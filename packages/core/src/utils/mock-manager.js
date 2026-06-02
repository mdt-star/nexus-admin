/**
 * Mock 管理器
 *
 * 统一管理所有 Mock 注册，支持核心包内置 + 第三方 + 应用层叠加。
 *
 * 每个 Mock 文件导出一个 (Mock) => { ... } 函数，
 * 在 Provider install 阶段通过 ctx.mock.add(handler) 注册。
 *
 * 使用方式（第三方 provider.js）：
 *   import blogMock from './mock/blog'
 *   export default {
 *     install({ mock }) {
 *       mock.add(blogMock)   // 注册自己的 Mock
 *     }
 *   }
 *
 * 开关：import.meta.env.VITE_USE_MOCK === 'false' 时跳过
 */
import coreMock from '../mock/index'

export class MockManager {
  constructor() {
    this._handlers = []
    // 默认注册核心包内置 Mock
    this.add(coreMock)
  }

  /**
   * 注册一个 Mock 处理函数
   * @param {Function} fn - (Mock) => { ... }
   */
  add(fn) {
    if (typeof fn === 'function') {
      this._handlers.push(fn)
    }
  }

  /**
   * 执行所有注册的 Mock
   * 在 app.mount() 之前调用
   *
   * 逆序执行：后注册的 handler 先注册到 Mock.js。
   * 这样业务/第三方 Mock 可以覆盖核心包内置 Mock 的同 pattern 响应。
   */
  async run() {
    if (import.meta.env.VITE_USE_MOCK === 'false') return
    if (this._handlers.length === 0) return

    const Mock = (await import('mockjs')).default
    Mock.setup({ timeout: '200-400' })

    // 逆序：业务/第三方 Mock（后 add）先注册，优先级更高
    for (const fn of [...this._handlers].reverse()) {
      try {
        await fn(Mock)
      } catch (e) {
        console.warn('[NexusAdmin] Mock 注册失败:', e.message)
      }
    }
  }
}