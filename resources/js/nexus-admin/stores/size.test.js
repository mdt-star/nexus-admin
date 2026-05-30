/**
 * UI Size Store 单元测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUiSizeStore } from './size'
import { useConfigStore } from './config'

// Mock hookManager (used by config store)
vi.mock('../utils/hook-manager', () => ({
  default: {
    emit: vi.fn(() => Promise.resolve())
  }
}))

// Mock localStorage (used by config store)
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

describe('UiSizeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorageMock.clear()
    vi.clearAllMocks()
    document.documentElement.removeAttribute('data-ui-size')
  })

  it('初始尺寸为 medium', () => {
    const store = useUiSizeStore()
    expect(store.size).toBe('medium')
  })

  it('syncFromConfig() 从 ConfigStore 读取尺寸', () => {
    const configStore = useConfigStore()
    // 设置用户配置中的 uiSize
    configStore.user.uiSize = 'small'

    const store = useUiSizeStore()
    store.syncFromConfig(configStore)
    expect(store.size).toBe('small')
    expect(document.documentElement.getAttribute('data-ui-size')).toBe('small')
  })

  it('syncFromConfig() 无效值回退到 medium', () => {
    const configStore = useConfigStore()
    configStore.user.uiSize = 'invalid'

    const store = useUiSizeStore()
    store.syncFromConfig(configStore)
    expect(store.size).toBe('medium')
  })

  it('syncFromConfig() 无配置时使用 medium', () => {
    const configStore = useConfigStore()
    // 不设置 uiSize，使用默认值

    const store = useUiSizeStore()
    store.syncFromConfig(configStore)
    expect(store.size).toBe('medium')
  })

  it('elementSize 映射 large → large', () => {
    const configStore = useConfigStore()
    configStore.user.uiSize = 'large'

    const store = useUiSizeStore()
    store.syncFromConfig(configStore)
    expect(store.elementSize).toBe('large')
  })

  it('elementSize 映射 small → small', () => {
    const configStore = useConfigStore()
    configStore.user.uiSize = 'small'

    const store = useUiSizeStore()
    store.syncFromConfig(configStore)
    expect(store.elementSize).toBe('small')
  })

  it('elementSize 映射 medium → default', () => {
    const store = useUiSizeStore()
    expect(store.elementSize).toBe('default')
  })

  it('setSize() 设置尺寸并应用到 DOM', () => {
    const store = useUiSizeStore()
    store.setSize('large')
    expect(store.size).toBe('large')
    expect(document.documentElement.getAttribute('data-ui-size')).toBe('large')
  })

  it('toggleSize() 循环切换 small → medium → large → small', () => {
    const store = useUiSizeStore()
    expect(store.size).toBe('medium')

    store.toggleSize()
    expect(store.size).toBe('large')

    store.toggleSize()
    expect(store.size).toBe('small')

    store.toggleSize()
    expect(store.size).toBe('medium')
  })

  it('init() 应用尺寸到 DOM', () => {
    const store = useUiSizeStore()
    store.init()
    expect(document.documentElement.getAttribute('data-ui-size')).toBe('medium')
  })
})
