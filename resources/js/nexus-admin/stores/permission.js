/**
 * 权限状态管理
 * 管理用户的权限标签列表
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import hookManager from '../utils/hook-manager'

export const usePermissionStore = defineStore('nexus-permission', () => {
  // 用户的权限标签列表
  const tags = ref([])

  // 是否已加载
  const loaded = ref(false)

  /**
   * 设置权限标签
   * @param {string[]} tagList
   */
  function setTags(tagList) {
    tags.value = tagList
    loaded.value = true
  }

  /**
   * 检查是否拥有指定标签
   * @param {string} tag
   */
  async function hasTag(tag) {
    const result = tags.value.includes(tag)
    await hookManager.emit('permission:check', tag, result)
    return result
  }

  /**
   * 检查是否拥有所有指定标签
   * @param {string[]} tagList
   */
  async function hasAllTags(tagList) {
    const result = tagList.every(tag => tags.value.includes(tag))
    for (const tag of tagList) {
      await hookManager.emit('permission:check', tag, tags.value.includes(tag))
    }
    return result
  }

  /**
   * 检查是否拥有任一指定标签
   * @param {string[]} tagList
   */
  async function hasAnyTag(tagList) {
    const result = tagList.some(tag => tags.value.includes(tag))
    for (const tag of tagList) {
      await hookManager.emit('permission:check', tag, tags.value.includes(tag))
    }
    return result
  }

  /**
   * 从后端加载权限标签
   */
  async function loadTags() {
    try {
      const { getPermissionTags } = await import('../services/api')
      const response = await getPermissionTags()
      setTags(response.data || [])
    } catch (e) {
      console.warn('[NexusAdmin] 加载权限标签失败，使用空列表:', e)
      setTags([])
    }

    // 触发权限标签加载完成钩子
    await hookManager.emit('permission:loaded', tags.value)
  }

  return {
    tags,
    loaded,
    setTags,
    hasTag,
    hasAllTags,
    hasAnyTag,
    loadTags
  }
})
