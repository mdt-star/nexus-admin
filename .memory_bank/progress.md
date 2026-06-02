# 项目进度

## 总体状态
- 测试通过率: 188/188 (100%)
- 测试文件: 15/15 全部通过
- Unhandled errors: 0

## 已完成
- [x] 架构重构：从「声明式清单」到「编程式 Provider + routeStore」模型
  - [x] 创建 `utils/create-provider-installer.js`：提供 `installProvider()` + `routeStore` + `normalizeRoute()`
  - [x] 路由简写功能：name/permission 自动推演、数组批量注册、path 参数支持
  - [x] 创建 `providers/nexus-admin.js`：基座自身通过 Provider 模式注册
  - 包括 install()（路由/图标/指令/组件/语言包）和 init()（config/theme/i18n/user 等有顺序依赖的初始化）
  - [x] 重构 `app.js`：bootstrap 流程精简为 createApp → loadAndInstallProviders → mount
  - [x] `loadAndInstallProviders` 一体化：install 基座 → install 第三方 → init 基座 → init 第三方
  - [x] 重构后端 `NexusAdminManager.php`：仅收集 provider 路径
  - [x] 更新 Blade 注入 `__NEXUS_ADMIN_PROVIDERS__`
  - [x] 路由配置集中到 `router/index.js` 的 `internalRoutes`
- [x] 国际化改造
  - [x] 创建 `lang/` 目录：zh.js / en.js / index.js 统一入口
  - [x] i18nStore 新增 `addMessages()` 统一注册接口（支持批量/单语言）
  - [x] 三层合并：基座内置 → 第三方 Provider → 后端 API（深合并）
  - [x] 清理 mock：移除 lang 翻译、mockMenus 等死代码
  - [x] mock 数据集中到 mock/index.js
- [x] 菜单数据源从后端 API 改为 routeStore（menuStore 改为 computed）
- [x] 样式迁移：菜单文字颜色变量移入 styles/global.scss
- [x] 清理旧文件：pages/registry.js、plugins/registry.js 及测试
- [x] 修复各类运行时 Bug：页面空白、组件映射丢失、StartMenu 无法打开等