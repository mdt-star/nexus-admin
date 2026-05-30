# 当前活动上下文

## 当前工作
桌面背景视觉优化：增加多层背景效果（径向光泽 + 浅淡点阵纹理），提升桌面质感。

## 改动内容

### GlobalSearch.vue (`components/common/GlobalSearch.vue`)
- **Bug 修复一（输入消失）**：`filteredResults` 中 `item.id.toLowerCase()` 在数字 id 上抛 TypeError 导致 Vue 渲染崩溃、弹窗关闭
  - 修复：4 处 `xxx.toLowerCase()` → `String(xxx ?? '').toLowerCase()`
- **Bug 修复二（点不开）**：原始代码 `visible` computed 的 getter 返回 `props.visible`（恒 `false`），侧边栏模式未传 prop 时弹窗无法打开
  - 修复：getter 改为 `() => localVisible.value`，新增 `watch(() => props.visible, ...)` 同步父组件 prop → 本地状态
- **影响范围**：仅改 GlobalSearch.vue，DesktopLayout.vue 零改动

### HomePage.vue (`pages/system/HomePage.vue`)
- **问题**：欢迎页在侧边栏和桌面模式下展示相同，缺少布局差异
- **需求**：侧边栏模式系统信息在右侧；桌面模式保持单列
- **方案**：
  - 导入 `useAppStore`，通过 `appStore.layout` 判断布局模式
  - 新增 `isSidebar` 计算属性，根元素动态添加 `.nexus-home-sidebar` 类
  - 模板重构为双容器结构：`.nexus-home-main`（快捷菜单+服务器信息+PHP环境）和 `.nexus-home-side`（系统信息卡片）
  - CSS：侧边栏模式使用 `display: grid; grid-template-columns: 1fr 360px`；桌面模式 `.nexus-home-side { display: none }` 隐藏侧栏
  - 侧边栏模式下系统信息卡片 `position: sticky` 随滚动固定

### 桌面端交互优化
- **FolderView.vue**：文件夹视图禁止文本选中（`user-select: none`）；图标必须双击打开；拖拽标记 `isDraggingFromFolder` 防止拖拽过程中意外关闭或打开；新增 `onPopupMouseDown`/`onGridMouseDown` 阻止网格区域文本选中
- **DesktopLayout.vue**：文件夹拖拽坐标检测改用 `getBoundingClientRect` 避免临时拖拽元素导致 `e.target.closest` 不匹配；临时拖拽元素添加半透明效果（`opacity:0.85` + `scale(0.95)`）显示正常拖拽状态
- **windows.js**：`activate()` 增加同 id 重新激活逻辑（先置空再 `nextTick` 恢复），用于窗口最小化后通过 taskbar 恢复显示
- **SidebarLayout.vue**：Tab 悬浮关闭按钮功能已验证正常运作

### theme.js（Bug 修复）
- **`applyTheme()` 和 `applyPrimaryColor()` 补上 `--nexus-primary-color-dark`**：此前该变量从未被动态更新，用户切换主色调后始终残留为硬编码绿色（`#0d9488`），导致使用该变量的背景/图标色无法跟随主题。现用 `darken(c, 0.2)` 动态计算，与 `--el-color-primary-dark-2` 保持一致。

### DesktopLayout.vue
- **图标颜色重构**：白色 `#fff` + `drop-shadow(0 1px 3px rgba(0,0,0,0.25))` — 最高对比度，确保在任意主色渐变背景上都清晰可读
- **图标容器质感升级**：背景从纯色改为 `color-mix()` 掺入极淡主色（10%）的对角渐变，容器高光处带有一丝主色调，既保留动态主题联动，又不影响白色图标清晰度；暗色模式同步适配
  - 修正：渐变终点不透明度从 `0.12` 提升至 `0.20`（亮色）/ `0.18`（暗色），修复右下角边缘过于透明「粘」背景的问题，保持完整轮廓
- **图标视觉对比度优化**：提升图标在渐变+网点背景上的突出度
  - `.nexus-desktop-icon-img`：背景不透明度 15%→22%，增加 1px 半透白边框定义边缘，投影深度翻倍（`0 4px 12px`），毛玻璃强度增强（blur 4→6px）
  - `.nexus-desktop-icon-label`：文字色改为纯白 `#fff`，文字阴影升级为双重阴影（深投影 6px + 柔光晕 4px），确保网点纹理上清晰可读
  - `html.dark`：移除黑色背景覆盖（`rgba(0,0,0,0.25)`——在青绿渐变上反效果），替换为稍低的白底 `rgba(255,255,255,0.18)`；移除标签文字颜色覆盖（与亮色统一）
- **桌面背景视觉优化（重构）**：改用 CSS `::before`/`::after` 伪元素叠加层
  - 基础层：`bgStyle` 保留原有单层 `linear-gradient(135deg, ...)` 渐变（简化后更可靠）
  - 光泽层：`::before` 顶部径向渐变 `radial-gradient(ellipse 80% 40% at 50% 0%, ...)`，提高透明度至 18%
  - 纹理层：`::after` 浅淡点阵网格 `radial-gradient(circle, ...)`，32px 间距，提高透明度至 20%
  - 图片模式：通过 `bgIsColor` 计算属性条件绑定 `.nexus-bg-enhanced` 类，图片背景时禁用伪元素
  - `pointer-events: none` 确保叠加层不干扰任何交互
- **影响范围**：仅改 DesktopLayout.vue，零改动其他组件

### variables.scss
- 更新 `--nexus-desktop-grid-color`：点阵网格色，亮色 rgba(255,255,255,0.20)，暗色 rgba(255,255,255,0.18)
- 更新 `--nexus-desktop-glow`：顶部光泽色，亮色 rgba(255,255,255,0.18)，暗色 rgba(255,255,255,0.16)

### 文档更新
- docs/README.md：更新桌面背景视觉变量值为新透明度

## 当前状态
- 14 个测试文件，123 个测试用例，全部通过
- 0 unhandled errors
- 构建成功，零报错
