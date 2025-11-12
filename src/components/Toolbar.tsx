import React, { useRef } from 'react';
import { 
  Undo, 
  Redo, 
  Download, 
  Upload, 
  Trash2, 
  ZoomIn, 
  ZoomOut,
  Moon,
  Sun,
  Grid3x3
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { exportToPNG, exportToSVG, exportToJSON, importFromJSON } from '../utils/export';
import '../styles/Toolbar.css';

export const Toolbar: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const {
    elements,
    undo,
    redo,
    clearCanvas,
    zoom,
    setZoom,
    darkMode,
    toggleDarkMode,
    gridEnabled,
    toggleGrid,
    historyStep,
    history,
  } = useStore();

  const handleExportPNG = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      exportToPNG(canvas);
    }
  };

  const handleExportSVG = () => {
    exportToSVG(elements);
  };

  const handleExportJSON = () => {
    exportToJSON(elements);
  };

  const handleImportJSON = () => {
    importFromJSON((importedElements) => {
      // Clear current elements and add imported ones
      clearCanvas();
      importedElements.forEach((element) => {
        useStore.getState().addElement(element);
      });
    });
  };

  const handleZoomIn = () => {
    setZoom(zoom * 1.2);
  };

  const handleZoomOut = () => {
    setZoom(zoom / 1.2);
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  const canUndo = historyStep > 0;
  const canRedo = historyStep < history.length - 1;

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <button
          className="toolbar-button"
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          <Undo size={20} />
        </button>
        <button
          className="toolbar-button"
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo size={20} />
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-section">
        <div className="toolbar-dropdown">
          <button className="toolbar-button" title="Export">
            <Download size={20} />
            <span className="toolbar-button-text">Export</span>
          </button>
          <div className="toolbar-dropdown-content">
            <button onClick={handleExportPNG}>Export as PNG</button>
            <button onClick={handleExportSVG}>Export as SVG</button>
            <button onClick={handleExportJSON}>Export as JSON</button>
          </div>
        </div>

        <button
          className="toolbar-button"
          onClick={handleImportJSON}
          title="Import JSON"
        >
          <Upload size={20} />
          <span className="toolbar-button-text">Import</span>
        </button>

        <button
          className="toolbar-button"
          onClick={clearCanvas}
          title="Clear Canvas (Ctrl+Delete)"
        >
          <Trash2 size={20} />
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-section">
        <button
          className="toolbar-button"
          onClick={handleZoomOut}
          title="Zoom Out"
        >
          <ZoomOut size={20} />
        </button>
        <button
          className="toolbar-button zoom-reset"
          onClick={handleResetZoom}
          title="Reset Zoom"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          className="toolbar-button"
          onClick={handleZoomIn}
          title="Zoom In"
        >
          <ZoomIn size={20} />
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-section">
        <button
          className={`toolbar-button ${gridEnabled ? 'active' : ''}`}
          onClick={toggleGrid}
          title="Toggle Grid"
        >
          <Grid3x3 size={20} />
        </button>

        <button
          className="toolbar-button"
          onClick={toggleDarkMode}
          title="Toggle Dark Mode"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </div>
  );
};
