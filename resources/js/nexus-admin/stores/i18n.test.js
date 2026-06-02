/**
 * I18n Store 单元测试
 *
 * 测试两层合并：第三方 Provider → 后端 API
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useI18nStore } from './i18n'
import { baseMessages } from '../lang/index'

vi.mock('../utils/hook-manager', () => ({
  default: {
    emit: vi.fn(() => Promise.resolve())
  }
}))

vi.mock('../services/i18n', () => ({
  default: {
    messages: vi.fn()
  }
}))

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

  it('addMessages 批量注册所有语言', async () => {
    const store = useI18nStore()
    const { default: i18nApi } = await import('../services/i18n')
    i18nApi.messages.mockResolvedValue({ data: {} })

    // Provider 通过 addMessages(baseMessages) 批量注册所有语言
    store.addMessages(baseMessages)

    await store.init()

    expect(store.t('common.save')).toBe('保存')
    expect(store.t('common.cancel')).toBe('取消')
  })

  it('addMessages 支持单语言注册', async () => {
    const store = useI18nStore()
    const { default: i18nApi } = await import('../services/i18n')
    i18nApi.messages.mockResolvedValue({ data: {} })

    store.addMessages('zh-CN', { custom: { hello: '你好' } })
    await store.init()

    expect(store.t('custom.hello')).toBe('你好')
  })

  it('init 通过 pendingMessages 注册语言包', async () => {
    const store = useI18nStore()
    const { default: i18nApi } = await import('../services/i18n')
    i18nApi.messages.mockResolvedValue({ data: {} })

    // 模拟 provider install 阶段的 pending 队列
    const pending = [baseMessages]
    await store.init(pending)

    // 基座翻译可用
    expect(store.t('common.save')).toBe('保存')
  })

  it('addMessages 深合并不覆盖已有翻译', async () => {
    const store = useI18nStore()
    const { default: i18nApi } = await import('../services/i18n')
    i18nApi.messages.mockResolvedValue({ data: {} })

    store.addMessages(baseMessages)
    // Provider 注册额外翻译
    store.addMessages('zh-CN', { blog: { title: '博客管理' } })
    await store.init()

    expect(store.t('common.save')).toBe('保存')    // 基座翻译不变
    expect(store.t('blog.title')).toBe('博客管理')  // 新增翻译
  })

  it('addMessages 合并同名键，后注册优先', async () => {
    const store = useI18nStore()
    const { default: i18nApi } = await import('../services/i18n')
    i18nApi.messages.mockResolvedValue({ data: {} })

    store.addMessages(baseMessages)
    store.addMessages('zh-CN', { common: { save: '存储' } })
    await store.init()

    expect(store.t('common.save')).toBe('存储')     // 被覆盖
    expect(store.t('common.cancel')).toBe('取消')    // 未被覆盖
  })

  it('后端 API 语言包通过 addMessages 合并，优先级最高', async () => {
    const { default: i18nApi } = await import('../services/i18n')
    i18nApi.messages.mockResolvedValue({ data: { common: { save: '后端保存' } } })

    const store = useI18nStore()
    store.addMessages(baseMessages)
    await store.init()

    expect(store.t('common.save')).toBe('后端保存')  // 后端 > Provider
    expect(store.t('common.cancel')).toBe('取消')     // 基座翻译未覆盖
  })

  it('后端 API 失败时保留 Provider 翻译', async () => {
    const { default: i18nApi } = await import('../services/i18n')
    i18nApi.messages.mockRejectedValue(new Error('Network error'))

    const store = useI18nStore()
    store.addMessages(baseMessages)
    await store.init()

    // Provider 翻译仍在
    expect(store.t('common.save')).toBe('保存')
  })

  it('t() 插值替换', async () => {
    const store = useI18nStore()
    const { default: i18nApi } = await import('../services/i18n')
    i18nApi.messages.mockResolvedValue({ data: {} })

    store.addMessages(baseMessages)
    await store.init()

    expect(store.t('common.confirmDelete', { title: '测试' })).toBe('确定删除「测试」？')
  })

  it('t() 未找到翻译时返回键名', () => {
    const store = useI18nStore()
    store.messages['zh-CN'] = {}
    expect(store.t('nonexistent.key')).toBe('nonexistent.key')
  })

  it('setLocale() 切换语言', async () => {
    const { default: i18nApi } = await import('../services/i18n')
    // en 在 provider 中已注册，mock 后端返回空
    i18nApi.messages.mockResolvedValue({ data: {} })

    const store = useI18nStore()
    store.addMessages(baseMessages)
    await store.init()

    // 切换到英文
    await store.setLocale('en')
    expect(store.locale).toBe('en')
    expect(store.t('common.save')).toBe('Save')
  })

  it('loadLocale() API 失败时保留现有翻译', async () => {
    const { default: i18nApi } = await import('../services/i18n')
    i18nApi.messages.mockResolvedValue({ data: {} })

    const store = useI18nStore()
    store.addMessages(baseMessages)
    await store.init()

    // 模拟后继请求失败
    i18nApi.messages.mockRejectedValue(new Error('Network error'))
    await store.loadLocale('ja')

    // 已有翻译不受影响
    expect(store.t('common.save')).toBe('保存')
  })
})