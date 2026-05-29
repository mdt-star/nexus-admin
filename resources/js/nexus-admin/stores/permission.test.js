/**
 * Permission Store 单元测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePermissionStore } from './permission'

vi.mock('../utils/hook-manager', () => ({
  default: {
    emit: vi.fn(() => Promise.resolve())
  }
}))

vi.mock('../services/api', () => ({
  getPermissionTags: vi.fn()
}))

describe('PermissionStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('初始状态为空', () => {
    const store = usePermissionStore()
    expect(store.tags).toEqual([])
    expect(store.loaded).toBe(false)
  })

  it('setTags() 设置权限标签', () => {
    const store = usePermissionStore()
    store.setTags(['admin', 'user:list'])
    expect(store.tags).toEqual(['admin', 'user:list'])
    expect(store.loaded).toBe(true)
  })

  it('hasTag() 检查单标签', async () => {
    const store = usePermissionStore()
    store.setTags(['admin', 'user:list'])

    expect(await store.hasTag('admin')).toBe(true)
    expect(await store.hasTag('nonexistent')).toBe(false)
  })

  it('hasAllTags() 检查全部标签', async () => {
    const store = usePermissionStore()
    store.setTags(['admin', 'user:list', 'user:create'])

    expect(await store.hasAllTags(['admin', 'user:list'])).toBe(true)
    expect(await store.hasAllTags(['admin', 'nonexistent'])).toBe(false)
  })

  it('hasAnyTag() 检查任一标签', async () => {
    const store = usePermissionStore()
    store.setTags(['admin'])

    expect(await store.hasAnyTag(['admin', 'nonexistent'])).toBe(true)
    expect(await store.hasAnyTag(['nonexistent1', 'nonexistent2'])).toBe(false)
  })

  it('loadTags() 从 API 加载', async () => {
    const { getPermissionTags } = await import('../services/api')
    getPermissionTags.mockResolvedValue({ data: ['admin', 'user:list'] })

    const store = usePermissionStore()
    await store.loadTags()
    expect(store.tags).toEqual(['admin', 'user:list'])
    expect(store.loaded).toBe(true)
  })

  it('loadTags() API 失败时使用空列表', async () => {
    const { getPermissionTags } = await import('../services/api')
    getPermissionTags.mockRejectedValue(new Error('Network error'))

    const store = usePermissionStore()
    await store.loadTags()
    expect(store.tags).toEqual([])
    expect(store.loaded).toBe(true)
  })
})
