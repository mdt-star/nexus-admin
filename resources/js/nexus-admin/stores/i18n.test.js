/**
 * I18n Store 单元测试
 *
 * 测试三层合并：基座内置 → Provider 暂存 → 后端 API
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useI18nStore } from './i18n'

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

  it('init 加载基座内置语言包', async () => {
    const store = useI18nStore()
    // Mock 后端返回空，不干扰内置翻译
    const { default: i18nApi } = await import('../services/i18n')
    i18nApi.messages.mockResolvedValue({ data: {} })

    await store.init()

    // 基座内置翻译可用
    expect(store.t('common.save')).toBe('保存')
    expect(store.t('common.searchPlaceholder')).toBe('搜索菜单或页面...')
  })

  it('init 加载英文内置语言包', async () => {
    const store = useI18nStore()
    const { default: i18nApi } = await import('../services/i18n')
    i18nApi.messages.mockResolvedValue({ data: {} })

    await store.setLocale('en')

    expect(store.t('common.save')).toBe('Save')
    expect(store.t('common.searchPlaceholder')).toBe('Search menus or pages...')
  })

  it('addMessages 深合并不覆盖已有翻译', async () => {
    const store = useI18nStore()
    const { default: i18nApi } = await import('../services/i18n')
    i18nApi.messages.mockResolvedValue({ data: {} })

    await store.init()

    // Provider 注册额外翻译
    store.addMessages('zh-CN', { blog: { title: '博客管理' } })

    expect(store.t('common.save')).toBe('保存')   // 基座翻译不变
    expect(store.t('blog.title')).toBe('博客管理')  // 新增翻译
  })

  it('addMessages 合并同名键，后注册优先', async () => {
    const store = useI18nStore()
    const { default: i18nApi } = await import('../services/i18n')
    i18nApi.messages.mockResolvedValue({ data: {} })

    await store.init()

    // Provider 覆盖部分翻译
    store.addMessages('zh-CN', { common: { save: '存储' } })

    expect(store.t('common.save')).toBe('存储')     // 被覆盖
    expect(store.t('common.cancel')).toBe('取消')    // 未被覆盖
  })

  it('后端 API 语言包通过 addMessages 合并', async () => {
    const { default: i18nApi } = await import('../services/i18n')
    // 后端返回覆盖翻译
    i18nApi.messages.mockResolvedValue({ data: { common: { save: '后端保存' } } })

    const store = useI18nStore()
    await store.init()

    // 后端优先级最高
    expect(store.t('common.save')).toBe('后端保存')
    expect(store.t('common.cancel')).toBe('取消')    // 基座翻译未覆盖
  })

  it('pendingMessages 在 init 中合并', async () => {
    const store = useI18nStore()
    const { default: i18nApi } = await import('../services/i18n')
    i18nApi.messages.mockResolvedValue({ data: {} })

    // 模拟第三方 Provider 暂存的翻译（使用嵌套对象，t() 通过点号路径查找）
    const pending = [
      ['zh-CN', { plugin: { hello: '你好' } }],
      ['en', { plugin: { hello: 'Hello' } }]
    ]

    await store.init(pending)

    expect(store.t('plugin.hello')).toBe('你好')
    // 基座翻译仍在
    expect(store.t('common.save')).toBe('保存')
  })

  it('pendingMessages 优先级高于基座，低于后端', async () => {
    const { default: i18nApi } = await import('../services/i18n')
    i18nApi.messages.mockResolvedValue({ data: { common: { save: '后端保存' } } })

    const store = useI18nStore()
    const pending = [['zh-CN', { common: { save: 'Provider 保存' } }]]

    await store.init(pending)

    // 后端 > Provider > 基座
    expect(store.t('common.save')).toBe('后端保存')
  })

  it('后端 API 失败时保留基座+Provider 翻译', async () => {
    const { default: i18nApi } = await import('../services/i18n')
    i18nApi.messages.mockRejectedValue(new Error('Network error'))

    const store = useI18nStore()
    await store.init()

    // 基座翻译仍在
    expect(store.t('common.save')).toBe('保存')
  })

  it('t() 插值替换', async () => {
    const store = useI18nStore()
    const { default: i18nApi } = await import('../services/i18n')
    i18nApi.messages.mockResolvedValue({ data: {} })

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
    i18nApi.messages.mockResolvedValue({ data: {} })

    const store = useI18nStore()
    await store.setLocale('en')
    expect(store.locale).toBe('en')
    expect(store.t('common.save')).toBe('Save')
  })

  it('loadLocale() API 失败时保留现有翻译', async () => {
    const { default: i18nApi } = await import('../services/i18n')
    i18nApi.messages.mockResolvedValue({ data: {} })

    const store = useI18nStore()
    await store.init()

    // 模拟后继请求失败
    i18nApi.messages.mockRejectedValue(new Error('Network error'))
    await store.loadLocale('ja')

    // 基座 zh-CN 翻译仍在
    expect(store.t('common.save')).toBe('保存')
  })
})