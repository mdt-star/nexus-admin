import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'NexusAdminCore',
      formats: ['es'],
      fileName: () => 'index.mjs'
    },
    rollupOptions: {
      external: [
        'vue',
        'pinia',
        'element-plus',
        'vue-router',
        'axios'
      ]
    }
  }
})
