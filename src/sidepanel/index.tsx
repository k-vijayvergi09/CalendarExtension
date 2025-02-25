import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import '../styles/global.css';
import { ToastProvider } from '../context/ToastContext';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </React.StrictMode>
); 