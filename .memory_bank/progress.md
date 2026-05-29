# 项目进度

## 总体状态
- 测试通过率: 121/121 (100%)
- 测试文件: 14/14 全部通过
- 待修复: windows.test.js 中的 2 个 unhandled rejection（预存问题，不影响测试结果）

## 已完成
- [x] 修复 config.test.js - Pinia setup store ref 解包问题
- [x] 修复 i18n.test.js - 跨测试 mock 调用计数污染
- [x] 修复 menu.test.js - 跨测试 mock 调用计数污染 + 字段名不匹配
- [x] 修复 notification.test.js - vi.mock 工厂引用外部变量
- [x] 修复 size.test.js - localStorage mock 返回值跨测试污染
- [x] 修复 hook-events.test.js - 正则不匹配含数字的命名空间
- [x] 修复 registry.test.js - 使用 ESM 不支持的 require
