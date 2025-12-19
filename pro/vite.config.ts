
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 如果你的 GitHub 仓库名为 "lg-pro"，base 应设为 "/lg-pro/"
export default defineConfig({
  plugins: [react()],
  base: './', 
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
});
