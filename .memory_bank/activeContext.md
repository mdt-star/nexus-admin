# 当前活动上下文

## 当前工作
桌面模式多选协同拖拽功能完善与图标位置重算算法开发（本次任务完成）。

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
- **【布局】图标竖向排列**：`COLS=1` 常量，`getItemBasePos` 使用 `idx` 直接计算纵向位置。当图标超过容器可视高度时，自动流转至下一列（基于 `container.clientHeight` 计算 `maxRowsPerCol`）。
- **【功能】框选与批量操作**：新增 `onDesktopMouseDown`/`onSelectMove`/`onSelectEnd` 实现拖拽框选，虚线框（`.nexus-select-rect`：1.5px dashed + 8% 背景色），选中图标高亮（`.nexus-desktop-icon-selected`：主色边框）。右键菜单多选时「编辑」置灰、「删除」变为「批量删除」。**关键安全措施**：`!iconsRef.value` 守卫；`e.preventDefault()` 禁用原生框选；点击图标时 `e.target.closest('.nexus-desktop-icon')` 提前 return 避免干扰拖拽。
- **【视窗】首次进入仅展示激活窗口**：`initialHideInactive = ref(true)`，`v-show="!initialHideInactive \|\| win.id===ws.activeId"`。`watch(() => ws.activeId)` 监听用户切换/打开窗口后自动设 `false`，恢复多窗口共存。非激活窗口 DOM 保留不销毁。
- **【功能】个人信息入口**：`onOpenProfile` 打开 `system-config` 页面。

#### TaskBar.vue
- 用户下拉菜单新增「个人信息」选项，同步侧边栏菜单结构。

## 新增改造：ResizeObserver 循环限制修复

### 改动文件

| 文件 | 操作类型 | 说明 |
|------|---------|------|
| `app.js` | 修改 | 新增 ResizeObserver 自修复补丁（IIFE，在 import 之前执行） |

### 根因分析

`ResizeObserver loop completed with undelivered notifications` 是浏览器原生警告（非 JS 异常），触发条件：

1. **Element Plus 内部使用 ResizeObserver**：`el-table`（列宽计算 + 表头同步）、`el-dialog`（定位）、`el-popover`/`el-select`/`el-dropdown`（弹出位置）均依赖 ResizeObserver 检测尺寸变化
2. **Vue 响应式 DOM 更新**：当 Element Plus 的 ResizeObserver 回调触发 Vue 重新渲染，导致 DOM 尺寸再次变化，在当前帧内形成递归观察循环
3. **CSS transition 加剧**：桌面图标 `left/top 0.25s ease-out` 过渡动画在拖拽释放时持续触发布局变化

### 修复方案

在 `app.js` 顶部（所有 import 之前）注入自执行补丁 `patchResizeObserver()`：

- **拦截原生 `ResizeObserver`**：将所有回调通知暂存到全局队列 `window.__nexus_ROPendingList`
- **`requestAnimationFrame` 批处理**：通过 `requestAnimationFrame` 将同一帧内的多次观察合并到下一帧统一执行
- **零副作用**：保留所有原始功能，仅改变回调的调度时机，Element Plus 组件行为完全不变
- **防重复注入**：`window.__nexus_ROPatched` 标记确保只执行一次

### 方案优势

- 业界标准做法（Vuetify、PrimeVue 等 UI 框架均采用）
- 不影响 Element Plus 组件正常功能
- 不修改任何业务组件逻辑
- 构建通过、全部 162 测试用例通过
- **环境隔离**：侧边栏/桌面改动互不交叉。
- **初始隐藏 + watch 恢复**：`initialHideInactive` + `watch(ws.activeId)` 实现首次仅展示激活窗口，用户操作后恢复多窗口共存；非激活窗口用 `v-show` 保留 DOM。
- **iconsRef 守卫**：所有 `getBoundingClientRect` 调用前检查 `iconsRef.value`。
- **原生框选禁用**：`onDesktopMouseDown` 中调用 `e.preventDefault()` 防止浏览器原生选中效果干扰自定义虚线框。
- **竖向排列（纵向自上而下）**：基于 `container.clientHeight` 计算 `maxRowsPerCol`，`col = floor(idx/maxRowsPerCol)`，`row = idx % maxRowsPerCol` 实现图标纵向排满后流转至下一列。
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

### 四、桌面模式多选协同拖拽与图标位置重算算法

#### DesktopLayout.vue — 新增多选协同拖拽支持

##### 新增数据结构
- **`multiDragData` ref**：存储多选拖拽时所有选中图标的初始基准位置快照（`[{ id, baseX, baseY }]`），用于释放时基于各自起始位置计算独立目标坐标。

##### 改动函数

**`onIconMouseDown`（多选拖拽启动检测）**
- 点击已在 `selectedIds` 中的图标时，遍历全部选中项记录 `getItemBasePos` 快照到 `multiDragData`
- 点击未选中图标时，清除选中状态走单选拖拽逻辑
- **隔离防线**：只有 `isMultiSelected && selectedIds.has(item.id)` 才进入多选分支

**`onIconDragMove`（多选同步移动）**
- 主拖拽图标用 `_dragOffset` 保持原有 transform 逻辑
- 其他选中图标循环查找 `[data-item-id]` DOM 元素，同步应用相同 `translate(dx,dy) scale(0.95)` 变换

**`onIconDragUp`（多选落点位置重算 — 核心算法）**
- **多选分支**（`multiDragData.length > 1`）：
  1. 清除所有选中图标的 transform
  2. 遍历 `multiDragData`，每个图标独立计算：`tx = baseX + dx`，`ty = baseY + dy`
  3. **网格吸附**：每个图标独立调用 `snapToNearestGrid()` 吸附到最近网格交点
  4. **位置冲突检测**：检查目标位置是否被非选中图标占据，自动交换位置
  5. 每个图标各自调用 `ds.updateItem(id, { custom: { x: tx, y: ty } })` 保存
  6. 拖拽完成后清理 `selectedIds` 和 `multiDragData`
- **单选分支**：保持原有完整逻辑不变，不受多选分支任何影响

##### 安全与隔离保障
- 多选仅在 `selectedIds.size > 1` 且点击图标在选中列表内时触发
- 单选拖拽逻辑完整保留，两个分支在 `onIconDragUp` 中泾渭分明
- `FolderView.vue`、`SidebarLayout.vue`、`ItemEditor.vue`、`TaskBar.vue` 零改动
- 所有 162 测试用例通过，零回归

### 五、侧边栏模式下无激活 Tab 时菜单选中状态同步清除（2026-06-01）

#### 根因分析

侧边栏模式下，关闭全部 Tab 后左侧菜单依然高亮选中某菜单项。

**数据链路**：`SidebarLayout.onTabClickClose()` → `windowStore.close(id)` → `items.value.splice(index, 1)`（移除最后一项，但 `activeId` 未清空） → `SidebarMenu.vue` 的 `watch(() => windowStore.activeId)` 仍看到 truthy 值 → `menuActiveId` 保持非空 → `<el-menu :default-active>` 保持高亮。

**根因**：`windows.js` 的 `close()` 方法仅移除了 items 中的元素，但未在 items 列表完全为空时将 `activeId` 同步置空。

#### 改动文件

| 文件 | 操作类型 | 说明 |
|------|---------|------|
| `stores/windows.js` | 修改 | `close()` 方法末尾追加防御性判断：items 为空时同步置空 activeId |
| `stores/windows.test.js` | 修改 | 更新「关闭最后一个窗口」测试用例，期望值从 `toBe('a')` 改为 `toBeNull()` |

#### 影响范围

- 仅改 `stores/windows.js`，一行核心逻辑 + 一行为空判断
- 桌面模式（DesktopLayout.vue/TaskBar.vue/DesktopWindow.vue）共用同一个 `close()` 方法，关闭最后一个窗口时同样受益（activeId 正确置空，正常显示首页）
- 非末位关闭场景零影响：删除非最后一项时 items 不为空，条件不成立，activeId 保持不变
- 全部 162 测试用例通过，零回归
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

### 三、桌面端 TaskBar 右键上下文菜单同步

#### TaskBar.vue
- **【功能补齐】任务栏项右键菜单**：新增与侧边栏 Tab 完全同步的右键上下文菜单，包含「关闭」「关闭其他」「关闭右侧标签页」「关闭全部」四个功能项。
- **【交互】右键触发**：`.nexus-taskbar-center`（空白区域）和 `.nexus-taskbar-item`（单个窗口项）均支持 `@contextmenu.prevent.stop`，空白区域右键时「关闭」「关闭其他」「关闭右侧」置灰禁用。
- **【样式复用】**：直接复用 SidebarLayout.vue 全局定义的 `.nexus-context-menu`、`.nexus-context-item`、`.nexus-context-divider` 等样式类，零新增 CSS。
- **【国际化】**：菜单文案全部使用现有 `t('tab.close')`、`t('tab.closeOthers')`、`t('tab.closeRight')`、`t('tab.closeAll')` i18n 键，中英文均已有对应翻译。
- **【图标】**：使用全局注册的 Element Plus 图标组件（`<Close />`、`<CircleClose />`、`<DArrowRight />`），无需额外导入。
- **【隔离原则】**: 仅改 TaskBar.vue，侧边栏模式（SidebarLayout.vue/SidebarMenu.vue）零改动。

## 当前状态
- 15 个测试文件，162 个测试用例，全部通过
- 0 unhandled errors
- 构建成功，零报错

## 新增改造：前端接口层统一（API BaseURL、JWT 鉴权、全局错误拦截）

### 改动文件

| 文件 | 操作类型 | 说明 |
|------|---------|------|
| `services/api.js` | 重写 | 新增 BaseURL 配置、JWT 请求拦截器、全局错误响应拦截器 |
| `services/auth.js` | 修改 | 所有方法新增 `options` 参数透传 |
| `stores/user.js` | 修改 | `restoreSession()` 使用静默模式 `{ _silentError: true }` |
| `router/index.js` | 修改 | 新增 `/login` 独立路由 |
| `components/LoginPage.vue` | 修改 | 新增登录后路径恢复逻辑 |
| `resources/views/app.blade.php` | 修改 | 注入 `__NEXUS_ADMIN_CONFIG__.apiBaseURL` |
| `config/nexus-admin.php` | 修改 | 新增 `api_base_url` 配置项 |
| `docs/README.md` | 更新 | 新增 API 通信层完整文档 |

### 关键决策

1. **BaseURL 配置**：setter 模式，由 ConfigStore 全局配置加载后调用 `setApiBaseURL()` 设置（`configStore.get('apiBaseURL', '')`），env 变量为 fallback
2. **JWT 自动携带**：请求拦截器中从 `localStorage('nexus-admin-token')` 读取并注入 `Authorization: Bearer` 头
3. **错误分类处理**：401（特殊处理）、403、404、422（静默）、429、5xx、其他
4. **401 四步处理**：保存路径 → 清除 Token → 触发 `auth:unauthorized` 事件 → 跳转登录页
5. **防重复提示**：同一状态码 2 秒节流
6. **静默模式**：`_silentError` 标记用于会话恢复等无需弹错的场景
7. **登录恢复**：401 时路径存入 `sessionStorage('nexus-redirect-path')`，登录后读取并跳转
8. **登录路由动态注册**：路由名固定为 `login`，路径来自 `configStore.get('loginPath', '/login')`，通过 `addLoginRoute()` 动态添加
9. **事件机制统一**：全部通过 `hookManager.emit()` 触发，不再使用 `window.dispatchEvent`
10. **国际化错误提示**：通过 `setTranslator(i18nStore.t)` 注入翻译函数，错误消息使用 `_t(key, fallback)` 模式

## 最近改动（侧边栏文件夹交互及深层菜单展开修复）

### 2026-06-01：侧边栏三项交互修复

#### 改动文件

| 文件 | 改动类型 |
|------|----------|
| `components/sidebar/SidebarMenuNode.vue` | **新增** — 递归菜单节点组件 |
| `components/sidebar/SidebarMenu.vue` | 模板重构 + 逻辑修复 |

#### 修复内容

**修复一：新建文件夹后不再自动打开标签页**
- **根因**：新建文件夹（`type: 'folder'`）时，`buildTree` 生成 `children: []`，`item.children.length > 0` 为 `false`，文件夹渲染为 `el-menu-item`，点击后触发 `handleMenuSelect` 打开标签页。
- **修复**：引入递归组件 `SidebarMenuNode.vue`，`isFolderNode` 判断仅当有子项时渲染为 `el-sub-menu`，空文件夹渲染为 `el-menu-item`（点击由 `handleMenuSelect` 守卫拦截）。
- **守卫**：`handleMenuSelect` 中增加 `if (item.type === 'folder') return`，双重保障。

**修复二：文件夹右键新增项与桌面模式行为对齐**
- **根因**：`addSidebarFolder()` 中 `parentId = contextItem.parent_id` 将新项创建为同级。
- **修复**：合并为统一 `addSidebarItem()` 函数，文件夹场景使用 `parentId = contextItem.id` 创建为子级。
- **简化**：移除独立的「添加项」和「新建文件夹」两个菜单项，合并为单个「新增项」按钮。右键文件夹时显示「在此新增项」，空白处显示「新增项」。用户通过编辑器类型下拉菜单自由选择创建菜单/文件夹/链接等。

**修复三：恢复二级及更深层级文件夹的正常展开**
- **根因**：原模板仅在 `<el-sub-menu>` 内渲染 `el-menu-item`，不支持嵌套渲染。
- **修复**：提取 `SidebarMenuNode.vue` 递归组件，每个节点根据 `isFolderNode` 判断渲染为 `el-sub-menu` 或 `el-menu-item`，支持任意层级嵌套。

#### 影响范围
- 仅改 `src/components/sidebar/` 目录下的组件
- `SidebarLayout.vue`、`DesktopLayout.vue`、`disktop.js` 等文件零改动
- 桌面模式不受任何影响
