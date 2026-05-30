<template><div class="nexus-taskbar" :class="{ 'nexus-taskbar-dark': isDark }">
    <div class="nexus-taskbar-left">
      <StartMenu @open-page="onMenuOpen">
        <template #reference>
          <button class="nexus-taskbar-btn nexus-taskbar-start"><WindowsStartIcon :size="20" /></button>
        </template>
      </StartMenu>
    </div>
    <div class="nexus-taskbar-center">
      <el-tooltip content="搜索 (⌘K)" placement="top"><button class="nexus-taskbar-btn" @click="openSearch"><el-icon :size="18"><Search /></el-icon></button></el-tooltip>
      <div class="nexus-taskbar-divider" />
      <div v-for="win in windowStore.items" :key="win.id" class="nexus-taskbar-item" :class="{ 'nexus-taskbar-item-active': win.id === windowStore.activeId }" @click="switchToWindow(win.id)" @mouseenter="showPreview(win.id, $event)" @mouseleave="hidePreview">
        <el-icon :size="18" class="nexus-taskbar-item-icon"><component :is="getIconComponent(win.icon)" /></el-icon>
        <span class="nexus-taskbar-item-label">{{ win.title }}</span>
        <div v-if="win.id === windowStore.activeId" class="nexus-taskbar-item-indicator" />
      </div>
    </div>
    <div class="nexus-taskbar-right">
      <NotificationBell />
      <el-tooltip content="首页" placement="top"><button class="nexus-taskbar-btn nexus-taskbar-tray-btn" @click="openHome"><el-icon :size="18"><Monitor /></el-icon></button></el-tooltip>
      <el-dropdown trigger="click" @command="onLocaleChange"><button class="nexus-taskbar-btn nexus-taskbar-tray-btn"><GlobeIcon :size="16" /></button><template #dropdown><el-dropdown-menu><el-dropdown-item command="zh-CN">中文</el-dropdown-item><el-dropdown-item command="en">English</el-dropdown-item></el-dropdown-menu></template></el-dropdown>
      <el-tooltip content="切换主题" placement="top"><button class="nexus-taskbar-btn nexus-taskbar-tray-btn" @click="themeStore.toggleTheme()"><el-icon :size="16"><component :is="themeStore.theme === 'dark' ? 'Sunny' : 'Moon'" /></el-icon></button></el-tooltip>
      <el-dropdown v-if="userStore.isLoggedIn" trigger="click" @command="onUserCommand"><button class="nexus-taskbar-btn nexus-taskbar-tray-btn"><el-avatar :size="22" :src="userStore.user?.avatar||''" shape="square">{{ userInitial }}</el-avatar></button><template #dropdown><el-dropdown-menu><el-dropdown-item command="preferences"><el-icon><Setting /></el-icon> 偏好设置</el-dropdown-item><el-dropdown-item command="logout"><el-icon><SwitchButton /></el-icon> 退出登录</el-dropdown-item></el-dropdown-menu></template></el-dropdown>
      <div class="nexus-taskbar-clock"><div class="nexus-taskbar-clock-time">{{ clockTime }}</div><div class="nexus-taskbar-clock-date">{{ clockDate }}</div></div>
    </div>
    <Teleport to="body"><div v-if="previewVisible" class="nexus-taskbar-preview" :style="previewStyle" @mouseenter="previewKeep = true" @mouseleave="previewKeep = false; hidePreview()" @click="switchToWindow(previewWinId)">
        <div class="nexus-taskbar-preview-header"><el-icon v-if="previewWin?.icon" :size="14"><component :is="getIconComponent(previewWin.icon)" /></el-icon><span>{{ previewWin?.title }}</span></div>
        <div class="nexus-taskbar-preview-thumb"><el-icon :size="48" color="var(--nexus-text-color-placeholder)"><component :is="previewWin ? getIconComponent(previewWin.icon) : 'Monitor'" /></el-icon></div>
      </div></Teleport>
  </div></template>
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useWindowStore } from '../../stores/windows'
import { useThemeStore } from '../../stores/theme'
import { useI18nStore } from '../../stores/i18n'
import { useUserStore } from '../../stores/user'
import * as Icons from '@element-plus/icons-vue'
import { Search, Setting, SwitchButton, Monitor } from '@element-plus/icons-vue'
import GlobeIcon from '../GlobeIcon.vue'
import NotificationBell from '../common/NotificationBell.vue'
import WindowsStartIcon from './WindowsStartIcon.vue'
import StartMenu from './StartMenu.vue'
const emit = defineEmits(['open-page', 'open-search', 'open-preferences', 'open-home'])
const windowStore = useWindowStore()
const themeStore = useThemeStore()
const i18nStore = useI18nStore()
const userStore = useUserStore()
const { t } = i18nStore
const isDark = computed(() => themeStore.theme === 'dark')
const userInitial = computed(() => (userStore.user?.username || 'U').charAt(0).toUpperCase())
const clockTime = ref('')
const clockDate = ref('')
let clockTimer = null
function updateClock() {
  const now = new Date()
  clockTime.value = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  clockDate.value = now.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', weekday: 'short' })
}
onMounted(() => { updateClock(); clockTimer = setInterval(updateClock, 30000) })
onUnmounted(() => { if (clockTimer) clearInterval(clockTimer) })
function switchToWindow(id) { windowStore.activate(id); hidePreview() }
function onMenuOpen(item) { emit('open-page', item) }
function openSearch() { emit('open-search') }
function openHome() { emit('open-home') }
const previewVisible = ref(false)
const previewWinId = ref(null)
const previewWin = computed(() => windowStore.items.find(w => w.id === previewWinId.value))
const previewStyle = ref({})
let previewTimer = null
const previewKeep = ref(false)
function showPreview(id, event) {
  previewWinId.value = id
  const rect = event.currentTarget.getBoundingClientRect()
  const taskbarRect = event.currentTarget.closest('.nexus-taskbar')?.getBoundingClientRect()
  const tw = 240, th = 160
  let left = rect.left + rect.width / 2 - tw / 2
  left = Math.max(8, Math.min(left, window.innerWidth - tw - 8))
  const top = (taskbarRect?.top || rect.top) - th - 8
  previewStyle.value = { left: left + 'px', top: top + 'px', width: tw + 'px', height: th + 'px' }
  clearTimeout(previewTimer)
  previewTimer = setTimeout(() => { previewVisible.value = true }, 300)
}
function hidePreview() {
  clearTimeout(previewTimer)
  setTimeout(() => { if (!previewKeep.value) previewVisible.value = false }, 100)
}
function onLocaleChange(loc) { i18nStore.setLocale(loc) }
function onUserCommand(cmd) {
  if (cmd === 'preferences') emit('open-preferences')
  else if (cmd === 'logout') userStore.logout()
}
function getIconComponent(n) { return n ? Icons[n] || null : null }
</script>

<style scoped>
.nexus-taskbar {
  display: flex; align-items: center; height: var(--nexus-taskbar-height);
  padding: 0 12px; background: var(--nexus-taskbar-bg);
  backdrop-filter: blur(var(--nexus-taskbar-blur));
  -webkit-backdrop-filter: blur(var(--nexus-taskbar-blur));
  border-top: 1px solid rgba(255,255,255,0.08);
  position: relative; z-index: 200; user-select: none; gap: 8px;
}
.nexus-taskbar-left { display: flex; align-items: center; gap: 4px; }
.nexus-taskbar-center { flex: 1; display: flex; align-items: center; gap: var(--nexus-taskbar-item-gap); justify-content: center; overflow: hidden; }
.nexus-taskbar-right { display: flex; align-items: center; gap: 2px; flex-shrink: 0; }
.nexus-taskbar-btn {
  display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; border: none; background: transparent;
  color: var(--nexus-text-color); border-radius: var(--nexus-taskbar-item-radius);
  cursor: pointer; transition: all 0.15s ease; padding: 0;
}
.nexus-taskbar-btn:hover { background: rgba(255,255,255,0.1); }
.nexus-taskbar-start { width: 40px; height: 40px; }
.nexus-taskbar-start:hover { background: rgba(255,255,255,0.08); color: var(--nexus-primary-color); }
.nexus-taskbar-divider { width: 1px; height: 24px; background: rgba(128,128,128,0.2); margin: 0 4px; flex-shrink: 0; }
.nexus-taskbar-item {
  display: flex; align-items: center; gap: 6px; padding: 6px 12px;
  border-radius: var(--nexus-taskbar-item-radius); cursor: pointer;
  transition: all 0.15s ease; position: relative; max-width: 160px; color: var(--nexus-text-color);
}
.nexus-taskbar-item:hover { background: rgba(255,255,255,0.08); }
.nexus-taskbar-item-active { background: rgba(255,255,255,0.12); }
.nexus-taskbar-item-label { font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.nexus-taskbar-item-icon { flex-shrink: 0; }
.nexus-taskbar-item-indicator {
  position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%);
  width: 20px; height: 3px; border-radius: 2px; background: var(--nexus-primary-color);
}
.nexus-taskbar-tray-btn { width: 32px; height: 32px; }
.nexus-taskbar-clock { display: flex; flex-direction: column; align-items: center; line-height: 1.15; padding: 0 6px; cursor: default; }
.nexus-taskbar-clock-time { font-size: 11px; font-weight: 600; color: var(--nexus-text-color); }
.nexus-taskbar-clock-date { font-size: 10px; color: var(--nexus-text-color-secondary); }
.nexus-taskbar-preview {
  position: fixed; z-index: 9999; background: var(--nexus-window-bg);
  backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
  border-radius: 12px; box-shadow: 0 8px 40px rgba(0,0,0,0.25);
  border: 1px solid rgba(255,255,255,0.15); display: flex; flex-direction: column; overflow: hidden; cursor: pointer;
  animation: nexus-preview-in 0.15s ease-out;
}
@keyframes nexus-preview-in {
  from { opacity: 0; transform: translateY(8px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.nexus-taskbar-preview-header {
  display: flex; align-items: center; gap: 6px; padding: 8px 12px;
  font-size: 12px; font-weight: 500; color: var(--nexus-text-color);
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.nexus-taskbar-preview-thumb { flex: 1; display: flex; align-items: center; justify-content: center; padding: 16px; min-height: 100px; }
html.dark .nexus-taskbar-preview { border-color: rgba(255,255,255,0.08); }
</style>