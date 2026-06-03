# 布局模式

Nexus Admin 支持两种布局模式，通过 `useAppStore` 切换。

## 侧边栏模式（默认）

企业级后台的经典布局：左侧菜单 + 顶部操作栏 + 主内容区。

```
┌─────────────────────────────────┐
│       顶部操作栏                 │
├──────────┬──────────────────────┤
│          │                      │
│  侧边栏   │    内容区域           │
│  菜 单    │    (Tab 切换)        │
│          │                      │
└──────────┴──────────────────────┘
```

## 桌面模式

Windows 风格的桌面布局：任务栏 + 桌面图标 + 可拖拽窗口。

```
┌─────────────────────────────────┐
│     桌面图标  桌面图标  桌面图标   │
│                                  │
│        ┌─────────┐              │
│        │ 窗口内容 │              │
│        └─────────┘              │
│                                  │
├─────────────────────────────────┤
│ 开始  │ 任务栏图标 │ 托盘       │
└─────────────────────────────────┘
```

## 切换布局

```js
import { useAppStore } from 'nexus-admin-core'

const appStore = useAppStore()

// 切换为桌面模式
appStore.toggleLayout('desktop')

// 切换为侧边栏模式
appStore.toggleLayout('sidebar')

// 获取当前模式
console.log(appStore.layout) // 'sidebar' | 'desktop'
```

## 响应式适配

移动端（屏幕宽度 < 768px）自动切换为侧边栏模式，侧边栏通过滑动方式展开/收起。

```js
import { useUiSizeStore } from 'nexus-admin-core'

const uiSizeStore = useUiSizeStore()
console.log(uiSizeStore.elementSize) // 'default' | 'small'
```

## 布局组件

| 组件 | 用途 |
|------|------|
| `MainLayout` | 主导布局，根据模式自动切换 DesktopLayout / SidebarLayout |
| `DesktopLayout` | 桌面模式布局 |
| `SidebarLayout` | 侧边栏模式布局 |