import React from 'react'; 
import { useStore } from '../store/useStore'; 
 
export const Canvas: React.FC = () => { 
  const { gridEnabled } = useStore(); 
 
  return ( 
    <div className={`canvas ${gridEnabled ? 'grid-enabled' : ''}`}> 
      <canvas id="canvas" /> 
    </div> 
  ); 
}; 
