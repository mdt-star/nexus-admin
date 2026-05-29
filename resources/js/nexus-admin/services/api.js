/**
 * API 服务层
 * 封装所有后端接口调用
 *
 * 切换策略：
 *   开发时使用 Mock 数据，后端就绪后 .env 中设置 VITE_USE_MOCK=false 即可切换
 *   所有 Store 和组件零改动
 */
import axios from 'axios'
import { mockMenus, mockPermissionTags, mockConfig, mockI18nMessages } from '../mock'

// ==================== 切换开关 ====================

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

// ==================== 响应适配 ====================

/**
 * 适配后端响应为前端统一格式
 *
 * 后端统一格式：
 *   { data, meta, pagination, msg }
 *
 * 前端统一格式：
 *   { data, meta, pagination, status, message }
 */
function adaptResponse(axiosResponse) {
  const body = axiosResponse.data
  return {
    data: body.data ?? body,
    meta: body.meta || null,
    pagination: body.pagination || null,
    status: axiosResponse.status,
    message: body.msg || 'success'
  }
}

// ==================== Mock 工具 ====================

function delay(ms = 200) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function mockResponse(data) {
  return { data, status: 200, message: 'success' }
}

// ==================== 菜单 API ====================

/**
 * 获取菜单/桌面项列表
 */
export async function getMenus() {
  if (USE_MOCK) {
    await delay()
    return mockResponse(mockMenus)
  }
  const res = await axios.get('/api/menus')
  return adaptResponse(res)
}

// ==================== Disktop API ====================

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

/**
 * 获取桌面列表
 */
export async function getDisktops() {
  if (USE_MOCK) {
    await delay()
    return mockResponse(mockDisktops)
  }
  const res = await axios.get('/api/disktops')
  return adaptResponse(res)
}

/**
 * 获取指定桌面的所有项
 */
export async function getDisktopItems(disktopId) {
  if (USE_MOCK) {
    await delay()
    return mockResponse(mockDisktopItems.filter(item => item.disktop_id === disktopId))
  }
  const res = await axios.get(`/api/disktops/${disktopId}/items`)
  return adaptResponse(res)
}

/**
 * 创建桌面项
 */
export async function createDisktopItem(data) {
  if (USE_MOCK) {
    await delay()
    const newItem = {
      id: Date.now(),
      ...data,
      custom: data.custom || {},
      sort: data.sort ?? 0,
      created_at: new Date().toISOString()
    }
    mockDisktopItems.push(newItem)
    return mockResponse(newItem)
  }
  const res = await axios.post('/api/disktop-items', data)
  return adaptResponse(res)
}

/**
 * 更新桌面项
 */
export async function updateDisktopItem(id, data) {
  if (USE_MOCK) {
    await delay()
    const item = mockDisktopItems.find(i => i.id === id)
    if (item) Object.assign(item, data)
    return mockResponse({ success: true })
  }
  const res = await axios.put(`/api/disktop-items/${id}`, data)
  return adaptResponse(res)
}

/**
 * 删除桌面项
 */
export async function deleteDisktopItem(id) {
  if (USE_MOCK) {
    await delay()
    const index = mockDisktopItems.findIndex(i => i.id === id)
    if (index !== -1) mockDisktopItems.splice(index, 1)
    return mockResponse({ success: true })
  }
  const res = await axios.delete(`/api/disktop-items/${id}`)
  return adaptResponse(res)
}

// ==================== 配置 API ====================

/**
 * 获取配置
 */
export async function getConfig() {
  if (USE_MOCK) {
    await delay()
    return mockResponse(mockConfig)
  }
  const res = await axios.get('/api/config')
  return adaptResponse(res)
}

/**
 * 保存用户配置
 */
export async function saveConfig(config) {
  if (USE_MOCK) {
    await delay()
    Object.assign(mockConfig.user, config)
    return mockResponse({ success: true })
  }
  const res = await axios.put('/api/config', config)
  return adaptResponse(res)
}

// ==================== 权限 API ====================

/**
 * 获取权限标签列表
 */
export async function getPermissionTags() {
  if (USE_MOCK) {
    await delay()
    return mockResponse(mockPermissionTags)
  }
  const res = await axios.get('/api/permissions/tags')
  return adaptResponse(res)
}

// ==================== 国际化 API ====================

/**
 * 获取语言包
 */
export async function getI18nMessages(locale) {
  if (USE_MOCK) {
    await delay(100)
    return mockResponse(mockI18nMessages[locale] || mockI18nMessages['zh-CN'])
  }
  const res = await axios.get(`/api/i18n/${locale}`)
  return adaptResponse(res)
}

// ==================== 认证 API ====================

/**
 * 登录
 */
export async function login(username, password) {
  if (USE_MOCK) {
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
  const res = await axios.post('/api/auth/login', { username, password })
  return adaptResponse(res)
}

/**
 * 退出登录
 */
export async function logout() {
  if (USE_MOCK) {
    await delay()
    return mockResponse({ success: true })
  }
  const res = await axios.post('/api/auth/logout')
  return adaptResponse(res)
}

/**
 * 获取当前登录用户信息
 */
export async function getCurrentUser() {
  if (USE_MOCK) {
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
  const res = await axios.get('/api/auth/user')
  return adaptResponse(res)
}

// ==================== 通知 API ====================

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

/**
 * 获取通知列表
 */
export async function getNotifications() {
  if (USE_MOCK) {
    await delay(200)
    return mockResponse([...mockNotifications])
  }
  const res = await axios.get('/api/notifications')
  return adaptResponse(res)
}

/**
 * 获取未读通知数量
 */
export async function getUnreadCount() {
  if (USE_MOCK) {
    await delay(100)
    const count = mockNotifications.filter(n => !n.read_at).length
    return mockResponse({ count })
  }
  const res = await axios.get('/api/notifications/unread-count')
  return adaptResponse(res)
}

/**
 * 标记单条通知为已读
 */
export async function markAsRead(id) {
  if (USE_MOCK) {
    await delay(100)
    const notification = mockNotifications.find(n => n.id === id)
    if (notification) notification.read_at = new Date().toISOString()
    return mockResponse({ success: true })
  }
  const res = await axios.put(`/api/notifications/${id}/read`)
  return adaptResponse(res)
}

/**
 * 全部标记已读
 */
export async function markAllAsRead() {
  if (USE_MOCK) {
    await delay(200)
    mockNotifications.forEach(n => { if (!n.read_at) n.read_at = new Date().toISOString() })
    return mockResponse({ success: true })
  }
  const res = await axios.put('/api/notifications/read-all')
  return adaptResponse(res)
}

// ==================== 系统信息 API ====================

/**
 * 获取系统信息
 */
export async function getSystemInfo() {
  if (USE_MOCK) {
    await delay(300)
    return mockResponse({
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
    })
  }
  const res = await axios.get('/api/system/info')
  return adaptResponse(res)
}
