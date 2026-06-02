# 架构设计

## 第三方扩展机制：Provider 模型

### 核心思路
从「声明式清单」转变为「编程式 Provider」。第三方不再通过 composer.json 声明 pages/components/directives/plugins 四类清单，而是发布一个 provider.js 入口文件，基座负责加载并执行，第三方在 provider 中自行注册组件、指令、路由。

### 数据流

```
第三方 composer.json
  {
    "extra": {
      "nexus": {
        "provider": "resources/js/nexus-admin/provider.js"
      }
    }
  }
         ↓
NexusAdminManager.php
  仅收集 provider 路径 → { "nexus-blog": "vendor/nexus-blog/provider.js" }
         ↓
Blade 视图注入
  window.__NEXUS_ADMIN_PROVIDERS__ = @json($providers)
         ↓
app.js
  loadProviders() → 遍历执行每个 provider.install(ctx)
```

### 核心模块

#### `utils/create-provider-installer.js`
- **`createProviderInstaller(providerName, installFn)`**：创建 Provider 安装器
  - 代理 `router.addRoute`，自动捕获注册的路由
  - 为路由打上 `meta._provider` 标记，标记来源
  - 注册完成后将路由按 providerName 分组存入 `routeStore.providers`
- **`routeStore`**：响应式路由注册中心
  - `providers: { 'nexus-blog': [routeRecords], 'nexus-admin': [routeRecords] }`
  - `getProviderRoutes(name)`：获取指定提供者的路由
  - `getAllProviderRoutes()`：获取所有 provider 的快照
  - `getMenuTree(options)`：构建菜单树（支持 provider 过滤、自定义 filter、按 sort 排序）

#### `providers/`
基座自身也作为一个 Provider，与第三方保持完全一致的注册方式：
- `providers/nexus-admin.js`：注册基座内置路由（system、demo 等）

### 路由管理
- 开发者通过 `router.addRoute()` 自由注册
- 基座通过代理自动收集至 `routeStore`，按提供者分组隔离
- meta 字段由开发者完全定义，基座按约定读取
  - `title`：菜单显示标题
  - `icon`：图标，支持 string 或 `{desktop, sidebar}` 两种形态
  - `permission`：权限标识
  - `hidden`：是否在菜单中隐藏
  - `sort`：排序权重
  - 子路由未定义 icon 时默认不继承父级（保持明确）

### 基座上下文
Provider 的 install 方法接收上下文对象：
```js
{ app, router, hookManager, pinia, configStore }
```
- app：Vue 应用实例（可调用 app.component、app.directive、app.use）
- router：Vue Router 实例（addRoute 已被代理自动收集）
- hookManager：钩子管理器
- pinia：Pinia 实例

### 组件/页面引用
- 页面组件不再通过注册表管理，而是通过路由的 component 字段引用
- 兼容旧式 `window.__NEXUS_ADMIN_PAGES__`：通过 `buildPageMapFromRoutes()` 从路由表反向构建组件映射
- 布局组件（SidebarLayout、DesktopLayout）通过 `window.__NEXUS_ADMIN_PAGES__[name]` 查找组件