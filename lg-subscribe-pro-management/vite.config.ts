
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // 模拟环境变量，防止浏览器端 process 未定义报错
    'process.env': {
      API_KEY: ""
    }
  },
  server: {
    port: 5173,
    host: true
  }
});
