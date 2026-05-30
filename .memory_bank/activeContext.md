# 当前活动上下文

## 当前工作
修复搜索弹窗输入时自动关闭的 Bug，修复欢迎页在侧边栏/桌面模式下的展示异常。

## 改动内容

### GlobalSearch.vue (`components/common/GlobalSearch.vue`)
- **Bug 修复（精准修复）**：`filteredResults` 计算属性中 `item.id.toLowerCase()` 报错导致弹窗关闭
- **根本原因**：菜单/页面数据的 `id` 字段可能为数字（非字符串），`item.id.toLowerCase()` 抛 `TypeError: item.id.toLowerCase is not a function`，计算属性异常导致 Vue 渲染崩溃，弹窗随之关闭
- **触发链**：输入 → `query` 变化 → `filteredResults` 重算 → `item.id.toLowerCase()` 在数字 id 上抛异常 → Vue 渲染崩溃 → 弹窗关闭
- **方案**：将 4 处 `xxx.toLowerCase()` 改为 `String(xxx ?? '').toLowerCase()`，安全处理非字符串/undefined/null 值
- **还原**：移除此前所有无效改动（dialogVisible ref、watchers、isInputActive、@mousedown.stop、display:none 移除等），仅保留上述 4 行核心修复
- **影响范围**：仅改 GlobalSearch.vue 的 `filteredResults` 计算属性（4 行），DesktopLayout.vue 完全还原

### HomePage.vue (`pages/system/HomePage.vue`)
- **问题**：欢迎页在侧边栏和桌面模式下展示相同，缺少布局差异
- **需求**：侧边栏模式系统信息在右侧；桌面模式保持单列
- **方案**：
  - 导入 `useAppStore`，通过 `appStore.layout` 判断布局模式
  - 新增 `isSidebar` 计算属性，根元素动态添加 `.nexus-home-sidebar` 类
  - 模板重构为双容器结构：`.nexus-home-main`（快捷菜单+服务器信息+PHP环境）和 `.nexus-home-side`（系统信息卡片）
  - CSS：侧边栏模式使用 `display: grid; grid-template-columns: 1fr 360px`；桌面模式 `.nexus-home-side { display: none }` 隐藏侧栏
  - 侧边栏模式下系统信息卡片 `position: sticky` 随滚动固定

## 当前状态
- 14 个测试文件，123 个测试用例，全部通过
- 0 unhandled errors
