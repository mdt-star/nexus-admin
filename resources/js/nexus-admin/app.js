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

import AppRoot from './AppRoot.vue'
import router from './router'
import hookManager from './utils/hook-manager'
import { installProvider, routeStore } from './utils/create-provider-installer'

import './styles/global.scss'

// 基座自身 Provider
import nexusAdminProvider from './providers/nexus-admin'

/**
 * 加载、安装并初始化所有 Provider
 *
 * 内部顺序（install 无顺序依赖，init 有顺序依赖）：
 *   1. install 基座 provider（语言包、图标、指令、组件、路由）
 *   2. install 第三方 provider（注册操作）
 *   3. init 基座 provider（config → API → 权限 → 主题 → i18n → 用户 → 尺寸 → 响应式）
 *   4. init 第三方 provider（如果提供 init 方法）
 *
 * @param {object} ctx                  - provider 上下文
 * @param {Array}  pendingI18nMessages   - 第三方暂存的语言包队列
 */
async function loadAndInstallProviders(ctx, pendingI18nMessages) {
  // === 1. 安装基座 provider ===
  installProvider(ctx, 'nexus-admin', nexusAdminProvider)

  // === 2. 安装第三方 provider（注册型操作） ===
  const providerMap = window.__NEXUS_ADMIN_PROVIDERS__ || {}
  const thirdPartyProviders = []

  await Promise.all(Object.entries(providerMap).map(async ([pkg, path]) => {
    try {
      const mod = await import(/* @vite-ignore */ `./${path}`)
      const provider = mod.default || mod
      if (provider && typeof provider.install === 'function') {
        installProvider(ctx, pkg, provider)
        thirdPartyProviders.push(provider)
      }
    } catch (e) {
      console.warn(`[NexusAdmin] 加载 Provider "${pkg}" 失败:`, e)
    }
  }))

  // === 3. 初始化基座 provider ===
  await nexusAdminProvider.init(ctx, pendingI18nMessages)

  // === 4. 初始化第三方 provider（如果有 init 方法） ===
  for (const provider of thirdPartyProviders) {
    if (typeof provider.init === 'function') {
      try {
        await provider.init(ctx)
      } catch (e) {
        console.warn(`[NexusAdmin] 初始化 Provider 失败:`, e)
      }
    }
  }
}

/**
 * 构建页面组件映射（兼容旧式 window.__NEXUS_ADMIN_PAGES__）
 * 布局组件（SidebarLayout/DesktopLayout/DesktopWindow）通过此映射查找组件
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

  // 一句话完成：install 基座 → install 第三方 → init 基座 → init 第三方
  await loadAndInstallProviders(providerCtx, pendingI18nMessages)

  // 暴露页面组件到全局（布局组件通过此映射查找页面组件）
  window.__NEXUS_ADMIN_PAGES__ = buildPageMapFromRoutes()

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

export { bootstrap, hookManager, routeStore }