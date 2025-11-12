// Collision detection utility functions for checking if a point is near a line and getting bounding boxes for elements
import { Element, Point } from '../types';

export const isPointNearLine = (
  point: Point,
  lineStart: Point,
  lineEnd: Point,
  threshold: number = 5
): boolean => {
  // Calculate distance from point to line segment
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  const lengthSquared = dx * dx + dy * dy;
  
  if (lengthSquared === 0) {
    // Line is a point
    const dist = Math.sqrt(
      (point.x - lineStart.x) ** 2 + (point.y - lineStart.y) ** 2
    );
    return dist <= threshold;
  }
  
  const t = Math.max(
    0,
    Math.min(
      1,
      ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / lengthSquared
    )
  );
  
  const projX = lineStart.x + t * dx;
  const projY = lineStart.y + t * dy;
  const distance = Math.sqrt((point.x - projX) ** 2 + (point.y - projY) ** 2);
  
  return distance <= threshold;
};

export const getBoundingBox = (element: Element) => {
  return {
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height,
  };
};