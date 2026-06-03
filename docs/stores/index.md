# 状态管理

Nexus Admin 提供 12 个 Pinia Store，覆盖后台管理的常见状态需求。

## 快速开始

```js
import { useAppStore, useUserStore } from 'nexus-admin-core'

const appStore = useAppStore()
const userStore = useUserStore()
```

## Stores 一览

| Store | 说明 | 核心状态 |
|-------|------|---------|
| [useAppStore](/stores/app) | 应用状态 | `layout`, `sidebarCollapsed` |
| [useConfigStore](/stores/config) | 用户配置 | `global`, `userConfig` |
| [useI18nStore](/stores/i18n) | 国际化 | `locale`, `messages` |
| [useMenuStore](/stores/menu) | 菜单 | `items`, `activeId` |
| [usePermissionStore](/stores/permission) | 权限 | `tags` |
| [useThemeStore](/stores/theme) | 主题 | `theme`, `primaryColor` |
| [useUserStore](/stores/user) | 用户 | `user`, `token` |
| [useWindowStore](/stores/window) | 窗口/Tab | `items`, `activeId` |
| [useDisktopStore](/stores/disktop) | 桌面项 | `items` |
| [useNotificationStore](/stores/notification) | 通知 | `items`, `unreadCount` |
| [useShortcutsStore](/stores/shortcuts) | 快捷键 | `items` |
| [useUiSizeStore](/stores/size) | UI 尺寸 | `elementSize` |

## 设计原则

- **按需加载**：每个 Store 独立，只在使用时从 Pinia 初始化
- **响应式**：所有状态通过 Pinia 管理，Vue 组件自动响应变化
- **持久化**：部分 Store（如 Window、Config）自动同步到 localStorage