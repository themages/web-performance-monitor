import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

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
    open: true
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'WebPerformanceMonitor',
      fileName: (format) => `web-performance-monitor.${format}.js`
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
}) 