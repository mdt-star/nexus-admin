/**
 * 应用层业务 Provider
 *
 * 封装所有"本应用特有"的注册与初始化逻辑，
 * 避免业务代码污染 app.js。
 *
 * 生命周期：
 *   install — 注册型操作（业务路由、业务语言包、业务 Mock）
 *   init    — 初始化型操作（可选）
 */
import zh from '../lang/zh'
import en from '../lang/en'
import { internalRoutes } from '../router/index'
import businessMock from '../mock/business'

export default {
  name: 'app',

  /**
   * install 阶段：注册型操作
   */
  install({ router, i18n, mock }) {
    // 1. 业务语言包（与核心包翻译合并）
    i18n.addMessages({ 'zh-CN': zh, 'en': en })

    // 2. 业务路由（走 installProvider 代理的 addRoute）
    internalRoutes.forEach(route => router.addRoute(route))

    // 3. 业务 Mock（与核心包内置 Mock 叠加）
    mock.add(businessMock)
  }

  /**
   * init 阶段（按需启用）
   * async init(ctx) {
   *   // 业务初始化逻辑
   * }
   */
}
