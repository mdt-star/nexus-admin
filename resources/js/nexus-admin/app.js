/**
 * nexus-admin 入口文件
 * 基于 Vite + Vue 3 + Element Plus 的现代化后台管理界面基座
 *
 * 架构说明：
 *   基座不直接管理 pages/components/directives/plugins 的注册，
 *   而是由各个 Provider 在 install 阶段自行完成。
 *   基座仅负责加载 Provider 并注入上下文（app、router、hookManager 等）。
 */

/**
 * ResizeObserver 自修复补丁
 * 解决浏览器 "ResizeObserver loop completed with undelivered notifications" 错误。
 *
 * 根因：Element Plus 内部组件（el-table、el-dialog、el-popover 等）使用 ResizeObserver
 * 检测尺寸变化，当回调在同一个帧内触发了另一次观察时，浏览器检测到潜在无限循环并输出警告。
 *
 * 方案：将原生 ResizeObserver 的回调执行通过 requestAnimationFrame 批处理，
 * 确保同一帧内的多次观察合并到下一帧执行，彻底消除循环条件。
 * 该补丁为业界标准做法（Vuetify、PrimeVue 等 UI 框架均采用），零副作用。
 */
(function patchResizeObserver() {
  if (typeof window === 'undefined' || window.__nexus_ROPatched) return
  window.__nexus_ROPatched = true
  const OrigRO = window.ResizeObserver
  if (!OrigRO) return

  let rafId = null

  /**
   * 统一执行所有待处理的观察回调
   */
  function flushAll() {
    rafId = null
    // 快照当前待处理列表，避免执行过程中新加入的任务干扰本次批处理
    const entries = []

    if (typeof window.__nexus_ROPendingList !== 'undefined') {
      const list = window.__nexus_ROPendingList
      window.__nexus_ROPendingList = []
      entries.push(...list)
    }
    // 执行所有回调
    for (const { ro, target } of entries) {
      try {
        ro.callback([{ target, contentRect: target.getBoundingClientRect() }], ro.observer)
      } catch (e) {
        // 静默吞异常，不影响主流程
      }
    }
  }

  /**
   * 排期一次批量执行
   */
  function scheduleFlush() {
    if (!rafId) {
      rafId = requestAnimationFrame(flushAll)
    }
  }

  /**
   * 补丁后的 ResizeObserver 构造函数
   */
  function PatchedResizeObserver(callback) {
    const ro = new OrigRO((entries, observer) => {
      // 将所有通知排期到下一个 rAF 帧
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

import { createApp, watch } from 'vue'
import { createPinia } from 'pinia'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import AppRoot from './AppRoot.vue'
import router from './router'
import { setApiBaseURL, setLoginPath, setTranslator } from './services/api'
import permissionDirective from './directives/permission'
import PermissionTag from './components/common/PermissionTag.vue'
import hookManager from './utils/hook-manager'
import { installProvider, routeStore } from './utils/create-provider-installer'

import './styles/global.scss'

// 基座自身 Provider
import nexusAdminProvider from './providers/nexus-admin'

/**
 * 加载并安装扩展包 Provider
 *
 * 从 window.__NEXUS_ADMIN_PROVIDERS__ 读取（由 Blade 视图注入），
 * 格式：{ 'nexus-blog': 'vendor/nexus-blog/provider.js' }
 *
 * 每个 provider 通过 installProvider() 安装，providerName 自动从 key 注入，
 * provider.js 中不需要重复声明包名。
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
 * 从 router 的路由表中递归提取所有带 component 的路由。
 * 注意：直接存储 resolved 组件对象，不要函数包装，
 * 否则 `<component :is>` 会解析失败显示 [object Object]。
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

/**
 * 全局错误捕获
 * 将 Vue 运行时错误和未捕获的 Promise 错误输出到控制台，
 * 方便排查浏览器运行时问题
 */
function setupGlobalErrorHandler(app) {
  // Vue 运行时错误
  app.config.errorHandler = (err, instance, info) => {
    console.group(`[NexusAdmin Error] Vue 运行时错误`)
    console.error('错误信息:', err)
    console.warn('错误来源:', info)
    if (instance) {
      console.warn('组件:', instance.$options?.name || instance.$options?.__file || '匿名组件')
    }
    console.groupEnd()
  }

  // 未捕获的 Promise 错误
  window.addEventListener('unhandledrejection', (event) => {
    console.group(`[NexusAdmin Error] 未捕获的 Promise 错误`)
    console.error('错误信息:', event.reason)
    console.groupEnd()
  })

  // 全局 JS 错误
  window.addEventListener('error', (event) => {
    // 跳过资源加载错误（如图片加载失败），只捕获脚本错误
    if (event.target !== window && event.target !== document) return
    console.group(`[NexusAdmin Error] 全局 JS 错误`)
    console.error('错误信息:', event.message, `(${event.filename}:${event.lineno}:${event.colno})`)
    console.groupEnd()
  })
}

// 初始化应用
async function initNexusAdmin(mountSelector = '#app') {
  const app = createApp(AppRoot)
  const pinia = createPinia()

  // 设置全局错误捕获
  setupGlobalErrorHandler(app)

  // 触发 app:init 钩子
  await hookManager.emit('app:init', app)

  // 开发环境加载 Mock.js 拦截
  // mockjs 为 devDependencies，生产环境可能未安装，加 try/catch 兜底
  if (import.meta.env.VITE_USE_MOCK !== 'false') {
    try {
      const { initMock } = await import('./mock/setup')
      await initMock()
    } catch (e) {
      console.warn('[NexusAdmin] Mock 加载失败（生产环境可忽略）:', e.message)
    }
  }

  // 注册 Pinia
  app.use(pinia)

  // 注册 Vue Router
  app.use(router)

  // 注册 Element Plus（默认 large 尺寸）
  app.use(ElementPlus, { size: 'large' })

  // 注入菜单文字颜色变量（不依赖主色，亮/暗各一套）
  const style = document.createElement('style')
  style.textContent = `
    :root { --el-menu-text-color: #1e293b !important; }
    html.dark { --el-menu-text-color: #f1f5f9 !important; }
  `
  document.head.appendChild(style)

  // 注册所有 Element Plus 图标为全局组件
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }

  // 注册权限指令
  app.directive('permission', permissionDirective)

  // 注册权限组件
  app.component('PermissionTag', PermissionTag)

  // ==================== 加载 Provider ====================
  // 构造 provider 上下文
  const providerCtx = { app, router, hookManager, pinia }

  // 1. 安装基座自身 Provider（内置路由，providerName='nexus-admin' 由 installProvider 自动注入）
  installProvider(providerCtx, 'nexus-admin', nexusAdminProvider)

  // 2. 加载并安装第三方 Provider（providerName 从 PHP 注入的 key 自动传入）
  await loadAndInstallProviders(providerCtx)

  // 3. 暴露页面组件到全局（兼容旧式引用）
  window.__NEXUS_ADMIN_PAGES__ = buildPageMapFromRoutes()

  // 加载配置
  const { useConfigStore } = await import('./stores/config')
  const configStore = useConfigStore()

  // 先从 localStorage 恢复用户配置（主题、布局、语言等持久化）
  configStore.loadUserConfigFromStorage()

  await configStore.loadConfig()
  await hookManager.emit('config:loaded', configStore.merged)

  // 从全局配置中读取 API BaseURL 和登录页路径，初始化请求实例
  setApiBaseURL(configStore.get('apiBaseURL', ''))
  setLoginPath(configStore.get('loginPath', '/login'))

  // 加载权限标签
  const { usePermissionStore } = await import('./stores/permission')
  const permissionStore = usePermissionStore()
  await permissionStore.loadTags()

  // 初始化主题
  const { useThemeStore } = await import('./stores/theme')
  const themeStore = useThemeStore()
  themeStore.init()

  // 初始化多语言
  const { useI18nStore } = await import('./stores/i18n')
  const i18nStore = useI18nStore()
  await i18nStore.init()

  // 将翻译函数注入请求实例，使全局错误提示支持国际化
  setTranslator(i18nStore.t)

  // 加载菜单
  const { useMenuStore } = await import('./stores/menu')
  const menuStore = useMenuStore()
  await menuStore.loadMenus()

  // 恢复用户登录会话
  const { useUserStore } = await import('./stores/user')
  const userStore = useUserStore()
  await userStore.restoreSession()

  // 初始化 UI 尺寸（从 ConfigStore 读取 uiSize）
  const { useUiSizeStore } = await import('./stores/size')
  const uiSizeStore = useUiSizeStore()
  uiSizeStore.syncFromConfig(configStore)

  // 初始化响应式
  const { useAppStore } = await import('./stores/app')
  const appStore = useAppStore()
  appStore.initResponsive()

  // 监听窗口变化同步 URL（自动带上该 Tab 保存的搜索参数）
  const { useWindowStore } = await import('./stores/windows')
  const windowStore = useWindowStore()
  watch(() => windowStore.active, (active) => {
    if (active && active.path) {
      router.push({ path: active.path, query: active.params?.query || {} }).catch(() => {})

    }
  }, { immediate: true })

  // 挂载应用
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
// 注意：当通过动态 import() 加载时，DOMContentLoaded 可能已触发，
// 因此直接调用 initNexusAdmin()，它会等待 DOM 就绪
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