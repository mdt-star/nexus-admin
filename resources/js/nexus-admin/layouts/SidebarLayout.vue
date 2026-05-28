<template>
  <div class="nexus-sidebar-layout">
    <aside class="nexus-sidebar" :class="{
      'nexus-sidebar-collapsed': appStore.sidebarCollapsed,
      'nexus-sidebar-themed': hasHeaderColor,
      'nexus-sidebar-dragover': isDragOver
    }" @dragenter="onSidebarDragEnter" @dragover.prevent="onSidebarDragOver" @dragleave="onSidebarDragLeave"
      @drop.prevent="onSidebarDrop">
      <div v-if="isDragOver" class="nexus-sidebar-drop-overlay">
        <div class="nexus-sidebar-drop-hint">
          <el-icon :size="32">
            <Plus />
          </el-icon>
          <span>释放以添加到快捷菜单</span>
        </div>
      </div>

      <div class="nexus-sidebar-logo" :class="{ 'nexus-sidebar-logo-themed': hasHeaderColor }"
        :style="hasHeaderColor ? headerStyle : {}">
        <div class="nexus-sidebar-logo-inner" :class="{ 'nexus-sidebar-logo-collapsed': appStore.sidebarCollapsed }">
          <el-icon class="nexus-sidebar-logo-icon" :size="logoIconSize">
            <TrendCharts />
          </el-icon>
          <span v-show="!appStore.sidebarCollapsed" class="nexus-sidebar-logo-text">{{ appName }}</span>
        </div>
      </div>
      <div class="nexus-sidebar-menu-container">
        <el-menu :default-active="menuActiveId" class="nexus-sidebar-menu" :collapse="appStore.sidebarCollapsed"
          :collapse-transition="false"  @select="handleMenuSelect">
          <template v-for="item in disktopStore.treeItems" :key="item.id">
            <el-sub-menu v-if="item.children && item.children.length > 0" :index="String(item.id)"
              :data-folder-id="item.type === 'folder' ? item.id : ''"
              @contextmenu.prevent="openSidebarContextMenu($event, item)">
              <template #title>
                <el-icon v-if="item.icon">
                  <component :is="getIconComponent(item.icon)" />
                </el-icon>
                <span>{{ item.title }}</span>
              </template>
              <el-menu-item v-for="child in item.children" :key="child.id" :index="String(child.id)"
                :data-folder-id="child.type === 'folder' ? child.id : ''">
                <template #title>
                  <span @contextmenu.prevent="openSidebarContextMenu($event, child)">{{ child.title }}</span>
                </template>
              </el-menu-item>
            </el-sub-menu>
            <el-menu-item v-else :index="String(item.id)" :data-folder-id="item.type === 'folder' ? item.id : ''">
              <el-icon v-if="item.icon">
                <component :is="getIconComponent(item.icon)" />
              </el-icon>
              <template #title>
                <span @contextmenu.prevent="openSidebarContextMenu($event, item)">{{ item.title }}</span>
              </template>
            </el-menu-item>
          </template>
        </el-menu>
        <StartMenu @open-page="onStartMenuOpenPage"
        @add-item="onStartMenuAddItem">
          <template #reference>
            <div class="nexus-start-btn-wrapper">
              <el-button class="nexus-start-btn">
                <WindowsStartIcon :size="20" />
              </el-button>
            </div>
          </template>
        </StartMenu>
      </div>
    </aside>

    <div class="nexus-main-area">
      <header class="nexus-header" :style="headerStyle">
        <div class="nexus-header-left">
          <el-button :icon="appStore.sidebarCollapsed ? 'Expand' : 'Fold'" circle @click="appStore.toggleSidebar()" />
          <GlobalSearch />
        </div>
        <div class="nexus-header-right">
          <NotificationBell />
          <div style="display: flex; align-items: center; gap: 0;">
            <el-tooltip :content="t('theme.toggle')" placement="bottom">
              <el-button :icon="themeStore.theme === 'dark' ? 'Sunny' : 'Moon'" circle
                @click="themeStore.toggleTheme()" />
            </el-tooltip>
            <el-tooltip :content="t('layout.toggle')" placement="bottom">
              <el-button icon="Grid" circle @click="appStore.toggleLayout()" />
            </el-tooltip>
          </div>
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
              <el-avatar :size="22" :src="userStore.user?.avatar || ''" class="nexus-user-avatar">{{ userInitial
                }}</el-avatar>
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

      <div class="nexus-tabs" v-if="configStore.get('tabMode', true) && windowStore.items.length > 0">
        <div class="nexus-tabs-wrapper" ref="tabsWrapperRef">
          <div v-for="tab in windowStore.items" :key="tab.id" class="nexus-tab"
            :class="{ 'nexus-tab-active': tab.id === windowStore.activeId }" @click="windowStore.activate(tab.id)"
            @contextmenu.prevent="openTabContextMenu($event, tab)">
            <span class="nexus-tab-label">{{ tab.title }}</span>
            <el-icon class="nexus-tab-close" size="12" @click.stop="windowStore.close(tab.id)">
              <Close />
            </el-icon>
          </div>
          <div class="nexus-tabs-divider" />
          <el-button class="nexus-tabs-close-all-btn" :icon="Close" size="small" circle
            @click="windowStore.closeAll()" />
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
      <div v-if="sidebarContextVisible" class="nexus-context-menu" :style="sidebarContextStyle" @click.stop>
        <div class="nexus-context-item" @click="editSidebarItem"><el-icon>
            <Edit />
          </el-icon><span>编辑</span></div>
        <div class="nexus-context-item" @click="deleteSidebarItem"><el-icon>
            <Delete />
          </el-icon><span>删除</span></div>
        <div class="nexus-context-divider" />
        <div class="nexus-context-item" @click="addSidebarFolder"><el-icon>
            <FolderAdd />
          </el-icon><span>新建文件夹</span></div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="tabContextVisible" class="nexus-context-menu" :style="tabContextStyle" @click.stop>
        <div class="nexus-context-item" @click="closeAllTabs"><el-icon>
            <Close />
          </el-icon><span>关闭全部</span></div>
        <div class="nexus-context-item" @click="closeOtherTabs"><el-icon>
            <CircleClose />
          </el-icon><span>关闭其他</span></div>
        <div class="nexus-context-item" @click="closeRightTabs"><el-icon>
            <DArrowRight />
          </el-icon><span>关闭右侧标签页</span></div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useAppStore } from '../stores/app'
import { useMenuStore } from '../stores/menu'
import { useDisktopStore } from '../stores/disktop'
import { useWindowStore } from '../stores/windows'
import { useThemeStore } from '../stores/theme'
import { useI18nStore } from '../stores/i18n'
import { useConfigStore } from '../stores/config'
import { useUserStore } from '../stores/user'
import { useUiSizeStore } from '../stores/size'
import hookManager from '../utils/hook-manager'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { ArrowLeft, ArrowRight, TrendCharts, Plus, Edit, Delete, FolderAdd, HelpFilled } from '@element-plus/icons-vue'
import GlobeIcon from '../components/GlobeIcon.vue'
import NotificationBell from '../components/common/NotificationBell.vue'
import GlobalSearch from '../components/common/GlobalSearch.vue'
import PreferencesPanel from '../components/PreferencesPanel.vue'
import StartMenu from '../components/desktop/StartMenu.vue'
import WindowsStartIcon from '../components/desktop/WindowsStartIcon.vue'

const appStore = useAppStore()
const menuStore = useMenuStore()
const disktopStore = useDisktopStore()
const windowStore = useWindowStore()
const themeStore = useThemeStore()
const i18nStore = useI18nStore()
const configStore = useConfigStore()
const userStore = useUserStore()
const uiSizeStore = useUiSizeStore()
const { t } = i18nStore

const appName = computed(() => configStore.get('appName', 'Nexus Admin'))
const footerText = computed(() => configStore.get('footer', ''))
const currentLocale = computed(() => i18nStore.locale)

const preferencesRef = ref(null)
const isDragOver = ref(false)
const menuActiveId = ref('')
let dragEnterCounter = 0

function onStartMenuOpenPage(item) {
  windowStore.open({ id: item.id, title: item.title, icon: item.icon, component: item.component, route: item.route })
}

async function onStartMenuAddItem(item) {
  await disktopStore.addItem({ title: item.title, icon: item.icon, component: item.component, path: item.path, type: 'menu' })
}

// ==================== 侧边栏拖放 ====================

function onSidebarDragEnter(event) {
  if (event.dataTransfer.types.includes('application/json')) {
    dragEnterCounter++
    isDragOver.value = true
  }
}

function onSidebarDragOver(event) {
  if (event.dataTransfer.types.includes('application/json')) {
    event.dataTransfer.dropEffect = 'copy'
  }
}

function onSidebarDragLeave() {
  dragEnterCounter--
  if (dragEnterCounter <= 0) {
    dragEnterCounter = 0
    isDragOver.value = false
  }
}

async function onSidebarDrop(event) {
  isDragOver.value = false
  dragEnterCounter = 0
  const data = event.dataTransfer.getData('application/json')
  if (!data) return
  try {
    const item = JSON.parse(data)
    // 检测鼠标下方是否有文件夹菜单项
    const el = document.elementFromPoint(event.clientX, event.clientY)
    const folderEl = el?.closest('[data-folder-id]')
    const parentId = folderEl ? Number(folderEl.dataset.folderId) || null : null
    await disktopStore.addItem({ title: item.title, icon: item.icon, component: item.component, path: item.path, type: item.type || 'menu', parent_id: parentId })
  } catch (e) {
    console.warn('[NexusAdmin] 侧边栏拖放添加失败:', e)
  }
}

// 顶部背景色
const hasHeaderColor = computed(() => !!configStore.get('headerColor', ''))
const headerStyle = computed(() => {
  const color = configStore.get('headerColor', '')
  return color ? { background: color, borderBottom: 'none' } : {}
})

const localeDisplay = computed(() => ({ 'zh-CN': '中文', 'en': 'English' })[currentLocale.value] || currentLocale.value)
const userInitial = computed(() => (userStore.user?.nickname || 'U').charAt(0))

const logoIconSize = computed(() => {
  const collapsed = appStore.sidebarCollapsed
  return { small: collapsed ? 22 : 20, medium: collapsed ? 26 : 22, large: collapsed ? 30 : 26 }[uiSizeStore.size] || (collapsed ? 26 : 22)
})

const tabsWrapperRef = ref(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

function updateScrollState() {
  const el = tabsWrapperRef.value
  if (el) { canScrollLeft.value = el.scrollLeft > 0; canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth }
}
function scrollTabs(dir) { tabsWrapperRef.value?.scrollBy({ left: dir * 200, behavior: 'smooth' }) }

onMounted(async () => {
  if (!disktopStore.loaded) await disktopStore.loadDisktops()
  if (disktopStore.activeDisktopId) await disktopStore.loadItems()
  // 菜单加载完成后，同步 activeId 到侧边栏选中状态
  menuActiveId.value = windowStore.activeId ? String(windowStore.activeId) : ''
  const el = tabsWrapperRef.value
  if (el) {
    el.addEventListener('scroll', updateScrollState)
    new MutationObserver(updateScrollState).observe(el, { childList: true, subtree: true })
    updateScrollState()
  }
  document.addEventListener('click', closeSidebarContext)
})

// 监听 activeId 变化，同步侧边栏选中状态
watch(() => windowStore.activeId, (id) => {
  menuActiveId.value = id ? String(id) : ''
})

onUnmounted(() => {
  tabsWrapperRef.value?.removeEventListener('scroll', updateScrollState)
  document.removeEventListener('click', closeSidebarContext)
})

const pageCache = {}
function getIconComponent(iconName) { return iconName ? ElementPlusIconsVue[iconName] || null : null }
function getPageComponent(name) {
  if (!name) return null
  if (pageCache[name]) return pageCache[name]
  return pageCache[name] = (window.__NEXUS_ADMIN_PAGES__ || {})[name] || null
}

async function handleMenuSelect(index) {
  let item = disktopStore.items.find(i => String(i.id) === index)
  if (!item) item = menuStore.findMenuByComponent(index) || menuStore.findMenuByRoute(index)
  if (item) {
    await hookManager.emit('menu:item-click', item)
    if (!configStore.get('tabMode', true)) windowStore.closeAll()
    windowStore.open(item)
  }
}

function handleLocaleChange(locale) { i18nStore.setLocale(locale) }
// ==================== 侧边栏右键菜单 ====================
const sidebarContextVisible = ref(false)
const sidebarContextItem = ref(null)
const sidebarContextStyle = ref({})

function openSidebarContextMenu(event, item) {
  sidebarContextVisible.value = true
  sidebarContextItem.value = item
  sidebarContextStyle.value = { left: `${event.clientX}px`, top: `${event.clientY}px` }
}

function closeSidebarContext() { sidebarContextVisible.value = false }

function editSidebarItem() {
  sidebarContextVisible.value = false
  // 触发父组件的编辑器（通过 emit 到 MainLayout）
  // 这里直接复用 disktopStore 的 updateItem
  // 简化处理：弹出 prompt 编辑标题
  const item = sidebarContextItem.value
  if (!item) return
  const newTitle = prompt('编辑标题', item.title)
  if (newTitle && newTitle.trim()) {
    disktopStore.updateItem(item.id, { title: newTitle.trim() })
  }
}

function deleteSidebarItem() {
  sidebarContextVisible.value = false
  const item = sidebarContextItem.value
  if (!item) return
  disktopStore.removeItem(item.id)
}

async function addSidebarFolder() {
  sidebarContextVisible.value = false
  const newItem = await disktopStore.addItem({ title: '新建文件夹', icon: 'FolderOpened', type: 'folder', parent_id: null })
  const newTitle = prompt('编辑文件夹名称', newItem.title)
  if (newTitle && newTitle.trim()) {
    disktopStore.updateItem(newItem.id, { title: newTitle.trim() })
  }
}

// ==================== Tab 右键菜单 ====================
const tabContextVisible = ref(false)
const tabContextItem = ref(null)
const tabContextStyle = ref({})

function openTabContextMenu(event, tab) {
  tabContextVisible.value = true
  tabContextItem.value = tab
  tabContextStyle.value = { left: `${event.clientX}px`, top: `${event.clientY}px` }
  // 点击其他地方关闭
  setTimeout(() => document.addEventListener('click', closeTabContext, { once: true }), 0)
}

function closeTabContext() {
  tabContextVisible.value = false
}

function closeAllTabs() {
  tabContextVisible.value = false
  windowStore.closeAll()
}

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
  // 关闭右侧所有 tab
  const toClose = items.slice(idx + 1).map(t => t.id)
  toClose.forEach(tid => windowStore.close(tid))
}

function handleUserCommand(cmd) {
  if (cmd === 'preferences') preferencesRef.value?.open()
  else if (cmd === 'logout') userStore.logout()
}
</script>

<style scoped>
.nexus-sidebar-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.nexus-sidebar {
  width: var(--nexus-sidebar-width);
  background-color: var(--nexus-bg-color-light);
  border-right: 1px solid var(--nexus-border-color);
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
  overflow: hidden;
  position: relative;
}

.nexus-sidebar-collapsed {
  width: var(--nexus-sidebar-collapsed-width);
}

.nexus-sidebar-logo {
  height: var(--nexus-header-height);
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--nexus-border-color);
  transition: background 0.3s ease;
}

.nexus-sidebar-logo-inner {
  display: flex;
  align-items: center;
  gap: 6px;
}

.nexus-sidebar-logo-collapsed {
  justify-content: center;
  margin-left: 0;
  gap: 0;
}

.nexus-sidebar-logo-icon {
  color: var(--nexus-text-color) !important;
  transition: font-size 0.3s ease, color 0.3s ease;
}

.nexus-sidebar-logo-text {
  font-size: calc(var(--nexus-font-size-lg) + 6px);
  font-weight: 700;
  color: var(--nexus-text-color);
  white-space: nowrap;
  transition: color 0.3s ease;
}

.nexus-sidebar-themed {
  border-right: 0 !important;
}

.nexus-sidebar-menu-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.nexus-sidebar-themed .nexus-sidebar-menu-container {
  border-right: 1px solid var(--nexus-border-color) !important;
  overflow: hidden;
}

.nexus-sidebar-logo-themed {
  border-bottom-color: transparent !important;
}

.nexus-sidebar-logo-themed .nexus-sidebar-logo-icon,
.nexus-sidebar-logo-themed .nexus-sidebar-logo-text {
  color: #fff !important;
}

.nexus-sidebar-menu {
  flex: 1;
  overflow-y: auto;
  border-right: none;
  padding-top: 0px;
}

/*.nexus-sidebar-logo-themed[style*="background"] + .nexus-sidebar-menu {
  padding-top: 0px;
}*/
.nexus-sidebar-dragover {
  position: relative;
  outline: 2px dashed var(--nexus-primary-color);
  outline-offset: -2px;
  background-color: color-mix(in srgb, var(--nexus-primary-color) 6%, transparent);
}

.nexus-sidebar-drop-overlay {
  position: absolute;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.nexus-sidebar-drop-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--nexus-primary-color);
  font-size: 14px;
  font-weight: 500;
  animation: nexus-drop-pulse 1.2s ease-in-out infinite;
}

@keyframes nexus-drop-pulse {

  0%,
  100% {
    transform: scale(1);
    opacity: 0.8;
  }

  50% {
    transform: scale(1.05);
    opacity: 1;
  }
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  font-size: var(--nexus-font-size-base) !important;
}

:deep(.el-menu-item .el-icon),
:deep(.el-sub-menu__title .el-icon) {
  font-size: calc(var(--nexus-font-size-base) + 2px) !important;
  width: calc(var(--nexus-font-size-base) + 2px) !important;
}

:deep(.el-menu-item.is-active) {
  background-color: color-mix(in srgb, var(--nexus-primary-color) 8%, transparent) !important;
  color: var(--nexus-primary-color) !important;
}

:deep(.el-menu-item.is-active .el-icon) {
  color: var(--nexus-primary-color) !important;
}

.nexus-sidebar-collapsed .nexus-sidebar-menu :deep(.el-menu-item),
.nexus-sidebar-collapsed .nexus-sidebar-menu :deep(.el-sub-menu__title) {
  padding: 0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nexus-sidebar-collapsed .nexus-sidebar-menu :deep(.el-menu-item > div),
.nexus-sidebar-collapsed .nexus-sidebar-menu :deep(.el-sub-menu__title > div) {
  padding: 0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
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
  border: none;
  background-color: transparent;
  color: var(--nexus-text-color-secondary);
  transition: all 0.25s ease;
  margin-left: 0 !important;
}

.nexus-header-right :deep(.el-button:hover),
.nexus-header-left :deep(.el-button:hover) {
  background-color: var(--nexus-bg-color-dark);
  color: var(--nexus-primary-color);
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

.nexus-tabs-divider {
  width: 1px;
  height: 20px;
  background-color: var(--nexus-border-color);
  margin: auto 4px;
  flex-shrink: 0;
}

.nexus-tabs-close-all-btn {
  flex-shrink: 0;
  margin: auto 6px auto 4px !important;
  border: none !important;
  background-color: transparent !important;
  color: var(--nexus-text-color-secondary) !important;
}

.nexus-tabs-close-all-btn:hover {
  color: var(--nexus-text-color) !important;
  background-color: var(--nexus-bg-color-dark) !important;
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

.nexus-start-btn-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: var(--nexus-footer-height);
  
}

.nexus-start-btn-wrapper button {
  width: 100%;
  height: 40px;
  border-radius: 0px !important;
  border-width: 0px;
  border-top-width: 1px;
  font-size: 24px;
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
