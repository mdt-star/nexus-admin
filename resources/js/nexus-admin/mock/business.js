/**
 * 应用层业务 Mock 数据
 *
 * 导出一个 (Mock) => { ... } 函数，
 * 在 app-provider 的 install 阶段通过 ctx.mock.add() 注册，
 * 与核心包内置 Mock 叠加运行。
 */
import {
  mockPermissionTags,
  mockConfig,
  mockDisktops,
  mockDisktopItems,
  mockNotifications,
  mockSystemInfo
} from './index'

export default (Mock) => {
  // ==================== 桌面（补充业务数据）====================
  Mock.mock(/\/api\/disktops$/, 'get', () => mockDisktops)

  Mock.mock(/\/api\/disktops\/(\d+)\/items$/, 'get', (options) => {
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