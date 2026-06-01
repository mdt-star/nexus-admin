# 技术上下文

## 技术栈
- **前端框架**: Vue 3 (Composition API + `<script setup>`)
- **构建工具**: Vite
- **UI 组件库**: Element Plus
- **后端框架**: Laravel (PHP 扩展包)
- **语言**: JavaScript / TypeScript / PHP
- **样式方案**: SCSS / CSS Variables (主题切换)

## 开发环境
- 包管理器: npm / pnpm / yarn
- 构建命令: `npm run dev` / `npm run build`
- PHP 依赖管理: Composer

## 项目定位
这是一个 Laravel 扩展包，提供现代化的后台管理界面基座。作为基座，它不包含具体业务功能，而是提供一套可扩展的框架，让其他业务扩展包可以注册页面、组件、插件等。

## 关键依赖
- Vue 3 + Vite: 前端核心
- Element Plus: UI 组件库
- Axios: HTTP 请求（已统一封装 BaseURL + JWT + 错误拦截）
- Vue Router: 前端路由
- Pinia: 状态管理
- Laravel: 后端框架（`config/nexus-admin.php` 中配置 `api_base_url`）

## API 层设计

### 统一请求实例 (`services/api.js`)
- **BaseURL 配置**：三级降级（`window.__NEXUS_ADMIN_CONFIG__.apiBaseURL` → `VITE_API_BASE_URL` → `''`）
- **请求拦截器**：自动从 `localStorage('nexus-admin-token')` 读取 JWT Token，注入 `Authorization: Bearer` 头
- **响应拦截器**（成功）：调用 `adaptResponse()` 将后端格式转为前端统一格式
- **响应拦截器**（失败）：按 HTTP 状态码分类处理，显示友好错误提示

### 错误处理策略
- **401**：保存路径 → 清除 Token → 触发 `auth:unauthorized` 事件 → 跳转 `/login`
- **403**：全局提示「没有权限执行此操作」
- **404**：全局提示「请求的资源不存在」
- **422**：静默（由调用方自行处理）
- **429**：全局提示「请求过于频繁，请稍后重试」
- **5xx**：全局提示「服务器内部错误，请稍后重试」
- **防重复**：同一状态码 2 秒内不重复弹出
- **静默模式**：请求 config 中传 `_silentError: true` 跳过错误提示

### 认证流程
- `LoginPage.vue` → `userStore.login()` → `authApi.login()` → 后端返回 token → 存入 localStorage
- 后续请求自动携带 token，401 时自动清除并跳转登录页
- 会话恢复 (`userStore.restoreSession()`) 使用静默模式，不弹错误
