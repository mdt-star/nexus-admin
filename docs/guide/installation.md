# 安装

## 作为 npm 包使用

```bash
npm install nexus-admin-core
```

## 在 Monorepo 中使用

本项目使用 npm workspaces 管理。根目录 `package.json` 已配置：

```json
{
  "workspaces": ["packages/*"]
}
```

`packages/core` 自动链接到 `node_modules/nexus-admin-core`，开发时无需构建即可引用。

## 导入方式

```js
// 导入核心 API
import { createNexusApp, nexusAdminProvider } from 'nexus-admin-core'

// 导入 Store
import { useI18nStore, useThemeStore } from 'nexus-admin-core'

// 导入组件
import { AppRoot, LoginPage } from 'nexus-admin-core'

// 导入样式
import 'nexus-admin-core/src/styles/global.scss'

// 导入语言包（按需）
import zh from 'nexus-admin-core/src/lang/zh.js'
import en from 'nexus-admin-core/src/lang/en.js'
```

## Peer Dependencies

`nexus-admin-core` 将以下包声明为 peer dependencies，需要自行安装：

```bash
npm install vue pinia element-plus vue-router @element-plus/icons-vue axios
```

版本要求：

| 包 | 最低版本 |
|---|---------|
| vue | ^3.4.0 |
| pinia | ^2.3.0 |
| element-plus | ^2.9.0 |
| vue-router | ^4.6.4 |
| @element-plus/icons-vue | ^2.3.0 |
| axios | ^1.16.1 |