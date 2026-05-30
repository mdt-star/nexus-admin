# 当前活动上下文

## 当前工作
修复搜索弹窗输入时自动关闭的 Bug，修复欢迎页在侧边栏/桌面模式下的展示异常。

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

## 当前状态
- 14 个测试文件，123 个测试用例，全部通过
- 0 unhandled errors
