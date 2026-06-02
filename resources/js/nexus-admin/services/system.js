/**
 * 系统信息 API
 */
import request from '@nexus-admin/core/src/services/api'

export default {
  info() {
    return request.get('/api/system/info')
  }
}
