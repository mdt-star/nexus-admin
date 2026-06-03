# 当前活动上下文

## 当前工作
核心包 `nexus-admin-core` 已拆分为独立 npm 包，完成 npm 发布和 GitHub Actions 自动化流程配置。

### 已完成
- [x] 核心代码拆分为 `packages/core/`（npm workspace monorepo）
- [x] 包名定为 `nexus-admin-core`（`@nexus-admin` org 被占用）
- [x] 修复 `publishConfig` 废弃警告（移除 `main`/`module`/`exports` 覆盖）
- [x] 创建 `packages/core/README.md`（含 API 文档、Provider 机制说明）
- [x] 发布 `nexus-admin-core@0.1.0` 到 npm
- [x] 所有 `@nexus-admin/core` import 替换为 `nexus-admin-core`（9 个文件）
- [x] 创建 `.github/workflows/publish.yml`（tag 触发自动发布）
- [x] 创建 GitHub 远程仓库 `mdt-star/nexus-admin` 并推送
- [x] 修复 `windows.test.js` 测试（localStorage 在 happy-dom 中不可用）
- [x] 194 测试用例全部通过，16 测试文件通过
- [x] 版本 0.1.1（含 README）、0.1.2（测试修复）已通过 GitHub Actions 自动发布

### 包名说明
- **npm**: `nexus-admin-core`
- **workspace**: `packages/core`
- 原因：`@nexus-admin` organization 在 npm 上被占用

### 发布流程
```
改版本号 → git commit → git tag v{x.y.z} → git push --tags
→ GitHub Actions 自动构建并发布到 npm
```

### 目录结构
```
nexus-admin/
├── packages/
│   └── core/                     ← nexus-admin-core（npm 包）
│       ├── package.json
│       ├── README.md
│       ├── vite.config.js
│       └── src/
│           ├── index.js          (public API 入口)
│           ├── utils/            (create-provider-installer, hook-manager, hook-events)
│           ├── providers/        (nexus-admin.js)
│           ├── stores/           (12 个 Pinia stores)
│           ├── services/         (9 个 API 服务)
│           ├── components/       (公共组件)
│           ├── layouts/          (布局组件)
│           ├── lang/             (语言包)
│           ├── styles/           (SCSS 变量/全局样式)
│           ├── directives/       (权限指令)
│           └── composables/      (useWindowDrag)
├── .github/workflows/
│   └── publish.yml               (GitHub Actions 自动发布)
├── resources/js/nexus-admin/     ← 应用层（入口 + 业务页面 + mock）
│   ├── app.js
│   ├── pages/                    (demo + system)
│   ├── mock/
│   └── router/index.js
└── package.json                  (workspaces: ["packages/*"])
```

### 测试
- 16 测试文件，194 测试用例，全部通过
- 核心变化：`windows.test.js` 新增 localStorage polyfill（happy-dom 兼容）