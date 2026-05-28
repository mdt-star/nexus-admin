/**
 * 窗口/Tab 状态管理
 * 桌面模式使用窗口，侧边栏模式使用 Tab，统一状态管理
 */
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import hookManager from '../utils/hook-manager'




const STORAGE_KEY = 'nexus-admin-windows'

function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return {
        items: parsed.items || [],
        activeId: parsed.activeId || null
      }
    }
  } catch (e) { /* ignore */ }
  return { items: [], activeId: null }
}

function saveToStorage(items, activeId) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, activeId }))
  } catch (e) { /* ignore */ }
}

export const useWindowStore = defineStore('nexus-windows', () => {
  const router = useRouter()
  const saved = loadFromStorage()


  // 已打开的窗口/Tab 列表
  const items = ref(saved.items)

  // 当前激活的窗口/Tab ID
  const activeId = ref(saved.activeId)

  // 自动持久化
  watch([items, activeId], ([newItems, newActiveId]) => {
    saveToStorage(newItems, newActiveId)
    if(newItems.length === 0) {
      router.replace({ path: '/' }).catch(() => {})
    }
  }, { deep: true })

  // 窗口/Tab 历史（用于前进/后退）
  const history = ref([])

  // 当前激活的窗口/Tab
  const active = computed(() => {
    return items.value.find(item => item.id === activeId.value) || null
  })

  /**
   * 打开窗口/Tab
   * @param {object} menuItem - 菜单项数据
   */
  async function open(menuItem) {
    const existing = items.value.find(item => item.id === menuItem.id)
    if (existing) {
      // 已存在，切换到它
      activeId.value = menuItem.id
    } else {
      // 新建窗口/Tab
      const newItem = {
        id: menuItem.id,
        title: menuItem.title,
        icon: menuItem.icon,
        component: menuItem.component,
        route: menuItem.route,
        params: menuItem.params || {},
        tags: menuItem.tags || [],
        meta: menuItem.meta || {},
        openedAt: Date.now()

      }
      items.value.push(newItem)
      activeId.value = newItem.id


      // 触发窗口打开钩子
      await hookManager.emit('window:open', newItem)
    }

    // 记录历史
    history.value.push(activeId.value)
  }

  /**
   * 关闭窗口/Tab
   * @param {string} id
   */
  async function close(id) {
    const index = items.value.findIndex(item => item.id === id)
    if (index === -1) return

    const item = items.value[index]

    // 触发窗口关闭钩子
    await hookManager.emit('window:close', item)

    items.value.splice(index, 1)

    // 如果关闭的是当前激活的，切换到上一个
    if (activeId.value === id) {
      if (items.value.length > 0) {
        activeId.value = items.value[Math.min(index, items.value.length - 1)].id
      } else {
        activeId.value = null
      }
    }
  }

  /**
   * 关闭其他所有窗口/Tab
   * @param {string} id - 保留的窗口 ID
   */
  function closeOthers(id) {
    items.value = items.value.filter(item => item.id === id)
    activeId.value = id
  }

  /**
   * 关闭所有窗口/Tab
   */
  function closeAll() {
    items.value = []
    activeId.value = null
    history.value = []
  }

  /**
   * 激活指定窗口/Tab
   * @param {string} id
   */
  async function activate(id) {
    const prevId = activeId.value
    activeId.value = id
    history.value.push(id)

    const item = items.value.find(item => item.id === id)
    if (item) {
      await hookManager.emit('window:activate', item)
    }

  }


  /**
   * 更新窗口/Tab 状态
   * @param {string} id
   * @param {object} state
   */
  function update(id, state) {
    const item = items.value.find(item => item.id === id)
    if (item) {
      Object.assign(item, state)
    }
  }

  /**
   * 更新指定 Tab 的搜索参数，并同步到浏览器 URL
   * 搜索参数存储在 item.params.query 中，与菜单自带参数互不冲突
   * @param {string} id
   * @param {object} query
   */
  function updateSearchParams(id, query) {
    const item = items.value.find(item => item.id === id)
    if (item) {
      if (!item.params) item.params = {}
      item.params.query = { ...query }
    }
    // 如果更新的是当前激活的 Tab，同步到 URL
    if (id === activeId.value && item?.route) {
      router.replace({ path: item.route, query: { ...query } }).catch(() => {})
    } 

  }



  /**
   * 获取指定 Tab 的搜索参数
   * @param {string} id
   * @returns {object}
   */
  function getSearchParams(id) {
    const item = items.value.find(item => item.id === id)
    return item?.params?.query || {}
  }


  return {
    items,
    activeId,
    active,
    history,
    open,
    close,
    closeOthers,
    closeAll,
    activate,
    update,
    updateSearchParams,
    getSearchParams
  }


})
