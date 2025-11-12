import React from 'react';
import { useStore } from '../store/useStore';
import '../styles/ToolPalette.css';

export const ToolPalette: React.FC = () => {
  const {
    tool,
    strokeColor,
    setStrokeColor,
    backgroundColor,
    setBackgroundColor,
    strokeWidth,
    setStrokeWidth,
    strokeStyle,
    setStrokeStyle,
    fillStyle,
    setFillStyle,
    opacity,
    setOpacity,
    roughness,
    setRoughness,
    fontSize,
    setFontSize,
    fontFamily,
    setFontFamily,
  } = useStore();

  const strokeColors = ['#000000', '#e03131', '#2f9e44', '#1971c2', '#f59f00', '#1e1e1e'];
  const bgColors = ['transparent', '#ffe8e8', '#d3f9d8', '#d0ebff', '#fff4d6', '#f1f3f5'];

  const renderStrokeColors = () => (
    <div className="palette-section">
      <label>Stroke</label>
      <div className="color-grid">
        {strokeColors.map((color) => (
          <button
            key={color}
            className={`color-btn ${strokeColor === color ? 'active' : ''}`}
            style={{ backgroundColor: color === 'transparent' ? '#fff' : color }}
            onClick={() => setStrokeColor(color)}
            title={color}
          />
        ))}
      </div>
    </div>
  );

  const renderBackgroundColors = () => (
    <div className="palette-section">
      <label>Background</label>
      <div className="color-grid">
        {bgColors.map((color) => (
          <button
            key={color}
            className={`color-btn ${backgroundColor === color ? 'active' : ''}`}
            style={{ 
              backgroundColor: color === 'transparent' ? '#fff' : color,
              border: color === 'transparent' ? '1px solid #ccc' : undefined
            }}
            onClick={() => setBackgroundColor(color)}
            title={color}
          />
        ))}
      </div>
    </div>
  );

  const renderStrokeWidth = () => (
    <div className="palette-section">
      <label>Stroke width</label>
      <div className="button-row">
        {[1, 2, 4].map((width) => (
          <button
            key={width}
            className={`palette-btn ${strokeWidth === width ? 'active' : ''}`}
            onClick={() => setStrokeWidth(width)}
          >
            {width === 1 ? 'Thin' : width === 2 ? 'Bold' : 'Extra Bold'}
          </button>
        ))}
      </div>
    </div>
  );

  const renderStrokeStyle = () => (
    <div className="palette-section">
      <label>Stroke style</label>
      <div className="button-row">
        {['solid', 'dashed', 'dotted'].map((style) => (
          <button
            key={style}
            className={`palette-btn icon-btn ${strokeStyle === style ? 'active' : ''}`}
            onClick={() => setStrokeStyle(style)}
            title={style}
          >
            <div className={`stroke-preview stroke-${style}`} />
          </button>
        ))}
      </div>
    </div>
  );

  const renderSloppiness = () => (
    <div className="palette-section">
      <label>Sloppiness</label>
      <div className="button-row">
        {[0, 1, 2].map((r) => (
          <button
            key={r}
            className={`palette-btn ${roughness === r ? 'active' : ''}`}
            onClick={() => setRoughness(r)}
            title={`Roughness: ${r}`}
          >
            <svg width="20" height="20" viewBox="0 0 20 20">
              <circle cx="10" cy="10" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );

  const renderFillStyle = () => (
    <div className="palette-section">
      <label>Fill</label>
      <div className="button-row">
        {[
          { value: 'solid', label: 'Solid' },
          { value: 'hachure', label: 'Hachure' },
          { value: 'cross-hatch', label: 'Cross-hatch' },
        ].map((fill) => (
          <button
            key={fill.value}
            className={`palette-btn ${fillStyle === fill.value ? 'active' : ''}`}
            onClick={() => setFillStyle(fill.value)}
            title={fill.label}
          >
            {fill.label}
          </button>
        ))}
      </div>
    </div>
  );

  const renderEdges = () => (
    <div className="palette-section">
      <label>Edges</label>
      <div className="button-row">
        <button className="palette-btn active">
          <svg width="20" height="20" viewBox="0 0 20 20">
            <rect x="5" y="5" width="10" height="10" fill="none" stroke="currentColor" />
          </svg>
        </button>
        <button className="palette-btn">
          <svg width="20" height="20" viewBox="0 0 20 20">
            <rect x="5" y="5" width="10" height="10" rx="2" fill="none" stroke="currentColor" />
          </svg>
        </button>
      </div>
    </div>
  );

  const renderArrowType = () => (
    <div className="palette-section">
      <label>Arrow type</label>
      <div className="button-row">
        <button className="palette-btn active">→</button>
        <button className="palette-btn">⇄</button>
        <button className="palette-btn">—</button>
      </div>
    </div>
  );

  const renderArrowheads = () => (
    <div className="palette-section">
      <label>Arrowheads</label>
      <div className="button-row">
        <button className="palette-btn">—</button>
        <button className="palette-btn active">→</button>
      </div>
    </div>
  );

  const renderOpacity = () => (
    <div className="palette-section">
      <label>Opacity</label>
      <input
        type="range"
        min="0"
        max="100"
        value={opacity}
        onChange={(e) => setOpacity(Number(e.target.value))}
        className="slider"
      />
      <div className="slider-labels">
        <span>0</span>
        <span>100</span>
      </div>
    </div>
  );

  const renderFontFamily = () => (
    <div className="palette-section">
      <label>Font family</label>
      <div className="button-row">
        {[
          { value: 'hand-drawn', icon: '✏️', label: 'Virgil' },
          { value: 'normal', icon: 'A', label: 'Normal' },
          { value: 'code', icon: '</>', label: 'Code' },
        ].map((font) => (
          <button
            key={font.value}
            className={`palette-btn ${fontFamily === font.value ? 'active' : ''}`}
            onClick={() => setFontFamily(font.value)}
            title={font.label}
          >
            {font.icon}
          </button>
        ))}
      </div>
    </div>
  );

  const renderFontSize = () => (
    <div className="palette-section">
      <label>Font size</label>
      <div className="button-row">
        {[
          { value: 16, label: 'S' },
          { value: 20, label: 'M' },
          { value: 28, label: 'L' },
          { value: 36, label: 'XL' },
        ].map((size) => (
          <button
            key={size.value}
            className={`palette-btn ${fontSize === size.value ? 'active' : ''}`}
            onClick={() => setFontSize(size.value)}
          >
            {size.label}
          </button>
        ))}
      </div>
    </div>
  );

  const renderTextAlign = () => (
    <div className="palette-section">
      <label>Text align</label>
      <div className="button-row">
        <button className="palette-btn active">⫴</button>
        <button className="palette-btn">▬</button>
        <button className="palette-btn">⫵</button>
      </div>
    </div>
  );

  // Determine which palette to show based on tool
  const renderPalette = () => {
    switch (tool) {
      case 'ellipse':
      case 'rectangle':
      case 'diamond':
        return (
          <>
            {renderStrokeColors()}
            {renderBackgroundColors()}
            {renderStrokeWidth()}
            {renderFillStyle()}
            {renderSloppiness()}
            {renderEdges()}
            {renderOpacity()}
          </>
        );

      case 'arrow':
        return (
          <>
            {renderStrokeColors()}
            {renderStrokeWidth()}
            {renderArrowType()}
            {renderArrowheads()}
            {renderOpacity()}
          </>
        );

      case 'line':
        return (
          <>
            {renderStrokeColors()}
            {renderBackgroundColors()}
            {renderStrokeWidth()}
            {renderStrokeStyle()}
            {renderEdges()}
            {renderOpacity()}
          </>
        );

      case 'freedraw':
        return (
          <>
            {renderStrokeColors()}
            {renderStrokeWidth()}
            {renderOpacity()}
          </>
        );

      case 'text':
        return (
          <>
            {renderStrokeColors()}
            {renderFontFamily()}
            {renderFontSize()}
            {renderTextAlign()}
            {renderOpacity()}
          </>
        );

      case 'selection':
      default:
        return null;
    }
  };

  if (tool === 'selection') {
    return null;
  }

  return (
    <div className="tool-palette">
      {renderPalette()}
    </div>
  );
};
