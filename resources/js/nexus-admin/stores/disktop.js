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
      const { default: disktopsApi } = await import('../services/disktops')
      const response = await disktopsApi.list()
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
      const { default: disktopsApi } = await import('../services/disktops')
      const response = await disktopsApi.items.list(activeDisktopId.value)
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
  /**
   * 同级同名项自动加副本后缀并编序
   * @param {string} title
   * @param {number|null} parentId
   * @param {string} [copySuffix] - 副本后缀，默认 ' 副本'
   * @returns {string}
   */
  function deduplicateTitle(title, parentId, copySuffix = ' 副本') {
    const siblings = items.value.filter(i => i.parent_id === parentId)
    // 精确匹配同名
    const sameName = siblings.filter(i => i.title === title)
    if (sameName.length === 0) return title
    // 已有同名，计算当前 title 的副本序号
    const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const copyPattern = new RegExp(`^${escaped}${escapeRegex(copySuffix)}(\\d+)?$`)
    const copies = siblings.filter(i => copyPattern.test(i.title))
    const maxNum = copies.reduce((max, i) => {
      const m = i.title.match(copyPattern)
      return m ? Math.max(max, parseInt(m[1] || '1', 10)) : max
    }, 0)
    return maxNum === 0 ? `${title}${copySuffix}` : `${title}${copySuffix}${maxNum + 1}`
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  async function addItem(data) {
    // 同级同名自动重命名（_skipDedup 时跳过，用于新建项目等已计算好标题的场景）
    const copySuffix = data._copySuffix || ' 副本'
    const title = data._skipDedup ? data.title : deduplicateTitle(data.title || '未命名', data.parent_id ?? null, copySuffix)
    const dedupedData = { ...data, title }
    try {
      const { default: disktopsApi } = await import('../services/disktops')
      const response = await disktopsApi.items.create({
        disktop_id: activeDisktopId.value,
        ...dedupedData
      })
      // 合并后端响应与请求数据，确保后端未返回的字段（如 component、path）不丢失
      const newItem = {
        ...response.data,
        parent_id: response.data.parent_id ?? null,
        component: response.data.component ?? data.component ?? null,
        path: response.data.path ?? data.path ?? null,
        custom: response.data.custom ?? data.custom ?? {}
      }
      items.value.push(newItem)
      return newItem
    } catch (e) {
      console.warn('[NexusAdmin] 添加桌面项失败:', e)
      // 本地 fallback
      const fallbackItem = {
        id: Date.now(),
        disktop_id: activeDisktopId.value,
        parent_id: dedupedData.parent_id ?? null,
        type: dedupedData.type || 'menu',
        title: dedupedData.title || '未命名',
        icon: dedupedData.icon || null,
        component: dedupedData.component || null,
        path: dedupedData.path || null,
        custom: dedupedData.custom || {},
        sort: items.value.filter(i => i.parent_id === (dedupedData.parent_id || null)).length
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
    // 先本地更新（即时反馈）
    const index = items.value.findIndex(item => item.id === id)
    if (index !== -1) {
      items.value[index] = { ...items.value[index], ...data }
    }
    try {
      const { default: disktopsApi } = await import('../services/disktops')
      await disktopsApi.items.update(id, data)
    } catch (e) {
      console.warn('[NexusAdmin] 更新桌面项失败，重新加载:', e)
      if (activeDisktopId.value) await loadItems()
    }
  }

  /**
   * 删除项
   * @param {number} id
   */
  async function removeItem(id) {
    // 先本地删除（即时反馈），再异步 API
    const childIds = items.value
      .filter(item => item.parent_id === id)
      .map(item => item.id)
    childIds.forEach(cid => removeItemFromLocal(cid))
    removeItemFromLocal(id)
    try {
      const { default: disktopsApi } = await import('../services/disktops')
      await disktopsApi.items.remove(id)
    } catch (e) {
      console.warn('[NexusAdmin] 删除桌面项失败:', e)
    }
  }

  function removeItemFromLocal(id) {
    const index = items.value.findIndex(item => item.id === id)
    if (index !== -1) {
      items.value.splice(index, 1)
    }
  }

  /**
   * 重新排序（支持跨父级移动）
   * @param {number} id
   * @param {number} newSort
   * @param {number|null} [newParentId] - 新的父级 ID，不传则保持原父级
   */
  async function reorderItem(id, newSort, newParentId) {
    const item = items.value.find(i => i.id === id)
    if (!item) return
    item.sort = newSort
    if (newParentId !== undefined) {
      item.parent_id = newParentId
    }
    try {
      const { default: disktopsApi } = await import('../services/disktops')
      await disktopsApi.items.update(id, { sort: newSort, parent_id: item.parent_id })
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
