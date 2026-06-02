/**
 * 国际化 API
 */
import request from './api'

export default {
  messages(locale) {
    return request.get(`/api/i18n/${locale}`)
  }
}
