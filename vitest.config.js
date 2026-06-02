import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'resources/js/nexus-admin')
    }
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['packages/core/src/**/*.test.js'],
    root: resolve(__dirname)
  }
})