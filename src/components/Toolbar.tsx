import React from 'react'; 
import { Undo2, Redo2, Download, Upload, Trash2, ZoomIn, ZoomOut, Grid3x3, Moon, Sun } from 'lucide-react'; 
import { useStore } from '../store/useStore'; 
import { exportToPNG, importFromJSON } from '../utils/export'; 
 
export const Toolbar: React.FC = () => { 
  const { 
    undo, 
    redo, 
    clearCanvas, 
    zoom, 
    setZoom, 
    gridEnabled, 
    toggleGrid, 
    darkMode, 
    toggleDarkMode, 
    elements, 
    historyStep, 
    history, 
  } = useStore(); 
 
  const canUndo = historyStep > 0; 
  const canRedo = historyStep < history.length - 1; 
 
  const handleExportPNG = () => { 
    exportToPNG(elements, 'freeflow-drawing.png'); 
  }; 
 
  const handleImportJSON = () => { 
    importFromJSON('drawing.json'); 
  }; 
 
  return ( 
    <div className="toolbar"> 
      <button onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)"> 
        <Undo2 size={20} /> 
      </button> 
      <button onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)"> 
        <Redo2 size={20} /> 
      </button> 
 
      <div className="toolbar-divider"></div> 
 
      <button onClick={handleExportPNG} title="Export as PNG"> 
        <Download size={20} /> 
        Export 
      </button> 
      <button onClick={handleImportJSON} title="Import JSON"> 
        <Upload size={20} /> 
        Import 
      </button> 
      <button onClick={clearCanvas} title="Clear Canvas"> 
        <Trash2 size={20} /> 
      </button> 
 
      <div className="toolbar-divider"></div> 
 
      <button onClick={() => setZoom(zoom - 0.1)} title="Zoom Out"> 
        <ZoomOut size={20} /> 
      </button> 
      <span className="zoom-level">{Math.round(zoom * 100)}%%</span> 
      <button onClick={() => setZoom(zoom + 0.1)} title="Zoom In"> 
        <ZoomIn size={20} /> 
      </button> 
 
      <div className="toolbar-divider"></div> 
 
      <button 
        onClick={toggleGrid} 
        className={gridEnabled ? 'active' : ''} 
        title="Toggle Grid" 
      > 
        <Grid3x3 size={20} /> 
      </button> 
      <button 
        onClick={toggleDarkMode} 
        className={darkMode ? 'active' : ''} 
        title="Toggle Dark Mode" 
      > 
        {darkMode ? <Sun size={20} /> : <Moon size={20} />} 
      </button> 
    </div> 
  ); 
}; 
