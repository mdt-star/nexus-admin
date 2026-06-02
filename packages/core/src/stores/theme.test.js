/**
 * Theme Store 单元测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useThemeStore } from './theme'
import { useConfigStore } from './config'

vi.mock('../utils/hook-manager', () => ({
  default: {
    emit: vi.fn(() => Promise.resolve())
  }
}))

// Mock localStorage for config store
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn(key => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = value }),
    removeItem: vi.fn(key => { delete store[key] }),
    clear: vi.fn(() => { store = {} })
  }
})()
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

describe('ThemeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorageMock.clear()
    document.documentElement.classList.remove('dark')
    document.documentElement.removeAttribute('data-theme')
  })

  it('初始主题从 configStore 读取', () => {
    const configStore = useConfigStore()
    configStore.setUserConfig('theme', 'dark')

    const store = useThemeStore()
    expect(store.theme).toBe('dark')
  })

  it('setTheme() 切换主题并触发钩子', async () => {
    const store = useThemeStore()
    const { default: hookManager } = await import('../utils/hook-manager')

    await store.setTheme('dark')
    expect(store.theme).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(hookManager.emit).toHaveBeenCalledWith('theme:before-change', 'dark')
    expect(hookManager.emit).toHaveBeenCalledWith('theme:changed', { theme: 'dark', primaryColor: '#14b8a6' })
  })

  it('toggleTheme() 亮暗互切', async () => {
    const store = useThemeStore()
    expect(store.theme).toBe('light')

    await store.toggleTheme()
    expect(store.theme).toBe('dark')

    await store.toggleTheme()
    expect(store.theme).toBe('light')
  })

  it('setPrimaryColor() 设置主色调', async () => {
    const store = useThemeStore()
    await store.setPrimaryColor('#ff0000')
    expect(store.primaryColor).toBe('#ff0000')
    expect(document.documentElement.style.getPropertyValue('--el-color-primary')).toBe('#ff0000')
  })

  it('init() 应用主题和主色调', () => {
    const configStore = useConfigStore()
    configStore.setUserConfig('primaryColor', '#1890ff')

    const store = useThemeStore()
    store.init()

    expect(store.primaryColor).toBe('#1890ff')
    expect(document.documentElement.style.getPropertyValue('--el-color-primary')).toBe('#1890ff')
  })
})
