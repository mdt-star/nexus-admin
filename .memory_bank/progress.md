# 项目进度

## 总体状态
- 测试通过率: 123/123 (100%)
- 测试文件: 14/14 全部通过
- Unhandled errors: 0

## 已完成
- [x] 修复 config.test.js - Pinia setup store ref 解包问题
- [x] 修复 i18n.test.js - 跨测试 mock 调用计数污染
- [x] 修复 menu.test.js - 跨测试 mock 调用计数污染 + 字段名不匹配
- [x] 修复 notification.test.js - vi.mock 工厂引用外部变量
- [x] 修复 size.test.js - localStorage mock 返回值跨测试污染
- [x] 修复 hook-events.test.js - 正则不匹配含数字的命名空间
- [x] 修复 registry.test.js - 使用 ESM 不支持的 require
- [x] 修复 windows.js - router.replace 在测试中 undefined 导致 unhandled rejection
- [x] 创建 HomePage.vue 默认首页组件（服务器信息、PHP 环境、系统信息）
- [x] 添加 getSystemInfo() Mock API
- [x] 注册 nexus-home 页面组件
- [x] SidebarLayout 无 Tab 时显示 HomePage
- [x] DesktopLayout 无窗口时显示 HomePage
- [x] 将测试 mock 从 `../services/api` 迁移到独立 service 模块
  - [x] disktop.test.js → `../services/disktops`
  - [x] menu.test.js → `../services/menus`
  - [x] notification.test.js → `../services/notifications`
  - [x] permission.test.js → `../services/permissions`
  - [x] i18n.test.js → `../services/i18n`
- [x] UI 尺寸改为通过 ConfigStore 统一管理（随用户配置持久化到后端）
  - [x] size store 移除 localStorage，改为从 ConfigStore 读取/写入
  - [x] config store defaults 新增 `uiSize: 'medium'`
  - [x] app.js 初始化顺序调整
  - [x] 更新 size.test.js 测试
- [x] 修复登录页 Logo 显示问题，统一登录框主色调与系统一致
  - [x] 用品牌 SVG Logo 替换通用 Monitor 图标（增大色块、提高透明度使图标清晰）
  - [x] 所有硬编码主色调替换为 CSS 变量（`var(--el-color-primary)` 等）
  - [x] 移除未使用的 `Monitor` 图标导入
  - [x] 输入框图标（User/Lock）从 18px→20px，提高对比度至 `var(--nexus-text-color-secondary)`
  - [x] 登录页支持系统亮/暗主题切换（移除强制暗色背景，使用 `var(--nexus-bg-color)` 等系统变量）
  - [x] 亮色模式下粒子效果淡化（opacity * 0.3）
- [x] 修复搜索弹窗输入时自动关闭的 Bug
  - [x] 真正根因：`filteredResults` 中 `item.id.toLowerCase()` 在数字 id 上抛异常导致渲染崩溃
  - [x] 修复：`String(item.id ?? '').toLowerCase()` 安全处理非字符串值（仅 4 行改动）
  - [x] 还原此前所有无效改动（dialogVisible ref、isInputActive、display:none 移除等）
- [x] 修复欢迎页在侧边栏/桌面模式下的展示异常（HomePage.vue）
  - [x] 侧边栏模式：系统信息卡片在右侧，CSS Grid 双列布局
  - [x] 桌面模式：保持原有单列样式，隐藏侧边容器
