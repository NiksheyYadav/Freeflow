import React from 'react';
import { useStore } from '../store/useStore';
import '../styles/PropertiesPanel.css';

export const PropertiesPanel: React.FC = () => {
  const {
    strokeColor,
    backgroundColor,
    fillStyle,
    strokeWidth,
    strokeStyle,
    roughness,
    opacity,
    fontSize,
    fontFamily,
    selectedElements,
    elements,
    setStrokeColor,
    setBackgroundColor,
    updateElement,
  } = useStore();

  const selectedElement = selectedElements.length === 1 
    ? elements.find(el => el.id === selectedElements[0])
    : null;

  const handleStrokeColorChange = (color: string) => {
    setStrokeColor(color);
    if (selectedElement) {
      updateElement(selectedElement.id, { strokeColor: color });
    }
  };

  const handleBackgroundColorChange = (color: string) => {
    setBackgroundColor(color);
    if (selectedElement) {
      updateElement(selectedElement.id, { backgroundColor: color });
    }
  };

  const handleStrokeWidthChange = (width: number) => {
    useStore.setState({ strokeWidth: width as 1 | 2 | 4 });
    if (selectedElement) {
      updateElement(selectedElement.id, { strokeWidth: width as 1 | 2 | 4 });
    }
  };

  const handleStrokeStyleChange = (style: 'solid' | 'dashed' | 'dotted') => {
    useStore.setState({ strokeStyle: style });
    if (selectedElement) {
      updateElement(selectedElement.id, { strokeStyle: style });
    }
  };

  const handleFillStyleChange = (style: 'solid' | 'hachure' | 'cross-hatch') => {
    useStore.setState({ fillStyle: style });
    if (selectedElement) {
      updateElement(selectedElement.id, { fillStyle: style });
    }
  };

  const handleOpacityChange = (value: number) => {
    useStore.setState({ opacity: value });
    if (selectedElement) {
      updateElement(selectedElement.id, { opacity: value });
    }
  };

  const handleRoughnessChange = (value: number) => {
    useStore.setState({ roughness: value as 0 | 1 | 2 });
    if (selectedElement) {
      updateElement(selectedElement.id, { roughness: value as 0 | 1 | 2 });
    }
  };

  const handleFontSizeChange = (size: number) => {
    useStore.setState({ fontSize: size });
    if (selectedElement && selectedElement.type === 'text') {
      updateElement(selectedElement.id, { fontSize: size });
    }
  };

  const handleFontFamilyChange = (family: 'hand-drawn' | 'normal' | 'code') => {
    useStore.setState({ fontFamily: family });
    if (selectedElement && selectedElement.type === 'text') {
      updateElement(selectedElement.id, { fontFamily: family });
    }
  };

  const currentStrokeColor = selectedElement?.strokeColor || strokeColor;
  const currentBackgroundColor = selectedElement?.backgroundColor || backgroundColor;
  const currentStrokeWidth = selectedElement?.strokeWidth || strokeWidth;
  const currentStrokeStyle = selectedElement?.strokeStyle || strokeStyle;
  const currentFillStyle = selectedElement?.fillStyle || fillStyle;
  const currentOpacity = selectedElement?.opacity || opacity;
  const currentRoughness = selectedElement?.roughness || roughness;
  const currentFontSize = selectedElement?.fontSize || fontSize;
  const currentFontFamily = selectedElement?.fontFamily || fontFamily;

  const showTextProperties = selectedElement?.type === 'text' || !selectedElement;

  return (
    <div className="properties-panel">
      <h3 className="properties-title">Properties</h3>

      <div className="properties-section">
        <label className="properties-label">Stroke Color</label>
        <div className="color-input-wrapper">
          <input
            type="color"
            value={currentStrokeColor}
            onChange={(e) => handleStrokeColorChange(e.target.value)}
            className="color-input"
          />
          <input
            type="text"
            value={currentStrokeColor}
            onChange={(e) => handleStrokeColorChange(e.target.value)}
            className="color-text-input"
          />
        </div>
      </div>

      <div className="properties-section">
        <label className="properties-label">Background Color</label>
        <div className="color-input-wrapper">
          <input
            type="color"
            value={currentBackgroundColor === 'transparent' ? '#ffffff' : currentBackgroundColor}
            onChange={(e) => handleBackgroundColorChange(e.target.value)}
            className="color-input"
          />
          <input
            type="text"
            value={currentBackgroundColor}
            onChange={(e) => handleBackgroundColorChange(e.target.value)}
            className="color-text-input"
            placeholder="transparent"
          />
        </div>
      </div>

      <div className="properties-section">
        <label className="properties-label">Stroke Width</label>
        <div className="button-group">
          {[1, 2, 4].map((width) => (
            <button
              key={width}
              className={`button-group-item ${currentStrokeWidth === width ? 'active' : ''}`}
              onClick={() => handleStrokeWidthChange(width)}
            >
              {width}
            </button>
          ))}
        </div>
      </div>

      <div className="properties-section">
        <label className="properties-label">Stroke Style</label>
        <div className="button-group">
          {(['solid', 'dashed', 'dotted'] as const).map((style) => (
            <button
              key={style}
              className={`button-group-item ${currentStrokeStyle === style ? 'active' : ''}`}
              onClick={() => handleStrokeStyleChange(style)}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      <div className="properties-section">
        <label className="properties-label">Fill Style</label>
        <div className="button-group">
          {(['solid', 'hachure', 'cross-hatch'] as const).map((style) => (
            <button
              key={style}
              className={`button-group-item ${currentFillStyle === style ? 'active' : ''}`}
              onClick={() => handleFillStyleChange(style)}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      <div className="properties-section">
        <label className="properties-label">
          Opacity: {currentOpacity}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={currentOpacity}
          onChange={(e) => handleOpacityChange(Number(e.target.value))}
          className="slider"
        />
      </div>

      <div className="properties-section">
        <label className="properties-label">
          Roughness: {currentRoughness}
        </label>
        <input
          type="range"
          min="0"
          max="2"
          step="1"
          value={currentRoughness}
          onChange={(e) => handleRoughnessChange(Number(e.target.value))}
          className="slider"
        />
      </div>

      {showTextProperties && (
        <>
          <div className="properties-divider" />
          
          <div className="properties-section">
            <label className="properties-label">Font Size</label>
            <input
              type="number"
              min="8"
              max="96"
              value={currentFontSize}
              onChange={(e) => handleFontSizeChange(Number(e.target.value))}
              className="number-input"
            />
          </div>

          <div className="properties-section">
            <label className="properties-label">Font Family</label>
            <select
              value={currentFontFamily}
              onChange={(e) => handleFontFamilyChange(e.target.value as 'hand-drawn' | 'normal' | 'code')}
              className="select-input"
            >
              <option value="hand-drawn">Hand Drawn</option>
              <option value="normal">Normal</option>
              <option value="code">Code</option>
            </select>
          </div>
        </>
      )}
    </div>
  );
};
