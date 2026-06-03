# create-nexus-admin

Nexus Admin 项目脚手架工具。

## 使用

```bash
# npm
npm create @nexus-admin/app my-project

# pnpm
pnpm create @nexus-admin/app my-project

# 或使用 npx
npx create-nexus-admin my-project
```

## 交互式提示

运行后会依次询问：

- 项目名称
- 布局模式（侧边栏 / 桌面 / 双模式）
- 是否需要 Mock 数据
- 包管理器（npm / pnpm / yarn）

## 生成的项目

```
my-project/
├── package.json              # 含所有依赖
├── vite.config.js
├── index.html
├── .env
├── src/
│   ├── main.js               # 入口
│   ├── App.vue
│   ├── router/index.js       # 路由
│   ├── providers/app.js      # Provider
│   ├── pages/Dashboard.vue   # 示例页面
│   └── mock/                 # Mock（可选）
└── public/