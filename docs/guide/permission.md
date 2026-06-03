# 权限控制

## v-permission 指令

```vue
<template>
  <!-- 有 user.create 权限才显示 -->
  <button v-permission="'user.create'">新建用户</button>

  <!-- 有任一权限即显示 -->
  <button v-permission="['user.create', 'user.edit']">管理用户</button>
</template>
```

## 权限 Store

```js
import { usePermissionStore } from 'nexus-admin-core'

const permissionStore = usePermissionStore()

// 检查权限
if (permissionStore.hasPermission('user.create')) {
  // 有权限
}

// 获取所有权限标签
console.log(permissionStore.tags)
```

## 路由权限

在路由 meta 中声明：

```js
router.addRoute({
  path: '/admin',
  name: 'admin',
  component: () => import('./pages/Admin.vue'),
  meta: {
    title: '管理后台',
    permission: 'admin.access'  // 无此权限时路由不可见
  }
})