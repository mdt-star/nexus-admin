# 当前活动上下文

## 当前工作
桌面与侧边栏模式功能修复及优化（本次任务完成）。

## 改动内容

### 一、侧边栏模式修复与优化

#### SidebarLayout.vue
- **【样式】暗黑主题头部修复**：在全局 `<style>` 中添加 `html.dark .nexus-header:not([style*="background"])` 选择器，解决 scoped CSS 中 `[data-theme]` 选择器因 `data-v-xxx` 属性隔离而无法匹配 `<html>` 元素的问题。纯浅色主题不受影响（通过 `:not([style*="background"])` 确保仅未设置自定义 headerColor 时生效）。
- **【交互】Tab 点击逻辑**：`onTabClick` 改为——同 Tab 仅保持激活状态（不触发切换或关闭），不同 Tab 才切换激活。新增 `ensureActiveTab()` + `watch` 监听，无激活 Tab 时自动激活第一个。
- **【功能】个人信息菜单**：`handleUserCommand` 补充 `profile` 命令处理，打开 `system-config` 页面。

#### StartMenu.vue
- `placement` 从硬编码改为动态 prop（默认 `top-start`），桌面模式不受影响。

#### SidebarMenu.vue
- 传入 `placement="right-start"`，侧边栏模式开始菜单从右侧弹出。

### 二、桌面模式功能增强与修复

#### DesktopLayout.vue
- **【布局】图标多列排布**：`COLS` 从常量 `1` 改为 `computed`，根据容器宽度动态计算列数。图标超首列后自动流转到后续列。
- **【功能】框选与批量操作**：新增 `onDesktopMouseDown`/`onSelectMove`/`onSelectEnd` 实现拖拽框选，虚线框（`.nexus-select-rect`：1.5px dashed + 8% 背景色），选中图标高亮（`.nexus-desktop-icon-selected`：主色边框）。右键菜单多选时「编辑」置灰、「删除」变为「批量删除」。**关键安全措施**：`!iconsRef.value` 守卫确保 `getBoundingClientRect` 不会在未挂载时调用；点击图标时 `e.target.closest('.nexus-desktop-icon')` 提前 return，不干扰 `onIconMouseDown` 拖拽逻辑。
- **【视窗】窗口条件渲染已移除**：恢复原始多窗口并行逻辑，所有窗口始终渲染共存（移除 `v-show`），保留 `z-index` 层级区分激活态。用户可同时看到和操作多个窗口。
- **【功能】个人信息入口**：`onOpenProfile` 打开 `system-config` 页面。

#### TaskBar.vue
- 用户下拉菜单新增「个人信息」选项，同步侧边栏菜单结构。

### 核心设计原则
- **环境隔离**：侧边栏/桌面改动互不交叉。
- **v-show 而非 v-if**：窗口条件渲染使用 `v-show` 避免组件销毁。
- **iconsRef 守卫**：所有 `getBoundingClientRect` 调用前检查 `iconsRef.value`。
- **原生框选禁用**：`onDesktopMouseDown` 中调用 `e.preventDefault()` + CSS `user-select: none` 防止浏览器原生选中效果干扰自定义虚线框。
- **竖向排列（纵向自上而下）**：`getItemBasePos` 使用 `rowsPerCol = Math.ceil(total/cols)`，`col = Math.floor(idx/rowsPerCol)`，`row = idx % rowsPerCol` 实现纵向排满后流转至下一列。
- **Bug 修复一（拖拽定位不准）**：从开始菜单拖拽到桌面时，`onDrop` 未传递 `custom: { x, y }` 坐标，导致图标自动使用网格布局定位而非鼠标释放位置
  - 修复：在 `ds.addItem` 参数中补充 `custom: { x: Math.max(0, e.clientX-40), y: Math.max(0, e.clientY-45) }`，与文件夹拖出的坐标偏移一致
- **Bug 修复二（拖拽影响其他图标排序）**：`onDrop` 未传递 `sort` 值，新图标默认 `sort: 0` 插入到排序列表头部，导致所有现有图标位移
  - 修复：计算 `nextSort = ds.rootItems.reduce((max,i)=>Math.max(max,i.sort||0),0)+1` 传入，确保新图标追加到末尾
- **Bug 修复三（拖拽后图标无法点击）**：`onIconDragUp` 在鼠标点击（非拖拽）时仅 return 跳过，依赖浏览器的 `@dblclick` 事件触发。但在某些场景下 `dblclick` 可能不触发，导致点击无响应
  - 修复：在 `onIconDragUp` 点击路径中新增双击检测逻辑——记录上次点击时间与图标 id，300ms 内同一图标两次点击则直接调用 `handleItemClick` 打开页面，不依赖浏览器 `dblclick` 事件

### StartMenu.vue（Bug 修复）
- **Bug 修复四（二级菜单拖拽缺少 component/path）**：`el-menu-item`（二级菜单）是 `el-sub-menu`（顶级菜单）的子元素。`dragstart` 事件冒泡到父级，父级的 `onDragStart` 用自身数据（`component: ''`）覆盖了子项的 `dataTransfer`，导致拖拽出的图标缺少 `component` 和 `path`
  - 修复：在 `el-menu-item` 的 `@dragstart` 上加 `.stop` 修饰符阻止冒泡，确保子项数据不被父级覆盖
  - 影响范围：仅改 StartMenu.vue 一行（添加 `.stop`），侧边栏同样受益
- **Bug 修复五（父级菜单拖拽类型错误）**：`onDragStart` 中 `type` 始终硬编码为 `'menu'`，导致有子节点的父级菜单拖出后也是 `'menu'` 类型，`handleItemClick` 无法识别为文件夹，且因 `component` 为空字符串无法打开
  - 修复：增加 `isFolder = !!(item.children?.length)` 判断，父级菜单 `type: 'folder'`，叶子菜单 `type: 'menu'`

### DesktopLayout.vue（Bug 修复）
- **Bug 修复五联动修复**：`onDrop` 中 `type` 也硬编码为 `'menu'`，覆盖了拖拽数据中的 `type: 'folder'`
  - 修复：`type: item.type || 'menu'`，透传拖拽数据的真实类型
- **Bug 修复六（文件夹拖出为空）**：`onDrop` 只创建了文件夹本身，拖拽数据 `item.children` 中的子集数据被丢弃，导致文件夹内无内容
  - 修复：创建文件夹后，遍历 `item.children` 逐一调用 `ds.addItem` 创建子项，并设置 `parent_id: newItem.id`、`sort: i`（保持菜单顺序）、`_skipDedup: true`

### disktop.js（数据异常修复）
- **API 响应字段合并**：`addItem()` 中创建 `newItem` 时，原先仅用 `...response.data` 解构后端响应。若后端 API 未返回 `component`、`path`、`custom` 等关键字段，则存储的桌面项会丢失这些字段，导致用户双击图标时 `handleItemClick` 因 `item.component` 为 `undefined` 无法打开窗口
  - 修复：合并处理，若后端未返回则从请求数据 `data` 中回填 `component`、`path`、`custom`
  - `component: response.data.component ?? data.component ?? null`
  - `path: response.data.path ?? data.path ?? null`
  - `custom: response.data.custom ?? data.custom ?? {}`
- **影响范围**：仅改 DesktopLayout.vue（onDrop/onIconDragUp）与 disktop.js（addItem 的 API success 分支），侧边栏模式零改动

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

## 代码清理
- **StartMenu.vue**：移除未使用的 `menuRef`、`isDragging`、`Rank`/`FolderOpened` 导入、`expandAllMatching` 空函数
- **DesktopLayout.vue**：移除未使用的 `activeWindow`、`Loading`/`Top`/`Bottom` 导入、`iconVer`、`dragOverId`
- 清理后构建正常，零报错

## 当前状态
- 14 个测试文件，123 个测试用例，全部通过
- 0 unhandled errors
- 构建成功，零报错
- 文档已同步更新
