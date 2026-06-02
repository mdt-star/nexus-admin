/**
 * 认证 API
 *
 * 支持请求选项透传（如 { _silentError: true } 用于静默模式）
 */
import request from './api'

export default {
  login(username, password, options = {}) {
    return request.post('/api/auth/login', { username, password }, options)
  },
  logout(options = {}) {
    return request.post('/api/auth/logout', {}, options)
  },
  currentUser(options = {}) {
    return request.get('/api/auth/user', options)
  }
}
