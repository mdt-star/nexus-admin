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

/**
 * 创建并启动 Nexus Admin 应用
 *
 * 自动加载 Mock 策略（优先级从高到低）：
 *   1. app layer 根目录下的 mock/setup.js（约定路径）
 *   2. 核心包内置的 initCoreMock（仅占位，无业务数据）
 *
 * @param {object} options
 * @param {object}   options.router         - Vue Router 实例
 * @param {object[]} options.baseProviders  - base provider 数组
 * @param {string}   [options.mountSelector] - 挂载选择器，默认 '#app'
 * @returns {Promise<object>} app 实例
 */
export async function createNexusApp({ router, baseProviders, mountSelector = '#app' }) {
  const app = createApp(AppRoot)
  const pinia = createPinia()

  // 触发 app:init 钩子
  await hookManager.emit('app:init', app)

  // 加载 Mock（先尝试应用层约定路径，再回退到核心包内置）
  if (import.meta.env.VITE_USE_MOCK !== 'false') {
    // 先尝试从应用层加载业务 Mock
    let mockLoaded = false
    if (typeof window.__NEXUS_ADMIN_MOCK_PATH__ !== 'undefined') {
      try {
        const mod = await import(/* @vite-ignore */ window.__NEXUS_ADMIN_MOCK_PATH__)
        await mod.initMock?.()
        mockLoaded = true
      } catch { /* 忽略 */ }
    }
    // 回退到核心包内置 Mock
    if (!mockLoaded) {
      try {
        const { initCoreMock } = await import('../mock/setup')
        await initCoreMock()
      } catch { /* 核心包内置 mock 不存在则跳过 */ }
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