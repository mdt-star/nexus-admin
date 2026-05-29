/**
 * Notification Store 单元测试
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNotificationStore } from './notification'

vi.mock('../services/api', () => ({
  getNotifications: vi.fn(),
  getUnreadCount: vi.fn(),
  markAsRead: vi.fn(),
  markAllAsRead: vi.fn()
}))

describe('NotificationStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('初始状态', () => {
    const store = useNotificationStore()
    expect(store.list).toEqual([])
    expect(store.unreadCount).toBe(0)
    expect(store.loading).toBe(false)
    expect(store.initialized).toBe(false)
    expect(store.hasUnread).toBe(false)
  })

  it('fetchNotifications() 获取通知列表并计算未读数', async () => {
    const { getNotifications } = await import('../services/api')
    getNotifications.mockResolvedValue({
      data: [
        { id: 1, data: { title: '通知1' }, read_at: null },
        { id: 2, data: { title: '通知2' }, read_at: new Date().toISOString() },
        { id: 3, data: { title: '通知3' }, read_at: null }
      ]
    })

    const store = useNotificationStore()
    await store.fetchNotifications()
    expect(store.list).toHaveLength(3)
    expect(store.unreadCount).toBe(2)
    expect(store.hasUnread).toBe(true)
  })

  it('init() 初始化并启动轮询', async () => {
    const { getNotifications, getUnreadCount } = await import('../services/api')
    getNotifications.mockResolvedValue({ data: [] })
    getUnreadCount.mockResolvedValue({ data: { count: 0 } })

    const store = useNotificationStore()
    await store.init(1000)
    expect(store.initialized).toBe(true)

    // 推进时间，验证轮询触发
    vi.advanceTimersByTime(1000)
    expect(getUnreadCount).toHaveBeenCalledTimes(1)
  })

  it('init() 重复调用不重复初始化', async () => {
    const { getNotifications } = await import('../services/api')
    getNotifications.mockResolvedValue({ data: [] })

    const store = useNotificationStore()
    await store.init()
    await store.init()
    // init 有 initialized 守卫，第二次调用直接返回
    expect(getNotifications).toHaveBeenCalledTimes(1)
  })

  it('markAsReadNotification() 标记单条已读', async () => {
    const { getNotifications, markAsRead } = await import('../services/api')
    getNotifications.mockResolvedValue({
      data: [
        { id: 1, data: { title: '通知1' }, read_at: null }
      ]
    })

    const store = useNotificationStore()
    await store.fetchNotifications()
    expect(store.unreadCount).toBe(1)

    await store.markAsReadNotification(store.list[0])
    expect(markAsRead).toHaveBeenCalledWith(1)
    expect(store.list[0].read_at).toBeTruthy()
    expect(store.unreadCount).toBe(0)
  })

  it('markAsReadNotification() 已读通知不重复请求', async () => {
    const { markAsRead } = await import('../services/api')

    const store = useNotificationStore()
    const notification = { id: 1, data: {}, read_at: new Date().toISOString() }
    await store.markAsReadNotification(notification)
    expect(markAsRead).not.toHaveBeenCalled()
  })

  it('markAllAsReadNotification() 全部标记已读', async () => {
    const { getNotifications, markAllAsRead } = await import('../services/api')
    getNotifications.mockResolvedValue({
      data: [
        { id: 1, data: {}, read_at: null },
        { id: 2, data: {}, read_at: null }
      ]
    })

    const store = useNotificationStore()
    await store.fetchNotifications()
    expect(store.unreadCount).toBe(2)

    await store.markAllAsReadNotification()
    expect(markAllAsRead).toHaveBeenCalledOnce()
    expect(store.unreadCount).toBe(0)
    expect(store.list.every(n => n.read_at)).toBe(true)
  })

  it('handleNotificationClick() openPage 类型', async () => {
    const { getNotifications } = await import('../services/api')
    getNotifications.mockResolvedValue({
      data: [{
        id: 1,
        data: {
          title: '通知',
          action: { type: 'openPage', component: 'dashboard', route: '/dashboard', params: {} }
        },
        read_at: null
      }]
    })

    const openPage = vi.fn()
    const store = useNotificationStore()
    await store.fetchNotifications()

    await store.handleNotificationClick(store.list[0], openPage)
    expect(openPage).toHaveBeenCalledWith({
      id: 'dashboard',
      title: '通知',
      icon: '',
      component: 'dashboard',
      route: '/dashboard',
      params: {}
    })
  })

  it('handleNotificationClick() openUrl 类型', async () => {
    const { getNotifications } = await import('../services/api')
    getNotifications.mockResolvedValue({
      data: [{
        id: 1,
        data: {
          title: '导出完成',
          action: { type: 'openUrl', route: '/download/file.csv', params: {} }
        },
        read_at: null
      }]
    })

    const openPage = vi.fn()
    const mockOpen = vi.fn()
    vi.stubGlobal('open', mockOpen)

    const store = useNotificationStore()
    await store.fetchNotifications()
    await store.handleNotificationClick(store.list[0], openPage)

    expect(mockOpen).toHaveBeenCalledWith('/download/file.csv', '_blank')
    expect(openPage).not.toHaveBeenCalled()
  })

  it('stopPolling() 停止轮询', async () => {
    const { getUnreadCount } = await import('../services/api')
    getUnreadCount.mockResolvedValue({ data: { count: 0 } })

    const store = useNotificationStore()
    store.startPolling(1000)
    // startPolling 不会立即调用 refreshUnreadCount，只设置定时器
    expect(getUnreadCount).not.toHaveBeenCalled()

    store.stopPolling()
    vi.advanceTimersByTime(2000)
    // 停止后不再触发
    expect(getUnreadCount).not.toHaveBeenCalled()
  })

  it('destroy() 清理所有状态', async () => {
    const { getNotifications } = await import('../services/api')
    getNotifications.mockResolvedValue({ data: [{ id: 1, data: {}, read_at: null }] })

    const store = useNotificationStore()
    await store.init()
    expect(store.initialized).toBe(true)
    expect(store.list).toHaveLength(1)

    store.destroy()
    expect(store.list).toEqual([])
    expect(store.unreadCount).toBe(0)
    expect(store.initialized).toBe(false)
  })
})
