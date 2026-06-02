# 当前活动上下文

## 当前工作
将核心代码拆分为独立 npm 包 `@nexus-admin/core`（npm workspace monorepo 模式）。

### 已完成
- 创建 `packages/core/` 目录及 `package.json` / `vite.config.js`（library mode）
- 核心代码迁入 `packages/core/src/`（utils / providers / stores / components / layouts / lang / styles / services / directives / composables）
- 创建 public API 入口 `packages/core/src/index.js`
- `app.js` / `AppRoot.vue` 改为导入 `@nexus-admin/core`
- 根目录 `package.json` 加入 `workspaces: ["packages/*"]`
- Vite 构建通过（3.60s）
- 全部 188 测试用例通过，15 测试文件通过

### 目录结构变化
```
nexus-admin/
├── packages/
│   └── core/                     ← @nexus-admin/core（npm 包）
│       ├── package.json
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
├── resources/js/nexus-admin/     ← 应用层（入口 + 业务页面 + mock）
│   ├── app.js
│   ├── AppRoot.vue
│   ├── pages/                    (demo + system)
│   ├── mock/
│   └── router/index.js
└── package.json                  (workspaces: ["packages/*"])
```

### 应用层 vs 核心包分离
| 类别 | 在核心包（core） | 在应用层（app） |
|------|-----------------|----------------|
| Provider 安装器 | ✅ `loadAndInstallProviders` | - |
| Stores | ✅ 12 个 | - |
| Components | ✅ 14 个 | - |
| Layouts | ✅ 3 个 | - |
| 路由定义 | - | ✅ `internalRoutes`（含 demo/system 页面） |
| 业务页面 | - | ✅ `pages/demo`, `pages/system` |
| Mock | - | ✅ `mock/` |
| 样式 | ✅ `styles/` (variables + global) | - |

### 测试
- 15 测试文件，188 测试用例，全部通过
- 构建成功
