import './index.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

console.log("System: React mounting sequence initiated...");

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("System: Application rendered successfully.");
  } catch (err) {
    console.error("System Error: Critical failure during React render.", err);
    rootElement.innerHTML = `
      <div style="height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#05090f; color:#e60044; font-family:sans-serif; text-align:center; padding:20px;">
        <h1 style="font-size:24px; font-weight:900;">UNABLE TO MOUNT APP</h1>
        <p style="font-size:12px; opacity:0.5; margin-top:10px;">Please check the browser console for security or parsing errors.</p>
      </div>
    `;
  }
} else {
  console.error("System Error: Target root element '#root' was not found in the document.");
}