/**
 * Nexus Admin 应用工厂
 *
 * 封装所有固定的启动流程，应用层只需传入 router 和 providers。
 *
 * 固定逻辑（所有项目一致）：
 *   - createApp + createPinia
 *   - 注册 Element Plus
 *   - hookManager 生命周期（app:init / app:mounted / app:before-unmount）
 *   - 创建 I18nCollector
 *   - loadAndInstallProviders + mount
 *
 * 可变逻辑（由应用层传入）：
 *   - router（createWebHistory 等配置在应用层）
 *   - baseProviders（至少 [nexusAdminProvider, appProvider]）
 *   - mockInit（可选）
 *   - mountSelector（默认 #app）
 */
import './patch-resize-observer'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

import AppRoot from '../AppRoot.vue'
import hookManager from './hook-manager'
import { I18nCollector } from './i18n-collector'
import { loadAndInstallProviders } from './create-provider-installer'
import { initCoreMock } from '../mock/setup'

/**
 * 创建并启动 Nexus Admin 应用
 *
 * Mock 策略：
 *   1. 始终加载核心包内置 Mock（框架 API 响应）
 *   2. 如果传入 mockInit，在核心 Mock 之后执行（应用层可继承并覆盖）
 *   3. 开关：import.meta.env.VITE_USE_MOCK === 'false' 时跳过
 *
 * @param {object} options
 * @param {object}   options.router         - Vue Router 实例
 * @param {object[]} options.baseProviders  - base provider 数组
 * @param {Function} [options.mockInit]     - 应用层 Mock 初始化函数（可选）
 * @param {string}   [options.mountSelector] - 挂载选择器，默认 '#app'
 * @returns {Promise<object>} app 实例
 */
export async function createNexusApp({ router, baseProviders, mockInit, mountSelector = '#app' }) {
  const app = createApp(AppRoot)
  const pinia = createPinia()

  // 触发 app:init 钩子
  await hookManager.emit('app:init', app)

  // 加载 Mock
  if (import.meta.env.VITE_USE_MOCK !== 'false') {
    // 1. 核心包内置 Mock（框架 API）
    try {
      await initCoreMock()
    } catch (e) {
      console.warn('[NexusAdmin] 核心 Mock 加载失败:', e.message)
    }

    // 2. 应用层自定义 Mock（继承并覆盖）
    if (mockInit) {
      try {
        await mockInit()
      } catch (e) {
        console.warn('[NexusAdmin] 应用层 Mock 加载失败（可忽略）:', e.message)
      }
    }
  }

  // ==================== 注册基础设施 ====================
  app.use(pinia)
  app.use(router)
  app.use(ElementPlus, { size: 'large' })

  // ==================== 安装并初始化所有 Provider ====================
  const providerCtx = {
    app, router, hookManager, pinia,
    i18n: new I18nCollector()
  }
  await loadAndInstallProviders(providerCtx, baseProviders)

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