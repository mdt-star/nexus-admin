/**
 * Nexus Admin 基座提供者
 *
 * install: 注册型操作（语言包、图标、指令、组件、路由）
 * init:    初始化型操作（config/theme/i18n/user/size 等有顺序依赖的启动流程）
 *
 * providerName 'nexus-admin' 由 app.js 通过 installProvider 自动注入。
 */
import { baseMessages } from '../lang/index'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import permissionDirective from '../directives/permission'
import PermissionTag from '../components/common/PermissionTag.vue'
import { setApiBaseURL, setLoginPath, setTranslator } from '../services/api'
import { watch } from 'vue'

export default {
  /**
   * install 阶段：注册型操作
   * 在 app.mount() 之前执行，无顺序依赖
   */
  install({ app, router, i18n }, providerName) {
    // ==================== 1. 语言包 ====================
    i18n.addMessages(baseMessages)

    // ==================== 2. Element Plus 图标全局注册 ====================
    for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
      app.component(key, component)
    }

    // ==================== 3. 权限指令 ====================
    app.directive('permission', permissionDirective)

    // ==================== 4. 权限组件 ====================
    app.component('PermissionTag', PermissionTag)
  },

  /**
   * init 阶段：初始化型操作
   * 在 install 之后、app.mount() 之前执行，有严格的顺序依赖
   *
   * @param {object}   ctx  - { app, router, hookManager, pinia, i18n }
   *                            ctx.i18n 为 I18nCollector 实例，内部调用 flush() 获取队列
   */
  async init(ctx) {
    const { app, router, hookManager, pinia } = ctx
    // 从 I18nCollector 中 flush 所有暂存的消息
    const pendingI18nMessages = ctx.i18n?.flush?.() ?? []

    // ==================== 1. 配置加载 ====================
    const { useConfigStore } = await import('../stores/config')
    const configStore = useConfigStore()
    configStore.loadUserConfigFromStorage()
    await configStore.loadConfig()
    await hookManager.emit('config:loaded', configStore.merged)

    // ==================== 2. API 基础配置 ====================
    setApiBaseURL(configStore.get('apiBaseURL', ''))
    setLoginPath(configStore.get('loginPath', '/login'))

    // ==================== 3. 权限标签 ====================
    const { usePermissionStore } = await import('../stores/permission')
    const permissionStore = usePermissionStore()
    await permissionStore.loadTags()

    // ==================== 4. 主题初始化 ====================
    const { useThemeStore } = await import('../stores/theme')
    const themeStore = useThemeStore()
    themeStore.init()

    // ==================== 5. 多语言初始化 ====================
    const { useI18nStore } = await import('../stores/i18n')
    const i18nStore = useI18nStore()
    await i18nStore.init(pendingI18nMessages)
    // 初始化后，第三方 provider 可调用 i18nStore.addMessages()
    ctx.i18n.addMessages = i18nStore.addMessages.bind(i18nStore)
    // 将翻译函数注入请求实例
    setTranslator(i18nStore.t)

    // ==================== 6. 用户会话恢复 ====================
    const { useUserStore } = await import('../stores/user')
    const userStore = useUserStore()
    await userStore.restoreSession()

    // ==================== 7. UI 尺寸 ====================
    const { useUiSizeStore } = await import('../stores/size')
    const uiSizeStore = useUiSizeStore()
    uiSizeStore.syncFromConfig(configStore)

    // ==================== 8. 响应式 ====================
    const { useAppStore } = await import('../stores/app')
    const appStore = useAppStore()
    appStore.initResponsive()

    // ==================== 9. URL 同步 ====================
    const { useWindowStore } = await import('../stores/windows')
    const windowStore = useWindowStore()

    // 窗口激活 → URL（replace 不新增历史记录，由 afterEach 管理前进/后退）
    watch(() => windowStore.active, (active) => {
      if (active && active.path) {
        router.replace({ path: active.path, query: active.params?.query || {} }).catch(() => {})
      }
    }, { immediate: true })

    // URL 变化 → 窗口激活（支持浏览器前进/后退）
    let syncing = false
    router.afterEach((to) => {
      if (syncing) return
      if (to.path === '/') return
      const match = windowStore.items.find(item => item.path === to.path)
      if (match && match.id !== windowStore.activeId) {
        syncing = true
        windowStore.activate(match.id)
        syncing = false
      }
    })

    // ==================== 10. 构建页面组件映射 ====================
    // 布局组件（SidebarLayout/DesktopLayout/DesktopWindow）通过此映射查找页面组件
    window.__NEXUS_ADMIN_PAGES__ = this.buildPageMap(router)
  },

  /**
   * 构建页面组件映射（兼容旧式 window.__NEXUS_ADMIN_PAGES__）
   * 布局组件（SidebarLayout/DesktopLayout/DesktopWindow）通过此映射查找组件
   *
   * @param {object} router - Vue Router 实例
   * @returns {object} { name: component }
   */
  buildPageMap(router) {
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
}
