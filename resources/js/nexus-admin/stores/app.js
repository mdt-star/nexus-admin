/**
 * 应用全局状态管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useConfigStore } from './config'

export const useAppStore = defineStore('nexus-app', () => {
  const configStore = useConfigStore()

  // 应用是否已初始化完成
  const initialized = ref(false)

  // 应用是否正在初始化
  const initializing = ref(false)

  // 布局模式
  const layout = computed(() => configStore.get('layout', 'sidebar'))

  // 侧边栏是否折叠
  const sidebarCollapsed = computed(() => configStore.get('sidebarCollapsed', false))

  // 是否移动端
  const isMobile = ref(window.innerWidth < 768)

  // 监听窗口大小变化
  function initResponsive() {
    const handler = () => {
      isMobile.value = window.innerWidth < 768
    }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }

  /**
   * 切换布局模式
   */
  async function toggleLayout() {
    const newLayout = layout.value === 'desktop' ? 'sidebar' : 'desktop'
    await configStore.setUserConfig('layout', newLayout)
  }

  /**
   * 切换侧边栏折叠
   */
  async function toggleSidebar() {
    await configStore.setUserConfig('sidebarCollapsed', !sidebarCollapsed.value)
  }

  return {
    initialized,
    initializing,
    layout,
    sidebarCollapsed,
    isMobile,
    initResponsive,
    toggleLayout,
    toggleSidebar
  }
})
