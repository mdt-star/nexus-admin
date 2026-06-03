# nexus-admin-core

[![npm version](https://img.shields.io/npm/v/nexus-admin-core)](https://www.npmjs.com/package/nexus-admin-core)

Nexus Admin 核心包 —— 基于 Vue 3 + Element Plus 的现代化后台管理界面基座核心逻辑。

提供后台管理系统所需的通用能力：Provider 插件化扩展、路由管理、状态管理、权限控制、国际化、主题定制、桌面模式（Windows 风格）和侧边栏模式。

## 安装

```bash
npm install nexus-admin-core
```

### 依赖要求（peerDependencies）

- `vue` ^3.4.0
- `pinia` ^2.3.0
- `element-plus` ^2.9.0
- `vue-router` ^4.6.4
- `@element-plus/icons-vue` ^2.3.0
- `axios` ^1.16.1

## 快速开始

```js
import { createNexusApp, nexusAdminProvider } from 'nexus-admin-core'
import router from './router'
import appProvider from './providers/app'

await createNexusApp({
  router,
  baseProviders: [nexusAdminProvider, appProvider]
})
```

## 公共 API

### 核心工具

| 导出 | 说明 |
|------|------|
| `createNexusApp(options)` | 创建 Vue 应用，安装 Provider、路由、Pinia |
| `createNexusRouter(routes)` | 创建预配置的 Vue Router 实例 |
| `loadAndInstallProviders(providers, ctx)` | 批量安装 Provider |
| `routeStore` | 响应式路由注册中心（按提供者分组） |
| `request` | Axios 请求实例（预配置） |
| `hookManager` | 钩子管理器（发布/订阅模式） |
| `hookEvents` | 内置钩子事件定义 |
| `I18nCollector` | 国际化翻译收集器 |
| `nexusAdminProvider` | 基座内置 Provider（注册路由、组件、指令） |

### 状态管理（Pinia Stores）

| Store | 说明 |
|-------|------|
| `useAppStore` | 应用状态（布局模式切换） |
| `useConfigStore` | 用户配置 |
| `useI18nStore` | 国际化（支持三层合并：内置 Provider → 第三方 → 后端 API） |
| `useMenuStore` | 菜单数据（从 routeStore 自动生成） |
| `usePermissionStore` | 权限标签 |
| `useThemeStore` | 主题 |
| `useUserStore` | 用户认证 |
| `useWindowStore` | 窗口管理（桌面模式） |
| `useDisktopStore` | 桌面项管理 |
| `useNotificationStore` | 通知 |
| `useShortcutsStore` | 快捷键 |
| `useUiSizeStore` | Element Plus 尺寸 |

### 组件

| 组件 | 说明 |
|------|------|
| `AppRoot` | 根组件 |
| `LoginPage` | 登录页 |
| `PreferencesPanel` | 偏好设置面板 |
| `GlobalSearch` | 全局搜索 |
| `NotificationBell` | 通知铃铛 |
| `PermissionTag` | 权限标签 |
| `SidebarMenu` / `SidebarMenuNode` | 侧边栏菜单 |
| `DesktopWindow` / `FolderView` / `ItemEditor` | 桌面模式窗口系统 |
| `StartMenu` / `TaskBar` / `WindowsStartIcon` | 桌面模式任务栏 |
| `GlobeIcon` | 地球图标 |
| `MainLayout` / `DesktopLayout` / `SidebarLayout` | 布局容器 |

### 指令

| 指令 | 说明 |
|------|------|
| `vPermission` | 权限控制指令（v-permission="'user.create'"） |

## Provider 插件机制

核心采用 Provider 模型实现插件化扩展。每个 Provider 是一个带有 `install(ctx)` 和 `init(ctx)` 方法的对象：

```js
// providers/app.js
export default {
  name: 'my-app',

  install({ app, router, hookManager, pinia, configStore }) {
    // 注册组件、指令、路由
    router.addRoute({
      path: '/my-page',
      component: () => import('./pages/MyPage.vue'),
      meta: { title: '我的页面', icon: 'Setting' }
    })
    app.component('MyButton', MyButton)
  },

  async init({ userStore, configStore, i18nStore }) {
    // 初始化逻辑（有顺序依赖时使用）
  }
}
```

路由通过 `router.addRoute()` 注册后会被自动收集到 `routeStore`，按提供者分组隔离。

## 导入样式

```js
import 'nexus-admin-core/src/styles/global.scss'
```

## License

MIT