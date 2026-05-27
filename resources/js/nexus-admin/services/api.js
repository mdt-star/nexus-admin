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
