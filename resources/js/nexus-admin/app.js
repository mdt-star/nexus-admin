/**
 * nexus-admin 入口文件
 * 基于 Vite + Vue 3 + Element Plus 的现代化后台管理界面基座
 *
 * 启动流程：
 *   1. 创建 app/Pinia/Router/ElementPlus
 *   2. loadAndInstallProviders（安装基座→安装第三方→初始化基座→初始化第三方）
 *   3. 挂载应用
 */

/**
 * ResizeObserver 自修复补丁
 * 解决浏览器 "ResizeObserver loop completed with undelivered notifications" 错误。
 */
(function patchResizeObserver() {
  if (typeof window === 'undefined' || window.__nexus_ROPatched) return
  window.__nexus_ROPatched = true
  const OrigRO = window.ResizeObserver
  if (!OrigRO) return

  let rafId = null

  function flushAll() {
    rafId = null
    const entries = []

    if (typeof window.__nexus_ROPendingList !== 'undefined') {
      const list = window.__nexus_ROPendingList
      window.__nexus_ROPendingList = []
      entries.push(...list)
    }
    for (const { ro, target } of entries) {
      try {
        ro.callback([{ target, contentRect: target.getBoundingClientRect() }], ro.observer)
      } catch (e) {
        // 静默吞异常
      }
    }
  }

  function scheduleFlush() {
    if (!rafId) {
      rafId = requestAnimationFrame(flushAll)
    }
  }

  function PatchedResizeObserver(callback) {
    const ro = new OrigRO((entries, observer) => {
      if (!window.__nexus_ROPendingList) {
        window.__nexus_ROPendingList = []
      }
      for (const entry of entries) {
        window.__nexus_ROPendingList.push({ ro: { callback, observer }, target: entry.target })
      }
      scheduleFlush()
    })
    return ro
  }
  PatchedResizeObserver.prototype = OrigRO.prototype
  window.ResizeObserver = PatchedResizeObserver
})()

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

import zh from './lang/zh'
import en from './lang/en'
import { AppRoot, I18nCollector } from '@nexus-admin/core'
import router, { internalRoutes } from './router/index'
import { hookManager, loadAndInstallProviders, nexusAdminProvider } from '@nexus-admin/core'
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
    i18n: new I18nCollector({ 'zh-CN': zh, 'en': en })
  }

  // install→init 一体化（i18n 队列在内部自动 flush）
  await loadAndInstallProviders(providerCtx, nexusAdminProvider)

  // 基座路由必须在 install 之后注册，确保走代理的数组处理逻辑
  internalRoutes.forEach(route => router.addRoute(route))

  // 暴露页面组件到全局（布局组件通过此映射查找页面组件）
  window.__NEXUS_ADMIN_PAGES__ = nexusAdminProvider.buildPageMap(router)

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
