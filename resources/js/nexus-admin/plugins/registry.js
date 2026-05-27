/**
 * 插件注册中心
 * 管理所有扩展包的插件注册与生命周期
 */
import hookManager from '../utils/hook-manager'

class PluginRegistry {
  constructor() {
    this.plugins = {}
  }

  /**
   * 注册插件
   * @param {string} pkg - 扩展包名称
   * @param {string} id - 插件 ID
   * @param {object} config - 插件配置
   * @param {string[]} config.hooks - 需要响应的钩子列表
   * @param {Function} [config.loader] - 异步加载器（有组件时）
   */
  register(pkg, id, config) {
    const key = `${pkg}:${id}`
    this.plugins[key] = { pkg, id, ...config }

    // 注册钩子监听
    if (config.hooks && config.hooks.length > 0) {
      config.hooks.forEach(hookName => {
        hookManager.on(hookName, async (...args) => {
          try {
            if (config.loader) {
              // 有加载器，动态加载插件代码
              const mod = await config.loader()
              const handler = mod[hookName] || mod.default?.[hookName] || mod.default
              if (typeof handler === 'function') {
                await handler(...args)
              } else if (typeof mod.default === 'function') {
                await mod.default(...args)
              }
            } else {
              // 无加载器，插件代码已内联
              if (typeof config.handler === 'function') {
                await config.handler(hookName, ...args)
              }
            }
          } catch (e) {
            console.error(`[NexusAdmin] 插件 "${key}" 执行钩子 "${hookName}" 出错:`, e)
          }
        })
      })
    }

    return this
  }

  /**
   * 批量注册插件（从 registry 导入）
   * @param {object} pluginMap - { pkg: { id: config } }
   */
  registerAll(pluginMap) {
    Object.entries(pluginMap).forEach(([pkg, plugins]) => {
      Object.entries(plugins).forEach(([id, config]) => {
        this.register(pkg, id, config)
      })
    })
  }

  /**
   * 获取已注册的插件列表
   */
  getPlugins() {
    return Object.values(this.plugins)
  }

  /**
   * 获取指定扩展包的插件
   */
  getPackagePlugins(pkg) {
    return Object.values(this.plugins).filter(p => p.pkg === pkg)
  }
}

const pluginRegistry = new PluginRegistry()

export default pluginRegistry
