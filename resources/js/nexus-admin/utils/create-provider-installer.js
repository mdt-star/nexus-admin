/**
 * Provider 安装器工厂 & 路由注册中心
 *
 * 基座内部使用 installProvider() 安装所有 Provider（基座自身 + 第三方），
 * 自动代理 router.addRoute 捕获路由，按 providerName 分组存入 routeStore。
 *
 * providerName 由 PHP 端通过 composer.json 的 extra.nexus 收集的 key 自动注入，
 * 第三方开发者在 provider.js 中不需要重复声明包名。
 *
 * 路由简写功能（通过代理自动展开）：
 *   1. name 自动推演：path 去除前导 /，/ 替换为 -。子路由自动拼接父 name + - + 子 path
 *      例如：path:'/blog' → name:'blog'，子 path:'posts' → name:'blog-posts'
 *   2. permission 自动推演：permission:true → 取推演后的 name 值
 *      例如：permission:true → permission:'blog'
 *
 * 使用方式（第三方 provider.js）：
 *   export default {
 *     install({ router, app, hookManager }, providerName) {
 *       router.addRoute({ ... })
 *     }
 *   }
 */
import { reactive } from 'vue'

/**
 * 路由注册中心
 * 以 provider 为维度存储所有注册的路由记录
 */
export const routeStore = reactive({
  /**
   * { 'nexus-blog': [routeRecords], 'nexus-admin': [routeRecords] }
   */
  providers: {},

  /**
   * 获取指定提供者的路由列表
   * @param {string} name
   * @returns {import('vue-router').RouteRecordRaw[]}
   */
  getProviderRoutes(name) {
    return this.providers[name] || []
  },

  /**
   * 获取所有提供者的路由（按 provider 分组）
   * @returns {Object<string, import('vue-router').RouteRecordRaw[]>}
   */
  getAllProviderRoutes() {
    return { ...this.providers }
  },

  /**
   * 构建菜单树（从所有 provider 路由中提取适合展示的菜单项）
   * 过滤规则：
   *   - 必须有 meta.title
   *   - meta.hidden !== true
   *   - 按 meta.sort 排序
   *
   * @param {object} [options]
   * @param {string} [options.provider]  - 仅构建指定提供者的菜单
   * @param {Function} [options.filter]  - 自定义过滤函数 (route) => boolean
   * @returns {Array}
   */
  getMenuTree(options = {}) {
    const { provider, filter } = options
    const sources = provider
      ? [[provider, this.getProviderRoutes(provider)]]
      : Object.entries(this.providers)

    const result = []
    for (const [, routes] of sources) {
      for (const route of routes) {
        const menu = this._routeToMenuItem(route)
        if (menu) {
          if (filter && !filter(route)) continue
          result.push(menu)
        }
      }
    }
    return result.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
  },

  /**
   * 递归将 RouteRecord 转为菜单项
   * @private
   */
  _routeToMenuItem(route) {
    const meta = route.meta || {}
    // 无 title 或 hidden=true 的跳过
    if (!meta.title || meta.hidden) return null

    const item = {
      id: route.name,
      title: meta.title,
      icon: meta.icon || null,
      permission: meta.permission || null,
      sort: meta.sort ?? 0,
      path: route.path,
      component: (route.components?.default || route.component)
        ? route.name // 用路由 name 作为组件标识
        : null,
      provider: meta._provider || null
    }

    // 处理 icon 的两种形态
    if (item.icon && typeof item.icon === 'object') {
      item.iconDesktop = item.icon.desktop || null
      item.iconSidebar = item.icon.sidebar || null
      item.icon = item.icon.desktop || item.icon.sidebar || null
    }

    // 递归处理 children
    if (route.children && route.children.length > 0) {
      const children = route.children
        .map(child => this._routeToMenuItem(child))
        .filter(Boolean)
      if (children.length > 0) {
        item.children = children
      }
    }

    return item
  }
})

/**
 * 安装一个 Provider
 *
 * 由 app.js 内部调用，自动完成：
 *   1. 代理 router.addRoute，捕获所有注册的路由
 *   2. 自动推演 name / permission 等简写字段
 *   3. 为路由打上 meta._provider 标记（来源 providerName）
 *   4. 调用 provider.install(ctx, providerName)
 *   5. 将捕获的路由存入 routeStore.providers[providerName]
 *
 * @param {object} ctx - 基座上下文 { app, router, hookManager, pinia }
 * @param {string} providerName - 提供者名称（由 PHP key 自动注入）
 * @param {object|Function} provider - Provider 对象（含 install 方法）或函数
 */
export function installProvider(ctx, providerName, provider) {
  const origAddRoute = ctx.router.addRoute.bind(ctx.router)
  const capturedRoutes = []

  // 代理 addRoute，支持三种签名：
  //   addRoute(route)         — 单条路由
  //   addRoute(parent, route) — 子路由
  //   addRoute([routes])      — 路由数组
  ctx.router.addRoute = function (parentOrRoute, route) {
    // 支持数组：遍历注册
    if (Array.isArray(parentOrRoute)) {
      const results = []
      for (const r of parentOrRoute) {
        results.push(ctx.router.addRoute(r))
      }
      return results
    }

    const record = route || parentOrRoute

    // 规范化路由：自动推演 name、permission，标记来源
    // 双参数签名时 parentOrRoute 是父路由 name，传给 normalizeRoute 用于子路由 name 拼接
    normalizeRoute(record, route ? parentOrRoute : null, providerName)

    capturedRoutes.push(record)

    return origAddRoute(parentOrRoute, route)
  }

  // 调用 provider 的 install（兼容对象和函数两种形态）
  if (typeof provider.install === 'function') {
    provider.install(ctx, providerName)
  } else if (typeof provider === 'function') {
    provider(ctx, providerName)
  }

  // 收集路由
  if (!routeStore.providers[providerName]) {
    routeStore.providers[providerName] = []
  }
  routeStore.providers[providerName].push(...capturedRoutes)
}

/**
 * 规范化路由记录
 *
 * 在路由注册前自动展开简写字段：
 *   1. name 自动推演：path 去除前导 /，/ 替换为 -
 *      子路由自动拼接父 name + - + 子 path
 *      path: '/' 不推演（需手动指定 name）
 *   2. permission 自动推演：permission: true → 取 name 值
 *      显式字符串或数组保持原样
 *   3. 标记 _provider 来源
 *   4. 递归处理 children
 *
 * @param {object}  route      - 路由记录
 * @param {string}  parentName - 父路由 name（子路径拼接用）
 * @param {string}  provider   - 提供者名称
 */
function normalizeRoute(route, parentName, provider) {
  // === 1. 标记来源 ===
  if (!route.meta) route.meta = {}
  if (!route.meta._provider) {
    route.meta._provider = provider
  }

  // === 2. 自动推演 name ===
  if (!route.name && route.path && route.path !== '/') {
    // 将 /:paramName 替换为 -paramName，确保 name 唯一
    // /user/:id     → user-id
    // /user/:id/posts → user-id-posts
    // /user/:id/comm/:cid → user-id-comm-cid
    const cleanPath = route.path
      .replace(/\/:([\w.-]+)(?:\([^)]*\))?\??/g, '-$1')  // /:id → -id
      .replace(/^\//, '')                                    // 去掉前导 /
    const derivedName = cleanPath.replace(/\//g, '-')        // / 转 -
    // 只有当 path 不以 / 开头时（即相对路径，确认为子路由），才拼接父 name
    // path 以 / 开头表示绝对路径，Vue Router 会注册为根路径，不拼接
    const isRelativeChild = parentName && !route.path.startsWith('/')
    route.name = isRelativeChild ? `${parentName}-${derivedName}` : derivedName
  }

  // === 3. 自动推演 permission ===
  // 支持顶层 shortcut 和 meta 内两种写法
  const rawPermission = route.permission ?? route.meta.permission
  if (rawPermission === true && route.name) {
    route.meta.permission = route.name
  } else if (rawPermission !== undefined) {
    // 字符串或数组保持原样
    route.meta.permission = rawPermission
  }
  // 清除顶层 shortcut（如果存在）
  delete route.permission

  // === 4. 递归处理 children ===
  if (route.children) {
    for (const child of route.children) {
      normalizeRoute(child, route.name, provider)
    }
  }
}

/**
 * 加载、安装并初始化所有 Provider
 *
 * 内部顺序（install 无顺序依赖，init 有顺序依赖）：
 *   1. install 基座 provider
 *   2. install 第三方 provider（注册操作）
 *   3. init 基座 provider
 *   4. init 第三方 provider（如果提供 init 方法）
 *
 * @param {object}   ctx                   - provider 上下文
 * @param {object}   baseProvider           - 基座 provider 实例
 * @param {Array}    pendingI18nMessages    - 第三方暂存的语言包队列
 */
export async function loadAndInstallProviders(ctx, baseProvider, pendingI18nMessages) {
  // === 1. 安装基座 provider ===
  installProvider(ctx, 'nexus-admin', baseProvider)

  // === 2. 安装第三方 provider（注册型操作） ===
  const providerMap = window.__NEXUS_ADMIN_PROVIDERS__ || {}
  const thirdPartyProviders = []

  await Promise.all(Object.entries(providerMap).map(async ([pkg, path]) => {
    try {
      // path 格式: "vendor/nexus-blog/provider.js"
      // 从 utils/ 目录解析到项目根: ../${path}
      const mod = await import(/* @vite-ignore */ `../${path}`)
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
  await baseProvider.init(ctx, pendingI18nMessages)

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

