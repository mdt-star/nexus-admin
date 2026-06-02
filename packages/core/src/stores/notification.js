/**
 * 通知状态管理
 * 兼容 Laravel 通知系统，支持数据库通知和广播通知
 * 通知 data 结构：
 * {
 *   title: string,
 *   body: string,
 *   action: {
 *     type: 'openPage' | 'openUrl',
 *     component: string,
 *     route: string,
 *     params: object
 *   }
 * }
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import notificationsApi from '../services/notifications'

export const useNotificationStore = defineStore('nexus-notification', () => {
  // 通知列表
  const list = ref([])

  // 未读数量
  const unreadCount = ref(0)

  // 加载状态
  const loading = ref(false)

  // 是否已初始化
  const initialized = ref(false)

  // 轮询定时器
  let pollTimer = null

  // 是否有未读通知
  const hasUnread = computed(() => unreadCount.value > 0)

  /**
   * 初始化通知系统
   * @param {number} pollInterval - 轮询间隔（毫秒），默认 30 秒
   */
  async function init(pollInterval = 30000) {
    if (initialized.value) return
    initialized.value = true

    await fetchNotifications()
    startPolling(pollInterval)
  }

  /**
   * 获取通知列表
   */
  async function fetchNotifications() {
    loading.value = true
    try {
      const res = await notificationsApi.list()
      list.value = res.data || []
      unreadCount.value = list.value.filter(n => !n.read_at).length
    } catch (e) {
      console.warn('[Notification] 获取通知失败:', e)
    } finally {
      loading.value = false
    }
  }

  /**
   * 刷新未读数量
   */
  async function refreshUnreadCount() {
    try {
      const res = await notificationsApi.unreadCount()
      unreadCount.value = res.data?.count || 0
    } catch (e) {
      // 静默失败
    }
  }

  /**
   * 标记单条通知为已读
   * @param {object} notification
   */
  async function markAsReadNotification(notification) {
    if (notification.read_at) return

    try {
      await notificationsApi.markRead(notification.id)
      notification.read_at = new Date().toISOString()
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    } catch (e) {
      console.warn('[Notification] 标记已读失败:', e)
    }
  }

  /**
   * 全部标记已读
   */
  async function markAllAsReadNotification() {
    try {
      await notificationsApi.markAllRead()
      list.value.forEach(n => {
        if (!n.read_at) {
          n.read_at = new Date().toISOString()
        }
      })
      unreadCount.value = 0
    } catch (e) {
      console.warn('[Notification] 全部标记已读失败:', e)
    }
  }

  /**
   * 点击通知处理
   * @param {object} notification
   * @param {function} openPage - 打开页面的回调函数
   */
  async function handleNotificationClick(notification, openPage) {
    await markAsReadNotification(notification)

    const action = notification.data?.action
    if (!action) return

    if (action.type === 'openPage') {
      openPage({
        id: action.component,
        title: notification.data?.title || '',
        icon: action.icon || '',
        component: action.component,
        route: action.route || '',
        params: action.params || {}
      })
    } else if (action.type === 'openUrl') {
      window.open(action.route, '_blank')
    }
  }

  /**
   * 开始轮询
   * @param {number} interval
   */
  function startPolling(interval) {
    stopPolling()
    pollTimer = setInterval(() => {
      refreshUnreadCount()
    }, interval)
  }

  /**
   * 停止轮询
   */
  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  /**
   * 清理
   */
  function destroy() {
    stopPolling()
    list.value = []
    unreadCount.value = 0
    initialized.value = false
  }

  return {
    list,
    unreadCount,
    loading,
    initialized,
    hasUnread,
    init,
    fetchNotifications,
    refreshUnreadCount,
    markAsReadNotification,
    markAllAsReadNotification,
    handleNotificationClick,
    startPolling,
    stopPolling,
    destroy
  }
})
