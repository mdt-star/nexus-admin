/**
 * 系统信息 API
 */
import request from './api'

export default {
  info() {
    return request.get('/api/system/info')
  }
}
