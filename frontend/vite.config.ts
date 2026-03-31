import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const frontendPort = Number(process.env.FRONTEND_PORT ?? 5173)
const proxyTarget = process.env.VITE_PROXY_TARGET ?? 'http://127.0.0.1:5268'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: frontendPort,
    strictPort: true,
    proxy: {
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
      },
      '/health': {
        target: proxyTarget,
        changeOrigin: true,
      },
      '/openapi': {
        target: proxyTarget,
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
