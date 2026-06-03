# 项目结构

```
nexus-admin/
├── packages/
│   └── core/                     ← nexus-admin-core（npm 包）
│       ├── package.json          # peerDeps + build 配置
│       ├── vite.config.js        # library mode 构建
│       ├── README.md             # npm 包文档
│       └── src/
│           ├── index.js          # 公共 API 入口（导出所有）
│           ├── AppRoot.vue       # 根组件
│           ├── utils/            # 核心工具
│           │   ├── create-app.js               # 创建 Vue 应用
│           │   ├── create-router.js             # 创建路由实例
│           │   ├── create-provider-installer.js # Provider 加载器 + routeStore
│           │   ├── hook-manager.js              # 钩子管理器
│           │   ├── hook-events.js               # 内置钩子事件
│           │   ├── i18n-collector.js            # 国际化收集
│           │   ├── mock-manager.js              # Mock 管理器
│           │   └── patch-resize-observer.js     # ResizeObserver 补丁
│           ├── providers/
│           │   └── nexus-admin.js  # 基座内置 Provider
│           ├── stores/            # 12 个 Pinia Stores
│           ├── services/          # API 服务层
│           ├── components/        # 14+ 个公共组件
│           ├── layouts/           # 3 种布局组件
│           ├── lang/              # 中英文语言包
│           ├── styles/            # SCSS 变量 + 全局样式
│           ├── directives/        # 自定义指令
│           ├── composables/       # 组合式函数
│           ├── mock/              # 内置 Mock 数据
│           └── pages/             # 内置页面（HomePage）
├── resources/js/nexus-admin/      ← 应用层
│   ├── app.js                     # 应用入口
│   ├── router/index.js            # 路由定义
│   ├── providers/app.js           # 应用级 Provider
│   ├── pages/                     # 业务页面
│   │   ├── demo/                  # 示例模块
│   │   └── system/                # 系统管理
│   └── mock/                      # 应用层 Mock
├── src/                           ← Laravel 后端
│   ├── NexusAdminManager.php      # Provider 收集器
│   └── NexusAdminServiceProvider.php
├── docs/                          ← 文档站点
│   └── .vitepress/
├── .github/workflows/
│   ├── publish.yml                # npm 自动发布
│   └── docs.yml                   # 文档自动部署
└── package.json                   # workspaces: ["packages/*"]
```

## 设计原则

- **核心包与应用层分离**：`nexus-admin-core` 提供框架能力，可独立发布 npm
- **Monorepo 管理**：一个仓库管理核心包 + 应用层 + 后端，开发调试零成本
- **Provider 驱动**：功能模块通过 Provider 插件方式注册，架构清晰