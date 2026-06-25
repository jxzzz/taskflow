import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('antd') || id.includes('@ant-design')) {
              return 'antd-vendor';
            }
            if (id.includes('@tanstack')) {
              return 'query-vendor';
            }
            // Don't force remaining node_modules into a single 'vendor' chunk.
            // Rollup will auto-split them, avoiding circular dependencies
            // between chunks (e.g. dayjs locale ← antd's bundled dayjs).
          }
          // Don't manually chunk app code — let Rollup handle it.
          // This prevents CJS interop helpers from landing in the entry
          // chunk where they create cycles with vendor chunks.
        },
      },
    },
  },
})
