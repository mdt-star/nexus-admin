/**
 * UI Size Store 单元测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUiSizeStore } from './size'

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

describe('UiSizeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorageMock.clear()
    // 重置 getItem 的 mock 返回值，避免跨测试污染
    localStorageMock.getItem.mockReset()
    localStorageMock.getItem.mockImplementation(key => {
      const store = localStorageMock.mockClear ? {} : {}
      return null
    })
    // 简单方式：清除所有 mock 状态
    vi.clearAllMocks()
    document.documentElement.removeAttribute('data-ui-size')
  })

  it('初始尺寸为 medium', () => {
    const store = useUiSizeStore()
    expect(store.size).toBe('medium')
  })

  it('从 localStorage 恢复尺寸', () => {
    localStorageMock.getItem.mockReturnValue('small')
    const store = useUiSizeStore()
    expect(store.size).toBe('small')
  })

  it('elementSize 映射 large → large', () => {
    localStorageMock.getItem.mockReturnValue('large')
    const store = useUiSizeStore()
    expect(store.elementSize).toBe('large')
  })

  it('elementSize 映射 small → small', () => {
    localStorageMock.getItem.mockReturnValue('small')
    const store = useUiSizeStore()
    expect(store.elementSize).toBe('small')
  })

  it('elementSize 映射 medium → default', () => {
    // 确保没有 localStorage 值干扰
    localStorageMock.getItem.mockReturnValue(null)
    const store = useUiSizeStore()
    expect(store.elementSize).toBe('default')
  })

  it('setSize() 设置尺寸并持久化', () => {
    localStorageMock.getItem.mockReturnValue(null)
    const store = useUiSizeStore()
    store.setSize('large')
    expect(store.size).toBe('large')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('nexus-admin-ui-size', 'large')
    expect(document.documentElement.getAttribute('data-ui-size')).toBe('large')
  })

  it('toggleSize() 循环切换 small → medium → large → small', () => {
    localStorageMock.getItem.mockReturnValue(null)
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
    localStorageMock.getItem.mockReturnValue(null)
    const store = useUiSizeStore()
    store.init()
    expect(document.documentElement.getAttribute('data-ui-size')).toBe('medium')
  })
})
