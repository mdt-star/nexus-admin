/**
 * User Store 单元测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from './user'

vi.mock('../services/auth', () => ({
  default: {
    login: vi.fn(),
    logout: vi.fn(),
    currentUser: vi.fn()
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

describe('UserStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorageMock.clear()
  })

  it('初始状态未登录', () => {
    const store = useUserStore()
    expect(store.user).toBeNull()
    expect(store.isLoggedIn).toBe(false)
    expect(store.token).toBe('')
  })

  it('login() 成功', async () => {
    const { default: authApi } = await import('../services/auth')
    authApi.login.mockResolvedValue({
      data: {
        token: 'test-token',
        user: { id: 1, username: 'admin', nickname: '管理员' }
      }
    })

    const store = useUserStore()
    const result = await store.login('admin', 'admin')
    expect(result).toBeTruthy()
    expect(result.token).toBe('test-token')
    expect(result.user.username).toBe('admin')
    expect(store.token).toBe('test-token')
    expect(store.user.username).toBe('admin')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('nexus-admin-token', 'test-token')
  })

  it('login() 失败', async () => {
    const { default: authApi } = await import('../services/auth')
    authApi.login.mockRejectedValue(new Error('Invalid credentials'))

    const store = useUserStore()
    await expect(store.login('wrong', 'wrong')).rejects.toThrow('Invalid credentials')
    expect(store.isLoggedIn).toBe(false)
  })

  it('logout() 清除登录状态', async () => {
    const { default: authApi } = await import('../services/auth')
    authApi.login.mockResolvedValue({
      data: { token: 'test-token', user: { id: 1, username: 'admin' } }
    })

    const store = useUserStore()
    await store.login('admin', 'admin')
    expect(store.isLoggedIn).toBe(true)

    await store.logout()
    expect(store.user).toBeNull()
    expect(store.token).toBe('')
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('nexus-admin-token')
  })

  it('restoreSession() 从 token 恢复会话', async () => {
    localStorageMock.getItem.mockReturnValue('saved-token')
    const { default: authApi } = await import('../services/auth')
    authApi.currentUser.mockResolvedValue({
      data: { id: 1, username: 'admin', nickname: '管理员' }
    })

    const store = useUserStore()
    const result = await store.restoreSession()
    expect(result).toBe(true)
    expect(store.user.username).toBe('admin')
  })

  it('restoreSession() token 无效时清除', async () => {
    localStorageMock.getItem.mockReturnValue('invalid-token')
    const { default: authApi } = await import('../services/auth')
    authApi.currentUser.mockRejectedValue(new Error('Unauthorized'))

    const store = useUserStore()
    const result = await store.restoreSession()
    expect(result).toBe(false)
    expect(store.user).toBeNull()
    expect(store.token).toBe('')
  })

  it('clearSession() 清除登录状态', () => {
    const store = useUserStore()
    store.token = 'some-token'
    store.user = { id: 1, username: 'admin' }
    localStorageMock.setItem('nexus-admin-token', 'some-token')

    store.clearSession()
    expect(store.user).toBeNull()
    expect(store.token).toBe('')
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('nexus-admin-token')
  })
})
