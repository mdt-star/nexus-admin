# 路由系统

## 创建路由

```js
import { createNexusRouter } from 'nexus-admin-core'

const routes = [
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('./pages/Dashboard.vue'),
    meta: {
      title: '控制台',
      icon: 'Platform',
      sort: 1,
      permission: 'dashboard.view'
    }
  }
]

const router = createNexusRouter(routes)
```

## 路由 meta 约定

| 字段 | 类型 | 说明 |
|------|------|------|
| `title` | string | 菜单显示标题 **（必填）** |
| `icon` | string \| object | 菜单图标，支持 string 或 `{ desktop: '...', sidebar: '...' }` |
| `sort` | number | 菜单排序权重，越小越靠前 |
| `hidden` | boolean | 是否在菜单中隐藏 |
| `permission` | string | 权限标识 |
| `tags` | string[] | 标签（用于筛选分类） |

## routeStore

路由注册后自动被 `routeStore` 收集，按 Provider 分组隔离。

```js
import { routeStore } from 'nexus-admin-core'

// 获取所有路由
console.log(routeStore.getAllRoutes())

// 按 Provider 获取
console.log(routeStore.getProviderRoutes('my-app'))

// 构建菜单树
const menuTree = routeStore.getMenuTree({
  filter: route => !route.meta.hidden,
  sort: (a, b) => (a.meta?.sort || 0) - (b.meta?.sort || 0)
})
```

## 注册路由

通过 `router.addRoute()` 注册的路由自动被 routeStore 捕获：

```js
router.addRoute({
  path: '/blog',
  name: 'blog',
  component: () => import('./pages/Blog.vue'),
  meta: { title: '博客管理', icon: 'Document' }
})