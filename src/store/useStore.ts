import { create } from 'zustand';
import { AppState, Element, ElementType } from '../types';

interface StoreState extends AppState {
  history: Element[][];
  historyStep: number;
  addElement: (element: Element) => void;
  updateElement: (id: string, updates: Partial<Element>) => void;
  deleteElements: (ids: string[]) => void;
  setSelectedElements: (ids: string[]) => void;
  setTool: (tool: ElementType) => void;
  setStrokeColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  setZoom: (zoom: number) => void;
  setOffset: (x: number, y: number) => void;
  undo: () => void;
  redo: () => void;
  clearCanvas: () => void;
  toggleGrid: () => void;
  toggleDarkMode: () => void;
}

export const useStore = create<StoreState>((set) => ({
  elements: [],
  selectedElements: [],
  tool: 'selection',
  strokeColor: '#000000',
  backgroundColor: 'transparent',
  fillStyle: 'hachure',
  strokeWidth: 1,
  strokeStyle: 'solid',
  roughness: 1,
  opacity: 100,
  fontSize: 20,
  fontFamily: 'hand-drawn',
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
  gridEnabled: false,
  darkMode: false,
  history: [[]],
  historyStep: 0,

  addElement: (element) => set((state) => {
    const newElements = [...state.elements, element];
    const newHistory = state.history.slice(0, state.historyStep + 1);
    newHistory.push(newElements);
    return {
      elements: newElements,
      history: newHistory,
      historyStep: newHistory.length - 1,
    };
  }),

  updateElement: (id, updates) => set((state) => ({
    elements: state.elements.map((el) =>
      el.id === id ? { ...el, ...updates } : el
    ),
  })),

  deleteElements: (ids) => set((state) => {
    const newElements = state.elements.filter((el) => !ids.includes(el.id));
    const newHistory = state.history.slice(0, state.historyStep + 1);
    newHistory.push(newElements);
    return {
      elements: newElements,
      selectedElements: [],
      history: newHistory,
      historyStep: newHistory.length - 1,
    };
  }),

  setSelectedElements: (ids) => set({ selectedElements: ids }),

  setTool: (tool) => set({ tool }),

  setStrokeColor: (color) => set({ strokeColor: color }),

  setBackgroundColor: (color) => set({ backgroundColor: color }),

  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(10, zoom)) }),

  setOffset: (x, y) => set({ offsetX: x, offsetY: y }),

  undo: () => set((state) => {
    if (state.historyStep > 0) {
      const newStep = state.historyStep - 1;
      return {
        elements: state.history[newStep],
        historyStep: newStep,
        selectedElements: [],
      };
    }
    return state;
  }),

  redo: () => set((state) => {
    if (state.historyStep < state.history.length - 1) {
      const newStep = state.historyStep + 1;
      return {
        elements: state.history[newStep],
        historyStep: newStep,
        selectedElements: [],
      };
    }
    return state;
  }),

  clearCanvas: () => set((state) => {
    const newHistory = state.history.slice(0, state.historyStep + 1);
    newHistory.push([]);
    return {
      elements: [],
      selectedElements: [],
      history: newHistory,
      historyStep: newHistory.length - 1,
    };
  }),

  toggleGrid: () => set((state) => ({ gridEnabled: !state.gridEnabled })),

  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
}));