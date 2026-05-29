/**
 * 权限 API
 */
import request from './api'

export default {
  tags() {
    return request.get('/api/permissions/tags')
  }
}
