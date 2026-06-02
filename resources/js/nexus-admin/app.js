/**
 * nexus-admin 入口文件
 * 基于 Vite + Vue 3 + Element Plus 的现代化后台管理界面基座
 *
 * 启动流程：
 *   1. 创建 app/Pinia/Router/ElementPlus
 *   2. 安装所有 Provider（注册型操作：图标、指令、组件、路由、语言包）
 *   3. 初始化所有 Provider（初始化型操作：config/theme/i18n/user 等，有顺序依赖）
 *   4. 挂载应用
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

import AppRoot from './AppRoot.vue'
import router from './router'
import hookManager from './utils/hook-manager'
import { installProvider, routeStore } from './utils/create-provider-installer'

import './styles/global.scss'

// 基座自身 Provider（统一的注册点：图标、指令、组件、样式、路由、语言包、初始化）
import nexusAdminProvider from './providers/nexus-admin'

/**
 * 加载并安装扩展包 Provider
 * provider 格式：{ 'nexus-blog': 'vendor/nexus-blog/provider.js' }
 */
async function loadAndInstallProviders(ctx) {
  const providerMap = window.__NEXUS_ADMIN_PROVIDERS__ || {}

  const tasks = Object.entries(providerMap).map(async ([pkg, path]) => {
    try {
      const mod = await import(/* @vite-ignore */ `./${path}`)
      const provider = mod.default || mod
      if (provider && typeof provider.install === 'function') {
        installProvider(ctx, pkg, provider)
      }
    } catch (e) {
      console.warn(`[NexusAdmin] 加载 Provider "${pkg}" 失败:`, e)
    }
  })

  return Promise.all(tasks)
}

/**
 * 构建页面组件映射（兼容旧式 window.__NEXUS_ADMIN_PAGES__）
 */
function buildPageMapFromRoutes() {
  const pageMap = {}
  const routes = router.getRoutes()

  function walk(records) {
    for (const record of records) {
      if (record.components?.default) {
        pageMap[record.name] = record.components.default
      }
      if (record.children) {
        walk(record.children)
      }
    }
  }

  walk(routes)
  return pageMap
}

// 初始化应用
async function initNexusAdmin(mountSelector = '#app') {
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

  // ==================== 第1步：安装所有 Provider ====================
  // i18n.addMessages 暂存到队列，init 阶段回放
  const pendingI18nMessages = []

  const providerCtx = {
    app, router, hookManager, pinia,
    i18n: {
      addMessages(lang, msgs) {
        if (typeof lang === 'object') {
          pendingI18nMessages.push(lang)
        } else {
          pendingI18nMessages.push([lang, msgs])
        }
      }
    }
  }

  installProvider(providerCtx, 'nexus-admin', nexusAdminProvider)
  await loadAndInstallProviders(providerCtx)

  // 暴露页面组件到全局
  window.__NEXUS_ADMIN_PAGES__ = buildPageMapFromRoutes()

  // ==================== 第2步：初始化所有 Provider ====================
  await nexusAdminProvider.init(providerCtx, pendingI18nMessages)

  // ==================== 第3步：挂载应用 ====================
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

// 自动初始化
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initNexusAdmin()
    })
  } else {
    initNexusAdmin()
  }
}

export { initNexusAdmin, hookManager, routeStore }