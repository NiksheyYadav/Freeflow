import React, { useRef, useEffect, useState, useCallback } from 'react';
import rough from 'roughjs';
import { nanoid } from 'nanoid';
import { useStore } from '../store/useStore';
import { Element, Point } from '../types';

export const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentElement, setCurrentElement] = useState<Element | null>(null);
  const [cursorPos, setCursorPos] = useState<Point | null>(null);

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
    addElement,
    deleteElements,
  } = useStore();

  // Render a single element
  const renderElement = useCallback((
    ctx: CanvasRenderingContext2D,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rc: any,
    element: Element
  ) => {
    const options = {
      stroke: element.strokeColor,
      fill: element.backgroundColor === 'transparent' ? undefined : element.backgroundColor,
      fillStyle: element.fillStyle,
      strokeWidth: element.strokeWidth,
      roughness: element.roughness,
      strokeLineDash: element.strokeStyle === 'dashed' ? [10, 5] : element.strokeStyle === 'dotted' ? [2, 2] : undefined,
    };

    ctx.globalAlpha = element.opacity / 100;

    switch (element.type) {
      case 'rectangle':
        rc.rectangle(element.x, element.y, element.width, element.height, options);
        break;

      case 'ellipse':
        rc.ellipse(
          element.x + element.width / 2,
          element.y + element.height / 2,
          element.width,
          element.height,
          options
        );
        break;

      case 'diamond': {
        const centerX = element.x + element.width / 2;
        const centerY = element.y + element.height / 2;
        rc.polygon(
          [
            [centerX, element.y],
            [element.x + element.width, centerY],
            [centerX, element.y + element.height],
            [element.x, centerY],
          ],
          options
        );
        break;
      }

      case 'line':
        rc.line(element.x, element.y, element.x + element.width, element.y + element.height, options);
        break;

      case 'arrow': {
        // Draw arrow line
        rc.line(element.x, element.y, element.x + element.width, element.y + element.height, options);
        
        // Draw arrowhead
        const angle = Math.atan2(element.height, element.width);
        const headLength = 15;
        const x2 = element.x + element.width;
        const y2 = element.y + element.height;
        
        rc.line(
          x2,
          y2,
          x2 - headLength * Math.cos(angle - Math.PI / 6),
          y2 - headLength * Math.sin(angle - Math.PI / 6),
          options
        );
        rc.line(
          x2,
          y2,
          x2 - headLength * Math.cos(angle + Math.PI / 6),
          y2 - headLength * Math.sin(angle + Math.PI / 6),
          options
        );
        break;
      }

      case 'freedraw':
        if (element.points && element.points.length > 1) {
          ctx.strokeStyle = element.strokeColor;
          ctx.lineWidth = element.strokeWidth;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          
          ctx.beginPath();
          ctx.moveTo(element.points[0].x, element.points[0].y);
          for (let i = 1; i < element.points.length; i++) {
            ctx.lineTo(element.points[i].x, element.points[i].y);
          }
          ctx.stroke();
        }
        break;

      case 'text':
        ctx.font = `${element.fontSize || fontSize}px ${
          element.fontFamily === 'hand-drawn'
            ? 'Virgil, sans-serif'
            : element.fontFamily === 'code'
            ? 'monospace'
            : 'Arial, sans-serif'
        }`;
        ctx.fillStyle = element.strokeColor;
        ctx.fillText(element.text || '', element.x, element.y);
        break;
    }

    ctx.globalAlpha = 1;
  }, [fontSize]);

  // Initialize canvas and render elements
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to window size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply zoom and offset transformations
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(zoom, zoom);

    // Initialize rough.js
    const rc = rough.canvas(canvas);

    // Render all elements
    elements.forEach((element) => {
      renderElement(ctx, rc, element);
    });

    // Render current element being drawn
    if (currentElement) {
      renderElement(ctx, rc, currentElement);
    }

    ctx.restore();

    // Draw eraser cursor if eraser tool is active
    if (tool === 'eraser' && cursorPos) {
      const eraserRadius = strokeWidth * 5;
      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.scale(zoom, zoom);
      ctx.beginPath();
      ctx.arc(cursorPos.x, cursorPos.y, eraserRadius, 0, 2 * Math.PI);
      ctx.strokeStyle = '#ff4444';
      ctx.lineWidth = 2 / zoom;
      ctx.stroke();
      ctx.restore();
    }
  }, [elements, currentElement, zoom, offsetX, offsetY, renderElement, tool, cursorPos, strokeWidth]);

  // Check if a point is inside an element
  const isPointInElement = (point: Point, element: Element): boolean => {
    const eraserRadius = strokeWidth * 5; // Eraser size based on stroke width

    // For freedraw, check if point is near any of the path points
    if (element.type === 'freedraw' && element.points) {
      return element.points.some(p => {
        const distance = Math.sqrt(Math.pow(p.x - point.x, 2) + Math.pow(p.y - point.y, 2));
        return distance <= eraserRadius;
      });
    }

    // For other shapes, check if point is within bounding box with some tolerance
    const minX = Math.min(element.x, element.x + element.width) - eraserRadius;
    const maxX = Math.max(element.x, element.x + element.width) + eraserRadius;
    const minY = Math.min(element.y, element.y + element.height) - eraserRadius;
    const maxY = Math.max(element.y, element.y + element.height) + eraserRadius;

    return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY;
  };

  // Get mouse position relative to canvas with zoom and offset
  const getMousePos = (e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ('touches' in e) {
      // Touch event
      if (e.touches.length === 0) return { x: 0, y: 0 };
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left - offsetX) / zoom,
      y: (clientY - rect.top - offsetY) / zoom,
    };
  };

  // Handle mouse down
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (tool === 'selection') return; // Selection handled separately

    e.preventDefault(); // Prevent default touch behavior
    const point = getMousePos(e);
    setIsDrawing(true);
    setStartPoint(point);

    // Handle eraser tool
    if (tool === 'eraser') {
      const elementsToDelete = elements.filter(el => isPointInElement(point, el));
      if (elementsToDelete.length > 0) {
        deleteElements(elementsToDelete.map(el => el.id));
      }
      return;
    }

    // Create initial element
    const newElement: Element = {
      id: nanoid(),
      type: tool as Exclude<typeof tool, 'selection' | 'eraser'>,
      x: point.x,
      y: point.y,
      width: 0,
      height: 0,
      angle: 0,
      strokeColor,
      backgroundColor,
      fillStyle,
      strokeWidth: strokeWidth as Element['strokeWidth'],
      strokeStyle: strokeStyle as Element['strokeStyle'],
      roughness: roughness as Element['roughness'],
      opacity,
      isDeleted: false,
      points: tool === 'freedraw' ? [point] : undefined,
      text: tool === 'text' ? '' : undefined,
      fontSize: tool === 'text' ? fontSize : undefined,
      fontFamily: tool === 'text' ? fontFamily : undefined,
    };

    setCurrentElement(newElement);
  };

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    const point = getMousePos(e);

    // Update cursor position for eraser visualization
    if (tool === 'eraser') {
      setCursorPos(point);
    }

    if (!isDrawing || !startPoint) return;

    e.preventDefault(); // Prevent default touch behavior

    // Handle eraser tool
    if (tool === 'eraser') {
      const elementsToDelete = elements.filter(el => isPointInElement(point, el));
      if (elementsToDelete.length > 0) {
        deleteElements(elementsToDelete.map(el => el.id));
      }
      return;
    }

    if (!currentElement) return;

    if (currentElement.type === 'freedraw') {
      // Add point to freedraw path
      setCurrentElement({
        ...currentElement,
        points: [...(currentElement.points || []), point],
      });
    } else {
      // Update element dimensions
      const width = point.x - startPoint.x;
      const height = point.y - startPoint.y;

      setCurrentElement({
        ...currentElement,
        width,
        height,
      });
    }
  };

  // Handle mouse up
  const handleMouseUp = () => {
    if (!isDrawing) return;

    setIsDrawing(false);

    // Eraser doesn't create elements, just deletes them
    if (tool === 'eraser') {
      setCurrentElement(null);
      setStartPoint(null);
      return;
    }

    if (!currentElement) return;

    // Only add element if it has size (or is freedraw with points)
    if (
      currentElement.type === 'freedraw' ||
      Math.abs(currentElement.width) > 1 ||
      Math.abs(currentElement.height) > 1
    ) {
      // For text tool, prompt for text input
      if (currentElement.type === 'text') {
        const text = prompt('Enter text:');
        if (text) {
          addElement({ ...currentElement, text });
        }
      } else {
        addElement(currentElement);
      }
    }

    setCurrentElement(null);
    setStartPoint(null);
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`canvas ${gridEnabled ? 'grid-enabled' : ''}`}>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        onTouchCancel={handleMouseUp}
        style={{ 
          cursor: tool === 'selection' ? 'default' : tool === 'eraser' ? 'none' : 'crosshair',
          touchAction: 'none'
        }}
      />
    </div>
  );
};