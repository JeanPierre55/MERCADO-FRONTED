import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      // Proxy para el backend Spring Boot (evita CORS en desarrollo)
      // Todas las rutas /api/* se redirigen a localhost:8080
      // Esto cubre: /api/auth/login, /api/products/*, /api/sales/*
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.warn('[Vite Proxy] Error conectando a Spring Boot:', err.message)
          })
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: false,
    clearMocks: true,
  },
})
