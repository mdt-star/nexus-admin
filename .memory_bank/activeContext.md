# 当前活动上下文

## 当前状态
实现了完整的桌面自定义系统（Disktop），用户可以通过开始菜单拖拽/点击添加桌面项，支持右键编辑、删除、新建文件夹，桌面图标和侧边栏菜单均来自用户自定义的 disktop_items。

## 最近变更
- **侧边栏拖放功能**（SidebarLayout.vue）：侧边栏 `<aside>` 新增 `@dragenter`/`@dragover`/`@dragleave`/`@drop` 事件处理
  - 从开始菜单拖拽菜单项时，侧边栏自动高亮显示拖放区域（虚线边框 + 脉冲动画提示）
  - 使用 `dragEnterCounter` 计数器避免子元素进出导致闪烁
  - 拖放成功后调用 `disktopStore.addItem()` 添加到自定义菜单
  - 新增 CSS：`.nexus-sidebar-dragover` 高亮状态、`.nexus-sidebar-drop-overlay` 覆盖层、`nexus-drop-pulse` 脉冲动画

- **拖放目标定位与层级嵌套**（StartMenu.vue, DesktopLayout.vue, SidebarLayout.vue）
  - StartMenu.vue：拖拽开始时 overlay 添加 `pointer-events: none` 确保拖放事件穿透
  - DesktopLayout.vue：每个桌面图标新增 `@dragover/@dragleave/@drop` 事件，拖到文件夹图标上时高亮并支持放入子级
    - 新增 `dropTargetId` 状态追踪当前悬停目标
    - 新增 `tryParseDragData()` 统一解析拖拽数据
    - 新增 `onIconDragOver/onIconDragLeave/onIconDrop` 处理单图标拖放
    - `onDrop` 添加 `parent_id: null` 明确表示根级
    - 新增 CSS `.nexus-desktop-icon-drop-target` 拖放目标高亮样式
  - SidebarLayout.vue：每个侧边栏菜单项增加拖放目标，文件夹类型菜单项可接收子项拖入
    - 每个 `el-menu-item` 和 `el-sub-menu` 的 `#title` 内嵌入 `.nexus-sidebar-item-title` div 承载拖放事件
    - 新增 `dropTargetId` 状态和控制函数 `onItemDragOver/onItemDragLeave/onItemDrop`
    - `onSidebarDrop` 添加 `parent_id: null` 明确表示根级
    - 新增 CSS `.nexus-sidebar-item-title` 和 `.nexus-sidebar-drop-target` 样式

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
