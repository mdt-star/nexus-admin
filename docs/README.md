# Nexus Admin

基于 Vite + Vue 3 + Element Plus 的现代化后台管理界面基座，支持插件化扩展和主题定制。

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 运行测试

```bash
# 单次运行
npm test

# 监听模式
npm run test:watch
```

## 项目结构

```
resources/js/nexus-admin/
├── app.js                    # 应用入口
├── components/               # 公共组件
│   └── common/
│       └── PermissionTag.vue # 权限标签组件
├── composables/              # 组合式函数
│   └── useWindowDrag.js      # 窗口拖拽
├── directives/               # 自定义指令
│   └── permission.js         # v-permission 权限指令
├── layouts/                  # 布局组件
│   ├── DesktopLayout.vue     # 桌面式布局（窗口模式）
│   ├── MainLayout.vue        # 主布局（响应式切换）
│   └── SidebarLayout.vue     # 侧边栏布局（Tab 模式）
├── mock/                     # Mock 数据
│   └── index.js
├── plugins/                  # 插件系统
│   └── registry.js           # 插件注册中心
├── services/                 # API 服务
│   └── api.js
├── stores/                   # Pinia 状态管理
│   ├── app.js                # 应用全局状态
│   ├── config.js             # 配置管理
│   ├── i18n.js               # 多语言
│   ├── menu.js               # 菜单管理
│   ├── permission.js         # 权限管理
│   ├── theme.js              # 主题管理
│   └── windows.js            # 窗口/Tab 管理
├── styles/                   # 样式
│   ├── variables.scss        # CSS 变量（亮/暗主题）
│   └── global.scss           # 全局样式
├── utils/                    # 工具
│   ├── hook-manager.js       # 钩子管理器
│   └── hook-events.js        # 内置钩子事件
└── vendor/                   # 扩展包目录
    └── nexus-demo/           # 示例扩展包
        ├── registry.js
        └── pages/
            ├── Dashboard.vue
            ├── ContentArticle.vue
            ├── ContentCategory.vue
            ├── SystemUser.vue
            ├── SystemRole.vue
            └── SystemConfig.vue
```

## 布局模式

支持两种布局模式：

- **侧边栏模式（sidebar）**：左侧菜单 + 顶部操作栏 + Tab 标签页切换
- **桌面模式（desktop）**：顶部栏 + 桌面图标网格 + 可拖拽窗口

移动端（<768px）自动切换为侧边栏模式，侧边栏滑动展开/收起。

## 钩子系统

全局事件系统，支持插件的生命周期响应。

### 内置事件

| 事件 | 触发时机 |
|------|---------|
| `app:init` | 应用初始化后 |
| `app:mounted` | 应用挂载后 |
| `config:before-load` | 配置加载前 |
| `config:loaded` | 配置加载完成 |
| `theme:before-change` | 主题切换前 |
| `theme:changed` | 主题切换后 |
| `i18n:before-change` | 语言切换前 |
| `i18n:changed` | 语言切换后 |
| `menu:before-load` | 菜单加载前 |
| `menu:loaded` | 菜单加载完成 |
| `permission:loaded` | 权限标签加载完成 |
| `window:open` | 窗口打开时 |
| `window:close` | 窗口关闭时 |

### 使用示例

```js
import hookManager from './utils/hook-manager'

// 注册
hookManager.on('theme:changed', ({ theme, primaryColor }) => {
  console.log('主题已切换:', theme)
})

// 触发
await hookManager.emit('theme:changed', { theme: 'dark', primaryColor: '#409EFF' })
```

## 扩展包开发

在 `vendor/` 目录下创建子目录即可开发扩展包。支持自动扫描：

```
vendor/my-package/
├── pages/          # 页面组件（.vue）
├── components/     # 公共组件
├── directives/     # 自定义指令
├── plugins/        # 插件
└── registry.js     # 注册文件
```

## 主题定制

支持亮/暗两种主题，CSS 变量驱动全界面配色。

### 核心颜色变量

| 变量 | 用途 | 亮色值 | 暗色值 |
|------|------|--------|--------|
| `--nexus-primary-color` | 主色调 | #14b8a6 | #14b8a6 |
| `--nexus-primary-color-dark` | 主色调深色 | #0d9488 | #0d9488 |
| `--nexus-bg-color` | 页面背景 | #f8fafc | #0f172a |
| `--nexus-bg-color-light` | 卡片/浮层背景 | #ffffff | #1e293b |
| `--nexus-text-color` | 主文字色 | #1e293b | #f1f5f9 |

### 桌面背景视觉变量

| 变量 | 用途 | 亮色值 | 暗色值 |
|------|------|--------|--------|
| `--nexus-desktop-grid-color` | 桌面点阵网格色 | rgba(255,255,255,0.20) | rgba(255,255,255,0.18) |
| `--nexus-desktop-glow` | 桌面顶部光泽色 | rgba(255,255,255,0.18) | rgba(255,255,255,0.16) |

## 测试

当前测试覆盖（14 个测试文件，126 个测试用例）：

- HookManager 生命周期管理（10 项）
- Windows Store 窗口状态管理（11 项）
- Disktop Store 桌面项管理（16 项）
- Menu Store 菜单管理（9 项）
- Config Store 全局配置（9 项）
- I18n Store 多语言管理（9 项）
- Theme Store 主题管理（5 项）
- Permission Store 权限管理（7 项）
- User Store 用户状态（7 项）
- Notification Store 通知管理（11 项）
- Size Store 尺寸管理（10 项）
- App Store 应用状态（4 项）
- Plugin Registry 插件注册（6 项）
- Hook Events 钩子事件（9 项）

框架：Vitest + happy-dom

## 开始菜单拖拽功能说明

桌面模式下，开始菜单中的菜单项可通过拖拽添加到桌面（支持拖入已有文件夹）。

### 数据流

```
StartMenu.onDragStart → JSON.stringify({ title, icon, component, path, type, children })
                                ↓
 DesktopLayout.onDrop → JSON.parse → ds.addItem({ ...item, custom, sort })
                                ↓
                     disktopStore.addItem → API POST → items.value.push(newItem)
```

- 叶子菜单（无 children）：`type: 'menu'`，将作为桌面图标，双击打开页面
- 父级菜单（有 children）：`type: 'folder'`，将作为桌面文件夹，子项自动创建到文件夹内
- 二级菜单：通过 `@dragstart.stop` 阻止事件冒泡到父级，确保 component/path 正确传递

### 点击机制

桌面图标支持双击打开。使用独立双击检测机制（300ms 内同一图标两次点击），不依赖浏览器原生 `dblclick` 事件，兼容性更可靠。