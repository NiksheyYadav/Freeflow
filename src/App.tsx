import { Canvas } from './components/Canvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { Sidebar } from './components/Sidebar';
import { Toolbar } from './components/Toolbar';
import { ToolPalette } from './components/ToolPalette';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useStore } from './store/useStore';
import './styles/App.css';
import './styles/index.css';

function App() {
  const { darkMode } = useStore();
  useKeyboardShortcuts();

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      <Toolbar />
      <Sidebar />
      <ToolPalette />
      <PropertiesPanel />
      <Canvas />
    </div>
  );
}

export default App;