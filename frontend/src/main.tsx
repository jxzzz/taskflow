import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

// 全局样式
import './styles/variables.css';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
