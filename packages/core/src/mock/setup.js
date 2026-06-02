/**
 * 核心包内置 Mock 拦截
 *
 * 仅模拟框架基础设施所需的 API 响应，
 * 不包含任何业务数据。业务 Mock 由应用层提供。
 *
 * 当应用层不提供自定义 Mock 时，此文件确保框架可启动。
 */
export async function initCoreMock() {
  // 仅当 window.__NEXUS_ADMIN_USE_MOCK__ 不为 false 时启动
  if (window.__NEXUS_ADMIN_USE_MOCK__ === false) return
  // 核心包不内置 mock 数据，仅声明占位
}