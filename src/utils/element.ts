import rough from 'roughjs';
import { Element, ElementType } from '../types';
import { nanoid } from 'nanoid';

const generator = rough.generator();

export const createElement = (
  type: Exclude<ElementType, 'selection'>,
  x: number,
  y: number,
  width: number,
  height: number,
  options: Partial<Element> = {}
): Element => {
  return {
    id: nanoid(),
    type,
    x,
    y,
    width,
    height,
    angle: 0,
    strokeColor: '#000000',
    backgroundColor: 'transparent',
    fillStyle: 'hachure',
    strokeWidth: 1,
    strokeStyle: 'solid',
    roughness: 1,
    opacity: 100,
    isDeleted: false,
    fontSize: 20,
    fontFamily: 'hand-drawn',
    ...options,
  };
};

export const generateRoughElement = (element: Element) => {
  const options = {
    stroke: element.strokeColor,
    strokeWidth: element.strokeWidth,
    roughness: element.roughness,
    fill: element.backgroundColor === 'transparent' ? undefined : element.backgroundColor,
    fillStyle: element.fillStyle,
  };

  switch (element.type) {
    case 'rectangle':
      return generator.rectangle(0, 0, element.width, element.height, options);
    
    case 'diamond':
      return generator.polygon(
        [
          [element.width / 2, 0],
          [element.width, element.height / 2],
          [element.width / 2, element.height],
          [0, element.height / 2],
        ],
        options
      );
    
    case 'ellipse':
      return generator.ellipse(
        element.width / 2,
        element.height / 2,
        element.width,
        element.height,
        options
      );
    
    case 'line':
      return generator.line(0, 0, element.width, element.height, options);
    
    case 'arrow':
      const arrowHeadSize = 15;
      const angle = Math.atan2(element.height, element.width);
      const arrowPoints: [number, number][] = [
        [element.width - arrowHeadSize * Math.cos(angle - Math.PI / 6), element.height - arrowHeadSize * Math.sin(angle - Math.PI / 6)],
        [element.width, element.height],
        [element.width - arrowHeadSize * Math.cos(angle + Math.PI / 6), element.height - arrowHeadSize * Math.sin(angle + Math.PI / 6)],
      ];
      return {
        line: generator.line(0, 0, element.width, element.height, options),
        arrowHead: generator.polygon(arrowPoints, options),
      };
    
    case 'freedraw':
      if (!element.points || element.points.length < 2) return null;
      const pathData = element.points.map((point, index) => 
        index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`
      ).join(' ');
      return generator.path(pathData, options);
    
    default:
      return null;
  }
};

export const drawElement = (
  context: CanvasRenderingContext2D,
  element: Element,
  rc: any
) => {
  context.save();
  context.globalAlpha = element.opacity / 100;

  if (element.angle !== 0) {
    const centerX = element.x + element.width / 2;
    const centerY = element.y + element.height / 2;
    context.translate(centerX, centerY);
    context.rotate(element.angle);
    context.translate(-centerX, -centerY);
  }

  if (element.type === 'text') {
    context.font = `${element.fontSize}px ${getFontFamily(element.fontFamily || 'hand-drawn')}`;
    context.fillStyle = element.strokeColor;
    context.fillText(element.text || '', element.x, element.y + (element.fontSize || 20));
  } else if (element.type === 'freedraw') {
    if (element.points && element.points.length > 0) {
      context.strokeStyle = element.strokeColor;
      context.lineWidth = element.strokeWidth;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      
      context.beginPath();
      context.moveTo(element.x + element.points[0].x, element.y + element.points[0].y);
      
      for (let i = 1; i < element.points.length; i++) {
        context.lineTo(element.x + element.points[i].x, element.y + element.points[i].y);
      }
      
      context.stroke();
    }
  } else {
    const roughElement = generateRoughElement(element);
    if (roughElement) {
      context.translate(element.x, element.y);
      
      if (element.type === 'arrow' && typeof roughElement === 'object' && 'line' in roughElement) {
        rc.draw(roughElement.line);
        rc.draw(roughElement.arrowHead);
      } else {
        rc.draw(roughElement);
      }
      
      context.translate(-element.x, -element.y);
    }
  }

  context.restore();
};

const getFontFamily = (family: string): string => {
  switch (family) {
    case 'hand-drawn':
      return 'Virgil, "Segoe UI Emoji"';
    case 'code':
      return 'Cascadia, monospace';
    default:
      return 'Helvetica, Arial, sans-serif';
  }
};

export const isPointInElement = (x: number, y: number, element: Element): boolean => {
  const { x: ex, y: ey, width, height, angle } = element;

  if (angle !== 0) {
    const centerX = ex + width / 2;
    const centerY = ey + height / 2;
    const dx = x - centerX;
    const dy = y - centerY;
    const rotatedX = dx * Math.cos(-angle) - dy * Math.sin(-angle) + centerX;
    const rotatedY = dx * Math.sin(-angle) + dy * Math.cos(-angle) + centerY;
    x = rotatedX;
    y = rotatedY;
  }

  if (element.type === 'ellipse') {
    const cx = ex + width / 2;
    const cy = ey + height / 2;
    const rx = width / 2;
    const ry = height / 2;
    return ((x - cx) ** 2) / (rx ** 2) + ((y - cy) ** 2) / (ry ** 2) <= 1;
  }

  if (element.type === 'freedraw' && element.points) {
    const threshold = element.strokeWidth + 5;
    for (const point of element.points) {
      const distance = Math.sqrt((x - (ex + point.x)) ** 2 + (y - (ey + point.y)) ** 2);
      if (distance < threshold) return true;
    }
    return false;
  }

  return x >= ex && x <= ex + width && y >= ey && y <= ey + height;
};

export const getElementAtPosition = (x: number, y: number, elements: Element[]): Element | null => {
  for (let i = elements.length - 1; i >= 0; i--) {
    if (isPointInElement(x, y, elements[i])) {
      return elements[i];
    }
  }
  return null;
};

export const adjustElementCoordinates = (element: Element): Element => {
  const { x, y, width, height } = element;
  
  if (element.type === 'rectangle' || element.type === 'diamond' || element.type === 'ellipse' || element.type === 'text') {
    const minX = Math.min(x, x + width);
    const maxX = Math.max(x, x + width);
    const minY = Math.min(y, y + height);
    const maxY = Math.max(y, y + height);
    
    return {
      ...element,
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }
  
  return element;
};

export const getResizeHandler = (x: number, y: number, element: Element): string | null => {
  const { x: ex, y: ey, width, height } = element;
  const handleSize = 8;
  
  const handles = {
    nw: { x: ex, y: ey },
    n: { x: ex + width / 2, y: ey },
    ne: { x: ex + width, y: ey },
    e: { x: ex + width, y: ey + height / 2 },
    se: { x: ex + width, y: ey + height },
    s: { x: ex + width / 2, y: ey + height },
    sw: { x: ex, y: ey + height },
    w: { x: ex, y: ey + height / 2 },
  };
  
  for (const [position, handle] of Object.entries(handles)) {
    if (
      x >= handle.x - handleSize / 2 &&
      x <= handle.x + handleSize / 2 &&
      y >= handle.y - handleSize / 2 &&
      y <= handle.y + handleSize / 2
    ) {
      return position;
    }
  }
  
  return null;
};