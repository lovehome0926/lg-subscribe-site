import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 关键：在代码开始执行的瞬间设置标志位，解除 index.html 的超时监测
(window as any).__APP_MOUNTED__ = true;

console.log("LG System: Module execution started.");

const rootElement = document.getElementById('root');
const fallback = document.getElementById('loading-fallback');

const hideLoading = () => {
  if (fallback) {
    fallback.style.opacity = '0';
    setTimeout(() => {
      fallback.style.display = 'none';
      console.log("LG System: Splash screen cleared.");
    }, 400);
  }
};

if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    // 渲染启动后立即尝试隐藏加载屏
    // 使用 requestAnimationFrame 确保在浏览器处理完第一帧后再操作
    requestAnimationFrame(() => {
      setTimeout(hideLoading, 300);
    });
    
  } catch (error) {
    console.error("LG System: React mount failed:", error);
    const status = document.getElementById('loading-status');
    if (status) status.innerText = '程序内部错误，请打开控制台查看详情。';
  }
} else {
  console.error("LG System: Root target element #root not found.");
}
