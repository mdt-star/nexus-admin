# 系统模式与设计模式

## 核心设计模式

### 1. 插件系统模式 (Plugin System Pattern)
- **用途**: 允许其他扩展包注册页面、组件、功能模块
- **实现方式**: 前端维护一个插件注册中心，后端通过 ServiceProvider 注册
- **插件类型**:
  - 有界面插件 (UI Plugin): 在特定区域渲染组件
  - 无界面插件 (Headless Plugin): 监听钩子事件，无 UI 渲染
  - 全局插件 (Global Plugin): 全局生效
  - 局部插件 (Local Plugin): 在特定页面/区域生效

### 2. 钩子系统模式 (Hook System Pattern)
- **用途**: 无界面插件通过钩子响应事件
- **生命周期钩子**: `onAppInit`, `onRouteChange`, `onMenuLoad`, `onWindowOpen`, `onWindowClose`, `onConfigChange`, `onThemeChange`, `onLanguageChange`
- **行为钩子**: `beforeRender`, `afterRender`, `beforeRequest`, `afterRequest`

### 3. 布局策略模式 (Layout Strategy Pattern)
- **用途**: 支持桌面式和侧边栏式两种布局
- **实现方式**: 通过配置切换布局策略，核心层提供统一接口
- **桌面模式**: 类似 Windows 桌面，图标+窗口
- **侧边栏模式**: 类似传统后台，左侧菜单+多 Tab

### 4. 统一菜单模式 (Unified Menu Pattern)
- **用途**: 桌面和侧边栏共享同一套菜单数据接口
- **菜单结构**: 桌面项 (Desktop Item) 是统一概念，桌面模式下渲染为图标，侧边栏模式下渲染为菜单项
- **异步加载**: 菜单数据通过后端 API 异步加载

### 5. 多窗口/Tab 管理模式 (Multi-Window/Tab Pattern)
- **用途**: 桌面模式使用窗口，侧边栏模式使用 Tab
- **统一抽象**: Window/Tab Manager 提供统一的状态管理
- **状态持久化**: 窗口/Tab 状态可持久化到用户配置

### 6. 主题系统模式 (Theme System Pattern)
- **用途**: 支持更换主题及色调
- **实现方式**: CSS Variables + Element Plus 主题变量覆盖
- **主题结构**: 基础主题 (亮/暗) + 色调 (主色/辅助色)
- **持久化**: 主题配置存储在用户配置中

### 7. 多语言模式 (I18n Pattern)
- **用途**: 支持多语言，语言包由后端提供
- **实现方式**: 前端 i18n 引擎 + 后端语言包 API
- **动态加载**: 切换语言时从后端获取对应语言包

### 8. 权限控制模式 (Permission Control Pattern)
- **用途**: 基于标签 (Tag) 的细粒度组件可见权限
- **实现方式**: 统一指令/组件封装，后端提供用户标签列表
- **覆盖范围**: 菜单项、桌面项、按钮、组件、插件等所有可见元素

### 9. 配置分层模式 (Config Layering Pattern)
- **用途**: 支持全局配置和用户选项配置
- **层级**: 系统默认配置 < 全局配置 < 用户配置 < 会话配置
- **合并策略**: 下层覆盖上层，未设置项继承上层

## 组件设计模式

### 权限指令 (v-permission)
```vue
<!-- 基于标签的权限控制 -->
<el-button v-permission="'user:create'">创建用户</el-button>
```

### 权限组件包装
```vue
<PermissionTag tags="['user:create', 'admin']">
  <el-button>创建用户</el-button>
</PermissionTag>
```

### 插件注册
```typescript
// 有界面插件
registerPlugin({
  id: 'my-plugin',
  type: 'ui',
  component: MyComponent,
  position: 'sidebar-bottom',
  hooks: {
    onMenuLoad: (menu) => { /* ... */ }
  }
})

// 无界面插件
registerPlugin({
  id: 'analytics',
  type: 'headless',
  hooks: {
    onRouteChange: (to, from) => { /* 路由统计 */ },
    afterRequest: (response) => { /* 请求日志 */ }
  }
})
```
