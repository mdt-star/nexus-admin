# 当前活动上下文

## 当前工作
已完成 CLI 脚手架工具、文档站点构建和第三方依赖管理优化。已完善自动发布工作流体系。

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
- [x] 修复 publish-core.yml 构建问题
  - [x] 不再使用 `npx --package` 隔离环境
  - [x] `packages/core/package.json` 添加 `mockjs` 到 devDependencies
  - [x] 修复 `AppRoot.vue`、`HomePage.vue` 中 `nexus-admin-core` 自引用改为相对路径
- [x] 建立双包自动发布工作流体系

### 已发布包版本

| 包名 | 最新版本 | 说明 |
|------|---------|------|
| `nexus-admin-core` | 0.2.5 | 核心包，`files: ["dist"]`，含构建 CSS |
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
│   ├── publish-core.yml          ← nexus-admin-core 自动发布
│   ├── publish-create.yml        ← create-nexus-admin 自动发布
│   └── deploy-docs.yml           ← GitHub Pages 自动部署
└── package.json                  (workspaces: ["packages/*"])
```

---

## 📜 发布标准操作规程（SOP）

### 工作流规则

两个包共用 `v*` 标签触发，通过 `paths` 过滤自动区分：

| 工作流文件 | 发布包 | 触发条件 |
|-----------|-------|---------|
| `.github/workflows/publish-core.yml` | `nexus-admin-core` | tag `v*` + `packages/core/**` 有变化 |
| `.github/workflows/publish-create.yml` | `create-nexus-admin` | tag `v*` + `packages/create-nexus-admin/**` 有变化 |

### 发布流程

**两个包流程完全统一**，只需改包名和版本号：

```bash
# 1. bump 版本（patch/minor/major 按需）
npm version patch -w <包名> --no-git-tag-version

# 2. 提交 + 打标签 + 推送
git add <包的 package.json>
git commit -m "chore: bump <包名> to v<新版本>"
git tag v<新版本>
git push && git push origin v<新版本>
```

### 发布示例

**发布 nexus-admin-core：**
```bash
npm version patch -w nexus-admin-core --no-git-tag-version
git add packages/core/package.json
git commit -m "chore: bump nexus-admin-core to v0.2.6"
git tag v0.2.6
git push && git push origin v0.2.6
```

**发布 create-nexus-admin：**
```bash
npm version patch -w create-nexus-admin --no-git-tag-version
git add packages/create-nexus-admin/package.json
git commit -m "chore: bump create-nexus-admin to v0.3.0"
git tag v0.3.0
git push && git push origin v0.3.0
```

### ⚠️ 注意事项

1. **标签是全局命名空间**：务必 `git diff --stat` 确认只改了目标包的 `package.json`，避免标签版本号与包版本号不一致
2. **不要一次发两个包**：不同包分开发布，各自打对应版本的标签
3. **version 字段必须递增**：`npm version patch` 会自动处理