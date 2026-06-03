# Provider 机制

Provider 是 Nexus Admin 的核心架构模式，采用编程式插件模型。

## 概念

从「声明式清单」转变为「编程式 Provider」。第三方不再通过 `composer.json` 声明 pages/components 清单，而是发布一个 provider 入口文件，基座负责加载并执行。

## Provider 结构

```js
export default {
  name: 'my-provider',

  // install：注册组件、指令、路由
  install({ app, router, hookManager, pinia, configStore }) {
    router.addRoute({
      path: '/my-page',
      component: () => import('./pages/MyPage.vue'),
      meta: { title: '我的页面', icon: 'Setting' }
    })
    app.component('MyButton', MyButton)
    app.directive('my-dir', MyDirective)
  },

  // init：初始化业务逻辑（有顺序依赖）
  async init({ userStore, configStore, i18nStore }) {
    await configStore.load()
  }
}
```

## 安装 Provider

```js
import { loadAndInstallProviders } from 'nexus-admin-core'

await loadAndInstallProviders([
  nexusAdminProvider,
  myAppProvider
], { app, router, pinia })
```

执行顺序：

1. **install 基座** → 注册基础路由和组件
2. **install 第三方** → 按顺序注册各 Provider
3. **init 基座** → 初始化框架
4. **init 第三方** → 初始化插件

## Provider 上下文

| 属性 | 说明 |
|------|------|
| `app` | Vue 应用实例（可调用 app.component、app.directive、app.use）|
| `router` | Vue Router 实例（addRoute 已被代理自动收集）|
| `hookManager` | 钩子管理器 |
| `pinia` | Pinia 实例 |
| `configStore` | 全局配置 Store |