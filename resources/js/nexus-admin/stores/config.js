/**
 * 配置状态管理
 * 管理全局配置和用户配置，支持分层合并
 *
 * 配置层级（从低到高）：
 * 1. 系统默认配置
 * 2. 全局配置（管理员设置）
 * 3. 用户配置（用户个人设置）
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import hookManager from '../utils/hook-manager'

export const useConfigStore = defineStore('nexus-config', () => {
  // 系统默认配置
  const defaults = ref({
    layout: 'sidebar',        // 布局模式: desktop | sidebar
    theme: 'light',           // 主题: light | dark
    primaryColor: '#14b8a6',  // 主色调（青绿）
    sidebarCollapsed: false,  // 侧边栏是否折叠
    locale: 'zh-CN',          // 语言
    windowMaximized: false,   // 窗口是否最大化
    tabs: [],                 // 已打开的 Tab 列表
    tabMode: true,            // 是否显示 Tab 栏（false=单页模式）
    headerColor: '',          // 顶部背景色（空=默认）
    uiSize: 'medium'          // UI 控件尺寸: small | medium | large
  })

  // 全局配置（管理员设置）
  const global = ref({})

  // 用户配置
  const user = ref({})

  // 合并后的最终配置
  const merged = computed(() => {
    return {
      ...defaults.value,
      ...global.value,
      ...user.value
    }
  })

  /**
   * 获取指定配置项
   * @param {string} key
   * @param {*} defaultValue
   */
  function get(key, defaultValue = null) {
    return merged.value[key] !== undefined ? merged.value[key] : defaultValue
  }

  /**
   * 从 localStorage 恢复用户配置
   */
  function loadUserConfigFromStorage() {
    try {
      const saved = localStorage.getItem('nexus-admin-user-config')
      if (saved) {
        const parsed = JSON.parse(saved)
        Object.assign(user.value, parsed)
      }
    } catch (e) {
      // localStorage 不可用时静默忽略
    }
  }

  /**
   * 保存用户配置到 localStorage
   */
  function saveUserConfigToStorage() {
    try {
      localStorage.setItem('nexus-admin-user-config', JSON.stringify(user.value))
    } catch (e) {
      // localStorage 不可用时静默忽略
    }
  }

  /**
   * 更新用户配置
   * @param {string} key
   * @param {*} value
   */
  async function setUserConfig(key, value) {
    user.value[key] = value
    saveUserConfigToStorage()
    await saveUserConfig()
    await hookManager.emit('config:changed', key, value, merged.value)
  }


  /**
   * 批量更新用户配置
   * @param {object} config
   */
  async function setUserConfigs(config) {
    Object.assign(user.value, config)
    saveUserConfigToStorage()
    await hookManager.emit('config:changed', null, config, merged.value)
  }

  /**
   * 设置全局配置
   * @param {object} config
   */
  async function setGlobalConfig(config) {
    Object.assign(global.value, config)
    await hookManager.emit('config:changed', null, config, merged.value)
  }

  /**
   * 从后端加载配置
   */
  async function loadConfig() {
    // 触发配置加载前钩子
    await hookManager.emit('config:before-load')

    try {
      const { default: configApi } = await import('../services/config')
      const response = await configApi.fetch()
      if (response.data) {
        if (response.data.global) {
          setGlobalConfig(response.data.global)
        }
        if (response.data.user) {
          setUserConfigs(response.data.user)
        }
      }
    } catch (e) {
      console.warn('[NexusAdmin] 加载配置失败，使用默认配置:', e)
    }
  }

  /**
   * 保存用户配置到后端
   */
  async function saveUserConfig() {
    try {
      const { default: configApi } = await import('../services/config')
      await configApi.save(user.value)
    } catch (e) {
      console.warn('[NexusAdmin] 保存配置失败:', e)
    }
  }

  return {
    defaults,
    global,
    user,
    merged,
    get,
    setUserConfig,
    setUserConfigs,
    setGlobalConfig,
    loadConfig,
    loadUserConfigFromStorage,
    saveUserConfig,
    saveUserConfigToStorage
  }
})
