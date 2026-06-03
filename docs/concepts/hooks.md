# 钩子系统

全局事件系统，支持插件监听应用生命周期事件。

## 使用

```js
import { hookManager } from 'nexus-admin-core'

// 监听事件
hookManager.on('theme:changed', ({ theme, primaryColor }) => {
  console.log('主题已切换:', theme, primaryColor)
})

// 触发事件
await hookManager.emit('theme:changed', { theme: 'dark', primaryColor: '#14b8a6' })
```

## 内置事件

| 事件 | 触发时机 | 参数 |
|------|---------|------|
| `app:init` | 应用初始化后 | 无 |
| `app:mounted` | 应用挂载后 | 无 |
| `config:before-load` | 配置加载前 | 无 |
| `config:loaded` | 配置加载完成 | `{ config }` |
| `theme:before-change` | 主题切换前 | `{ theme }` |
| `theme:changed` | 主题切换后 | `{ theme, primaryColor }` |
| `i18n:before-change` | 语言切换前 | `{ locale }` |
| `i18n:changed` | 语言切换后 | `{ locale, messages }` |
| `menu:before-load` | 菜单加载前 | 无 |
| `menu:loaded` | 菜单加载完成 | `{ items }` |
| `permission:loaded` | 权限标签加载完成 | `{ tags }` |
| `window:open` | 窗口打开 | `{ id, title }` |
| `window:close` | 窗口关闭 | `{ id }` |
| `auth:unauthorized` | 未登录 | `{ status, message }` |

## 最佳实践

Provider 在 `install` 中注册钩子监听：

```js
export default {
  name: 'analytics',
  install({ hookManager }) {
    hookManager.on('theme:changed', ({ theme }) => {
      // 上报主题切换事件
      console.log('埋点：主题切换', theme)
    })
  }
}