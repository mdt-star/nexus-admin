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
        '@element-plus/icons-vue',
        'axios'
      ],
      output: {
        // 禁用代码分割，所有内容打包到单一文件
        // 避免 Vite 分割 chunk 时产生 star export 错误
        manualChunks: undefined,
        inlineDynamicImports: true
      }
    }
  }
})
