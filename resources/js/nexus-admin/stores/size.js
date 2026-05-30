/**
 * UI 尺寸状态管理
 * 控制全局控件尺寸：small | medium | large
 * 尺寸数据作为用户配置的一部分，通过 ConfigStore 持久化到后端
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUiSizeStore = defineStore('nexus-ui-size', () => {
  // 当前尺寸: small | medium | large，从 ConfigStore 读取
  const size = ref('medium')

  /**
   * Element Plus 配置映射
   */
  const elementSize = computed(() => {
    return size.value === 'large' ? 'large' : size.value === 'small' ? 'small' : 'default'
  })

  /**
   * 从 ConfigStore 同步尺寸
   * @param {import('pinia').Store} configStore
   */
  function syncFromConfig(configStore) {
    const saved = configStore.get('uiSize')
    if (saved && ['small', 'medium', 'large'].includes(saved)) {
      size.value = saved
    } else {
      size.value = 'medium'
    }
    applySize(size.value)
  }

  /**
   * 设置尺寸
   */
  function setSize(val) {
    size.value = val
    applySize(val)
    // 通过 ConfigStore 持久化到后端
    import('./config').then(({ useConfigStore }) => {
      const configStore = useConfigStore()
      configStore.setUserConfig('uiSize', val)
    })
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
    syncFromConfig,
    setSize,
    toggleSize,
    init,
    applySize
  }
})
