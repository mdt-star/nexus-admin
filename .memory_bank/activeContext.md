# 当前活动上下文

## 当前工作
架构重构已全部完成，代码已合并到 `dev` 分支。最新提交（9302d8e5）完成了最后的重构步骤：
- `loadAndInstallProviders()` 移入 `utils/create-provider-installer.js` 导出
- `buildPageMap()` 移入 `providers/nexus-admin.js` 作为基座 Provider 的方法
- `app.js` 进一步精简为纯 bootstrap 入口

## 改动总结

### 核心架构变更
从「声明式清单」（pages/components/directives/plugins 四类清单）转变为「编程式 Provider + routeStore」模型。

### Provider 生命周期
每个 Provider 支持两个阶段：
1. **install(ctx)** — 注册型操作（路由、图标、指令、组件、语言包），mount 前执行，无顺序依赖
2. **init(ctx, pendingI18nMessages)** — 初始化型操作（config/theme/i18n/user/size 等），有严格顺序依赖

### 启动流程 (`app.js bootstrap`)
```
createApp → use(Pinia) → use(Router) → use(ElementPlus)
  → loadAndInstallProviders(ctx, baseProvider, pendingI18nMessages)
    1. install 基座 provider
    2. install 第三方 provider（动态 import）
    3. init 基座 provider
    4. init 第三方 provider
  → window.__NEXUS_ADMIN_PAGES__ = nexusAdminProvider.buildPageMap(router)
  → mount()
```

### 国际化三层合并
1. 基座内置 (`lang/zh.js`, `lang/en.js`)
2. 第三方 Provider (`ctx.i18n.addMessages()`)
3. 后端 API（深合并，最高优先级）

### 核心模块职责
| 模块 | 职责 |
|------|------|
| `utils/create-provider-installer.js` | `installProvider()` / `loadAndInstallProviders()` / `routeStore` / `normalizeRoute()` |
| `providers/nexus-admin.js` | 基座 Provider：`install()` / `init()` / `buildPageMap(router)` |
| `app.js` | 入口：`createApp` → `loadAndInstallProviders` → `buildPageMap` → `mount` |
| `router/index.js` | `internalRoutes` 内部路由配置 |
| `stores/i18n.js` | `addMessages()` 三层合并国际化 |

### 文件变更
| 新增 | 修改 | 移除 |
|------|------|------|
| `utils/create-provider-installer.js` | `app.js` | `pages/registry.js` |
| `providers/nexus-admin.js` | `stores/i18n.js` | `plugins/registry.js` |
| `lang/zh.js`, `lang/en.js`, `lang/index.js` | `stores/menu.js` | `plugins/registry.test.js` |
| `utils/create-provider-installer.test.js` | `router/index.js` | `mockMenus` 相关代码 |
| | `NexusAdminManager.php` | |
| | `app.blade.php` | |
| | `mock/index.js`, `mock/setup.js` | |
| | `styles/global.scss` | |

### 测试
- 15 测试文件，188 测试用例，全部通过
