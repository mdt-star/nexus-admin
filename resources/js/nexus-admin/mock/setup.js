/**
 * 应用层 Mock 拦截
 *
 * 继承核心包内置 Mock，仅添加本应用特有的业务 Mock 数据。
 */
import { initCoreMock } from '@nexus-admin/core/src/mock/setup'
import {
  mockPermissionTags,
  mockConfig,
  mockDisktops,
  mockDisktopItems,
  mockNotifications,
  mockSystemInfo
} from './index'

let Mock = null

async function getMock() {
  if (!Mock) {
    Mock = (await import('mockjs')).default
  }
  return Mock
}

export async function initMock() {
  // 先加载框架 API Mock
  await initCoreMock()

  // 再用业务数据覆盖/补充
  const Mock = await getMock()

  // ==================== 桌面项（补充业务数据）====================
  Mock.mock(/\/api\/disktops\/\d+\/items$/, 'get', (options) => {
    const id = Number(options.url.match(/\/api\/disktops\/(\d+)\/items/)[1])
    return mockDisktopItems.filter(item => item.disktop_id === id)
  })

  // ==================== 配置（补充业务数据）====================
  Mock.mock(/\/api\/config$/, 'get', () => mockConfig)

  // ==================== 权限（补充业务数据）====================
  Mock.mock(/\/api\/permissions\/tags$/, 'get', () => mockPermissionTags)

  // ==================== 通知（补充业务数据）====================
  Mock.mock(/\/api\/notifications$/, 'get', () => [...mockNotifications])
  Mock.mock(/\/api\/notifications\/unread-count$/, 'get', () => ({
    count: mockNotifications.filter(n => !n.read_at).length
  }))

  // ==================== 系统信息（纯业务）====================
  Mock.mock(/\/api\/system\/info$/, 'get', () => mockSystemInfo)
}