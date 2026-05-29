/**
 * 桌面 API
 */
import request from './api'

export default {
  list() {
    return request.get('/api/disktops')
  },
  items: {
    list(disktopId) {
      return request.get(`/api/disktops/${disktopId}/items`)
    },
    create(data) {
      return request.post('/api/disktop-items', data)
    },
    update(id, data) {
      return request.put(`/api/disktop-items/${id}`, data)
    },
    remove(id) {
      return request.delete(`/api/disktop-items/${id}`)
    }
  }
}
