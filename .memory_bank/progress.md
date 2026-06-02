# 项目进度

## 总体状态
- 测试通过率: 170/170 (100%)
- 测试文件: 15/15 全部通过
- Unhandled errors: 0

## 已完成
- [x] 架构重构：从「声明式清单」到「编程式 Provider + routeStore」模型
  - [x] 创建 `utils/create-provider-installer.js`：提供 `createProviderInstaller()` + `routeStore`
  - [x] 创建 `providers/nexus-admin.js`：基座自身通过 Provider 模式注册内置路由
  - [x] 重构 `app.js`：Provider 加载流程替代四类清单注册流程（移除了 resolvePageComponents/resolveComponents/resolveDirectives/resolvePlugins）
  - [x] 重构 `NexusAdminManager.php`：仅收集 provider 路径，移除四类清单的扫描/收集逻辑
  - [x] 更新 `NexusAdminServiceProvider.php`：注入 nexusProviders 替代 nexusRegistry
  - [x] 更新 `app.blade.php`：注入 `__NEXUS_ADMIN_PROVIDERS__` 替代 `__NEXUS_ADMIN_REGISTRY__`
  - [x] 更新 `index.html`：开发环境使用新的 provider 机制
  - [x] 清理：移除 `pages/registry.js`、`plugins/registry.js`、`plugins/registry.test.js`
  - [x] 测试：14 个新测试覆盖 createProviderInstaller 和 routeStore
  - [x] 构建通过，全部 170 测试用例通过，零回归
- [x] 前端接口层统一改造：BaseURL、JWT 鉴权与全局错误拦截
- [x] 桌面与侧边栏模式功能修复及优化
- [x] 任务闭环：开始菜单拖拽功能完整修复等