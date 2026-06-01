/**
 * API 请求基座 单元测试
 * 测试 BaseURL 配置、JWT 鉴权拦截器、全局错误拦截、事件触发、翻译注入等
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// ==================== Mock 依赖 ====================

const mockInterceptors = { request: null, response: null }

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => {
      const instance = {
        defaults: { baseURL: '' },
        interceptors: {
          request: {
            use: vi.fn((fulfilled, rejected) => {
              mockInterceptors.request = { fulfilled, rejected }
            })
          },
          response: {
            use: vi.fn((fulfilled, rejected) => {
              mockInterceptors.response = { fulfilled, rejected }
            })
          }
        }
      }
      return instance
    })
  }
}))

vi.mock('element-plus', () => ({
  ElMessage: { error: vi.fn(), warning: vi.fn(), success: vi.fn() }
}))

vi.mock('../utils/hook-manager', () => ({
  default: { emit: vi.fn(() => Promise.resolve()) }
}))

// ==================== Storage Mock ====================

function createStorageMock() {
  let store = {}
  return {
    getItem: vi.fn(key => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = value }),
    removeItem: vi.fn(key => { delete store[key] }),
    clear: vi.fn(() => { store = {} })
  }
}

const localStorageMock = createStorageMock()
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, configurable: true })

const sessionStorageMock = createStorageMock()
Object.defineProperty(globalThis, 'sessionStorage', { value: sessionStorageMock, configurable: true })

const originalLocation = window.location

// ==================== 测试主体 ====================

describe('API Service', () => {
  let mod, ElMessage, hookManager

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
    localStorageMock.clear()
    sessionStorageMock.clear()
    delete window.location
    window.location = { ...originalLocation, href: '', pathname: '/', search: '' }
    mod = await import('./api')
    const ep = await import('element-plus')
    ElMessage = ep.ElMessage
    const hm = await import('../utils/hook-manager')
    hookManager = hm.default
  })

  afterEach(() => {
    window.location = originalLocation
  })

  // ==================== setApiBaseURL ====================

  describe('setApiBaseURL', () => {
    it('设置 BaseURL 到 axios 实例', () => {
      const { default: request, setApiBaseURL } = mod
      setApiBaseURL('https://api.example.com')
      expect(request.defaults.baseURL).toBe('https://api.example.com')
    })

    it('空字符串清除 BaseURL', () => {
      const { default: request, setApiBaseURL } = mod
      setApiBaseURL('')
      expect(request.defaults.baseURL).toBe('')
    })
  })

  // ==================== setLoginPath ====================

  describe('setLoginPath', () => {
    it('自定义路径，401 跳转到该路径', async () => {
      mod.setLoginPath('/admin/login')
      const error = { response: { status: 401, config: {} } }
      await expect(mockInterceptors.response.rejected(error)).rejects.toBe(error)
      expect(window.location.href).toBe('/admin/login')
    })

    it('空值使用默认 /login', async () => {
      mod.setLoginPath('')
      const error = { response: { status: 401, config: {} } }
      await expect(mockInterceptors.response.rejected(error)).rejects.toBe(error)
      expect(window.location.href).toBe('/login')
    })
  })

  // ==================== setTranslator ====================

  describe('setTranslator', () => {
    it('注入翻译后错误消息使用翻译结果', async () => {
      mod.setTranslator((key) => `T:${key}`)
      const error = { response: { status: 403, config: {} } }
      await expect(mockInterceptors.response.rejected(error)).rejects.toBe(error)
      expect(ElMessage.error).toHaveBeenCalledWith('T:error.forbidden')
    })

    it('非函数值不会覆盖现有翻译器', async () => {
      mod.setTranslator((key) => `译:${key}`)
      mod.setTranslator('not-a-function')
      mod.setTranslator(null)
      const error = { response: { status: 404, config: {} } }
      await expect(mockInterceptors.response.rejected(error)).rejects.toBe(error)
      expect(ElMessage.error).toHaveBeenCalledWith('译:error.notFound')
    })

    it('默认翻译器直接返回 key', async () => {
      const error = { response: { status: 403, config: {} } }
      await expect(mockInterceptors.response.rejected(error)).rejects.toBe(error)
      expect(ElMessage.error).toHaveBeenCalledWith('error.forbidden')
    })
  })

  // ==================== adaptResponse ====================

  describe('adaptResponse', () => {
    it('适配标准后端含 data/msg', () => {
      const r = mod.adaptResponse({ status: 200, data: { data: { id: 1 }, msg: 'ok' } })
      expect(r.data).toEqual({ id: 1 })
      expect(r.status).toBe(200)
      expect(r.message).toBe('ok')
    })

    it('无 data 时回退到 body', () => {
      const r = mod.adaptResponse({ status: 200, data: { id: 1 } })
      expect(r.data).toEqual({ id: 1 })
    })

    it('无 msg 时默认 success', () => {
      const r = mod.adaptResponse({ status: 200, data: { data: [] } })
      expect(r.message).toBe('success')
    })

    it('处理空响应体', () => {
      const r = mod.adaptResponse({ status: 200 })
      expect(r.data).toEqual({})
      expect(r.status).toBe(200)
    })
  // ==================== 请求拦截器 ====================

  describe('请求拦截器 — JWT Token', () => {
    it('有 token 时注入 Authorization 头', () => {
      localStorageMock.setItem('nexus-admin-token', 'my-jwt')
      const config = { headers: {} }
      const result = mockInterceptors.request.fulfilled(config)
      expect(result.headers.Authorization).toBe('Bearer my-jwt')
    })

    it('无 token 时不注入', () => {
      const config = { headers: {} }
      const result = mockInterceptors.request.fulfilled(config)
      expect(result.headers.Authorization).toBeUndefined()
    })

    it('错误分支直接 reject', async () => {
      const err = new Error('Request error')
      await expect(mockInterceptors.request.rejected(err)).rejects.toBe(err)
    })
  })

  // ==================== 成功响应拦截器 ====================

  describe('成功响应拦截器', () => {
    it('返回适配后的对象并保留 config 和 headers', () => {
      const response = {
        status: 200,
        data: { data: { id: 1 }, msg: 'ok' },
        config: { url: '/api/users', method: 'get' },
        headers: { 'x-total-count': '42' }
      }
      const result = mockInterceptors.response.fulfilled(response)
      // 业务数据正确适配
      expect(result.data).toEqual({ id: 1 })
      expect(result.status).toBe(200)
      expect(result.message).toBe('ok')
      // 原始 axios 属性保留
      expect(result.config).toEqual({ url: '/api/users', method: 'get' })
      expect(result.headers).toEqual({ 'x-total-count': '42' })
    })
  })

  // ==================== 401 处理 ====================

  describe('401 未登录', () => {
    it('清除 Token', async () => {
      localStorageMock.setItem('nexus-admin-token', 't')
      const error = { response: { status: 401, config: {} } }
      await expect(mockInterceptors.response.rejected(error)).rejects.toBe(error)
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('nexus-admin-token')
    })

    it('触发 auth:unauthorized 事件', async () => {
      const error = { response: { status: 401, config: {} } }
      await expect(mockInterceptors.response.rejected(error)).rejects.toBe(error)
      expect(hookManager.emit).toHaveBeenCalledWith('auth:unauthorized', {
        status: 401, message: 'error.unauthorized'
      })
    })

    it('保存当前路径到 sessionStorage', async () => {
      window.location.pathname = '/system/user'
      window.location.search = '?page=1'
      const error = { response: { status: 401, config: {} } }
      await expect(mockInterceptors.response.rejected(error)).rejects.toBe(error)
      expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
        'nexus-redirect-path', '/system/user?page=1'
      )
    })

    it('已在登录页不保存路径', async () => {
      window.location.pathname = '/login'
      const error = { response: { status: 401, config: {} } }
      await expect(mockInterceptors.response.rejected(error)).rejects.toBe(error)
      expect(sessionStorageMock.setItem).not.toHaveBeenCalled()
    })

    it('跳转到登录页', async () => {
      window.location.pathname = '/dashboard'
      const error = { response: { status: 401, config: {} } }
      await expect(mockInterceptors.response.rejected(error)).rejects.toBe(error)
      expect(window.location.href).toBe('/login')
    })

    it('已在登录页不重复跳转', async () => {
      window.location.pathname = '/login'
      const error = { response: { status: 401, config: {} } }
      await expect(mockInterceptors.response.rejected(error)).rejects.toBe(error)
      expect(window.location.href).toBe('')
    })

    it('弹出错误提示', async () => {
      const error = { response: { status: 401, config: {} } }
      await expect(mockInterceptors.response.rejected(error)).rejects.toBe(error)
      expect(ElMessage.error).toHaveBeenCalled()
    })
  })
  // ==================== 其他 HTTP 状态码 ====================

  describe('403', () => {
    it('提示无权限', async () => {
      const error = { response: { status: 403, config: {} } }
      await expect(mockInterceptors.response.rejected(error)).rejects.toBe(error)
      expect(ElMessage.error).toHaveBeenCalledWith('error.forbidden')
    })
  })

  describe('404', () => {
    it('提示资源不存在', async () => {
      const error = { response: { status: 404, config: {} } }
      await expect(mockInterceptors.response.rejected(error)).rejects.toBe(error)
      expect(ElMessage.error).toHaveBeenCalledWith('error.notFound')
    })
  })

  describe('422', () => {
    it('静默不弹窗', async () => {
      const error = { response: { status: 422, config: {} } }
      await expect(mockInterceptors.response.rejected(error)).rejects.toBe(error)
      expect(ElMessage.error).not.toHaveBeenCalled()
    })
  })

  describe('429', () => {
    it('提示频率限制', async () => {
      const error = { response: { status: 429, config: {} } }
      await expect(mockInterceptors.response.rejected(error)).rejects.toBe(error)
      expect(ElMessage.warning).toHaveBeenCalledWith('error.rateLimit')
    })
  })

  describe('5xx 服务端错误', () => {
    it('500 提示服务器错误', async () => {
      const error = { response: { status: 500, config: {} } }
      await expect(mockInterceptors.response.rejected(error)).rejects.toBe(error)
      expect(ElMessage.error).toHaveBeenCalledWith('error.serverError')
    })

    it('503 提示服务器错误', async () => {
      const error = { response: { status: 503, config: {} } }
      await expect(mockInterceptors.response.rejected(error)).rejects.toBe(error)
      expect(ElMessage.error).toHaveBeenCalledWith('error.serverError')
    })
  })

  describe('4xx 其他', () => {
    it('400 通用提示', async () => {
      const error = { response: { status: 400, config: {} } }
      await expect(mockInterceptors.response.rejected(error)).rejects.toBe(error)
      expect(ElMessage.error).toHaveBeenCalledWith('error.unknown')
    })
  })

  // ==================== 静默模式 ====================

  describe('静默模式 _silentError', () => {
    it('401 + _silentError 跳过整个错误处理', async () => {
      localStorageMock.setItem('nexus-admin-token', 't')
      window.location.pathname = '/dashboard'
      const error = { response: { status: 401, config: { _silentError: true } } }
      await expect(mockInterceptors.response.rejected(error)).rejects.toBe(error)
      // _silentError 跳过整个错误处理块，不清除 Token、不弹提示、不跳转
      expect(localStorageMock.removeItem).not.toHaveBeenCalled()
      expect(ElMessage.error).not.toHaveBeenCalled()
      expect(window.location.href).toBe('')
    })

    it('403 不弹提示', async () => {
      const error = { response: { status: 403, config: { _silentError: true } } }
      await expect(mockInterceptors.response.rejected(error)).rejects.toBe(error)
      expect(ElMessage.error).not.toHaveBeenCalled()
    })
  })
  // ==================== 网络错误 ====================

  describe('网络错误', () => {
    it('超时提示', async () => {
      const error = { code: 'ECONNABORTED', config: {} }
      await expect(mockInterceptors.response.rejected(error)).rejects.toBe(error)
      expect(ElMessage.error).toHaveBeenCalledWith('error.timeout')
    })

    it('网络中断提示', async () => {
      const error = { code: 'ERR_NETWORK', config: {} }
      await expect(mockInterceptors.response.rejected(error)).rejects.toBe(error)
      expect(ElMessage.error).toHaveBeenCalledWith('error.network')
    })

    it('网络错误 + _silentError 不弹提示', async () => {
      const error = { code: 'ERR_NETWORK', config: { _silentError: true } }
      await expect(mockInterceptors.response.rejected(error)).rejects.toBe(error)
      expect(ElMessage.error).not.toHaveBeenCalled()
    })
  })

  // ==================== 防重复提示 ====================

  describe('防重复提示', () => {
    it('同状态码短时间只弹一次', async () => {
      const error = { response: { status: 500, config: {} } }
      await expect(mockInterceptors.response.rejected(error)).rejects.toBe(error)
      await expect(mockInterceptors.response.rejected(error)).rejects.toBe(error)
      expect(ElMessage.error).toHaveBeenCalledTimes(1)
    })

    it('不同状态码分别弹窗', async () => {
      const e403 = { response: { status: 403, config: {} } }
      const e404 = { response: { status: 404, config: {} } }
      await expect(mockInterceptors.response.rejected(e403)).rejects.toBe(e403)
      await expect(mockInterceptors.response.rejected(e404)).rejects.toBe(e404)
      expect(ElMessage.error).toHaveBeenCalledWith('error.forbidden')
      expect(ElMessage.error).toHaveBeenCalledWith('error.notFound')
    })
  })
})
  })