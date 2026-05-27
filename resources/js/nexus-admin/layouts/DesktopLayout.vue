<template>
  <div class="nexus-desktop-layout">
    <!-- 顶部栏 -->
    <header class="nexus-header">
      <div class="nexus-header-left">
        <span class="nexus-header-title">{{ appName }}</span>
      </div>
      <div class="nexus-header-center">
        <!-- 桌面图标区域 -->
      </div>
      <div class="nexus-header-right">
        <!-- 通知铃铛 -->
        <NotificationBell />

        <!-- 主题切换 + 布局切换（零间距分组） -->
        <div style="display: flex; align-items: center; gap: 0;">

          <el-tooltip :content="t('theme.toggle')" placement="bottom">
            <el-button :icon="themeStore.theme === 'dark' ? 'Sunny' : 'Moon'" circle @click="themeStore.toggleTheme()" />
          </el-tooltip>
          <el-tooltip :content="t('layout.toggle')" placement="bottom">
            <el-button icon="Grid" circle @click="appStore.toggleLayout()" />
          </el-tooltip>
        </div>

        <!-- 尺寸切换 -->
        <el-dropdown @command="(val) => uiSizeStore.setSize(val)">
          <el-button>
            <span style="font-size:13px;font-weight:600">{{ uiSizeStore.size.charAt(0).toUpperCase() }}</span>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="small" :class="{ 'is-active': uiSizeStore.size === 'small' }">S - Small</el-dropdown-item>
              <el-dropdown-item command="medium" :class="{ 'is-active': uiSizeStore.size === 'medium' }">M - Medium</el-dropdown-item>
              <el-dropdown-item command="large" :class="{ 'is-active': uiSizeStore.size === 'large' }">L - Large</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <!-- 语言切换 -->
        <el-dropdown @command="handleLocaleChange">
          <el-button>
            <globe-icon style="vertical-align: middle;" /> {{ localeDisplay }}
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="zh-CN">中文</el-dropdown-item>
              <el-dropdown-item command="en">English</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <!-- 用户菜单 -->
        <el-dropdown @command="handleUserCommand" v-if="userStore.isLoggedIn">
          <el-button class="nexus-user-btn">
            <el-avatar
              :size="22"
              :src="userStore.user?.avatar || ''"
              class="nexus-user-avatar"
            >{{ userInitial }}</el-avatar>
            <span style="margin-left: 4px;">{{ userStore.user?.nickname }}</span>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <el-icon><InfoFilled /></el-icon>
                {{ t('login.profile') }}
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <el-icon><SwitchButton /></el-icon>
                {{ t('login.logout') }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <!-- 桌面区域 -->
    <main class="nexus-desktop">
      <!-- 桌面图标网格 -->
      <div class="nexus-desktop-icons">
        <div
          v-for="item in menuStore.desktopItems"
          :key="item.id"
          class="nexus-desktop-icon"
          @click="handleItemClick(item)"
        >
          <div
            class="nexus-desktop-icon-img"
            :class="{ 'nexus-desktop-icon-img-folder': item.isFolder }"
          >
            <el-icon :size="item.isFolder ? 28 : 32">
              <component :is="item.isFolder ? 'FolderOpened' : getIconComponent(item.icon)" />
            </el-icon>
          </div>
          <span class="nexus-desktop-icon-label">{{ item.title }}</span>
        </div>
      </div>

      <!-- 窗口容器 -->
      <div class="nexus-desktop-windows">
        <div
          v-for="(win, index) in windowStore.items"
          :key="win.id"
          class="nexus-window"
          :class="{ 'nexus-window-active': win.id === windowStore.activeId }"
          :style="getWindowStyle(win.id, index)"
          @mousedown="onWindowMouseDown(win.id)"
        >
          <!-- 窗口标题栏 -->
          <div
            class="nexus-window-header"
            @mousedown.prevent="startDrag($event, win.id)"
          >
            <span class="nexus-window-title">
              <el-icon v-if="win.icon" size="14">
                <component :is="getIconComponent(win.icon)" />
              </el-icon>
              {{ win.title }}
            </span>
            <div class="nexus-window-actions">
              <el-button
                icon="Close"
                circle
                text
                @click="windowStore.close(win.id)"
              />
            </div>
          </div>

          <!-- 窗口内容 -->
          <div class="nexus-window-body">
            <component
              :is="getPageComponent(win.component)"
              v-bind="win.params || {}"
              @open="(child) => windowStore.open(child)"
            />
          </div>
        </div>
      </div>

      <!-- iOS 风格文件夹弹出层 -->
      <FolderView
        v-if="currentFolder"
        :folder="currentFolder"
        @open="(child) => windowStore.open(child)"
        @close="closeFolder"
      />
    </main>

    <!-- 底部栏 -->
    <footer class="nexus-footer">
      <span>{{ footerText }}</span>
    </footer>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useAppStore } from '../stores/app'
import { useMenuStore } from '../stores/menu'
import { useWindowStore } from '../stores/windows'
import { useThemeStore } from '../stores/theme'
import { useI18nStore } from '../stores/i18n'
import { useConfigStore } from '../stores/config'
import hookManager from '../utils/hook-manager'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import GlobeIcon from '../components/GlobeIcon.vue'
import NotificationBell from '../components/common/NotificationBell.vue'
import { useWindowDrag } from '../composables/useWindowDrag'

import { useUserStore } from '../stores/user'
import { useUiSizeStore } from '../stores/size'
import FolderView from '../components/desktop/FolderView.vue'

const appStore = useAppStore()
const menuStore = useMenuStore()
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

const localeDisplay = computed(() => {
  const map = { 'zh-CN': '中文', 'en': 'English' }
  return map[currentLocale.value] || currentLocale.value
})

const userInitial = computed(() => {
  if (!userStore.user?.nickname) return 'U'
  return userStore.user.nickname.charAt(0)
})

const { getWindowRect, startDrag } = useWindowDrag()
const pageCache = {}
const currentFolder = ref(null)

function getIconComponent(iconName) {
  if (!iconName) return null
  return ElementPlusIconsVue[iconName] || null
}

function getPageComponent(componentName) {
  if (!componentName) return null
  if (pageCache[componentName]) return pageCache[componentName]
  const pages = window.__NEXUS_ADMIN_PAGES__ || {}
  const component = pages[componentName]
  if (component) {
    pageCache[componentName] = component
    return component
  }
  return null
}

function getWindowStyle(windowId, index) {
  const rect = getWindowRect(windowId, index)
  const zIndex = windowId === windowStore.activeId ? 100 : (10 + index)
  return {
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    zIndex
  }
}

function onWindowMouseDown(windowId) {
  windowStore.activate(windowId)
}

function handleItemClick(item) {
  if (item.isFolder) {
    openFolder(item)
  } else {
    windowStore.open(item)
  }
}

function openFolder(folder) {
  currentFolder.value = folder
}

function closeFolder() {
  currentFolder.value = null
}

function handleLocaleChange(locale) {
  i18nStore.setLocale(locale)
}

function handleUserCommand(command) {
  if (command === 'logout') {
    userStore.logout()
  }
}
</script>

<style scoped>
.nexus-desktop-layout { display: flex; flex-direction: column; height: 100vh; background-color: var(--nexus-bg-color); }
.nexus-header { display: flex; align-items: center; justify-content: space-between; height: var(--nexus-header-height); padding: 0 16px; background-color: var(--nexus-bg-color-light); border-bottom: 1px solid var(--nexus-border-color); z-index: 100; }
.nexus-header-title { font-size: var(--nexus-font-size-lg); font-weight: 600; }
.nexus-header-right { display: flex; align-items: center; gap: 4px; }
.nexus-header-right :deep(.el-button) { border: none; background-color: transparent; color: var(--nexus-text-color-secondary); transition: all 0.25s ease; }
.nexus-header-right :deep(.el-button:hover) { background-color: var(--nexus-bg-color-dark); color: var(--nexus-primary-color); }
.nexus-header-right :deep(.el-button.is-disabled), .nexus-header-right :deep(.el-button.is-disabled:hover) { background-color: transparent; color: var(--nexus-text-color-placeholder); }
[data-theme="dark"] .nexus-header-right :deep(.el-button:hover) { background-color: rgba(255, 255, 255, 0.08); }

.nexus-desktop { flex: 1; position: relative; overflow: hidden; user-select: none; -webkit-user-select: none; }
.nexus-desktop-icons { display: grid; grid-template-columns: repeat(auto-fill, 80px); gap: 16px; padding: 24px; justify-content: center; align-content: start; }
.nexus-desktop-icon { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 12px 8px; cursor: pointer; border-radius: var(--nexus-border-radius); transition: background-color 0.2s; user-select: none; }
.nexus-desktop-icon:hover { background-color: var(--nexus-bg-color-dark); }
.nexus-desktop-icon-img { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; background-color: var(--nexus-bg-color-light); border-radius: 12px; box-shadow: var(--nexus-box-shadow); transition: all 0.2s; }
.nexus-desktop-icon-img :deep(.el-icon) { font-size: 32px !important; }
[data-ui-size="small"] .nexus-desktop-icon-img { width: 40px; height: 40px; }
[data-ui-size="small"] .nexus-desktop-icon-img :deep(.el-icon) { font-size: 24px !important; }
[data-ui-size="large"] .nexus-desktop-icon-img { width: 56px; height: 56px; }
[data-ui-size="large"] .nexus-desktop-icon-img :deep(.el-icon) { font-size: 36px !important; }
.nexus-desktop-icon-label { font-size: var(--nexus-font-size-sm); text-align: center; word-break: break-all; line-height: 1.3; }
.nexus-desktop-windows { position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; }
.nexus-window { position: absolute; background-color: var(--nexus-bg-color-light); border-radius: 8px; box-shadow: var(--nexus-box-shadow); display: flex; flex-direction: column; pointer-events: auto; overflow: hidden; transition: box-shadow 0.2s; }
.nexus-window-active { z-index: 100; box-shadow: 0 4px 24px 0 rgba(0, 0, 0, 0.15); }
.nexus-window-header { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background-color: var(--nexus-bg-color); border-bottom: 1px solid var(--nexus-border-color); cursor: move; }
.nexus-window-title { display: flex; align-items: center; gap: 6px; font-size: var(--nexus-font-size-base); font-weight: 500; }
.nexus-window-body { flex: 1; overflow: auto; padding: 16px; }
.nexus-footer { display: flex; align-items: center; justify-content: center; height: var(--nexus-footer-height); font-size: var(--nexus-font-size-sm); color: var(--nexus-text-color-secondary); background-color: var(--nexus-bg-color-light); border-top: 1px solid var(--nexus-border-color); }
</style>