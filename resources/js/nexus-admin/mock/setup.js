/**
 * Mock.js 拦截配置
 * 开发时拦截 axios 请求，返回模拟数据
 * 后端就绪后设置 VITE_USE_MOCK=false 即可关闭
 *
 * mockjs 为 devDependencies，运行时动态导入以确保生产构建正确排除
 */
import {
  mockPermissionTags,
  mockConfig,
  mockDisktops,
  mockDisktopItems,
  mockNotifications,
  mockSystemInfo
} from './index'

let Mock = null

/**
 * 初始化 Mock.js 拦截
 * 动态导入 mockjs 以确保生产构建正确排除
 */
export async function initMock() {
  Mock = (await import('mockjs')).default

  // 模拟延迟
  Mock.setup({ timeout: '200-400' })

  // ==================== 桌面 ====================

  Mock.mock(/\/api\/disktops$/, 'get', () => mockDisktops)

  Mock.mock(/\/api\/disktops\/\d+\/items$/, 'get', (options) => {
    const id = Number(options.url.match(/\/api\/disktops\/(\d+)\/items/)[1])
    return mockDisktopItems.filter(item => item.disktop_id === id)
  })

  Mock.mock(/\/api\/disktop-items$/, 'post', (options) => {
    const data = JSON.parse(options.body)
    const newItem = {
      id: Date.now(),
      ...data,
      custom: data.custom || {},
      sort: data.sort ?? 0,
      created_at: new Date().toISOString()
    }
    mockDisktopItems.push(newItem)
    return newItem
  })

  Mock.mock(/\/api\/disktop-items\/\d+$/, 'put', (options) => {
    const id = Number(options.url.match(/\/api\/disktop-items\/(\d+)/)[1])
    const data = JSON.parse(options.body)
    const item = mockDisktopItems.find(i => i.id === id)
    if (item) Object.assign(item, data)
    return { success: true }
  })

  Mock.mock(/\/api\/disktop-items\/\d+$/, 'delete', (options) => {
    const id = Number(options.url.match(/\/api\/disktop-items\/(\d+)/)[1])
    const index = mockDisktopItems.findIndex(i => i.id === id)
    if (index !== -1) mockDisktopItems.splice(index, 1)
    return { success: true }
  })

  // ==================== 配置 ====================

  Mock.mock(/\/api\/config$/, 'get', () => mockConfig)

  Mock.mock(/\/api\/config$/, 'put', (options) => {
    const config = JSON.parse(options.body)
    Object.assign(mockConfig.user, config)
    return { success: true }
  })

  // ==================== 权限 ====================

  Mock.mock(/\/api\/permissions\/tags$/, 'get', () => mockPermissionTags)

  // ==================== 国际化 ====================
  // 基座语言包已内置，Mock 返回空对象（深合并不会覆盖）
  Mock.mock(/\/api\/i18n\/\w+/, 'get', () => ({}))

  // ==================== 认证 ====================

  Mock.mock(/\/api\/auth\/login$/, 'post', (options) => {
    const { username, password } = JSON.parse(options.body)
    if (username === 'admin' && password === 'admin') {
      return {
        token: 'nexus-mock-token-' + Date.now(),
        user: {
          id: 1,
          username: 'admin',
          nickname: '管理员',
          avatar: '',
          email: 'admin@nexus.local',
          roles: ['admin'],
          permissions: ['*']
        }
      }
    }
    return { error: '用户名或密码错误' }
  })

  Mock.mock(/\/api\/auth\/logout$/, 'post', () => ({ success: true }))

  Mock.mock(/\/api\/auth\/user$/, 'get', () => ({
    id: 1,
    username: 'admin',
    nickname: '管理员',
    avatar: '',
    email: 'admin@nexus.local',
    roles: ['admin'],
    permissions: ['*']
  }))

  // ==================== 通知 ====================

  Mock.mock(/\/api\/notifications$/, 'get', () => [...mockNotifications])

  Mock.mock(/\/api\/notifications\/unread-count$/, 'get', () => ({
    count: mockNotifications.filter(n => !n.read_at).length
  }))

  Mock.mock(/\/api\/notifications\/\d+\/read$/, 'put', (options) => {
    const id = Number(options.url.match(/\/api\/notifications\/(\d+)\/read/)[1])
    const notification = mockNotifications.find(n => n.id === id)
    if (notification) notification.read_at = new Date().toISOString()
    return { success: true }
  })

  Mock.mock(/\/api\/notifications\/read-all$/, 'put', () => {
    mockNotifications.forEach(n => { if (!n.read_at) n.read_at = new Date().toISOString() })
    return { success: true }
  })

  // ==================== 系统信息 ====================

  Mock.mock(/\/api\/system\/info$/, 'get', () => mockSystemInfo)
}