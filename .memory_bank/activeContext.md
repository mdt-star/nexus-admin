# 当前活动上下文

## 当前工作
修复登录页 Logo 显示问题，统一登录框主色调与系统 CSS 变量一致。

## 改动内容

### size store (`stores/size.js`)
- 移除 localStorage 读写（`getItem('nexus-admin-ui-size')` / `setItem('nexus-admin-ui-size')`）
- 新增 `syncFromConfig(configStore)` 方法，从 ConfigStore 读取 `uiSize` 配置
- `setSize()` 改为通过 `configStore.setUserConfig('uiSize', val)` 持久化，自动同步到后端
- 保留 `elementSize`、`toggleSize`、`applySize`、`init` 等接口不变

### config store (`stores/config.js`)
- `defaults` 中新增 `uiSize: 'medium'` 默认值

### app.js
- 初始化顺序调整：size 初始化移到 config 加载之后
- `uiSizeStore.init()` → `uiSizeStore.syncFromConfig(configStore)`

### 数据流
```
用户切换尺寸 → setSize() → configStore.setUserConfig('uiSize', val)
                                    ↕
                            localStorage + 后端 API
```

## 改动内容

### LoginPage.vue (`components/LoginPage.vue`)
- **Logo 修复**：将通用的 `Monitor` 图标替换为品牌风格 SVG Logo（Nexus 四象限菱形图标），使用 `currentColor` 跟随主题色；增大 SVG 渲染尺寸（32→36px）和色块面积（11→13），提高透明度使图标更清晰
- **颜色统一**：将登录页所有硬编码的主色调（`#14b8a6`、`#5eead4`、`#0d9488`、`rgba(94,234,212,...)`）全部替换为 CSS 变量：
  - `#14b8a6` → `var(--el-color-primary)`
  - `#5eead4` → `var(--el-color-primary-light-3)`
  - `#0d9488` → `var(--el-color-primary-dark-2)`
  - 各种透明度色值 → `color-mix(in srgb, var(--el-color-primary) X%, transparent)`
- **主题自适应**：移除强制暗色背景，改用 `var(--nexus-bg-color)` 跟随系统亮/暗主题；卡片背景、输入框背景、文本颜色全部替换为系统 CSS 变量
- **图标清晰度**：输入框前缀图标（User/Lock）从 18px→20px，颜色从 `rgba(148,163,184,0.6)` 提高到 `var(--nexus-text-color-secondary)`
- **影响范围**：粒子背景、扫描线网格、渐变光晕、登录卡片边框/阴影/背景、Logo、标题、描述、输入框、前缀图标、密码切换图标、提交按钮、底部提示

## 当前状态
- 14 个测试文件，123 个测试用例，全部通过
- 0 unhandled errors
