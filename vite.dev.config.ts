import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  root: 'examples',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      'web-performance-monitor': resolve(__dirname, 'src/index.ts')
    }
  },
  server: {
    port: 3000,
    open: true,
    hmr: true
  }
}); 