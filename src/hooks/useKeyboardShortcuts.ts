import { useEffect } from 'react';
import { useStore } from '../store/useStore';

export const useKeyboardShortcuts = () => {
  const {
    undo,
    redo,
    deleteElements,
    selectedElements,
    setTool,
    clearCanvas,
  } = useStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { key, ctrlKey, metaKey, shiftKey } = event;
      const isMod = ctrlKey || metaKey;

      // Undo: Ctrl/Cmd + Z (without Shift)
      if (isMod && key.toLowerCase() === 'z' && !shiftKey) {
        event.preventDefault();
        undo();
        return;
      }

      // Redo: Ctrl/Cmd + Shift + Z
      if (isMod && key.toLowerCase() === 'z' && shiftKey) {
        event.preventDefault();
        redo();
        return;
      }

      // Delete: Delete or Backspace
      if (key === 'Delete' || key === 'Backspace') {
        if (selectedElements.length > 0) {
          event.preventDefault();
          deleteElements(selectedElements);
        }
        return;
      }

      // Clear canvas: Ctrl/Cmd + Delete
      if (isMod && key === 'Delete') {
        event.preventDefault();
        clearCanvas();
        return;
      }

      // Tool selection shortcuts (only when not typing in input)
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      switch (key.toLowerCase()) {
        case 'v':
          event.preventDefault();
          setTool('selection');
          break;
        case 'r':
          event.preventDefault();
          setTool('rectangle');
          break;
        case 'e':
          event.preventDefault();
          setTool('ellipse');
          break;
        case 'd':
          event.preventDefault();
          setTool('diamond');
          break;
        case 'a':
          event.preventDefault();
          setTool('arrow');
          break;
        case 'l':
          event.preventDefault();
          setTool('line');
          break;
        case 't':
          event.preventDefault();
          setTool('text');
          break;
        case 'p':
          event.preventDefault();
          setTool('freedraw');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, deleteElements, selectedElements, setTool, clearCanvas]);
};