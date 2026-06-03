# 当前活动上下文

## 当前工作
已完成 CLI 脚手架工具、文档站点构建和第三方依赖管理优化。

### 已完成
- [x] 创建 `create-nexus-admin` CLI 脚手架工具（`packages/create-nexus-admin/`）
  - [x] 交互式引导（项目名称、布局模式、Mock 数据、包管理器）
  - [x] 生成完整 Vite + Vue + nexus-admin-core 项目
  - [x] 所有 peer dependencies 自动写入 package.json
  - [x] 已发布到 npm: `create-nexus-admin@0.2.0`
- [x] 创建 VitePress 文档站点（docs/）
  - [x] 配置 GitHub Actions 自动部署到 GitHub Pages
  - [x] 文档内容涵盖：快速开始、安装、布局、路由、国际化、主题、权限、API、Provider、菜单、钩子、Stores、CLI 脚手架
  - [x] base 配置 `/nexus-admin/` 适配子路径部署
- [x] 核心包发布策略优化
  - [x] `files: ["dist"]`，只发布构建产物，不包含源码和测试文件
  - [x] `main` 指向 `dist/index.mjs`
  - [x] `@element-plus/icons-vue` 不 externalize，打包进 dist 避免 star export 问题
  - [x] `exports` 添加 `"./dist/*"` 允许导入 CSS
  - [x] SCSS 全局样式在 `src/index.js` 中 import，构建时打包进 CSS
  - [x] `--el-color-*` 变量添加 `!important` 防止被 Element Plus 默认 CSS 覆盖
- [x] 已发布版本
  - `nexus-admin-core`: v0.2.2
  - `create-nexus-admin`: v0.2.0

### 已发布包版本

| 包名 | 最新版本 | 说明 |
|------|---------|------|
| `nexus-admin-core` | 0.2.2 | 核心包，`files: ["dist"]`，含构建 CSS |
| `create-nexus-admin` | 0.2.0 | CLI 脚手架，生成完整项目 |

### 已知问题
- 无

### 目录结构
```
nexus-admin/
├── packages/
│   ├── core/                     ← nexus-admin-core（npm 包）
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── vite.config.js
│   │   └── src/
│   │       ├── index.js          (public API 入口)
│   │       ├── styles/           (SCSS 变量/全局样式)
│   │       ├── utils/            (create-provider-installer, hook-manager, etc.)
│   │       ├── providers/        (nexus-admin.js)
│   │       ├── stores/           (12 个 Pinia stores)
│   │       ├── services/         (9 个 API 服务)
│   │       ├── components/       (公共组件)
│   │       ├── layouts/          (布局组件)
│   │       ├── lang/             (语言包)
│   │       ├── directives/       (权限指令)
│   │       └── composables/      (useWindowDrag)
│   └── create-nexus-admin/       ← CLI 脚手架工具
│       ├── package.json
│       └── index.js              (交互式 CLI)
├── docs/                         ← VitePress 文档站点
│   ├── .vitepress/
│   ├── guide/                    (快速开始、安装、布局、路由、国际化等)
│   ├── concepts/                 (Provider、菜单、钩子)
│   └── stores/                   (状态管理文档)
├── resources/js/nexus-admin/     ← 应用层（入口 + 业务页面 + mock）
│   ├── app.js
│   ├── pages/                    (demo + system)
│   ├── mock/
│   └── router/index.js
├── .github/workflows/
│   ├── publish.yml               (npm 自动发布)
│   └── deploy-docs.yml           (GitHub Pages 自动部署)
└── package.json                  (workspaces: ["packages/*"])