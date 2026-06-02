/**
 * Config Store 单元测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useConfigStore } from './config'

// Mock hookManager
vi.mock('../utils/hook-manager', () => ({
  default: {
    emit: vi.fn(() => Promise.resolve())
  }
}))

// Mock localStorage
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

describe('ConfigStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorageMock.clear()
  })

  it('初始状态包含默认配置', () => {
    const store = useConfigStore()
    expect(store.defaults.layout).toBe('sidebar')
    expect(store.defaults.theme).toBe('light')
    expect(store.defaults.primaryColor).toBe('#14b8a6')
    expect(store.defaults.locale).toBe('zh-CN')
  })

  it('merged 合并默认/全局/用户配置（优先级：用户 > 全局 > 默认）', () => {
    const store = useConfigStore()
    // Pinia setup store 自动解包 ref，直接赋值给 reactive 对象
    Object.assign(store.global, { theme: 'dark', appName: 'MyApp' })
    Object.assign(store.user, { theme: 'light' })

    expect(store.merged.theme).toBe('light')       // 用户覆盖全局
    expect(store.merged.appName).toBe('MyApp')      // 全局提供
    expect(store.merged.layout).toBe('sidebar')     // 默认值
  })

  it('get() 返回指定配置项', () => {
    const store = useConfigStore()
    expect(store.get('layout')).toBe('sidebar')
    expect(store.get('nonexistent', 'fallback')).toBe('fallback')
    expect(store.get('nonexistent')).toBeNull()
  })

  it('setUserConfig() 更新用户配置并触发钩子', async () => {
    const store = useConfigStore()
    const { default: hookManager } = await import('../utils/hook-manager')

    await store.setUserConfig('theme', 'dark')
    expect(store.user.theme).toBe('dark')
    expect(store.merged.theme).toBe('dark')
    expect(hookManager.emit).toHaveBeenCalledWith('config:changed', 'theme', 'dark', store.merged)
  })

  it('setUserConfigs() 批量更新用户配置', async () => {
    const store = useConfigStore()
    await store.setUserConfigs({ theme: 'dark', locale: 'en' })
    expect(store.user.theme).toBe('dark')
    expect(store.user.locale).toBe('en')
  })

  it('setGlobalConfig() 更新全局配置', async () => {
    const store = useConfigStore()
    await store.setGlobalConfig({ appName: 'TestApp' })
    expect(store.global.appName).toBe('TestApp')
  })

  it('loadUserConfigFromStorage() 从 localStorage 恢复用户配置', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify({ theme: 'dark', locale: 'en' }))
    const store = useConfigStore()
    store.loadUserConfigFromStorage()
    expect(store.user.theme).toBe('dark')
    expect(store.user.locale).toBe('en')
  })

  it('saveUserConfigToStorage() 保存用户配置到 localStorage', () => {
    const store = useConfigStore()
    store.user.theme = 'dark'
    store.saveUserConfigToStorage()
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'nexus-admin-user-config',
      JSON.stringify({ theme: 'dark' })
    )
  })

  it('localStorage 数据损坏时静默忽略', () => {
    localStorageMock.getItem.mockReturnValue('{invalid json}')
    const store = useConfigStore()
    expect(() => store.loadUserConfigFromStorage()).not.toThrow()
    expect(store.user).toEqual({})
  })
})
