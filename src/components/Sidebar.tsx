import React from 'react'; 
import { MousePointer, Square, Diamond, Circle, ArrowRight, Minus, Pen, Type } from 'lucide-react'; 
import { useStore } from '../store/useStore'; 
import { ElementType } from '../types'; 
 
export const Sidebar: React.FC = () => { 
  const { tool, setTool } = useStore(); 
 
  const tools: { type: ElementType; icon: React.ReactNode; label: string }[] = [ 
    { type: 'selection', icon: <MousePointer size={20} />, label: 'Selection' }, 
    { type: 'rectangle', icon: <Square size={20} />, label: 'Rectangle' }, 
    { type: 'diamond', icon: <Diamond size={20} />, label: 'Diamond' }, 
    { type: 'ellipse', icon: <Circle size={20} />, label: 'Ellipse' }, 
    { type: 'arrow', icon: <ArrowRight size={20} />, label: 'Arrow' }, 
    { type: 'line', icon: <Minus size={20} />, label: 'Line' }, 
    { type: 'freedraw', icon: <Pen size={20} />, label: 'Draw' }, 
    { type: 'text', icon: <Type size={20} />, label: 'Text' }, 
  ]; 
 
  return ( 
    <div className="sidebar"> 
      {tools.map((t) => ( 
        <button 
          key={t.type} 
          onClick={() => setTool(t.type)} 
          className={tool === t.type ? 'active' : ''} 
          title={t.label} 
        > 
          {t.icon} 
          <span>{t.label}</span> 
        </button> 
      ))} 
    </div> 
  ); 
}; 
