/**
 * I18n Store 单元测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useI18nStore } from './i18n'

vi.mock('../utils/hook-manager', () => ({
  default: {
    emit: vi.fn(() => Promise.resolve())
  }
}))

vi.mock('../services/api', () => ({
  getI18nMessages: vi.fn(),
  saveConfig: vi.fn()
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

describe('I18nStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('初始语言为 zh-CN', () => {
    const store = useI18nStore()
    expect(store.locale).toBe('zh-CN')
  })

  it('t() 简单键翻译', async () => {
    const { getI18nMessages } = await import('../services/api')
    getI18nMessages.mockResolvedValue({ data: { common: { save: '保存' } } })

    const store = useI18nStore()
    await store.init()
    expect(store.t('common.save')).toBe('保存')
  })

  it('t() 嵌套键翻译', async () => {
    const { getI18nMessages } = await import('../services/api')
    getI18nMessages.mockResolvedValue({ data: { menu: { dashboard: '控制台' } } })

    const store = useI18nStore()
    await store.init()
    expect(store.t('menu.dashboard')).toBe('控制台')
  })

  it('t() 插值替换', async () => {
    const { getI18nMessages } = await import('../services/api')
    getI18nMessages.mockResolvedValue({ data: { common: { confirmDelete: '确定删除「{title}」？' } } })

    const store = useI18nStore()
    await store.init()
    expect(store.t('common.confirmDelete', { title: '测试' })).toBe('确定删除「测试」？')
  })

  it('t() 未找到翻译时返回键名', () => {
    const store = useI18nStore()
    // Pinia setup store 自动解包 ref，直接操作 store.messages
    store.messages['zh-CN'] = {}
    expect(store.t('nonexistent.key')).toBe('nonexistent.key')
  })

  it('setLocale() 切换语言', async () => {
    const { getI18nMessages } = await import('../services/api')
    getI18nMessages.mockResolvedValue({ data: { common: { save: 'Save' } } })

    const store = useI18nStore()
    await store.setLocale('en')
    expect(store.locale).toBe('en')
    expect(store.t('common.save')).toBe('Save')
  })

  it('setLocale() 切换已加载的语言不重复请求', async () => {
    const { getI18nMessages } = await import('../services/api')
    getI18nMessages.mockResolvedValue({ data: {} })

    const store = useI18nStore()
    await store.setLocale('en')
    await store.setLocale('en')
    expect(getI18nMessages).toHaveBeenCalledTimes(1)
  })

  it('loadLocale() API 失败时使用空对象', async () => {
    const { getI18nMessages } = await import('../services/api')
    getI18nMessages.mockRejectedValue(new Error('Network error'))

    const store = useI18nStore()
    await store.loadLocale('ja')
    expect(store.messages['ja']).toEqual({})
  })

  it('init() 加载当前语言包', async () => {
    const { getI18nMessages } = await import('../services/api')
    getI18nMessages.mockResolvedValue({ data: { common: { save: '保存' } } })

    const store = useI18nStore()
    await store.init()
    expect(store.messages['zh-CN']).toBeTruthy()
    expect(store.t('common.save')).toBe('保存')
  })
})
