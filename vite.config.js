import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'resources/js/nexus-admin')
    }
  },
  build: {
    outDir: resolve(__dirname, 'dist'),
    assetsDir: 'assets',
    copyPublicDir: true
  },
  server: {
    port: 5173
  }
})