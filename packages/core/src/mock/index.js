/**
 * 核心包内置 Mock 数据
 *
 * 模拟框架基础设施所需的 API 响应。
 * 导出一个 (Mock) => { ... } 函数，由 MockManager 自动注册。
 *
 * 开关：VITE_USE_MOCK=false 时全部跳过（由 MockManager 控制）。
 */

export default (Mock) => {
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
      return {
        token: 'nexus-mock-token-' + Date.now(),
        user: { id: 1, username: 'admin', nickname: '管理员', avatar: '', email: 'admin@nexus.local', roles: ['admin'], permissions: ['*'] }
      }
    }
    return { error: '用户名或密码错误' }
  })
  Mock.mock(/\/api\/auth\/logout$/, 'post', () => ({ success: true }))
  Mock.mock(/\/api\/auth\/user$/, 'get', () => ({
    id: 1, username: 'admin', nickname: '管理员', avatar: '', email: 'admin@nexus.local', roles: ['admin'], permissions: ['*']
  }))

  // ==================== 系统信息 API ====================
  Mock.mock(/\/api\/system\/info$/, 'get', () => ({
    server: { cpu: 23, memory: 45, disk: 62, os: 'Linux 6.1.0 (x86_64)', uptime: '15 天 8 小时 32 分钟', load: '1.02 / 0.85 / 0.67', processes: '186' },
    php: { version: '8.2.12', sapi: 'fpm-fcgi', memoryLimit: '256M', maxExecTime: '30s', uploadMax: '64M', postMax: '128M' },
    system: { appName: 'Nexus Admin', version: '1.0.0', website: 'https://nexus-admin.com', docs: 'https://nexus-admin.com/docs', github: 'https://github.com/nexus-admin/nexus-admin', updates: [{ version: 'v1.1.0-beta', title: '新增插件系统与权限管理增强', date: '2026-05-20', type: 'info' }, { version: 'v1.0.1', title: '安全更新：修复 XSS 漏洞', date: '2026-05-10', type: 'security' }] }
  }))

  // ==================== 通知 API ====================
  Mock.mock(/\/api\/notifications$/, 'get', () => [])
  Mock.mock(/\/api\/notifications\/unread-count$/, 'get', () => ({ count: 0 }))
  Mock.mock(/\/api\/notifications\/\d+\/read$/, 'put', () => ({ success: true }))
  Mock.mock(/\/api\/notifications\/read-all$/, 'put', () => ({ success: true }))
}