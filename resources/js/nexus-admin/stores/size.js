/**
 * UI 尺寸状态管理
 * 控制全局控件尺寸：small | medium | large
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUiSizeStore = defineStore('nexus-ui-size', () => {
  // 当前尺寸: small | medium | large，从 localStorage 恢复
  const savedSize = localStorage.getItem('nexus-admin-ui-size')
  const size = ref(savedSize || 'medium')

  /**
   * Element Plus 配置映射
   */
  const elementSize = computed(() => {
    return size.value === 'large' ? 'large' : size.value === 'small' ? 'small' : 'default'
  })

  /**
   * 设置尺寸
   */
  function setSize(val) {
    size.value = val
    applySize(val)
    localStorage.setItem('nexus-admin-ui-size', val)
  }

  /**
   * 循环切换尺寸
   */
  function toggleSize() {
    const sizes = ['small', 'medium', 'large']
    const idx = sizes.indexOf(size.value)
    const next = sizes[(idx + 1) % sizes.length]
    setSize(next)
  }

  /**
   * 应用尺寸 CSS
   */
  function applySize(val) {
    document.documentElement.setAttribute('data-ui-size', val)
  }

  /**
   * 初始化
   */
  function init() {
    applySize(size.value)
  }

  return {
    size,
    elementSize,
    setSize,
    toggleSize,
    init,
    applySize
  }
})
