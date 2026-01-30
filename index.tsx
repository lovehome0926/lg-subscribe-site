import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

console.log("System: React mounting sequence initiated...");

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("System Error: Root element '#root' not found in DOM.");
}