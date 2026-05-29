# 当前活动上下文

## 当前工作
修复了 7 个测试文件中的失败测试用例，所有 121 个测试全部通过。

## 修复的问题

### 1. config.test.js - Pinia setup store ref 解包
- **问题**: Pinia setup store 自动解包 ref，`store.global` 和 `store.user` 是原始值而非 ref
- **修复**: 移除 `.value` 访问，改用 `Object.assign()` 直接操作 store 属性

### 2. i18n.test.js - 跨测试 mock 调用计数污染
- **问题**: `vi.mock` 创建的 mock 在模块级别共享，调用计数跨测试累积
- **修复**: 在 `beforeEach` 中添加 `vi.clearAllMocks()`

### 3. menu.test.js - 跨测试 mock 调用计数污染 + 字段名不匹配
- **问题**: `getMenus` mock 调用计数跨测试累积；`findMenuByRoute` 使用 `route` 字段而非 `path`
- **修复**: 添加 `vi.clearAllMocks()`；测试数据改用 `route` 字段

### 4. notification.test.js - vi.mock 工厂引用外部变量
- **问题**: `vi.mock` 工厂函数被提升到文件顶部，无法引用 `apiMock` 变量
- **修复**: 使用内联 mock 工厂，在测试内通过 `await import()` 获取 mock 引用

### 5. size.test.js - localStorage mock 返回值跨测试污染
- **问题**: `mockReturnValue('small')` 在测试间持久化，影响后续测试
- **修复**: 在 `beforeEach` 中添加 `vi.clearAllMocks()` 和显式 `mockReturnValue(null)`

### 6. hook-events.test.js - 正则不匹配含数字的命名空间
- **问题**: 正则 `^[a-z]+(-[a-z]+)?:[a-z]+...` 不匹配 `i18n`（含数字）
- **修复**: 正则改为 `^[a-z0-9]+(-[a-z0-9]+)*:[a-z0-9]+(-[a-z0-9]+)*$`

### 7. registry.test.js - 使用 ESM 不支持的 require
- **问题**: `require('../utils/hook-manager')` 在 ESM 环境下不可用
- **修复**: 改用 `import hookManager from '../utils/hook-manager'`

## 待办
- windows.test.js 中的 `router.replace` 未处理错误（`router` 在测试中为 undefined）是预存问题，需单独修复
