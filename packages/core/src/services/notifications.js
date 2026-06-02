/**
 * 通知 API
 */
import request from './api'

export default {
  list() {
    return request.get('/api/notifications')
  },
  unreadCount() {
    return request.get('/api/notifications/unread-count')
  },
  markRead(id) {
    return request.put(`/api/notifications/${id}/read`)
  },
  markAllRead() {
    return request.put('/api/notifications/read-all')
  }
}
