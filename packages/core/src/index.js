/**
 * @nexus-admin/core 公共 API 入口
 *
 * 导入方式：
 *   import { nexusAdminProvider, loadAndInstallProviders, routeStore } from '@nexus-admin/core'
 */

// === Provider 安装器 ===
export { loadAndInstallProviders, installProvider, routeStore } from './utils/create-provider-installer'
export { I18nCollector } from './utils/i18n-collector'
export { createNexusApp } from './utils/create-app'

// === 钩子系统 ===
export { default as hookManager } from './utils/hook-manager'
export { default as hookEvents } from './utils/hook-events'

// === 基座 Provider ===
export { default as nexusAdminProvider } from './providers/nexus-admin'

// === Store ===
export { useAppStore } from './stores/app'
export { useConfigStore } from './stores/config'
export { useI18nStore } from './stores/i18n'
export { useMenuStore } from './stores/menu'
export { usePermissionStore } from './stores/permission'
export { useThemeStore } from './stores/theme'
export { useWindowStore } from './stores/windows'
export { useUserStore } from './stores/user'
export { useDisktopStore } from './stores/disktop'
export { useNotificationStore } from './stores/notification'
export { useShortcutsStore } from './stores/shortcuts'
export { useUiSizeStore } from './stores/size'

// === 组件 ===
export { default as AppRoot } from './AppRoot.vue'
export { default as GlobeIcon } from './components/GlobeIcon.vue'
export { default as LoginPage } from './components/LoginPage.vue'
export { default as PreferencesPanel } from './components/PreferencesPanel.vue'

// common
export { default as GlobalSearch } from './components/common/GlobalSearch.vue'
export { default as NotificationBell } from './components/common/NotificationBell.vue'
export { default as PermissionTag } from './components/common/PermissionTag.vue'

// desktop
export { default as DesktopWindow } from './components/desktop/DesktopWindow.vue'
export { default as FolderView } from './components/desktop/FolderView.vue'
export { default as ItemEditor } from './components/desktop/ItemEditor.vue'
export { default as StartMenu } from './components/desktop/StartMenu.vue'
export { default as TaskBar } from './components/desktop/TaskBar.vue'
export { default as WindowsStartIcon } from './components/desktop/WindowsStartIcon.vue'

// sidebar
export { default as SidebarMenu } from './components/sidebar/SidebarMenu.vue'
export { default as SidebarMenuNode } from './components/sidebar/SidebarMenuNode.vue'

// === 布局 ===
export { default as DesktopLayout } from './layouts/DesktopLayout.vue'
export { default as MainLayout } from './layouts/MainLayout.vue'
export { default as SidebarLayout } from './layouts/SidebarLayout.vue'

// === Composable ===
export { useWindowDrag } from './composables/useWindowDrag'

// === 指令 ===
export { default as vPermission } from './directives/permission'

// === 语言包（需要时手动导入）===
// import zh from '@nexus-admin/core/src/lang/zh.js'
// import en from '@nexus-admin/core/src/lang/en.js'