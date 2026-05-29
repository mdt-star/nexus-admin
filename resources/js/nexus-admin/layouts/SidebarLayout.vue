<template>
  <div class="nexus-sidebar-layout">
    <SidebarMenu @open-page="onStartMenuOpenPage" />

    <div class="nexus-main-area">
      <header class="nexus-header" :style="headerStyle">
        <div class="nexus-header-left">
          <el-button :icon="appStore.sidebarCollapsed ? 'Expand' : 'Fold'" circle @click="appStore.toggleSidebar()" />
          <GlobalSearch />
        </div>
        <div class="nexus-header-right">
          <NotificationBell />
          <el-tooltip :content="t('theme.toggle')" placement="bottom">
            <el-button :icon="themeStore.theme === 'dark' ? 'Sunny' : 'Moon'" circle
              @click="themeStore.toggleTheme()" />
          </el-tooltip>
          <el-dropdown @command="(val) => uiSizeStore.setSize(val)">
            <el-button><span style="font-size:13px;font-weight:600">{{ uiSizeStore.size.charAt(0).toUpperCase()
                }}</span></el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="small">S - Small</el-dropdown-item>
                <el-dropdown-item command="medium">M - Medium</el-dropdown-item>
                <el-dropdown-item command="large">L - Large</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-dropdown @command="handleLocaleChange">
            <el-button><globe-icon style="vertical-align: middle;" /> {{ localeDisplay }} <el-icon
                class="el-icon--right">
                <ArrowDown />
              </el-icon></el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="zh-CN">中文</el-dropdown-item>
                <el-dropdown-item command="en">English</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-dropdown @command="handleUserCommand" v-if="userStore.isLoggedIn">
            <el-button class="nexus-user-btn" style="padding-right: 0 !important;">
              <el-avatar :size="22" :src="userStore.user?.avatar || ''"
                :class="{'nexus-user-avatar': true, 'nexus-user-avatar-themed': hasHeaderColor}">{{ userInitial }}</el-avatar>
              <span style="margin-left: 4px;">{{ userStore.user?.nickname }}</span>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="preferences"><el-icon>
                    <Setting />
                  </el-icon> {{ t('preferences.title') }}</el-dropdown-item>
                <el-dropdown-item command="profile"><el-icon>
                    <InfoFilled />
                  </el-icon> {{ t('login.profile') }}</el-dropdown-item>
                <el-dropdown-item divided command="logout"><el-icon>
                    <SwitchButton />
                  </el-icon> {{ t('login.logout') }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <div class="nexus-tabs" v-if="configStore.get('tabMode', true) && windowStore.items.length > 0"
        @contextmenu.prevent="openTabContextMenu($event, null)">
        <div class="nexus-tabs-wrapper" ref="tabsWrapperRef">
          <div v-for="tab in windowStore.items" :key="tab.id" class="nexus-tab"
            :class="{ 'nexus-tab-active': tab.id === windowStore.activeId }" @click="windowStore.activate(tab.id)"
            @contextmenu.prevent.stop="openTabContextMenu($event, tab)">
            <span class="nexus-tab-label">{{ tab.title }}</span>
            <el-icon class="nexus-tab-close" size="12" @click.stop="windowStore.close(tab.id)">
              <Close />
            </el-icon>
          </div>
        </div>
        <div class="nexus-tabs-actions">
          <el-button class="nexus-tab-btn" :icon="ArrowLeft" circle @click="scrollTabs(-1)"
            :disabled="!canScrollLeft" />
          <el-button class="nexus-tab-btn" :icon="ArrowRight" circle @click="scrollTabs(1)"
            :disabled="!canScrollRight" />
        </div>
      </div>

      <main class="nexus-content">
        <div v-if="windowStore.items.length > 0" class="nexus-content-pages">
          <div v-for="tab in windowStore.items" :key="tab.id" class="nexus-content-page"
            v-show="tab.id === windowStore.activeId">
            <component :is="getPageComponent(tab.component)" :key="tab.id" />
          </div>
        </div>
        <div v-else class="nexus-content-empty"><el-empty :description="t('common.noData')" /></div>
      </main>

      <footer class="nexus-footer"><span>{{ footerText }}</span></footer>
    </div>

    <PreferencesPanel ref="preferencesRef" />

    <Teleport to="body">
      <div v-if="tabContextVisible" class="nexus-context-menu" :style="tabContextStyle" @click.stop>
        <div class="nexus-context-item" :class="{ 'nexus-context-item-disabled': !tabContextIsActive }"
          @click="tabContextIsActive && closeCurrentTab()">
          <el-icon><Close /></el-icon><span>{{ t('tab.close') }}</span>
        </div>
        <div class="nexus-context-divider" />
        <div class="nexus-context-item" :class="{ 'nexus-context-item-disabled': !tabContextIsActive }"
          @click="tabContextIsActive && closeOtherTabs()">
          <el-icon><CircleClose /></el-icon><span>{{ t('tab.closeOthers') }}</span>
        </div>
        <div class="nexus-context-item" :class="{ 'nexus-context-item-disabled': !tabContextIsActive }"
          @click="tabContextIsActive && closeRightTabs()">
          <el-icon><DArrowRight /></el-icon><span>{{ t('tab.closeRight') }}</span>
        </div>
        <div class="nexus-context-divider" />
        <div class="nexus-context-item" @click="closeAllTabs">
          <el-icon><Close /></el-icon><span>{{ t('tab.closeAll') }}</span>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useAppStore } from '../stores/app'
import { useWindowStore } from '../stores/windows'
import { useThemeStore } from '../stores/theme'
import { useI18nStore } from '../stores/i18n'
import { useConfigStore } from '../stores/config'
import { useUserStore } from '../stores/user'
import { useUiSizeStore } from '../stores/size'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import GlobeIcon from '../components/GlobeIcon.vue'
import NotificationBell from '../components/common/NotificationBell.vue'
import GlobalSearch from '../components/common/GlobalSearch.vue'
import PreferencesPanel from '../components/PreferencesPanel.vue'
import SidebarMenu from '../components/sidebar/SidebarMenu.vue'

const appStore = useAppStore()
const windowStore = useWindowStore()
const themeStore = useThemeStore()
const i18nStore = useI18nStore()
const configStore = useConfigStore()
const userStore = useUserStore()
const uiSizeStore = useUiSizeStore()
const { t } = i18nStore

// ==================== 计算属性 ====================
const footerText = computed(() => configStore.get('footer', ''))
const currentLocale = computed(() => i18nStore.locale)
const hasHeaderColor = computed(() => !!configStore.get('headerColor', ''))
const headerStyle = computed(() => {
  const color = configStore.get('headerColor', '')
  return color ? { background: color, borderBottom: 'none' } : {}
})
const localeDisplay = computed(() => ({ 'zh-CN': '中文', 'en': 'English' })[currentLocale.value] || currentLocale.value)
const userInitial = computed(() => (userStore.user?.username || 'U').charAt(0).toUpperCase())

const preferencesRef = ref(null)

// ==================== StartMenu 打开页面 ====================
function onStartMenuOpenPage(item) {
  windowStore.open({ id: item.id, title: item.title, icon: item.icon, component: item.component, path: item.path })
}

// ==================== Tab 滚动 ====================
const tabsWrapperRef = ref(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

function updateScrollState() {
  const el = tabsWrapperRef.value
  if (el) { canScrollLeft.value = el.scrollLeft > 0; canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth }
}
function scrollTabs(dir) { tabsWrapperRef.value?.scrollBy({ left: dir * 200, behavior: 'smooth' }) }

// ==================== Tab 右键菜单 ====================
const tabContextVisible = ref(false)
const tabContextItem = ref(null)
const tabContextStyle = ref({})
const tabContextIsActive = ref(false)

function openTabContextMenu(event, tab) {
  tabContextVisible.value = true
  tabContextItem.value = tab
  tabContextIsActive.value = tab !== null
  tabContextStyle.value = { left: `${event.clientX}px`, top: `${event.clientY}px` }
  setTimeout(() => document.addEventListener('click', closeTabContext, { once: true }), 0)
}
function closeTabContext() { tabContextVisible.value = false }
function closeCurrentTab() { tabContextVisible.value = false; const id = tabContextItem.value?.id; if (id) windowStore.close(id) }
function closeAllTabs() { tabContextVisible.value = false; windowStore.closeAll() }
function closeOtherTabs() {
  tabContextVisible.value = false
  const id = tabContextItem.value?.id
  if (id) windowStore.closeOthers(id)
}
function closeRightTabs() {
  tabContextVisible.value = false
  const id = tabContextItem.value?.id
  if (!id) return
  const items = windowStore.items
  const idx = items.findIndex(t => t.id === id)
  if (idx === -1) return
  const toClose = items.slice(idx + 1).map(t => t.id)
  for (let i = toClose.length - 1; i >= 0; i--) windowStore.close(toClose[i])
}

// ==================== 用户操作 ====================
function handleLocaleChange(locale) { i18nStore.setLocale(locale) }
function handleUserCommand(cmd) {
  if (cmd === 'preferences') preferencesRef.value?.open()
  else if (cmd === 'logout') userStore.logout()
}

// ==================== 生命周期 ====================
onMounted(() => {
  const el = tabsWrapperRef.value
  if (el) {
    el.addEventListener('scroll', updateScrollState)
    new MutationObserver(updateScrollState).observe(el, { childList: true, subtree: true })
    updateScrollState()
  }
})

// ==================== 工具函数 ====================
const pageCache = {}
function getPageComponent(name) {
  if (!name) return null
  if (pageCache[name]) return pageCache[name]
  return pageCache[name] = (window.__NEXUS_ADMIN_PAGES__ || {})[name] || null
}
</script>

<style scoped>
.nexus-sidebar-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.nexus-main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.nexus-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--nexus-header-height);
  padding: 0 16px 0 5px;
  background-color: var(--nexus-bg-color-light);
  border-bottom: 1px solid var(--nexus-border-color);
  z-index: 100;
  transition: background 0.3s ease;
}

.nexus-header[style*="background"] .nexus-header-right :deep(.el-button),
.nexus-header[style*="background"] .nexus-header-left :deep(.el-button) {
  color: rgba(255, 255, 255, 0.9) !important;
}

.nexus-header[style*="background"] .nexus-header-right :deep(.el-button:hover),
.nexus-header[style*="background"] .nexus-header-left :deep(.el-button:hover) {
  background-color: rgba(255, 255, 255, 0.15) !important;
  color: #fff !important;
}

.nexus-header[style*="background"] .nexus-user-btn span {
  color: rgba(255, 255, 255, 0.9) !important;
}

.nexus-header[style*="background"] .nexus-user-btn span.nexus-user-avatar-themed {
  background-color: rgba(255, 255, 255, 0.85) !important;
  color: var(--nexus-primary-color) !important;
}

.nexus-user-btn {
  padding-right: 0 !important;
}

.nexus-header-left {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nexus-header-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nexus-header-right :deep(.el-button),
.nexus-header-left :deep(.el-button) {
  border: none !important;
  border-color: transparent !important;
  background-color: transparent;
  color: var(--nexus-text-color-secondary);
  transition: all 0.25s ease;
  margin-left: 0 !important;
  outline: none !important;
}

.nexus-header-right :deep(.el-button:hover),
.nexus-header-left :deep(.el-button:hover) {
  background-color: var(--nexus-bg-color-dark);
  color: var(--nexus-primary-color);
  border: none !important;
  border-color: transparent !important;
  outline: none !important;
}

.nexus-header-right :deep(.el-button:focus),
.nexus-header-left :deep(.el-button:focus),
.nexus-header-right :deep(.el-button:focus-visible),
.nexus-header-left :deep(.el-button:focus-visible) {
  border: none !important;
  border-color: transparent !important;
  outline: none !important;
}

[data-theme="dark"] .nexus-header-right :deep(.el-button:hover),
[data-theme="dark"] .nexus-header-left :deep(.el-button:hover) {
  background-color: rgba(255, 255, 255, 0.08);
}

.nexus-tabs {
  height: var(--nexus-tab-height);
  background-color: var(--nexus-bg-color);
  border-bottom: 1px solid var(--nexus-border-color);
  display: flex;
  align-items: stretch;
  overflow: hidden;
  padding-left: 0px;
}

.nexus-tabs-wrapper {
  display: flex;
  align-items: stretch;
  overflow-x: auto;
  flex: 1;
  user-select: none;
  -webkit-user-select: none;
}

.nexus-tab {
  margin-top: 0px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 14px 0 28px;
  font-size: var(--nexus-font-size-sm);
  cursor: pointer;
  white-space: nowrap;
  user-select: none;
  position: relative;
  color: var(--nexus-text-color-secondary);
  transition: all 0.2s ease;
  border-right: 1px solid var(--nexus-border-color);
}

.nexus-tab:last-child {
  border-right-width: 0px;
}

.nexus-tab:hover {
  background-color: var(--nexus-bg-color-light);
  color: var(--nexus-text-color);
}

.nexus-tab:hover .nexus-tab-close {
  opacity: 1;
}

.nexus-tab-active {
  background-color: var(--nexus-bg-color-light);
  color: var(--nexus-primary-color) !important;
}

.nexus-tab-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--nexus-primary-color);
  border-radius: 1px 1px 0 0;
}

.nexus-tab-close {
  opacity: 0;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  padding: 1px;
}

.nexus-tab-close:hover {
  background-color: var(--nexus-bg-color-dark);
}

.nexus-tab-active .nexus-tab-close {
  opacity: 0.5;
}

.nexus-tab-active:hover .nexus-tab-close {
  opacity: 1;
}

.nexus-header[style*="background"]+.nexus-tabs {
  background-color: var(--nexus-bg-color-light) !important;
}

.nexus-header[style*="background"]+.nexus-tabs .nexus-tab:last-child {
  border-right-width: 1px;
}

.nexus-tabs-actions {
  display: flex;
  align-items: stretch;
  gap: 0;
}

.nexus-tabs-actions .nexus-tab-btn {
  border: none !important;
  border-radius: 0 !important;
  background-color: transparent;
  color: var(--nexus-text-color-secondary);
  height: auto;
  width: 28px;
  padding: 0;
  margin-left: 0 !important;
  border-right: 1px solid var(--nexus-border-color) !important;
}

.nexus-tabs-actions .nexus-tab-btn:last-child {
  border-right: none !important;
}

.nexus-tabs-actions .nexus-tab-btn:hover {
  background-color: var(--nexus-bg-color-light);
  color: var(--nexus-primary-color);
}

.nexus-tabs-actions .nexus-tab-btn:disabled {
  color: var(--nexus-text-color-disabled, #bbb) !important;
  cursor: default;
  opacity: 0.6;
}

.nexus-tabs-actions .nexus-tab-btn:disabled:hover {
  background-color: transparent;
  color: var(--nexus-text-color-disabled, #bbb) !important;
}

.nexus-content {
  flex: 1;
  overflow: auto;
  padding: 16px;
  background-color: var(--nexus-bg-color);
}

.nexus-content-pages {
  position: relative;
  height: 100%;
}

.nexus-content-page {
  position: absolute;
  inset: 0;
  height: 100%;
  overflow: auto;
}

.nexus-content-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.nexus-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  height: var(--nexus-footer-height);
  font-size: var(--nexus-font-size-sm);
  color: var(--nexus-text-color-secondary);
  background-color: var(--nexus-bg-color-light);
  border-top: 1px solid var(--nexus-border-color);
}
</style>

<style>
.nexus-context-menu {
  position: fixed;
  z-index: 9999;
  min-width: 160px;
  background-color: var(--nexus-bg-color-light);
  border: 1px solid var(--nexus-border-color);
  border-radius: var(--nexus-border-radius);
  box-shadow: var(--nexus-box-shadow-lg);
  padding: 4px;
}

.nexus-context-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  font-size: var(--nexus-font-size-base);
  color: var(--nexus-text-color);
  cursor: pointer;
  border-radius: var(--nexus-border-radius-sm);
  transition: background-color 0.15s;
}

.nexus-context-item:hover {
  background-color: var(--nexus-bg-color-dark);
}

.nexus-context-item-disabled {
  opacity: 0.4;
  cursor: not-allowed !important;
}

.nexus-context-item-disabled:hover {
  background-color: transparent !important;
}

.nexus-context-item .el-icon {
  font-size: 16px;
  color: var(--nexus-text-color-secondary);
}

.nexus-context-divider {
  height: 1px;
  background-color: var(--nexus-border-color);
  margin: 4px 8px;
}
</style>
