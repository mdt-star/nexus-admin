/**
 * 菜单状态管理
 * 管理桌面项/菜单数据，桌面模式和侧边栏模式共享同一套数据
 *
 * 数据来源：从 routeStore 获取（由各 Provider 注册的路由自动构建），
 * 不再依赖后端 API。菜单数据在 provider 安装完成后即自动就绪。
 */
import { defineStore } from 'pinia'
import { computed } from 'vue'
import { routeStore } from '../utils/create-provider-installer'

export const useMenuStore = defineStore('nexus-menu', () => {
  /**
   * 菜单树
   * 由 routeStore 的 getMenuTree 动态构建，自动包含所有 Provider 注册的路由
   */
  const menus = computed(() => routeStore.getMenuTree())

  // 数据始终就绪（路由注册完成后即可使用）
  const loaded = computed(() => true)

  /**
   * 获取桌面项列表（桌面模式使用）
   * 叶子节点为普通图标，有子菜单的为文件夹
   */
  const desktopItems = computed(() => {
    return buildDesktopItems(menus.value)
  })

  /**
   * 获取侧边栏菜单树（侧边栏模式使用）
   */
  const sidebarMenus = computed(() => {
    return menus.value
  })

  /**
   * loadMenus 保留为空函数，兼容外部调用
   * 数据已由 routeStore 自动就绪，无需加载
   */
  async function loadMenus() {
    // 数据已就绪，无需操作
  }

  /**
   * 根据 component 名称查找菜单项
   * @param {string} componentName
   */
  function findMenuByComponent(componentName) {
    return findInMenus(menus.value, item => item.component === componentName)
  }

  /**
   * 根据路由 path 查找菜单项
   * @param {string} route
   */
  function findMenuByRoute(route) {
    return findInMenus(menus.value, item => item.path === route)
  }

  return {
    menus,
    loaded,
    desktopItems,
    sidebarMenus,
    loadMenus,
    findMenuByComponent,
    findMenuByRoute
  }
})

/**
 * 构建桌面项列表
 * - 叶子节点（无 children 或 children 为空）→ 普通桌面图标
 * - 有子菜单的节点 → 文件夹桌面图标，标记 isFolder = true
 */
function buildDesktopItems(items) {
  const result = []
  for (const item of items) {
    const hasChildren = item.children && item.children.length > 0
    if (hasChildren) {
      // 文件夹：显示为文件夹图标，children 保留用于 FolderView
      result.push({
        ...item,
        isFolder: true,
        component: '', // 文件夹不直接打开页面
      })
    } else if (item.component) {
      // 叶子节点且有页面组件：普通桌面图标
      result.push({ ...item, isFolder: false })
    }
    // 叶子节点无 component → 忽略
  }
  return result
}

/**
 * 在菜单树中查找符合条件的项
 */
function findInMenus(items, predicate) {
  for (const item of items) {
    if (predicate(item)) return item
    if (item.children) {
      const found = findInMenus(item.children, predicate)
      if (found) return found
    }
  }
  return null
}