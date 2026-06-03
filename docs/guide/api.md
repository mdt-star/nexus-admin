# API 通信

基于 Axios 统一封装的 API 通信层。

## 发送请求

```js
import { request } from 'nexus-admin-core'

// GET
const { data } = await request.get('/api/users')

// POST
const { data } = await request.post('/api/users', { name: '张三' })

// PUT
const { data } = await request.put('/api/users/1', { name: '李四' })

// DELETE
await request.delete('/api/users/1')
```

## JWT 鉴权

Token 自动从 `localStorage('nexus-admin-token')` 读取并注入 `Authorization` 头。

登录流程：

```js
import { useUserStore } from 'nexus-admin-core'

const userStore = useUserStore()
await userStore.login({ username: 'admin', password: '123456' })
```

## BaseURL 配置

优先级：

1. `ConfigStore.global.apiBaseURL`（后端 API 返回的全局配置）
2. `import.meta.env.VITE_API_BASE_URL`（环境变量）
3. 空字符串（同源请求）

## 错误拦截

| 状态码 | 行为 |
|--------|------|
| 401 | 清除 Token，跳转登录页 |
| 403 | 提示"没有权限" |
| 404 | 提示"资源不存在" |
| 5xx | 提示"服务器错误" |

静默模式（不提示错误）：

```js
request.get('/api/silent-check', { _silentError: true })