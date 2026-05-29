/**
 * 快捷方式状态管理
 * 管理 HomePage 中固定的快捷菜单项，持久化到 localStorage
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_KEY = 'nexus-admin-shortcuts'

export const useShortcutsStore = defineStore('nexus-shortcuts', () => {
  // 从 localStorage 恢复
  const items = ref(loadFromStorage())

  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items.value))
    } catch {
      // localStorage 不可用时静默失败
    }
  }

  /**
   * 添加快捷方式
   */
  function add(item) {
    // 去重：相同 component 或相同 id 不重复添加
    const exists = items.value.some(
      i => (item.component && i.component === item.component) || i.id === item.id
    )
    if (exists) return false
    items.value.push({
      id: item.id,
      title: item.title,
      icon: item.icon,
      component: item.component,
      path: item.path
    })
    saveToStorage()
    return true
  }

  /**
   * 移除快捷方式
   */
  function remove(id) {
    const idx = items.value.findIndex(i => i.id === id)
    if (idx !== -1) {
      items.value.splice(idx, 1)
      saveToStorage()
    }
  }

  /**
   * 判断是否已添加快捷方式
   */
  function has(item) {
    return items.value.some(
      i => (item.component && i.component === item.component) || i.id === item.id
    )
  }

  return {
    items,
    add,
    remove,
    has
  }
})
