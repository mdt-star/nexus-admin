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

## API 通信层

基于 Axios 统一封装，提供 BaseURL 配置、JWT 自动鉴权、全局错误拦截与登录态自动管理。

### BaseURL 配置

BaseURL 通过 `ConfigStore.global.apiBaseURL` 字段获取，由后端全局配置提供，按以下优先级：

1. `setApiBaseURL(url)` — 应用初始化时由 `ConfigStore` 在全局配置加载后调用（来源：后端 API `/api/config` 返回的 `global.apiBaseURL`）
2. `import.meta.env.VITE_API_BASE_URL` — 环境变量（`.env` 文件，用于开发/构建时覆盖）
3. 空字符串 — 同源请求（默认）

**Laravel 配置**（`config/nexus-admin.php`）：

```php
// API 基础路径（前端 axios 请求的 BaseURL）
'api_base_url' => env('NEXUS_ADMIN_API_BASE_URL', ''),
```

**.env 文件配置**：

```env
# 前后端分离时设置后端 API 地址
NEXUS_ADMIN_API_BASE_URL=https://api.example.com
```

**全局配置 API 响应格式**（`/api/config` 返回的 `global` 对象中需包含）：

```json
{
  "global": {
    "apiBaseURL": "https://api.example.com",
    "loginPath": "/admin/login"
  }
}
```

### JWT 鉴权流程

```
请求 → 请求拦截器读取 localStorage('nexus-admin-token')
      ↓
      自动注入 Authorization: Bearer <token>
      ↓
      后端验证 → 有效 → 正常响应
                → 无效(401) → 响应拦截器处理
```

- Token 存储键名：`nexus-admin-token`
- 认证头格式：`Authorization: Bearer <token>`
- Token 由登录接口返回，`userStore.login()` 自动保存到 localStorage

### 全局 HTTP 错误状态拦截

响应拦截器捕获所有 HTTP 错误，按状态码分类处理：

| 状态码 | 行为 | 用户提示 |
|--------|------|---------|
| 401 | 清除 Token → 保存当前路径 → 触发事件 → 跳转登录页 | "登录已过期，请重新登录" |
| 403 | 全局提示 | "没有权限执行此操作" |
| 404 | 全局提示 | "请求的资源不存在" |
| 422 | 静默（由调用方自行处理） | 无 |
| 429 | 全局提示 | "请求过于频繁，请稍后重试" |
| 5xx | 全局提示 | "服务器内部错误，请稍后重试" |
| 网络超时 | 全局提示 | "请求超时，请稍后重试" |
| 网络中断 | 全局提示 | "网络连接失败，请检查网络后重试" |

**防重复提示机制**：同一状态码在 2 秒内只弹出一次错误提示，避免多个请求同时失败时重复弹窗。

### 401 未登录自动处理

当捕获到 401 状态码时，自动执行以下步骤：

1. **保存当前路径**：将当前页面 URL 存入 `sessionStorage('nexus-redirect-path')`，登录后可恢复
2. **清除本地 Token**：移除 localStorage 中的 `nexus-admin-token`
3. **触发全局事件**：通过 `window.dispatchEvent(new CustomEvent('auth:unauthorized', ...))` 触发，供埋点、监控等插件捕获
4. **跳转登录页**：`window.location.href = '/login'`

### 静默请求模式

某些场景（如会话恢复）需要静默处理错误，不显示用户提示。可通过 `_silentError` 选项标记：

```js
// 静默模式：错误时不弹出提示
authApi.currentUser({ _silentError: true })
```

### 自定义事件

所有全局事件通过 `hookManager.emit()` 触发，插件可通过 `hookManager.on()` 监听。

| 事件名 | 触发时机 | 参数 |
|--------|---------|------|
| `auth:unauthorized` | 401 未登录/Token 过期 | `{ status: 401, message: '...' }` |

插件监听事件示例：

```js
import hookManager from './utils/hook-manager'

hookManager.on('auth:unauthorized', (payload) => {
  console.log('未登录事件:', payload)
  // 埋点上报 / 日志记录等
})
```

## 测试

当前测试覆盖（15 个测试文件，162 个测试用例）：

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
- Disktop API 服务端数据管理（31 项）

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

## ResizeObserver 循环限制修复

### 问题描述

浏览器控制台出现 `ResizeObserver loop completed with undelivered notifications.` 警告。

### 根因

1. **Element Plus 内部使用 ResizeObserver**：`el-table`（列宽计算 + 表头同步）、`el-dialog`（定位）、`el-popover`/`el-select`/`el-dropdown`（弹出位置）均依赖 ResizeObserver 检测尺寸变化
2. **Vue 响应式 DOM 更新**：当 Element Plus 的 ResizeObserver 回调触发 Vue 重新渲染，导致 DOM 尺寸再次变化，在当前帧内形成递归观察循环
3. **桌面图标 CSS transition**：`left/top 0.25s ease-out` 过渡动画在拖拽释放时持续触发布局变化，加剧该问题

### 修复方案

在 `app.js` 顶部注入自执行补丁 `patchResizeObserver()`，对原生 `ResizeObserver` 进行安全封装：

```
原生 ResizeObserver → 补丁层拦截 → 暂存待处理通知 → requestAnimationFrame → 下一帧批量执行
```

**核心逻辑**：

- 所有回调通知暂存到全局队列 `window.__nexus_ROPendingList`
- 通过 `requestAnimationFrame` 将同一帧内的多次观察合并到下一帧统一执行
- 浏览器无法检测到循环条件，彻底消除警告

### 影响范围

- 仅修改 `app.js`，零改动业务组件
- 不影响 Element Plus 组件正常功能
- 构建通过，全部 162 测试用例通过