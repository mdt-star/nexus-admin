/**
 * 核心包内置 Mock 拦截
 *
 * 模拟框架基础设施所需的 API 响应（auth / config / disktops / permissions / i18n / notifications），
 * 不包含任何业务数据。
 *
 * 应用层可通过 createNexusApp({ mockInit }) 继承并扩展：
 *   import { initCoreMock } from '@nexus-admin/core/src/mock/setup'
 *   export async function initMock() {
 *     await initCoreMock()
 *     // 添加业务 Mock
 *   }
 *
 * 开关：import.meta.env.VITE_USE_MOCK === 'false' 时跳过
 */

let Mock = null

async function getMock() {
  if (!Mock) {
    Mock = (await import('mockjs')).default
    Mock.setup({ timeout: '200-400' })
  }
  return Mock
}

export async function initCoreMock() {
  if (import.meta.env.VITE_USE_MOCK === 'false') return

  const Mock = await getMock()

  // ==================== 桌面项 API ====================
  Mock.mock(/\/api\/disktops$/, 'get', () => [
    { id: 1, user_id: 1, name: '默认桌面', is_default: true, sort: 0, created_at: new Date().toISOString() }
  ])

  Mock.mock(/\/api\/disktops\/\d+\/items$/, 'get', () => [])

  Mock.mock(/\/api\/disktop-items$/, 'post', (options) => {
    const data = JSON.parse(options.body)
    return { id: Date.now(), ...data, custom: data.custom || {}, sort: data.sort ?? 0, created_at: new Date().toISOString() }
  })

  Mock.mock(/\/api\/disktop-items\/\d+$/, 'put', () => ({ success: true }))
  Mock.mock(/\/api\/disktop-items\/\d+$/, 'delete', () => ({ success: true }))

  // ==================== 配置 API ====================
  Mock.mock(/\/api\/config$/, 'get', () => ({
    global: { appName: 'Nexus Admin', appLogo: '', footer: '© 2026 Nexus Admin. All rights reserved.' },
    user: {}
  }))
  Mock.mock(/\/api\/config$/, 'put', () => ({ success: true }))

  // ==================== 权限 API ====================
  Mock.mock(/\/api\/permissions\/tags$/, 'get', () => ['admin'])

  // ==================== 国际化 API ====================
  Mock.mock(/\/api\/i18n\/\w+/, 'get', () => ({}))

  // ==================== 认证 API ====================
  Mock.mock(/\/api\/auth\/login$/, 'post', (options) => {
    const { username, password } = JSON.parse(options.body)
    if (username === 'admin' && password === 'admin') {
      return { token: 'nexus-mock-token-' + Date.now(), user: { id: 1, username: 'admin', nickname: '管理员', avatar: '', email: 'admin@nexus.local', roles: ['admin'], permissions: ['*'] } }
    }
    return { error: '用户名或密码错误' }
  })
  Mock.mock(/\/api\/auth\/logout$/, 'post', () => ({ success: true }))
  Mock.mock(/\/api\/auth\/user$/, 'get', () => ({ id: 1, username: 'admin', nickname: '管理员', avatar: '', email: 'admin@nexus.local', roles: ['admin'], permissions: ['*'] }))

  // ==================== 通知 API ====================
  Mock.mock(/\/api\/notifications$/, 'get', () => [])
  Mock.mock(/\/api\/notifications\/unread-count$/, 'get', () => ({ count: 0 }))
  Mock.mock(/\/api\/notifications\/\d+\/read$/, 'put', () => ({ success: true }))
  Mock.mock(/\/api\/notifications\/read-all$/, 'put', () => ({ success: true }))
}