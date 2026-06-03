# 项目进度

## 总体状态
- 测试通过率: 194/194 (100%)
- 测试文件: 16/16 全部通过
- Unhandled errors: 0
- npm 包: `nexus-admin-core` v0.1.2（已发布）
- GitHub Actions 自动发布: 已配置并验证成功

## 已完成
- [x] 架构重构：从「声明式清单」到「编程式 Provider + routeStore」模型
- [x] 国际化改造
- [x] 菜单数据源从后端 API 改为 routeStore
- [x] 样式迁移
- [x] 清理旧文件
- [x] 核心代码拆分为 npm 包 `nexus-admin-core`（npm workspace monorepo）
  - [x] 创建 `packages/core/` 目录及构建配置
  - [x] 核心代码迁入 `packages/core/src/`
  - [x] 创建 public API 入口 `packages/core/src/index.js`
  - [x] `app.js` / `AppRoot.vue` 改为导入 `nexus-admin-core`
  - [x] 根目录 `package.json` 加入 `workspaces: ["packages/*"]`
  - [x] 构建 194 测试用例全部通过
- [x] npm 发布配置
  - [x] 修复 `publishConfig`（`publishConfig` 覆盖 `main`/`module`/`exports`）
  - [x] 创建 `packages/core/README.md`
  - [x] 发布 `nexus-admin-core@0.1.0`→`0.1.1`→`0.1.2`
- [x] 修复所有 `@nexus-admin/core` 引用为 `nexus-admin-core`（9 个文件）
- [x] 修复 `windows.test.js` 测试（localStorage 在 happy-dom 中不可用）
- [x] GitHub 集成
  - [x] 创建远程仓库 `mdt-star/nexus-admin` 并推送
  - [x] 创建 `.github/workflows/publish.yml`（tag 触发自动发布）
  - [x] 验证自动发布成功（v0.1.2）
- [x] 版本管理委托：后续由 Cline 负责版本号递增和 tag 推送

## 待办
- [ ] 配置 GitHub Actions `NPM_TOKEN` Secret（用户需手动操作）
- [ ] 开发新功能或修复 Bug...