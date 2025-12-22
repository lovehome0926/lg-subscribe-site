
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // 確保生成到根目錄下的 dist 資料夾
    emptyOutDir: true,
    sourcemap: false,
    minify: 'esbuild'
  },
  // 注意：我們移除這裡的 'process.env.API_KEY' 定義，
  // 因為在 Aistudio 環境中，它會被自動注入，不需要編譯時硬編碼。
});
