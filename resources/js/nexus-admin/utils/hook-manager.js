/**
 * 钩子管理器
 * 管理系统的生命周期钩子，支持插件通过钩子响应系统事件
 */
class HookManager {
  constructor() {
    this.hooks = {}
  }

  /**
   * 注册钩子监听
   * @param {string} event - 事件名称
   * @param {Function} handler - 处理函数
   */
  on(event, handler) {
    if (!this.hooks[event]) {
      this.hooks[event] = []
    }
    this.hooks[event].push(handler)
  }

  /**
   * 移除钩子监听
   * @param {string} event - 事件名称
   * @param {Function} handler - 处理函数（不传则移除所有）
   */
  off(event, handler) {
    if (!this.hooks[event]) return
    if (handler) {
      this.hooks[event] = this.hooks[event].filter(h => h !== handler)
    } else {
      delete this.hooks[event]
    }
  }

  /**
   * 触发钩子事件
   * @param {string} event - 事件名称
   * @param {...any} args - 传递给处理函数的参数
   */
  async emit(event, ...args) {
    const handlers = this.hooks[event] || []
    for (const handler of handlers) {
      try {
        await handler(...args)
      } catch (e) {
        console.error(`[NexusAdmin] Hook "${event}" 执行出错:`, e)
      }
    }
  }

  /**
   * 获取所有已注册的事件名称
   */
  getEvents() {
    return Object.keys(this.hooks)
  }

  /**
   * 获取指定事件的监听器数量
   */
  getListenerCount(event) {
    return (this.hooks[event] || []).length
  }
}

// 全局单例
const hookManager = new HookManager()

export default hookManager
