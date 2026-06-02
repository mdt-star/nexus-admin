<template>
  <LoginPage v-if="!userStore.isLoggedIn" />
  <div v-else class="nexus-main-layout">
    <!-- 移动端顶部导航（仅 mobile 时显示） -->
    <div v-if="appStore.isMobile && appStore.layout === 'sidebar'" class="nexus-mobile-topbar">
      <div class="nexus-mobile-topbar-left">
        <el-button
          :icon="appStore.sidebarCollapsed ? 'Expand' : 'Fold'"
          circle
         
          @click="appStore.toggleSidebar()"
        />
      </div>
      <div class="nexus-mobile-topbar-title">{{ appName }}</div>
      <div class="nexus-mobile-topbar-right">
        <el-tooltip :content="t('theme.toggle')" placement="bottom">
          <el-button
            :icon="themeStore.theme === 'dark' ? 'Sunny' : 'Moon'"
            circle
           
            @click="themeStore.toggleTheme()"
          />
        </el-tooltip>
      </div>
    </div>

    <component :is="currentLayout" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '../stores/app'
import { useThemeStore } from '../stores/theme'
import { useI18nStore } from '../stores/i18n'
import { useConfigStore } from '../stores/config'
import { useUserStore } from '../stores/user'
import DesktopLayout from './DesktopLayout.vue'
import SidebarLayout from './SidebarLayout.vue'
import LoginPage from '../components/LoginPage.vue'

const appStore = useAppStore()
const themeStore = useThemeStore()
const i18nStore = useI18nStore()
const configStore = useConfigStore()
const userStore = useUserStore()

const { t } = i18nStore

const appName = computed(() => configStore.get('appName', 'Nexus Admin'))

const currentLayout = computed(() => {
  if (appStore.isMobile) return SidebarLayout
  return appStore.layout === 'desktop' ? DesktopLayout : SidebarLayout
})
</script>

<style scoped>
.nexus-main-layout {
  width: 100%;
  height: 100%;
}

.nexus-mobile-topbar {
  display: none;
  align-items: center;
  justify-content: space-between;
  height: var(--nexus-header-height);
  padding: 0 12px;
  background-color: var(--nexus-bg-color-light);
  border-bottom: 1px solid var(--nexus-border-color);
  z-index: 200;
  position: relative;
}

.nexus-mobile-topbar-title {
  font-size: 16px;
  font-weight: 600;
}

.nexus-mobile-topbar-left,
.nexus-mobile-topbar-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

@media (max-width: 768px) {
  .nexus-mobile-topbar {
    display: flex;
  }
}

/* 移动端覆盖 */
@media (max-width: 768px) {
  :deep(.nexus-sidebar-layout) .nexus-header {
    display: none;
  }

  :deep(.nexus-sidebar) {
    position: fixed;
    left: 0;
    top: var(--nexus-header-height);
    bottom: 0;
    z-index: 150;
    transform: translateX(-100%);
  }

  :deep(.nexus-sidebar:not(.nexus-sidebar-collapsed)) {
    transform: translateX(0);
  }

  :deep(.nexus-desktop-layout) .nexus-header {
    display: none;
  }

  :deep(.nexus-desktop-icons) {
    padding: 12px;
    gap: 8px;
    grid-template-columns: repeat(auto-fill, 64px);
  }

  :deep(.nexus-desktop-icon-img) {
    width: 40px;
    height: 40px;
  }

  :deep(.nexus-desktop-icon-img .el-icon) {
    font-size: 24px !important;
  }

  :deep(.nexus-desktop-icon-label) {
    font-size: 10px;
  }

  :deep(.nexus-window) {
    width: 92% !important;
    height: 85% !important;
    top: 5% !important;
    left: 4% !important;
  }

  :deep(.nexus-content) {
    padding: 8px;
  }

  :deep(.nexus-footer) {
    display: none;
  }
}
</style>