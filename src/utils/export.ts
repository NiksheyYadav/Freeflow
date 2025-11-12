import { Element } from '../types';

// Export canvas to PNG
export const exportToPNG = (canvas: HTMLCanvasElement, filename: string = 'freeflow-export.png') => {
  canvas.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = filename;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }
  });
};

// Export canvas to SVG
export const exportToSVG = (elements: Element[], filename: string = 'freeflow-export.svg') => {
  const svgElements = elements.map((element) => {
    const { x, y, width, height, strokeColor, backgroundColor, strokeWidth, type } = element;
    
    let svgElement = '';
    const fill = backgroundColor === 'transparent' ? 'none' : backgroundColor;
    const stroke = strokeColor;
    const strokeW = strokeWidth;

    switch (type) {
      case 'rectangle':
        svgElement = `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeW}" />`;
        break;
      case 'ellipse':
        svgElement = `<ellipse cx="${x + width / 2}" cy="${y + height / 2}" rx="${width / 2}" ry="${height / 2}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeW}" />`;
        break;
      case 'line':
        svgElement = `<line x1="${x}" y1="${y}" x2="${x + width}" y2="${y + height}" stroke="${stroke}" stroke-width="${strokeW}" />`;
        break;
      case 'arrow':
        svgElement = `<line x1="${x}" y1="${y}" x2="${x + width}" y2="${y + height}" stroke="${stroke}" stroke-width="${strokeW}" marker-end="url(#arrowhead)" />`;
        break;
      case 'text':
        svgElement = `<text x="${x}" y="${y + (element.fontSize || 20)}" fill="${stroke}" font-size="${element.fontSize || 20}" font-family="${element.fontFamily || 'hand-drawn'}">${element.text || ''}</text>`;
        break;
      default:
        break;
    }
    
    return svgElement;
  }).join('\n');

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080">
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="black" />
    </marker>
  </defs>
  ${svgElements}
</svg>`;

  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
};

// Export elements to JSON
export const exportToJSON = (elements: Element[], filename: string = 'freeflow-export.json') => {
  const json = JSON.stringify(elements, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
};

// Import elements from JSON
export const importFromJSON = (callback: (elements: Element[]) => void) => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const elements = JSON.parse(event.target?.result as string);
          callback(elements);
        } catch (error) {
          console.error('Failed to parse JSON:', error);
          alert('Failed to import file. Please ensure it is a valid Freeflow JSON file.');
        }
      };
      reader.readAsText(file);
    }
  };
  
  input.click();
};