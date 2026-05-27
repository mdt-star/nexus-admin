/**
 * nexus-admin 入口文件
 * 基于 Vite + Vue 3 + Element Plus 的现代化后台管理界面基座
 */
import { createApp, watch } from 'vue'
import { createPinia } from 'pinia'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import AppRoot from './AppRoot.vue'
import router from './router'
import permissionDirective from './directives/permission'
import PermissionTag from './components/common/PermissionTag.vue'
import hookManager from './utils/hook-manager'
import pluginRegistry from './plugins/registry'

import './styles/global.scss'

/**
 * 加载扩展包注册表
 * 从 window.__NEXUS_ADMIN_REGISTRY__ 读取（由 Blade 视图注入）
 * 如果不存在（开发环境直接使用 index.html），返回空注册表
 *
 * 注册表结构（兼容两种格式）：
 * 格式 A（路径字符串 - 生产环境 Blade 注入）：
 *   pages: { 'page-key': 'vendor/{pkg}/pages/xxx.vue' }
 * 格式 B（组件对象 - 开发环境 registry.js 直接导入）：
 *   pages: { 'page-key': VueComponent }
 */
function loadRegistry() {
  return window.__NEXUS_ADMIN_REGISTRY__ || {
    pages: {},
    components: {},
    directives: {},
    plugins: {}
  }
}

/**
 * 解析注册表中的条目
 * 兼容路径字符串和组件对象两种格式
 */
function resolveEntry(value) {
  // 如果是字符串（路径），动态导入
  if (typeof value === 'string') {
    return import(`./${value}`).then(mod => mod.default || mod)
  }
  // 如果是对象/函数（已导入的组件），直接返回
  return Promise.resolve(value)
}

/**
 * 解析注册表中的页面组件
 */
async function resolvePageComponents(pageMap) {
  const resolved = {}
  for (const [key, value] of Object.entries(pageMap)) {
    try {
      resolved[key] = await resolveEntry(value)
    } catch (e) {
      console.warn(`[NexusAdmin] 加载页面组件 "${key}" 失败:`, e)
    }
  }
  return resolved
}

/**
 * 解析注册表中的全局组件
 */
async function resolveComponents(compMap) {
  const resolved = {}
  for (const [name, value] of Object.entries(compMap)) {
    try {
      resolved[name] = await resolveEntry(value)
    } catch (e) {
      console.warn(`[NexusAdmin] 加载全局组件 "${name}" 失败:`, e)
    }
  }
  return resolved
}

/**
 * 解析注册表中的指令
 */
async function resolveDirectives(dirMap) {
  const resolved = {}
  for (const [name, value] of Object.entries(dirMap)) {
    try {
      resolved[name] = await resolveEntry(value)
    } catch (e) {
      console.warn(`[NexusAdmin] 加载指令 "${name}" 失败:`, e)
    }
  }
  return resolved
}

/**
 * 解析注册表中的插件处理器
 */
async function resolvePlugins(pluginMap) {
  const resolved = {}
  for (const [id, config] of Object.entries(pluginMap)) {
    try {
      const handler = await resolveEntry(config.handler)
      resolved[id] = {
        ...config,
        loader: () => handler
      }
    } catch (e) {
      console.warn(`[NexusAdmin] 加载插件 "${id}" 失败:`, e)
    }
  }
  return resolved
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

  // 加载扩展包注册表
  const registry = loadRegistry()

  // 解析并注册页面组件
  const pageComponents = await resolvePageComponents(registry.pages || {})

  // 解析并注册全局组件
  const globalComponents = await resolveComponents(registry.components || {})

  // 注册全局组件到 Vue
  for (const [name, component] of Object.entries(globalComponents)) {
    app.component(name, component)
  }

  // 解析并注册指令
  const directives = await resolveDirectives(registry.directives || {})
  for (const [name, directive] of Object.entries(directives)) {
    app.directive(name, directive)
  }

  // 解析并注册插件
  const plugins = await resolvePlugins(registry.plugins || {})
  for (const [id, config] of Object.entries(plugins)) {
    pluginRegistry.register('extension', id, config)
  }

  // 暴露页面组件到全局，供布局组件动态加载
  window.__NEXUS_ADMIN_PAGES__ = pageComponents

  // 加载配置
  const { useConfigStore } = await import('./stores/config')
  const configStore = useConfigStore()

  // 先从 localStorage 恢复用户配置（主题、布局、语言等持久化）
  configStore.loadUserConfigFromStorage()

  await configStore.loadConfig()
  await hookManager.emit('config:loaded', configStore.merged)

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

  // 加载菜单
  const { useMenuStore } = await import('./stores/menu')
  const menuStore = useMenuStore()
  await menuStore.loadMenus()

  // 恢复用户登录会话
  const { useUserStore } = await import('./stores/user')
  const userStore = useUserStore()
  await userStore.restoreSession()

  // 初始化 UI 尺寸
  const { useUiSizeStore } = await import('./stores/size')
  const uiSizeStore = useUiSizeStore()
  uiSizeStore.init()

  // 初始化响应式
  const { useAppStore } = await import('./stores/app')
  const appStore = useAppStore()
  appStore.initResponsive()

  // 监听窗口变化同步 URL（自动带上该 Tab 保存的搜索参数）
  const { useWindowStore } = await import('./stores/windows')
  const windowStore = useWindowStore()
  watch(() => windowStore.active, (active) => {
    if (active && active.route) {
      router.push({ path: active.route, query: active.searchParams }).catch(() => {})
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

export { initNexusAdmin, hookManager, pluginRegistry }
