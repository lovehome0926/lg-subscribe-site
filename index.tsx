import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

console.log("System: React mounting sequence initiated...");

const mountApp = () => {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    try {
      const root = createRoot(rootElement);
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
      console.log("System: Render successful.");
    } catch (err) {
      console.error("System Error: Critical failure during React render.", err);
      rootElement.innerHTML = `<div style="padding:20px; color:red; font-family:sans-serif;">CRITICAL MOUNT ERROR. CHECK CONSOLE.</div>`;
    }
  } else {
    console.error("System Error: Root element not found.");
  }
};

// Handle potential race conditions with DOM loading
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  mountApp();
} else {
  window.addEventListener('DOMContentLoaded', mountApp);
}