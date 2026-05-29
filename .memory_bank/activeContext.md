# 当前活动上下文

## 当前工作
将测试文件的 mock 从 `../services/api` 迁移到各自独立的 service 模块，消除对 `api.js` 的测试依赖。

## 迁移内容

### 已迁移的测试文件
- **disktop.test.js** — `../services/api` → `../services/disktops`
- **menu.test.js** — `../services/api` → `../services/menus`
- **notification.test.js** — `../services/api` → `../services/notifications`
- **permission.test.js** — `../services/api` → `../services/permissions`
- **i18n.test.js** — `../services/api` → `../services/i18n`

### 迁移模式
每个测试文件使用 `vi.mock` 模拟对应的独立 service 模块，格式统一为：
```js
vi.mock('../services/xxx', () => ({
  default: {
    methodName: vi.fn()
  }
}))
```
测试中通过 `const { default: api } = await import('../services/xxx')` 获取 mock 实例。

## 当前状态
- 11 个测试文件，96 个测试用例，全部通过
- 0 unhandled errors
