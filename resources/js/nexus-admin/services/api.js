/**
 * API 请求基座
 * 提供 axios 实例、BaseURL 配置、JWT 鉴权与全局错误拦截
 *
 * BaseURL 配置方式（按优先级从高到低）：
 *   1. setApiBaseURL(url) — 由 ConfigStore 加载全局配置后调用
 *   2. import.meta.env.VITE_API_BASE_URL — 环境变量
 *   3. 空字符串 — 同源请求（默认）
 *
 * 登录页路径配置：
 *   - 默认 '/login'，可通过 setLoginPath(path) 覆盖
 *   - 由 ConfigStore 加载全局配置后从 loginPath 字段读取
 *
 * 自定义请求选项（通过 axios config 传递）：
 *   - _silentError: true  静默模式，不弹出错误提示（用于会话恢复等场景）
 *
 * 全局事件（通过 hookManager 触发）：
 *   - 'auth:unauthorized'  401 时触发，参数: { status, message }
 */
import axios from 'axios'
import { ElMessage } from 'element-plus'
import hookManager from '../utils/hook-manager'

// ==================== 可配置项（由 app.js 在初始化后设置）====================
let _apiBaseURL = import.meta.env.VITE_API_BASE_URL || ''
let _loginPath = '/login'

/**
 * 设置 API BaseURL（在 ConfigStore 加载全局配置后调用）
 */
export function setApiBaseURL(url) {
  _apiBaseURL = url
  request.defaults.baseURL = url
}

/**
 * 设置登录页路径（在 ConfigStore 加载全局配置后调用）
 */
export function setLoginPath(path) {
  _loginPath = path || '/login'
}

// ==================== 国际化翻译 ====================
// 默认透传 key，未注入翻译函数时直接显示 key（保留原生 i18n 参数传参能力）
let _t = (key, ...args) => key

/**
 * 设置翻译函数（在 I18nStore 初始化后调用）
 * @param {Function} tFn - (key, ...args) => string
 */
export function setTranslator(tFn) {
  _t = typeof tFn === 'function' ? tFn : _t
}

// ==================== 防重复错误提示 ====================
let lastErrorTime = 0
let lastErrorStatus = 0
const ERROR_THROTTLE_MS = 2000

/**
 * 是否应该显示错误提示
 * 同一状态码短时间内不重复弹出
 */
function shouldShowError(status) {
  const now = Date.now()
  if (status === lastErrorStatus && (now - lastErrorTime) < ERROR_THROTTLE_MS) {
    return false
  }
  lastErrorTime = now
  lastErrorStatus = status
  return true
}

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
  const body = axiosResponse?.data || {}
  return {
    data: body.data ?? body,
    meta: body.meta || null,
    pagination: body.pagination || null,
    status: axiosResponse?.status || 0,
    message: body.msg || 'success'
  }
}

// ==================== 创建 axios 实例 ====================
const request = axios.create()

// 初始化 BaseURL（如果环境变量有值则优先使用）
if (_apiBaseURL) {
  request.defaults.baseURL = _apiBaseURL
}

// ==================== 请求拦截器：自动携带 JWT Token ====================
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nexus-admin-token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ==================== 响应拦截器：全局错误处理 ====================
request.interceptors.response.use(
  (response) => {
    // 成功响应：适配数据格式，并在适配结果上保留原始 axios response 的
    // config 和 headers 属性，供插件钩子（如 afterRequest）、日志等场景使用
    const adapted = adaptResponse(response)
    adapted.config = response.config
    adapted.headers = response.headers
    return adapted
  },
  (error) => {
    // 无响应（网络中断/超时）
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        ElMessage.error(_t('error.timeout'))
      } else if (!error.config?._silentError) {
        ElMessage.error(_t('error.network'))
      }
      return Promise.reject(error)
    }

    const { status, config } = error.response

    // 静默模式：不显示错误提示，仅透传错误
    if (config?._silentError) {
      return Promise.reject(error)
    }

    const show = shouldShowError(status)

    switch (status) {
      case 401: {
        // ====== 未登录 / Token 过期 ======
        // 保存当前路径以便登录后恢复
        const currentPath = window.location.pathname + window.location.search
        if (currentPath !== _loginPath) {
          sessionStorage.setItem('nexus-redirect-path', currentPath)
        }

        // 清除本地 Token
        localStorage.removeItem('nexus-admin-token')

        // 触发全局事件（供埋点/监控等插件通过 hookManager 捕获）
        hookManager.emit('auth:unauthorized', {
          status: 401,
          message: _t('error.unauthorized')
        })

        if (show) {
          ElMessage.error(_t('error.unauthorized'))
        }

        // 重定向至登录页
        if (window.location.pathname !== _loginPath) {
          window.location.href = _loginPath
        }
        break
      }

      case 403:
        // 无权限
        if (show) ElMessage.error(_t('error.forbidden'))
        break

      case 404:
        // 资源不存在
        if (show) ElMessage.error(_t('error.notFound'))
        break

      case 422:
        // 表单验证错误 — 由调用方自行处理，不全局提示
        break

      case 429:
        // 请求频率限制
        if (show) ElMessage.warning(_t('error.rateLimit'))
        break

      default:
        if (status >= 500) {
          // 服务端错误
          if (show) ElMessage.error(_t('error.serverError'))
        } else if (status >= 400) {
          // 其他客户端错误
          if (show) ElMessage.error(_t('error.unknown', { status }))
        }
        break
    }

    return Promise.reject(error)
  }
)

export default request
