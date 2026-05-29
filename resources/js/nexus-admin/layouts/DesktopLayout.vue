<template>
  <div class="nexus-desktop-layout">
    <header class="nexus-header">
      <div class="nexus-header-left">
        <StartMenu @open-page="onMenuOpen">
          <template #reference>
            <el-tooltip :content="t('startMenu.title')" placement="bottom">
              <el-button class="nexus-start-btn" :icon="TrendCharts" circle />
            </el-tooltip>
          </template>
        </StartMenu>
        <span class="nexus-header-title">{{ appName }}</span>
        <GlobalSearch />
      </div>
      <div class="nexus-header-right">
        <NotificationBell />
        <el-tooltip :content="t('theme.toggle')" placement="bottom">
          <el-button :icon="themeStore.theme === 'dark' ? 'Sunny' : 'Moon'" circle @click="themeStore.toggleTheme()" />
        </el-tooltip>
        <el-dropdown @command="(val) => sizeStore.setSize(val)">
          <el-button><span style="font-size:13px;font-weight:600">{{ sizeStore.size.charAt(0).toUpperCase() }}</span></el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="small">S - Small</el-dropdown-item>
              <el-dropdown-item command="medium">M - Medium</el-dropdown-item>
              <el-dropdown-item command="large">L - Large</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-dropdown @command="handleLocaleChange">
          <el-button><globe-icon style="vertical-align: middle;" /> {{ lang }}</el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="zh-CN">中文</el-dropdown-item>
              <el-dropdown-item command="en">English</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-dropdown @command="handleUserCommand" v-if="userStore.isLoggedIn">
          <el-button class="nexus-user-btn" style="padding-right: 0 !important;">
            <el-avatar :size="22" :src="userStore.user?.avatar || ''" :class="{'nexus-user-avatar': true}">{{ userInitial }}</el-avatar>
            <span style="margin-left: 4px;">{{ userStore.user?.nickname }}</span>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="preferences"><el-icon><Setting /></el-icon> {{ t('preferences.title') }}</el-dropdown-item>
              <el-dropdown-item command="profile"><el-icon><InfoFilled /></el-icon> {{ t('login.profile') }}</el-dropdown-item>
              <el-dropdown-item divided command="logout"><el-icon><SwitchButton /></el-icon> {{ t('login.logout') }}</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <PreferencesPanel ref="preferencesRef" />

    <main class="nexus-desktop" @dragover.prevent="onDragOver" @drop.prevent="onDrop">
      <div class="nexus-desktop-icons">
        <div
          v-for="item in disktopStore.rootItems" :key="item.id"
          class="nexus-desktop-icon"
          :data-folder-id="item.type === 'folder' ? item.id : ''"
          @click="handleItemClick(item)"
          @contextmenu.prevent="openContextMenu($event, item)"
        >
          <div class="nexus-desktop-icon-img">
            <el-icon :size="28"><component :is="item.type === 'folder' ? 'FolderOpened' : getIconComponent(item.icon)" /></el-icon>
          </div>
          <span class="nexus-desktop-icon-label">{{ item.title }}</span>
        </div>
        <div v-if="disktopStore.rootItems.length === 0" class="nexus-desktop-empty">
          <el-empty :description="t('startMenu.dragHint')" :image-size="80" />
        </div>
      </div>

      <div class="nexus-desktop-windows">
        <div v-for="(win, idx) in windowStore.items" :key="win.id" class="nexus-window" :class="{ active: win.id === windowStore.activeId }" :style="winStyle(win.id, idx)" @mousedown="windowStore.activate(win.id)">
          <div class="nexus-window-header" @mousedown.prevent="startDrag($event, win.id)">
            <span class="nexus-window-title">{{ win.title }}</span>
            <el-button icon="Close" circle text @click.stop="windowStore.close(win.id)" />
          </div>
          <div class="nexus-window-body"><component :is="getPage(win.component)" /></div>
        </div>
      </div>

      <div v-if="windowStore.items.length === 0" class="nexus-desktop-home">
        <component :is="homePage" />
      </div>

      <FolderView v-if="currentFolder" :folder="currentFolder" @open="(c) => windowStore.open(c)" @close="currentFolder = null" />
    </main>

    <footer class="nexus-footer">{{ footerText }}</footer>

    <ItemEditor :visible="editorVisible" :item="editingItem" :is-new="isNewItem" :position="editorPos" @close="editorVisible = false" @save="onEditorSave" />

    <Teleport to="body">
      <div v-if="ctxVisible" class="nexus-ctx" :style="ctxStyle" @click.stop>
        <div class="nexus-ctx-item" @click="editItem(ctxItem)"><el-icon><Edit /></el-icon>{{ t('common.edit') }}</div>
        <div class="nexus-ctx-item" @click="deleteItem(ctxItem)"><el-icon><Delete /></el-icon>{{ t('common.delete') }}</div>
        <div class="nexus-ctx-divider" />
        <div class="nexus-ctx-item" @click="addFolder"><el-icon><FolderAdd /></el-icon>{{ t('startMenu.newProject') }}</div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useAppStore } from '../stores/app'
import { useMenuStore } from '../stores/menu'
import { useDisktopStore } from '../stores/disktop'
import { useWindowStore } from '../stores/windows'
import { useThemeStore } from '../stores/theme'
import { useI18nStore } from '../stores/i18n'
import { useConfigStore } from '../stores/config'
import { useUserStore } from '../stores/user'
import { useUiSizeStore } from '../stores/size'
import * as Icons from '@element-plus/icons-vue'
import GlobeIcon from '../components/GlobeIcon.vue'
import NotificationBell from '../components/common/NotificationBell.vue'
import GlobalSearch from '../components/common/GlobalSearch.vue'
import { useWindowDrag } from '../composables/useWindowDrag'
import FolderView from '../components/desktop/FolderView.vue'
import StartMenu from '../components/desktop/StartMenu.vue'
import ItemEditor from '../components/desktop/ItemEditor.vue'
import { TrendCharts, Edit, Delete, FolderAdd, Setting, InfoFilled, SwitchButton } from '@element-plus/icons-vue'
import PreferencesPanel from '../components/PreferencesPanel.vue'

const appStore = useAppStore()
const menuStore = useMenuStore()
const disktopStore = useDisktopStore()
const windowStore = useWindowStore()
const themeStore = useThemeStore()
const i18n = useI18nStore()
const config = useConfigStore()
const userStore = useUserStore()
const sizeStore = useUiSizeStore()
const { t } = i18n
const appName = computed(() => config.get('appName', 'Nexus Admin'))
const footerText = computed(() => config.get('footer', ''))
const lang = computed(() => ({ 'zh-CN': '中文', 'en': 'English' })[i18n.locale] || i18n.locale)
const userInitial = computed(() => (userStore.user?.username || 'U').charAt(0).toUpperCase())
const avatarStyle = computed(() => {
  const color = config.get('headerColor', '')
  return color ? { background: '#fff', color: color } : {}
})

const { getWindowRect, startDrag } = useWindowDrag()
const cache = {}
const currentFolder = ref(null)
const preferencesRef = ref(null)
const editorVisible = ref(false)
const editingItem = ref(null)
const isNewItem = ref(false)
const editorPos = ref({ x: 0, y: 0 })
const ctxVisible = ref(false)
const ctxItem = ref(null)
const ctxStyle = ref({})

onMounted(async () => {
  if (!disktopStore.loaded) await disktopStore.loadDisktops()
  if (disktopStore.activeDisktopId) await disktopStore.loadItems()
  document.addEventListener('click', () => ctxVisible.value = false)
})

function getIconComponent(n) { return n ? Icons[n] || null : null }
function getPage(name) { return cache[name] || (cache[name] = (window.__NEXUS_ADMIN_PAGES__ || {})[name] || null) }
function winStyle(id, idx) {
  const r = getWindowRect(id, idx)
  return { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', zIndex: id === windowStore.activeId ? 100 : 10 + idx }
}

function handleItemClick(item) {
  if (item.type === 'folder') currentFolder.value = { ...item, children: disktopStore.getChildren(item.id) }
  else if (item.component) windowStore.open(item)
}
function onMenuOpen(item) { windowStore.open(item) }

function onDragOver(e) { e.dataTransfer.dropEffect = 'copy' }
async function onDrop(e) {
  const data = e.dataTransfer.getData('application/json')
  if (!data) return
  try {
    const item = JSON.parse(data)
    const el = document.elementFromPoint(e.clientX, e.clientY)
    const folder = el?.closest('[data-folder-id]')
    await disktopStore.addItem({ title: item.title, icon: item.icon, component: item.component, path: item.path, type: 'menu', parent_id: folder ? Number(folder.dataset.folderId) || null : null, _copySuffix: ` ${t('startMenu.copy')}` })
  } catch (ex) { console.warn('drop fail', ex) }
}

function openContextMenu(e, item) { ctxVisible.value = true; ctxItem.value = item; ctxStyle.value = { left: e.clientX + 'px', top: e.clientY + 'px' } }
function editItem(item) { ctxVisible.value = false; editingItem.value = item; isNewItem.value = false; editorPos.value = { x: 200, y: 100 }; editorVisible.value = true }
function deleteItem(item) { ctxVisible.value = false; disktopStore.removeItem(item.id) }
async function addFolder() {
  ctxVisible.value = false
  const item = await disktopStore.addItem({ title: t('startMenu.newProject'), icon: 'FolderOpened', type: 'folder' })
  editingItem.value = item; isNewItem.value = false; editorPos.value = { x: 200, y: 100 }; editorVisible.value = true
}
async function onEditorSave(data) {
  if (isNewItem.value) await disktopStore.addItem({ ...data, _skipDedup: true })
  else if (editingItem.value) await disktopStore.updateItem(editingItem.value.id, data)
}

function handleLocaleChange(loc) { i18n.setLocale(loc) }
function handleUserCommand(cmd) {
  if (cmd === 'preferences') preferencesRef.value?.open()
  else if (cmd === 'logout') userStore.logout()
}

// 默认首页（无窗口打开时显示）
const homePage = computed(() => {
  return (window.__NEXUS_ADMIN_PAGES__ || {})['nexus-home'] || null
})
</script>

<style scoped>
.nexus-desktop-layout { display: flex; flex-direction: column; height: 100vh; background: var(--nexus-bg-color); }
.nexus-header { display: flex; align-items: center; justify-content: space-between; height: var(--nexus-header-height); padding: 0 16px; background: var(--nexus-bg-color-light); border-bottom: 1px solid var(--nexus-border-color); z-index: 100; }
.nexus-header-left, .nexus-header-right { display: flex; align-items: center; gap: 8px; }
.nexus-header-title { font-size: var(--nexus-font-size-lg); font-weight: 600; }
.nexus-start-btn { border: none; background: transparent; color: var(--nexus-text-color-secondary); }
.nexus-start-btn:hover { background: var(--nexus-bg-color-dark); color: var(--nexus-primary-color); }
.nexus-header-right :deep(.el-button) { border: none !important; border-color: transparent !important; background: transparent; color: var(--nexus-text-color-secondary); outline: none !important; }
.nexus-header-right :deep(.el-button:hover) { background: var(--nexus-bg-color-dark); color: var(--nexus-primary-color); border: none !important; border-color: transparent !important; outline: none !important; }
.nexus-header-right :deep(.el-button:focus),
.nexus-header-right :deep(.el-button:focus-visible) { border: none !important; border-color: transparent !important; outline: none !important; }
.nexus-user-btn { padding-right: 0 !important; }

.nexus-desktop { flex: 1; position: relative; overflow: hidden; }
.nexus-desktop-icons { display: grid; grid-template-columns: repeat(auto-fill, 80px); gap: 16px; padding: 24px; justify-content: center; }
.nexus-desktop-icon { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 12px 8px; cursor: pointer; border-radius: 8px; }
.nexus-desktop-icon:hover { background: var(--nexus-bg-color-dark); }
.nexus-desktop-icon-img { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; background: var(--nexus-bg-color-light); border-radius: 12px; box-shadow: var(--nexus-box-shadow); }
.nexus-desktop-icon-label { font-size: var(--nexus-font-size-sm); text-align: center; word-break: break-all; }
.nexus-desktop-empty { grid-column: 1 / -1; display: flex; justify-content: center; padding: 60px 0; }
.nexus-desktop-windows { position: absolute; inset: 0; pointer-events: none; }
.nexus-desktop-home { position: absolute; inset: 0; overflow: auto; pointer-events: auto; }
.nexus-window { position: absolute; background: var(--nexus-bg-color-light); border-radius: 8px; box-shadow: var(--nexus-box-shadow); display: flex; flex-direction: column; pointer-events: auto; overflow: hidden; }
.nexus-window-header { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: var(--nexus-bg-color); border-bottom: 1px solid var(--nexus-border-color); cursor: move; }
.nexus-window-title { font-size: var(--nexus-font-size-base); font-weight: 500; }
.nexus-window-body { flex: 1; overflow: auto; padding: 16px; }
.nexus-footer { display: flex; align-items: center; justify-content: center; height: var(--nexus-footer-height); font-size: var(--nexus-font-size-sm); color: var(--nexus-text-color-secondary); background: var(--nexus-bg-color-light); border-top: 1px solid var(--nexus-border-color); }
.nexus-ctx { position: fixed; z-index: 5000; background: var(--nexus-bg-color-light); border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); border: 1px solid var(--nexus-border-color); padding: 4px; min-width: 140px; }
.nexus-ctx-item { display: flex; align-items: center; gap: 8px; padding: 8px 12px; cursor: pointer; border-radius: 6px; font-size: 13px; }
.nexus-ctx-item:hover { background: var(--nexus-bg-color-dark); }
.nexus-ctx-divider { height: 1px; background: var(--nexus-border-color); margin: 4px 8px; }
</style>