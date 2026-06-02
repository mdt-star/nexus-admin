/**
 * nexus-admin 入口文件
 * 基于 Vite + Vue 3 + Element Plus 的现代化后台管理界面基座
 *
 * 启动流程：
 *   1. 创建 app/Pinia/Router/ElementPlus
 *   2. loadAndInstallProviders（安装基座→安装第三方→初始化基座→初始化第三方）
 *   3. 挂载应用
 */

import '@nexus-admin/core/src/utils/patch-resize-observer'
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

import { AppRoot, I18nCollector } from '@nexus-admin/core'
import router from './router/index'
import { hookManager, loadAndInstallProviders, nexusAdminProvider } from '@nexus-admin/core'
import appProvider from './providers/app'
import '@nexus-admin/core/src/styles/global.scss'

// 启动应用
async function bootstrap(mountSelector = '#app') {
  const app = createApp(AppRoot)
  const pinia = createPinia()

  // 触发 app:init 钩子
  await hookManager.emit('app:init', app)

  // 开发环境加载 Mock.js 拦截
  if (import.meta.env.VITE_USE_MOCK !== 'false') {
    try {
      const { initMock } = await import('./mock/setup')
      await initMock()
    } catch (e) {
      console.warn('[NexusAdmin] Mock 加载失败（生产环境可忽略）:', e.message)
    }
  }

  // ==================== 注册基础设施 ====================
  app.use(pinia)
  app.use(router)
  app.use(ElementPlus, { size: 'large' })

  // ==================== 安装并初始化所有 Provider ====================
  const providerCtx = {
    app, router, hookManager, pinia,
    i18n: new I18nCollector()
  }

  // 安装基座 + 业务 provider（i18n 队列在 init 阶段自动 flush）
  await loadAndInstallProviders(providerCtx, [nexusAdminProvider, appProvider])

  // ==================== 挂载应用 ====================
  app.mount(mountSelector)

  // 触发 app:mounted 钩子
  await hookManager.emit('app:mounted', document.querySelector(mountSelector))

  // 注册应用卸载钩子
  const originalUnmount = app.unmount
  app.unmount = function () {
    hookManager.emit('app:before-unmount', app)
    originalUnmount.call(this)
  }

  return app
}

// 自动启动
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      bootstrap()
    })
  } else {
    bootstrap()
  }
}

export { bootstrap }
