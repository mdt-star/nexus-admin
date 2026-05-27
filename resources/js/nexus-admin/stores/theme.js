/**
 * 主题状态管理
 * 管理亮/暗主题和色调切换
 */
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import hookManager from '../utils/hook-manager'
import { useConfigStore } from './config'

export const useThemeStore = defineStore('nexus-theme', () => {
  const configStore = useConfigStore()

  // 当前主题: light | dark
  const theme = ref(configStore.get('theme', 'light'))

  // 当前主色调（初始值不重要，init() 中会重新设置）
  const primaryColor = ref('#14b8a6')

  /**
   * 根据主色生成变体色
   * 简单算法：对 hex 颜色的 R/G/B 通道分别向白色混合
   */
  function lighten(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16)
    const r = Math.min(255, ((num >> 16) & 0xff) + Math.round((255 - ((num >> 16) & 0xff)) * percent))
    const g = Math.min(255, ((num >> 8) & 0xff) + Math.round((255 - ((num >> 8) & 0xff)) * percent))
    const b = Math.min(255, (num & 0xff) + Math.round((255 - (num & 0xff)) * percent))
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
  }

  function darken(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16)
    const r = Math.round(((num >> 16) & 0xff) * (1 - percent))
    const g = Math.round(((num >> 8) & 0xff) * (1 - percent))
    const b = Math.round((num & 0xff) * (1 - percent))
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
  }

  /**
   * 设置主题
   * @param {'light'|'dark'} val
   */
  async function setTheme(val) {
    await hookManager.emit('theme:before-change', val)
    theme.value = val
    applyTheme()
    await configStore.setUserConfig('theme', val)
    await hookManager.emit('theme:changed', { theme: val, primaryColor: primaryColor.value })
  }

  /**
   * 切换主题（亮/暗互切）
   */
  async function toggleTheme() {
    await setTheme(theme.value === 'light' ? 'dark' : 'light')
  }

  /**
   * 设置主色调
   * 同时设置 nexus 变量和 Element Plus 变量，确保全局统一
   * @param {string} color - 十六进制颜色值
   */
  async function setPrimaryColor(color) {
    primaryColor.value = color
    applyPrimaryColor()
    await configStore.setUserConfig('primaryColor', color)
    await hookManager.emit('theme:color-change', color)
    await hookManager.emit('theme:changed', { theme: theme.value, primaryColor: color })
  }

  /**
   * 应用主题到文档
   * 亮/暗切换时同步覆盖 Element Plus dark 主题的主色
   */
  function applyTheme() {
    const c = primaryColor.value
    document.documentElement.setAttribute('data-theme', theme.value)
    if (theme.value === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    document.documentElement.style.setProperty('--el-color-primary', c)
    document.documentElement.style.setProperty('--el-color-primary-dark-2', darken(c, 0.2))
    document.documentElement.style.setProperty('--el-color-primary-light-3', lighten(c, 0.3))
    document.documentElement.style.setProperty('--el-menu-active-color', c)
  }

  /**
   * 应用主色调
   * 同时设置所有 --el-color-primary 变体，防止 Element Plus 组件残留蓝色
   */
  function applyPrimaryColor() {
    const c = primaryColor.value
    const root = document.documentElement
    root.style.setProperty('--nexus-primary-color', c)
    root.style.setProperty('--el-color-primary', c)
    root.style.setProperty('--el-color-primary', c)
    root.style.setProperty('--el-color-primary-dark-2', darken(c, 0.2))
    root.style.setProperty('--el-color-primary-light-3', lighten(c, 0.3))
    root.style.setProperty('--el-color-primary-light-5', lighten(c, 0.5))
    root.style.setProperty('--el-color-primary-light-7', lighten(c, 0.7))
    root.style.setProperty('--el-color-primary-light-8', lighten(c, 0.8))
    root.style.setProperty('--el-color-primary-light-9', lighten(c, 0.9))
    root.style.setProperty('--el-menu-active-color', c)
  }

  /**
   * 初始化主题
   */
  function init() {
    // 从 config 默认值读取主色（确保响应 config.js defaults 的修改）
    // 注意：Pinia 会自动解包 ref，所以 configStore.defaults 直接是对象
    primaryColor.value = configStore.defaults.primaryColor || '#14b8a6'
    applyTheme()
    applyPrimaryColor()
  }

  return {
    theme,
    primaryColor,
    setTheme,
    toggleTheme,
    setPrimaryColor,
    init
  }
})
