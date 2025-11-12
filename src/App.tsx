import React from 'react';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { Sidebar } from './components/Sidebar';
import { PropertiesPanel } from './components/PropertiesPanel';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useStore } from './store/useStore';
import './styles/index.css';
import './styles/App.css';

function App() {
  const { darkMode } = useStore();
  useKeyboardShortcuts();

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}> 
      <Toolbar />
      <Sidebar />
      <PropertiesPanel />
      <Canvas />
    </div>
  );
}

export default App;