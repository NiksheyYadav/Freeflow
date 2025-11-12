import React, { useEffect, useRef, useState } from 'react';
import rough from 'roughjs';
import { useStore } from '../store/useStore';
import { 
  createElement, 
  drawElement, 
  getElementAtPosition, 
  adjustElementCoordinates,
  getResizeHandler 
} from '../utils/element';
import { Element } from '../types';
import '../styles/Canvas.css';

export const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [action, setAction] = useState<'drawing' | 'moving' | 'resizing' | 'panning' | 'none'>('none');
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);

  const {
    elements,
    tool,
    strokeColor,
    backgroundColor,
    fillStyle,
    strokeWidth,
    strokeStyle,
    roughness,
    opacity,
    fontSize,
    fontFamily,
    zoom,
    offsetX,
    offsetY,
    gridEnabled,
    darkMode,
    addElement,
    updateElement,
    setSelectedElements,
    selectedElements,
    setOffset,
  } = useStore();

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Redraw on resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      redraw();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Redraw canvas
  const redraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const rc = rough.canvas(canvas);

    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Apply transformations
    context.save();
    context.translate(offsetX, offsetY);
    context.scale(zoom, zoom);

    // Draw grid if enabled
    if (gridEnabled) {
      drawGrid(context, canvas.width, canvas.height);
    }

    // Draw all elements
    elements.forEach((element) => {
      if (!element.isDeleted) {
        drawElement(context, element, rc);
      }
    });

    // Draw selection handles
    if (selectedElements.length > 0) {
      selectedElements.forEach((id) => {
        const element = elements.find((el) => el.id === id);
        if (element) {
          drawSelectionHandles(context, element);
        }
      });
    }

    context.restore();
  };

  // Draw grid
  const drawGrid = (context: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = 20;
    context.strokeStyle = darkMode ? '#333333' : '#e0e0e0';
    context.lineWidth = 0.5;

    for (let x = -offsetX % gridSize; x < width; x += gridSize) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.stroke();
    }

    for (let y = -offsetY % gridSize; y < height; y += gridSize) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }
  };

  // Draw selection handles
  const drawSelectionHandles = (context: CanvasRenderingContext2D, element: Element) => {
    const { x, y, width, height } = element;
    const handleSize = 8;

    context.strokeStyle = '#0066ff';
    context.lineWidth = 2;
    context.strokeRect(x, y, width, height);

    const handles = [
      { x: x, y: y },
      { x: x + width / 2, y: y },
      { x: x + width, y: y },
      { x: x + width, y: y + height / 2 },
      { x: x + width, y: y + height },
      { x: x + width / 2, y: y + height },
      { x: x, y: y + height },
      { x: x, y: y + height / 2 },
    ];

    context.fillStyle = '#0066ff';
    handles.forEach((handle) => {
      context.fillRect(
        handle.x - handleSize / 2,
        handle.y - handleSize / 2,
        handleSize,
        handleSize
      );
    });
  };

  // Redraw when elements, zoom, offset, or grid changes
  useEffect(() => {
    redraw();
  }, [elements, zoom, offsetX, offsetY, gridEnabled, selectedElements, darkMode]);

  // Mouse down handler
  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = (event.clientX - rect.left - offsetX) / zoom;
    const clientY = (event.clientY - rect.top - offsetY) / zoom;

    // Check if space key is pressed for panning
    if (event.button === 1 || (event.button === 0 && event.shiftKey)) {
      setAction('panning');
      setPanStart({ x: event.clientX - offsetX, y: event.clientY - offsetY });
      return;
    }

    if (tool === 'selection') {
      const element = getElementAtPosition(clientX, clientY, elements);
      
      if (element) {
        const handle = getResizeHandler(clientX, clientY, element);
        if (handle) {
          setAction('resizing');
          setResizeHandle(handle);
          setSelectedElement(element);
          setSelectedElements([element.id]);
        } else {
          setAction('moving');
          setSelectedElement(element);
          setSelectedElements([element.id]);
        }
      } else {
        setSelectedElements([]);
        setSelectedElement(null);
      }
    } else {
      setAction('drawing');
      const newElement = createElement(
        tool,
        clientX,
        clientY,
        0,
        0,
        {
          strokeColor,
          backgroundColor,
          fillStyle,
          strokeWidth,
          strokeStyle,
          roughness,
          opacity,
          fontSize,
          fontFamily,
          points: tool === 'freedraw' ? [{ x: 0, y: 0 }] : undefined,
        }
      );
      addElement(newElement);
      setSelectedElement(newElement);
    }
  };

  // Mouse move handler
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = (event.clientX - rect.left - offsetX) / zoom;
    const clientY = (event.clientY - rect.top - offsetY) / zoom;

    if (action === 'panning' && panStart) {
      const newOffsetX = event.clientX - panStart.x;
      const newOffsetY = event.clientY - panStart.y;
      setOffset(newOffsetX, newOffsetY);
      return;
    }

    if (action === 'drawing' && selectedElement) {
      const index = elements.findIndex((el) => el.id === selectedElement.id);
      if (index !== -1) {
        if (tool === 'freedraw') {
          const newPoint = {
            x: clientX - selectedElement.x,
            y: clientY - selectedElement.y,
          };
          const updatedPoints = [...(selectedElement.points || []), newPoint];
          updateElement(selectedElement.id, { points: updatedPoints });
        } else {
          const width = clientX - selectedElement.x;
          const height = clientY - selectedElement.y;
          updateElement(selectedElement.id, { width, height });
        }
      }
    } else if (action === 'moving' && selectedElement) {
      const deltaX = clientX - (selectedElement.x + selectedElement.width / 2);
      const deltaY = clientY - (selectedElement.y + selectedElement.height / 2);
      updateElement(selectedElement.id, {
        x: selectedElement.x + deltaX,
        y: selectedElement.y + deltaY,
      });
    } else if (action === 'resizing' && selectedElement && resizeHandle) {
      const { x, y, width, height } = selectedElement;
      let newX = x;
      let newY = y;
      let newWidth = width;
      let newHeight = height;

      switch (resizeHandle) {
        case 'nw':
          newX = clientX;
          newY = clientY;
          newWidth = width + (x - clientX);
          newHeight = height + (y - clientY);
          break;
        case 'n':
          newY = clientY;
          newHeight = height + (y - clientY);
          break;
        case 'ne':
          newY = clientY;
          newWidth = clientX - x;
          newHeight = height + (y - clientY);
          break;
        case 'e':
          newWidth = clientX - x;
          break;
        case 'se':
          newWidth = clientX - x;
          newHeight = clientY - y;
          break;
        case 's':
          newHeight = clientY - y;
          break;
        case 'sw':
          newX = clientX;
          newWidth = width + (x - clientX);
          newHeight = clientY - y;
          break;
        case 'w':
          newX = clientX;
          newWidth = width + (x - clientX);
          break;
      }

      updateElement(selectedElement.id, {
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
      });
    }

    // Update cursor
    if (tool === 'selection') {
      const element = getElementAtPosition(clientX, clientY, elements);
      if (element) {
        const handle = getResizeHandler(clientX, clientY, element);
        canvas.style.cursor = handle ? `${handle}-resize` : 'move';
      } else {
        canvas.style.cursor = 'default';
      }
    } else {
      canvas.style.cursor = 'crosshair';
    }
  };

  // Mouse up handler
  const handleMouseUp = () => {
    if (action === 'drawing' && selectedElement) {
      const index = elements.findIndex((el) => el.id === selectedElement.id);
      if (index !== -1) {
        const element = elements[index];
        const adjustedElement = adjustElementCoordinates(element);
        updateElement(element.id, adjustedElement);
      }
    }

    setAction('none');
    setSelectedElement(null);
    setResizeHandle(null);
    setPanStart(null);
  };

  // Wheel handler for zoom
  const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      const delta = event.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = zoom * delta;
      useStore.getState().setZoom(newZoom);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className="canvas"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    />
  );
};
