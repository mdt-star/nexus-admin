# 快速开始

## 安装

```bash
npm install nexus-admin-core
```

### 依赖要求

确保已安装以下 peer dependencies：

| 包名 | 版本要求 |
|------|---------|
| vue | ^3.4.0 |
| pinia | ^2.3.0 |
| element-plus | ^2.9.0 |
| vue-router | ^4.6.4 |
| @element-plus/icons-vue | ^2.3.0 |
| axios | ^1.16.1 |

## 创建应用

```js
import { createNexusApp, nexusAdminProvider } from 'nexus-admin-core'
import { createRouter, createWebHistory } from 'vue-router'
import appProvider from './providers/app'

// 创建路由
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('./pages/Home.vue'),
      meta: { title: '首页', icon: 'HomeFilled' }
    }
  ]
})

// 启动应用
await createNexusApp({
  router,
  baseProviders: [nexusAdminProvider, appProvider]
})
```

## 创建 Provider

```js
// providers/app.js
export default {
  name: 'my-app',

  install({ app, router }) {
    // 注册组件、路由
    router.addRoute({
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../pages/Dashboard.vue'),
      meta: { title: '控制台', icon: 'Platform', permission: 'dashboard.view' }
    })
    app.component('MyButton', () => import('../components/MyButton.vue'))
  },

  async init({ configStore, userStore, i18nStore }) {
    // 应用初始化逻辑
  }
}
```

## 导入样式

```js
import 'nexus-admin-core/src/styles/global.scss'
```

## 下一步

- [项目结构](/guide/structure) — 了解 monorepo 布局
- [Provider 机制](/concepts/provider) — 核心架构概念
- [布局模式](/guide/layouts) — 侧边栏与桌面模式