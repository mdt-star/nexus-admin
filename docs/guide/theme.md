# 主题定制

支持亮/暗两种主题，通过 CSS 变量驱动全界面配色。

## 切换主题

```js
import { useThemeStore } from 'nexus-admin-core'

const themeStore = useThemeStore()

// 切换暗色模式
themeStore.toggleTheme('dark')

// 切换亮色模式
themeStore.toggleTheme('light')

// 获取当前主题
console.log(themeStore.theme) // 'light' | 'dark'
```

## CSS 变量

| 变量名 | 用途 | 亮色默认值 |
|--------|------|-----------|
| `--nexus-primary-color` | 主色调 | #14b8a6 |
| `--nexus-primary-color-dark` | 主色调深色 | #0d9488 |
| `--nexus-bg-color` | 页面背景 | #f8fafc |
| `--nexus-bg-color-light` | 卡片/浮层背景 | #ffffff |
| `--nexus-text-color` | 主文字色 | #1e293b |
| `--nexus-sidebar-bg` | 侧边栏背景 | #1e293b |
| `--nexus-desktop-grid-color` | 桌面点阵网格色 | rgba(255,255,255,0.20) |
| `--nexus-desktop-glow` | 桌面顶部光泽色 | rgba(255,255,255,0.18) |

## 自定义主题

通过覆盖 CSS 变量实现：

```css
:root {
  --nexus-primary-color: #409eff;
  --nexus-primary-color-dark: #337ecc;
  --nexus-bg-color: #f0f2f5;
}
```

使用 Element Plus 的 `ElConfigProvider`：

```vue
<template>
  <el-config-provider :locale="locale">
    <AppRoot />
  </el-config-provider>
</template>