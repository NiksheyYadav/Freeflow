import React from 'react'; 
import { useStore } from '../store/useStore'; 
 
export const PropertiesPanel: React.FC = () => { 
  const { 
    strokeColor, 
    setStrokeColor, 
    backgroundColor, 
    setBackgroundColor, 
    strokeWidth, 
    strokeStyle, 
    fillStyle, 
    opacity, 
    roughness, 
    fontSize, 
    selectedElements, 
  } = useStore(); 
 
  const isVisible = selectedElements.length > 0; 
 
  return ( 
    <div className={`properties-panel ${isVisible ? 'visible' : ''}`}> 
      <h3>Properties</h3> 
 
      <div className="property-group"> 
        <label>Stroke Color</label> 
        <div className="color-picker"> 
          <input 
            type="color" 
            value={strokeColor} 
            onChange={(e) => setStrokeColor(e.target.value)} 
          /> 
          <input 
            type="text" 
            value={strokeColor} 
            onChange={(e) => setStrokeColor(e.target.value)} 
            placeholder="#000000" 
          /> 
        </div> 
      </div> 
 
      <div className="property-group"> 
        <label>Background Color</label> 
        <div className="color-picker"> 
          <input 
            type="color" 
            value={backgroundColor === 'transparent' ? '#ffffff' : backgroundColor} 
            onChange={(e) => setBackgroundColor(e.target.value)} 
          /> 
          <input 
            type="text" 
            value={backgroundColor} 
            onChange={(e) => setBackgroundColor(e.target.value)} 
            placeholder="transparent" 
          /> 
        </div> 
      </div> 
 
      <div className="property-group"> 
        <label>Stroke Width</label> 
        <div className="button-group"> 
          {[1, 2, 4].map((w) => ( 
            <button key={w} className={strokeWidth === w ? 'active' : ''}> 
              {w} 
            </button> 
          ))} 
        </div> 
      </div> 
 
      <div className="property-group"> 
        <label>Stroke Style</label> 
        <div className="button-group"> 
          {['solid', 'dashed', 'dotted'].map((s) => ( 
            <button key={s} className={strokeStyle === s ? 'active' : ''}> 
              {s.charAt(0).toUpperCase() + s.slice(1)} 
            </button> 
          ))} 
        </div> 
      </div> 
 
      <div className="property-group"> 
        <label>Fill Style</label> 
        <div className="button-group"> 
          {['solid', 'hachure', 'cross-hatch'].map((f) => ( 
            <button key={f} className={fillStyle === f ? 'active' : ''}> 
              {f === 'cross-hatch' ? 'Cross-Hatch' : f.charAt(0).toUpperCase() + f.slice(1)} 
            </button> 
          ))} 
        </div> 
      </div> 
 
      <div className="property-group"> 
        <label>Opacity: {opacity}%%</label> 
        <input type="range" min="0" max="100" value={opacity} readOnly /> 
      </div> 
 
      <div className="property-group"> 
        <label>Roughness: {roughness}</label> 
        <input type="range" min="0" max="3" step="0.1" value={roughness} readOnly /> 
      </div> 
 
      <div className="property-group"> 
        <label>Font Size</label> 
        <input type="number" value={fontSize} min="8" max="72" readOnly /> 
      </div> 
    </div> 
  ); 
}; 
