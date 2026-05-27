/**
 * API 服务层
 * 封装所有后端接口调用，当前使用 Mock 数据
 * 当后端接口就绪后，只需替换这里的实现即可
 */
import { mockMenus, mockPermissionTags, mockConfig, mockI18nMessages } from '../mock'

// 模拟延迟
function delay(ms = 200) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 模拟响应包装
function mockResponse(data) {
  return { data, status: 200, message: 'success' }
}

/**
 * 获取菜单/桌面项列表
 * 桌面模式和侧边栏模式共享此接口
 */
export async function getMenus() {
  await delay()
  return mockResponse(mockMenus)
}

/**
 * 获取配置
 */
export async function getConfig() {
  await delay()
  return mockResponse(mockConfig)
}

/**
 * 保存用户配置
 * @param {object} config
 */
export async function saveConfig(config) {
  await delay()
  Object.assign(mockConfig.user, config)
  return mockResponse({ success: true })
}

/**
 * 获取权限标签列表
 */
export async function getPermissionTags() {
  await delay()
  return mockResponse(mockPermissionTags)
}

/**
 * 获取语言包
 * @param {string} locale - 语言代码
 */
export async function getI18nMessages(locale) {
  await delay(100)
  return mockResponse(mockI18nMessages[locale] || mockI18nMessages['zh-CN'])
}

/**
 * 登录
 * @param {string} username
 * @param {string} password
 */
export async function login(username, password) {
  await delay(300)
  if (username === 'admin' && password === 'admin') {
    return mockResponse({
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
    })
  }
  throw new Error('用户名或密码错误')
}

/**
 * 退出登录
 */
export async function logout() {
  await delay()
  return mockResponse({ success: true })
}

/**
 * 获取当前登录用户信息
 */
export async function getCurrentUser() {
  await delay()
  return mockResponse({
    id: 1,
    username: 'admin',
    nickname: '管理员',
    avatar: '',
    email: 'admin@nexus.local',
    roles: ['admin'],
    permissions: ['*']
  })
}

// ==================== 通知相关 API ====================

// Mock 通知数据
const mockNotifications = [
  {
    id: 1,
    type: 'App\\Notifications\\ArticleReviewed',
    notifiable_type: 'App\\Models\\User',
    notifiable_id: 1,
    data: {
      title: '文章审核通过',
      body: '您提交的文章 "Nexus Admin 使用指南" 已审核通过，现已发布。',
      action: {
        type: 'openPage',
        component: 'content-article',
        route: '/content/article',
        params: {}
      }
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
      action: {
        type: 'openPage',
        component: 'system-user',
        route: '/system/user',
        params: {}
      }
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
      action: {
        type: 'openPage',
        component: 'system-config',
        route: '/system/config',
        params: {}
      }
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
      action: {
        type: 'openUrl',
        route: '/download/export-20260527.csv',
        params: {}
      }
    },
    read_at: null,
    created_at: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 2).toISOString()
  }
]

/**
 * 获取通知列表
 */
export async function getNotifications() {
  await delay(200)
  return mockResponse([...mockNotifications])
}

/**
 * 获取未读通知数量
 */
export async function getUnreadCount() {
  await delay(100)
  const count = mockNotifications.filter(n => !n.read_at).length
  return mockResponse({ count })
}

/**
 * 标记单条通知为已读
 * @param {number|string} id
 */
export async function markAsRead(id) {
  await delay(100)
  const notification = mockNotifications.find(n => n.id === id)
  if (notification) {
    notification.read_at = new Date().toISOString()
  }
  return mockResponse({ success: true })
}

/**
 * 全部标记已读
 */
export async function markAllAsRead() {
  await delay(200)
  mockNotifications.forEach(n => {
    if (!n.read_at) {
      n.read_at = new Date().toISOString()
    }
  })
  return mockResponse({ success: true })
}

