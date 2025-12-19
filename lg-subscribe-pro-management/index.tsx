import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
const fallback = document.getElementById('loading-fallback');

if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App />);

    // 成功渲染后隐藏加载动画
    setTimeout(() => {
      if (fallback) {
        fallback.style.display = 'none';
      }
    }, 800);
  } catch (error) {
    console.error("Mount error:", error);
    const text = document.getElementById('loading-text');
    if (text) text.innerText = '系统渲染出错，请检查浏览器控制台。';
  }
}