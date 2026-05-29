/**
 * 菜单 API
 */
import request from './api'

export default {
  list() {
    return request.get('/api/menus')
  }
}
