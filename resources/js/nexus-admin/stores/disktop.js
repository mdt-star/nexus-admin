/**
 * 桌面/侧边栏自定义区域状态管理
 * 管理用户的 disktops 和 disktop_items
 * 用户可以从总菜单拖入/点击添加项到自定义区域，自由排列、重命名、改图标、删除
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useDisktopStore = defineStore('nexus-disktop', () => {
  // 当前用户的桌面列表
  const disktops = ref([])

  // 当前选中的桌面 ID
  const activeDisktopId = ref(null)

  // 当前桌面的所有项（扁平列表，带 parent_id 树结构）
  const items = ref([])

  // 是否已加载
  const loaded = ref(false)

  // 正在加载中
  const loading = ref(false)

  // 当前桌面对象
  const currentDisktop = computed(() => {
    return disktops.value.find(d => d.id === activeDisktopId.value) || null
  })

  // 当前桌面的根级项（parent_id 为 null 的）
  const rootItems = computed(() => {
    return items.value.filter(item => !item.parent_id)
      .sort((a, b) => (a.sort || 0) - (b.sort || 0))
  })

  /**
   * 获取指定父级下的子项
   * @param {number|null} parentId
   */
  function getChildren(parentId) {
    return items.value.filter(item => item.parent_id === parentId)
      .sort((a, b) => (a.sort || 0) - (b.sort || 0))
  }

  /**
   * 构建树结构（用于侧边栏渲染）
   */
  const treeItems = computed(() => {
    return buildTree(items.value, null)
  })

  /**
   * 加载桌面列表
   */
  async function loadDisktops() {
    if (loading.value) return
    loading.value = true
    try {
      const { getDisktops } = await import('../services/api')
      const response = await getDisktops()
      disktops.value = response.data || []
      // 自动选中默认桌面
      const defaultDisktop = disktops.value.find(d => d.is_default)
      if (defaultDisktop) {
        activeDisktopId.value = defaultDisktop.id
      } else if (disktops.value.length > 0) {
        activeDisktopId.value = disktops.value[0].id
      }
      loaded.value = true
    } catch (e) {
      console.warn('[NexusAdmin] 加载桌面列表失败:', e)
      disktops.value = []
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载当前桌面的项
   */
  async function loadItems() {
    if (!activeDisktopId.value) return
    try {
      const { getDisktopItems } = await import('../services/api')
      const response = await getDisktopItems(activeDisktopId.value)
      items.value = response.data || []
    } catch (e) {
      console.warn('[NexusAdmin] 加载桌面项失败:', e)
      items.value = []
    }
  }

  /**
   * 切换桌面
   * @param {number} id
   */
  async function switchDisktop(id) {
    activeDisktopId.value = id
    await loadItems()
  }

  /**
   * 添加项到当前桌面
   * @param {object} data - { title, icon, component, path, type, parent_id, custom }
   */
  async function addItem(data) {
    try {
      const { createDisktopItem } = await import('../services/api')
      const response = await createDisktopItem({
        disktop_id: activeDisktopId.value,
        ...data
      })
      const newItem = response.data
      items.value.push(newItem)
      return newItem
    } catch (e) {
      console.warn('[NexusAdmin] 添加桌面项失败:', e)
      // 本地 fallback
      const fallbackItem = {
        id: Date.now(),
        disktop_id: activeDisktopId.value,
        parent_id: data.parent_id || null,
        type: data.type || 'menu',
        title: data.title || '未命名',
        icon: data.icon || null,
        component: data.component || null,
        path: data.path || null,
        custom: data.custom || {},
        sort: items.value.filter(i => i.parent_id === (data.parent_id || null)).length
      }
      items.value.push(fallbackItem)
      return fallbackItem
    }
  }

  /**
   * 更新项
   * @param {number} id
   * @param {object} data
   */
  async function updateItem(id, data) {
    try {
      const { updateDisktopItem } = await import('../services/api')
      await updateDisktopItem(id, data)
    } catch (e) {
      console.warn('[NexusAdmin] 更新桌面项失败:', e)
    }
    // 本地更新
    const index = items.value.findIndex(item => item.id === id)
    if (index !== -1) {
      Object.assign(items.value[index], data)
    }
  }

  /**
   * 删除项
   * @param {number} id
   */
  async function removeItem(id) {
    try {
      const { deleteDisktopItem } = await import('../services/api')
      await deleteDisktopItem(id)
    } catch (e) {
      console.warn('[NexusAdmin] 删除桌面项失败:', e)
    }
    // 递归删除子项
    const childIds = items.value
      .filter(item => item.parent_id === id)
      .map(item => item.id)
    childIds.forEach(cid => {
      removeItemFromLocal(cid)
    })
    removeItemFromLocal(id)
  }

  function removeItemFromLocal(id) {
    const index = items.value.findIndex(item => item.id === id)
    if (index !== -1) {
      items.value.splice(index, 1)
    }
  }

  /**
   * 重新排序
   * @param {number} id
   * @param {number} newSort
   */
  async function reorderItem(id, newSort) {
    const item = items.value.find(i => i.id === id)
    if (!item) return
    item.sort = newSort
    try {
      const { updateDisktopItem } = await import('../services/api')
      await updateDisktopItem(id, { sort: newSort })
    } catch (e) {
      console.warn('[NexusAdmin] 排序失败:', e)
    }
  }

  return {
    disktops,
    activeDisktopId,
    items,
    loaded,
    loading,
    currentDisktop,
    rootItems,
    treeItems,
    loadDisktops,
    loadItems,
    switchDisktop,
    getChildren,
    addItem,
    updateItem,
    removeItem,
    reorderItem
  }
})

/**
 * 构建树结构
 */
function buildTree(flatItems, parentId) {
  return flatItems
    .filter(item => item.parent_id === parentId)
    .sort((a, b) => (a.sort || 0) - (b.sort || 0))
    .map(item => ({
      ...item,
      children: buildTree(flatItems, item.id)
    }))
}
