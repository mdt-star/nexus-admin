/**
 * Mock.js 拦截配置
 * 开发时拦截 axios 请求，返回模拟数据
 * 后端就绪后设置 VITE_USE_MOCK=false 即可关闭
 *
 * mockjs 为 devDependencies，运行时动态导入以确保生产构建正确排除
 */
import {
  mockMenus,
  mockPermissionTags,
  mockConfig,
  mockI18nMessages
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

  // ==================== 菜单 ====================

  Mock.mock(/\/api\/menus$/, 'get', () => mockMenus)

  // ==================== 桌面 ====================

  const mockDisktops = [
    { id: 1, user_id: 1, name: '默认桌面', is_default: true, sort: 0, created_at: new Date().toISOString() }
  ]

  const mockDisktopItems = [
    { id: 1, disktop_id: 1, parent_id: null, type: 'menu', title: '控制台', icon: 'Monitor', component: 'dashboard', path: '/dashboard', custom: {}, sort: 0 },
    { id: 2, disktop_id: 1, parent_id: null, type: 'folder', title: '系统管理', icon: 'Setting', component: '', path: '', custom: {}, sort: 1 },
    { id: 3, disktop_id: 1, parent_id: 2, type: 'menu', title: '用户管理', icon: 'User', component: 'system-user', path: '/system/user', custom: {}, sort: 0 },
    { id: 4, disktop_id: 1, parent_id: 2, type: 'menu', title: '角色管理', icon: 'Avatar', component: 'system-role', path: '/system/role', custom: {}, sort: 1 },
    { id: 5, disktop_id: 1, parent_id: 2, type: 'menu', title: '系统配置', icon: 'Tools', component: 'system-config', path: '/system/config', custom: {}, sort: 2 },
    { id: 6, disktop_id: 1, parent_id: null, type: 'menu', title: '文章管理', icon: 'Notebook', component: 'content-article', path: '/content/article', custom: {}, sort: 2 },
  ]

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

  Mock.mock(/\/api\/i18n\/\w+/, 'get', (options) => {
    const locale = options.url.match(/\/api\/i18n\/(\w+)/)[1]
    return mockI18nMessages[locale] || mockI18nMessages['zh-CN']
  })

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
    // Mock.js 不支持 throw，返回错误格式让前端捕获
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

  const mockNotifications = [
    {
      id: 1,
      type: 'App\\Notifications\\ArticleReviewed',
      notifiable_type: 'App\\Models\\User',
      notifiable_id: 1,
      data: {
        title: '文章审核通过',
        body: '您提交的文章 "Nexus Admin 使用指南" 已审核通过，现已发布。',
        action: { type: 'openPage', component: 'content-article', route: '/content/article', params: {} }
      },
      read_at: null,
      created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 5).toISOString()
    },
    {
      id: 2,
      type: 'App\\Notifications\\NewUserRegistered',
      notifiable_type: 'App\\Models\\User',
      notifiable_id: 1,
      data: {
        title: '新用户注册',
        body: '新用户 "张三" 已注册，请尽快审核。',
        action: { type: 'openPage', component: 'system-user', route: '/system/user', params: {} }
      },
      read_at: null,
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
    },
    {
      id: 3,
      type: 'App\\Notifications\\SystemUpdate',
      notifiable_type: 'App\\Models\\User',
      notifiable_id: 1,
      data: {
        title: '系统更新通知',
        body: '系统将于今晚 02:00-04:00 进行维护升级，请提前保存工作。',
        action: { type: 'openPage', component: 'system-config', route: '/system/config', params: {} }
      },
      read_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
    },
    {
      id: 4,
      type: 'App\\Notifications\\TaskCompleted',
      notifiable_type: 'App\\Models\\User',
      notifiable_id: 1,
      data: {
        title: '导出任务完成',
        body: '您请求的用户数据导出任务已完成，请下载。',
        action: { type: 'openUrl', route: '/download/export-20260527.csv', params: {} }
      },
      read_at: null,
      created_at: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 2).toISOString()
    }
  ]

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

  Mock.mock(/\/api\/system\/info$/, 'get', () => ({
    server: {
      cpu: 23, memory: 45, disk: 62,
      os: 'Linux 6.1.0 (x86_64)',
      uptime: '15 天 8 小时 32 分钟',
      load: '1.02 / 0.85 / 0.67',
      processes: '186'
    },
    php: {
      version: '8.2.12', sapi: 'fpm-fcgi',
      memoryLimit: '256M', maxExecTime: '30s',
      uploadMax: '64M', postMax: '128M'
    },
    system: {
      appName: 'Nexus Admin', version: '1.0.0',
      website: 'https://nexus-admin.com',
      docs: 'https://nexus-admin.com/docs',
      github: 'https://github.com/nexus-admin/nexus-admin',
      updates: [
        { version: 'v1.1.0-beta', title: '新增插件系统与权限管理增强', date: '2026-05-20', type: 'info' },
        { version: 'v1.0.1', title: '安全更新：修复 XSS 漏洞', date: '2026-05-10', type: 'security' }
      ]
    }
  }))
}

