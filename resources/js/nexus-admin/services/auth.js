/**
 * 认证 API
 */
import request from './api'

export default {
  login(username, password) {
    return request.post('/api/auth/login', { username, password })
  },
  logout() {
    return request.post('/api/auth/logout')
  },
  currentUser() {
    return request.get('/api/auth/user')
  }
}
