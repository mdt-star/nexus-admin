# 项目进度

## 总体状态
- 测试通过率: 194/194 (100%)
- 测试文件: 16/16 全部通过
- npm 包:
  - `nexus-admin-core` v0.2.2（已发布）
  - `create-nexus-admin` v0.2.0（已发布）
- VitePress 文档站点: 已配置 GitHub Actions 自动部署到 GitHub Pages
- GitHub Actions 自动发布: 已配置并验证成功

## 已完成
- [x] 架构重构：从「声明式清单」到「编程式 Provider + routeStore」模型
- [x] 国际化改造
- [x] 菜单数据源从后端 API 改为 routeStore
- [x] 样式迁移
- [x] 清理旧文件
- [x] 核心代码拆分为 npm 包 `nexus-admin-core`（npm workspace monorepo）
- [x] npm 发布配置，发布 v0.1.0→v0.1.2
- [x] GitHub 集成（远程仓库 + Actions + 自动发布）
- [x] VitePress 文档站点搭建
  - [x] 配置 GitHub Actions 部署到 GitHub Pages
  - [x] 文档涵盖：入门指南、布局、路由、国际化、主题、权限、API、Provider、菜单、钩子、Stores、CLI
  - [x] 品牌主题（渐变标题、特征卡片悬停效果等）
- [x] CLI 脚手架工具 `create-nexus-admin` 创建并发布
  - [x] 交互式引导（项目名称、布局、Mock、包管理器）
  - [x] 生成完整项目，所有 peer dependencies 自动配置
- [x] 第三方依赖兼容性优化
  - [x] Vite 8.x 兼容（优化预构建配置）
  - [x] `@element-plus/icons-vue` 打包进 dist 避免 star export
  - [x] CSS 样式覆盖问题修复（`!important` + 导入构建产物）
  - [x] 测试文件排除出 npm 包
- [x] CI 构建修复与双包自动发布体系建立
  - [x] 修复 publish-core.yml：npx 隔离环境、mockjs 依赖、自引用导入等问题
  - [x] 拆分工作流：publish-core.yml + publish-create.yml，共用 v* 标签 + paths 过滤
  - [x] 编写发布 SOP 写入 activeContext.md
- [x] 已发布版本
  - `nexus-admin-core`: v0.2.5
  - `create-nexus-admin`: v0.2.0

## 待办
