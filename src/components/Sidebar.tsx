import React from 'react';
import { 
  MousePointer, 
  Square, 
  Diamond, 
  Circle, 
  ArrowRight, 
  Minus, 
  Pencil, 
  Type 
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { ElementType } from '../types';
import '../styles/Sidebar.css';

export const Sidebar: React.FC = () => {
  const { tool, setTool } = useStore();

  const tools: { type: ElementType; icon: React.ReactNode; label: string; shortcut: string }[] = [
    { type: 'selection', icon: <MousePointer size={20} />, label: 'Selection', shortcut: 'V' },
    { type: 'rectangle', icon: <Square size={20} />, label: 'Rectangle', shortcut: 'R' },
    { type: 'diamond', icon: <Diamond size={20} />, label: 'Diamond', shortcut: 'D' },
    { type: 'ellipse', icon: <Circle size={20} />, label: 'Ellipse', shortcut: 'E' },
    { type: 'arrow', icon: <ArrowRight size={20} />, label: 'Arrow', shortcut: 'A' },
    { type: 'line', icon: <Minus size={20} />, label: 'Line', shortcut: 'L' },
    { type: 'freedraw', icon: <Pencil size={20} />, label: 'Draw', shortcut: 'P' },
    { type: 'text', icon: <Type size={20} />, label: 'Text', shortcut: 'T' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-tools">
        {tools.map((toolItem) => (
          <button
            key={toolItem.type}
            className={`sidebar-tool ${tool === toolItem.type ? 'active' : ''}`}
            onClick={() => setTool(toolItem.type)}
            title={`${toolItem.label} (${toolItem.shortcut})`}
          >
            {toolItem.icon}
            <span className="sidebar-tool-label">{toolItem.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
