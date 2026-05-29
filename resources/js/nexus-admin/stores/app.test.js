/**
 * App Store 单元测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAppStore } from './app'

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

describe('AppStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorageMock.clear()
  })

  it('初始状态', () => {
    const store = useAppStore()
    expect(store.initialized).toBe(false)
    expect(store.initializing).toBe(false)
    expect(store.layout).toBe('sidebar')
    expect(store.sidebarCollapsed).toBe(false)
  })

  it('toggleLayout() 切换布局', async () => {
    const store = useAppStore()
    expect(store.layout).toBe('sidebar')

    await store.toggleLayout()
    expect(store.layout).toBe('desktop')

    await store.toggleLayout()
    expect(store.layout).toBe('sidebar')
  })

  it('toggleSidebar() 切换侧边栏折叠', async () => {
    const store = useAppStore()
    expect(store.sidebarCollapsed).toBe(false)

    await store.toggleSidebar()
    expect(store.sidebarCollapsed).toBe(true)

    await store.toggleSidebar()
    expect(store.sidebarCollapsed).toBe(false)
  })

  it('initResponsive() 监听窗口大小变化', () => {
    const store = useAppStore()
    const cleanup = store.initResponsive()

    // 模拟窗口 resize
    globalThis.innerWidth = 500
    globalThis.dispatchEvent(new Event('resize'))
    expect(store.isMobile).toBe(true)

    globalThis.innerWidth = 1024
    globalThis.dispatchEvent(new Event('resize'))
    expect(store.isMobile).toBe(false)

    cleanup()
  })
})
