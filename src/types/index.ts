export type ElementType = 
  | 'selection'
  | 'rectangle'
  | 'diamond'
  | 'ellipse'
  | 'arrow'
  | 'line'
  | 'freedraw'
  | 'text'
  | 'image';

export type FillStyle = 'solid' | 'hachure' | 'cross-hatch';
export type StrokeStyle = 'solid' | 'dashed' | 'dotted';
export type StrokeWidth = 1 | 2 | 4;
export type Roughness = 0 | 1 | 2;
export type FontFamily = 'hand-drawn' | 'normal' | 'code';

export interface Point {
  x: number;
  y: number;
}

export interface Element {
  id: string;
  type: Exclude<ElementType, 'selection'>;
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  strokeColor: string;
  backgroundColor: string;
  fillStyle: FillStyle;
  strokeWidth: StrokeWidth;
  strokeStyle: StrokeStyle;
  roughness: Roughness;
  opacity: number;
  isDeleted: boolean;
  points?: Point[];
  text?: string;
  fontSize?: number;
  fontFamily?: FontFamily;
}

export interface AppState {
  elements: Element[];
  selectedElements: string[];
  tool: ElementType;
  strokeColor: string;
  backgroundColor: string;
  fillStyle: FillStyle;
  strokeWidth: StrokeWidth;
  strokeStyle: StrokeStyle;
  roughness: Roughness;
  opacity: number;
  fontSize: number;
  fontFamily: FontFamily;
  zoom: number;
  offsetX: number;
  offsetY: number;
  gridEnabled: boolean;
  darkMode: boolean;
}