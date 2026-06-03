# 菜单系统

菜单从 `routeStore` 自动生成，无需手动配置菜单数据。

## 工作原理

```
路由注册 → routeStore 自动收集 → 按 provider 分组
    ↓
useMenuStore（computed）→ 生成菜单树
    ↓
SidebarMenu / StartMenu 渲染
```

## 路由 meta 影响菜单

```js
router.addRoute({
  path: '/users',
  name: 'users',
  component: () => import('./pages/Users.vue'),
  meta: {
    title: '用户管理',    // 菜单标题
    icon: 'User',          // 菜单图标
    sort: 2,               // 排序
    hidden: false,          // 是否隐藏
    permission: 'user.view' // 权限
  }
})
```

## 获取菜单

```js
import { useMenuStore } from 'nexus-admin-core'

const menuStore = useMenuStore()
console.log(menuStore.items)      // 所有菜单项
console.log(menuStore.activeId)   // 当前激活菜单 ID
```

## routeStore 菜单工具

```js
import { routeStore } from 'nexus-admin-core'

// 构建自定义菜单树
routeStore.getMenuTree({
  filter: route => !route.meta?.hidden,
  sort: (a, b) => (a.meta?.sort || 0) - (b.meta?.sort || 0)
})