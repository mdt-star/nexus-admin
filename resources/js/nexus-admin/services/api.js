/**
 * API 请求基座
 * 提供 axios 实例和响应适配函数
 */
import axios from 'axios'

/**
 * 适配后端响应为前端统一格式
 *
 * 后端统一格式：
 *   { data, meta, pagination, msg }
 *
 * 前端统一格式：
 *   { data, meta, pagination, status, message }
 */
export function adaptResponse(axiosResponse) {
  const body = axiosResponse.data
  return {
    data: body.data ?? body,
    meta: body.meta || null,
    pagination: body.pagination || null,
    status: axiosResponse.status,
    message: body.msg || 'success'
  }
}

// 创建 axios 实例
const request = axios.create()

// 响应拦截器：统一适配
request.interceptors.response.use(adaptResponse)

export default request
