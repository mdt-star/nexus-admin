# CLI 脚手架

使用 `create-nexus-admin` 命令行工具快速创建项目。

## 安装与使用

无需全局安装，直接运行：

```bash
npx create-nexus-admin my-project
```

或指定包管理器：

```bash
# npm
npm create @nexus-admin/app my-project

# pnpm
pnpm create @nexus-admin/app my-project
```

## 交互式引导

运行后按提示选择：

```
? 项目名称：my-project
? 选择布局模式：双模式（推荐）
? 是否需要 Mock 数据：是
? 选择包管理器：npm
```

## 生成的项目结构

```
my-project/
├── package.json              # 含 nexus-admin-core + 所有 peer dependencies
├── vite.config.js            # Vite + Vue 插件预配置
├── index.html                # HTML 入口
├── .env                      # API 地址配置
├── src/
│   ├── main.js               # 启动入口（已配置 Provider 加载）
│   ├── App.vue               # 根组件
│   ├── router/index.js       # 路由定义（含默认 dashboard 页面）
│   ├── providers/app.js      # 应用级 Provider
│   ├── pages/
│   │   └── Dashboard.vue     # 示例控制台页面
│   └── mock/                 # Mock 数据（可选）
└── public/
```

## 快速启动

```bash
cd my-project
npm install
npm run dev
```

访问 `http://localhost:5173` 即可看到运行效果。

## 生成内容说明

所有必需依赖已写入 `package.json`，`npm install` 一步到位：

```json
{
  "dependencies": {
    "nexus-admin-core": "^0.1.0",
    "vue": "^3.4.0",
    "pinia": "^2.3.0",
    "element-plus": "^2.9.0",
    "vue-router": "^4.6.4",
    "@element-plus/icons-vue": "^2.3.0",
    "axios": "^1.16.1"
  }
}
```

无需手动安装 peer dependencies，开箱即用。