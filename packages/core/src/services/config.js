/**
 * 配置 API
 */
import request from './api'

export default {
  fetch() {
    return request.get('/api/config')
  },
  save(config) {
    return request.put('/api/config', config)
  }
}
