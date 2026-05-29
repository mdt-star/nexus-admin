/**
 * 菜单状态管理
 * 管理桌面项/菜单数据，桌面模式和侧边栏模式共享同一套数据
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import hookManager from '../utils/hook-manager'

export const useMenuStore = defineStore('nexus-menu', () => {
  // 原始菜单数据（从后端加载）
  const menus = ref([])

  // 是否已加载
  const loaded = ref(false)

  // 正在加载中
  const loading = ref(false)

  /**
   * 从后端加载菜单
   */
  async function loadMenus() {
    if (loading.value) return
    loading.value = true

    // 触发菜单加载前钩子
    await hookManager.emit('menu:before-load')

    try {
      const { default: menusApi } = await import('../services/menus')
      const response = await menusApi.list()
      let data = response.data || []

      // 触发菜单加载钩子，允许插件修改菜单
      await hookManager.emit('menu:loaded', data)

      menus.value = data
      loaded.value = true
    } catch (e) {
      console.warn('[NexusAdmin] 加载菜单失败:', e)
      menus.value = []
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

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
   * 根据 component 名称查找菜单项
   * @param {string} componentName
   */
  function findMenuByComponent(componentName) {
    return findInMenus(menus.value, item => item.component === componentName)
  }

  /**
   * 根据路由查找菜单项
   * @param {string} route
   */
  function findMenuByRoute(route) {
    return findInMenus(menus.value, item => item.route === route)
  }

  return {
    menus,
    loaded,
    loading,
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
