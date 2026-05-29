# 当前活动上下文

## 当前状态
实现了完整的桌面自定义系统（Disktop），用户可以通过开始菜单拖拽/点击添加桌面项，支持右键编辑、删除、新建文件夹，桌面图标和侧边栏菜单均来自用户自定义的 disktop_items。

## 最近变更
- **StartMenu 重构为 el-popover 实现（修复定位问题）**（StartMenu.vue）：
  - 移除 `virtual-ref` + `virtual-triggering` 方式（无法定位，因为 el-button 的 ref 是组件实例而非 DOM 元素）
  - 改用 `el-popover` 的 `#reference` slot 方式，父组件将触发按钮放入 slot 中，popover 自动管理定位
  - 移除 `triggerRef` prop，不再需要父组件传入 DOM 引用
  - 父组件 DesktopLayout.vue / SidebarLayout.vue 将触发按钮移到 `<StartMenu>` 的 `<template #reference>` 内
  - 移除父组件中独立的 `<StartMenu>` 调用（已合并到 header 的 slot 中）
- **修复 URL 地址栏不同步**：
  - `app.js` 中已有 `watch(() => windowStore.active, ...)` 监听 active Tab 变化同步 URL（含 params.query）
  - `windows.js` 中移除多余的 `syncUrl()` 手动调用，避免与 `app.js` 的 watch 冲突
  - URL 同步统一由 `app.js` 的 watch 处理，确保打开/切换 Tab 时正确同步 route path + query 参数

## 示例页面清单

| 菜单项 | 页面组件 | 功能 |
|-------|---------|------|
| 控制台 | Dashboard.vue | 统计卡片展示 |
| 文章管理 | ContentArticle.vue | 表格列表、搜索、分页、新建/编辑对话框、删除确认 |
| 分类管理 | ContentCategory.vue | 表格列表、新建/编辑对话框、删除确认 |
| 用户管理 | SystemUser.vue | 表格列表、搜索筛选、分页、新建/编辑对话框、删除确认 |
| 角色管理 | SystemRole.vue | 表格列表、新建/编辑对话框、删除确认 |
| 系统配置 | SystemConfig.vue | Tab 切换（基本/邮件/安全），表单保存 |

## 内置钩子事件清单

### 应用生命周期
| 钩子 | 触发时机 | 参数 |
|-----|---------|------|
| `app:init` | 应用创建后，注册基础组件前 | `app` |
| `app:mounted` | 应用挂载到 DOM 后 | `el` |
| `app:before-unmount` | 应用卸载前 | `app` |

### 配置生命周期
| 钩子 | 触发时机 | 参数 |
|-----|---------|------|
| `config:before-load` | 加载配置前 | - |
| `config:loaded` | 配置加载完成后 | `config` |
| `config:changed` | 配置项变更时 | `key`, `newValue`, `fullConfig` |

### 主题生命周期
| 钩子 | 触发时机 | 参数 |
|-----|---------|------|
| `theme:before-change` | 主题切换前 | `theme` |
| `theme:changed` | 主题切换后 | `{ theme, primaryColor }` |
| `theme:color-change` | 主色调变更时 | `color` |

### 多语言生命周期
| 钩子 | 触发时机 | 参数 |
|-----|---------|------|
| `i18n:before-change` | 语言切换前 | `locale` |
| `i18n:changed` | 语言切换后 | `locale`, `messages` |
| `i18n:loaded` | 语言包加载完成 | `locale`, `messages` |

### 菜单生命周期
| 钩子 | 触发时机 | 参数 |
|-----|---------|------|
| `menu:before-load` | 加载菜单前 | - |
| `menu:loaded` | 菜单加载完成后 | `menus` |
| `menu:item-click` | 菜单项被点击时 | `item` |

### 权限生命周期
| 钩子 | 触发时机 | 参数 |
|-----|---------|------|
| `permission:loaded` | 权限标签加载完成 | `tags` |
| `permission:check` | 权限检查时 | `tag`, `result` |

### 窗口/Tab 生命周期
| 钩子 | 触发时机 | 参数 |
|-----|---------|------|
| `window:open` | 窗口/Tab 打开时 | `item` |
| `window:close` | 窗口/Tab 关闭时 | `item` |
| `window:activate` | 窗口/Tab 激活时 | `item` |

## 下一步计划
1. 验证构建无报错

## 已知问题
- 无
