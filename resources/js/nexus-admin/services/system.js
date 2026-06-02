/**
 * 系统信息 API
 */
import { request } from '@nexus-admin/core'

export default {
  info() {
    return request.get('/api/system/info')
  }
}
