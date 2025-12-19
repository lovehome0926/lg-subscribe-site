
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // 必须使用相对路径，否则在 GitHub Pages 上会找不到 JS 和 CSS 文件
  base: './', 
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
});
