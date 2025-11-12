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
  }, [elements, currentElement, zoom, offsetX, offsetY, renderElement]);

  // Get mouse position relative to canvas with zoom and offset
  const getMousePos = (e: React.MouseEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - offsetX) / zoom,
      y: (e.clientY - rect.top - offsetY) / zoom,
    };
  };

  // Handle mouse down
  const handleMouseDown = (e: React.MouseEvent) => {
    if (tool === 'selection') return; // Selection handled separately

    const point = getMousePos(e);
    setIsDrawing(true);
    setStartPoint(point);

    // Create initial element
    const newElement: Element = {
      id: nanoid(),
      type: tool as Exclude<typeof tool, 'selection'>,
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
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !startPoint || !currentElement) return;

    const point = getMousePos(e);

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
    if (!isDrawing || !currentElement) return;

    setIsDrawing(false);

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
        style={{ cursor: tool === 'selection' ? 'default' : 'crosshair' }}
      />
    </div>
  );
};