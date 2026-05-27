# 当前活动上下文

## 当前状态
示例扩展包（nexus-demo）已补充完整的业务页面，包括文章管理、分类管理、用户管理、角色管理、系统配置。

## 最近变更
- 顶部图标按钮主题融合优化（DesktopLayout.vue、SidebarLayout.vue）
- Tab 栏视觉重构（SidebarLayout.vue）- 去留白、分隔线、激活下划线指示器
- 窗口拖拽功能实现（composables/useWindowDrag.js + DesktopLayout.vue）
- 移动端适配优化（MainLayout.vue）：
  - 屏幕宽度 < 768px 自动检测，强制切换为 sidebar 布局
  - 新增移动端专属顶部导航栏（菜单折叠按钮 + 标题 + 主题切换）
  - 侧边栏改为 fixed 定位 + transform 滑入/滑出
  - 桌面布局的 header 在移动端隐藏
  - 桌面图标缩小（网格 64px、图标 40px、字号 10px）
  - 窗口尺寸自适应（宽度 92%、高度 85%）
  - 内容区 padding 缩小，底部栏隐藏

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
1. 安装依赖并启动开发服务器测试
2. 窗口拖拽功能
3. 移动端适配优化
4. 单元测试
5. 完善文档

## 已知问题
- 窗口拖拽功能尚未实现
- 移动端适配需要进一步优化
