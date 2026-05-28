<template>
  <div class="nexus-sidebar-layout">
    <aside
      class="nexus-sidebar"
      :class="{ 'nexus-sidebar-collapsed': appStore.sidebarCollapsed, 'nexus-sidebar-themed': hasHeaderColor }"
    >
      <div class="nexus-sidebar-logo" :class="{ 'nexus-sidebar-logo-themed': hasHeaderColor }" :style="hasHeaderColor ? headerStyle : {}">

        <div class="nexus-sidebar-logo-inner" :class="{ 'nexus-sidebar-logo-collapsed': appStore.sidebarCollapsed }">
          <el-icon class="nexus-sidebar-logo-icon" :size="logoIconSize">
            <TrendCharts />
          </el-icon>
          <span v-show="!appStore.sidebarCollapsed" class="nexus-sidebar-logo-text">{{ appName }}</span>
        </div>
      </div>

      <el-menu
        :default-active="windowStore.activeId"
        :collapse="appStore.sidebarCollapsed"
        :collapse-transition="false"
        class="nexus-sidebar-menu"
        @select="handleMenuSelect"
      >
        <template v-for="item in menuStore.sidebarMenus" :key="item.id">
          <el-sub-menu v-if="item.children && item.children.length > 0" :index="item.id">
            <template #title>
              <el-icon v-if="item.icon">
                <component :is="getIconComponent(item.icon)" />
              </el-icon>
              <span>{{ t('menu.' + item.id, item.title) }}</span>
            </template>
            <el-menu-item v-for="child in item.children" :key="child.id" :index="child.id">
              <el-icon v-if="child.icon">
                <component :is="getIconComponent(child.icon)" />
              </el-icon>
              <template #title>{{ t('menu.' + child.id, child.title) }}</template>
            </el-menu-item>
          </el-sub-menu>

          <el-menu-item v-else :index="item.id">
            <el-icon v-if="item.icon">
              <component :is="getIconComponent(item.icon)" />
            </el-icon>
            <template #title>{{ t('menu.' + item.id) }}</template>
          </el-menu-item>
        </template>
      </el-menu>
    </aside>

    <div class="nexus-main-area">
      <header class="nexus-header" :style="headerStyle">

        <div class="nexus-header-left">
          <el-button
            :icon="appStore.sidebarCollapsed ? 'Expand' : 'Fold'"
            circle
            @click="appStore.toggleSidebar()"
          />
          <!-- 全局搜索 -->
          <GlobalSearch />
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

          <el-dropdown @command="handleUserCommand" v-if="userStore.isLoggedIn">
            <el-button class="nexus-user-btn" style="padding-right: 0 !important;">
              <el-avatar :size="22" :src="userStore.user?.avatar || ''" class="nexus-user-avatar">{{ userInitial }}</el-avatar>
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

      <div class="nexus-tabs" v-if="configStore.get('tabMode', true) && windowStore.items.length > 0">

        <div class="nexus-tabs-wrapper" ref="tabsWrapperRef">
          <div v-for="tab in windowStore.items" :key="tab.id" class="nexus-tab" :class="{ 'nexus-tab-active': tab.id === windowStore.activeId }" @click="windowStore.activate(tab.id)">
            <span class="nexus-tab-label">{{ tab.title }}</span>
            <el-icon class="nexus-tab-close" size="12" @click.stop="windowStore.close(tab.id)"><Close /></el-icon>
          </div>
        </div>
        <div class="nexus-tabs-actions">
          <el-button class="nexus-tab-btn" :icon="ArrowLeft" circle @click="scrollTabs(-1)" :disabled="!canScrollLeft" />
          <el-button class="nexus-tab-btn" :icon="ArrowRight" circle @click="scrollTabs(1)" :disabled="!canScrollRight" />
          <!--<el-button class="nexus-tab-btn" :icon="Refresh" circle @click="refreshCurrentTab" />-->
        </div>

      </div>

      <main class="nexus-content">
        <div v-if="windowStore.items.length > 0" class="nexus-content-pages">
          <div v-for="tab in windowStore.items" :key="tab.id" class="nexus-content-page" v-show="tab.id === windowStore.activeId">
            <component :is="getPageComponent(tab.component)" :key="tab.id + (refreshKey > 0 && tab.id === windowStore.activeId ? '-' + refreshKey : '')" />
          </div>
        </div>
        <div v-else class="nexus-content-empty">
          <el-empty :description="t('common.noData')" />
        </div>
      </main>

      <footer class="nexus-footer">
        <span>{{ footerText }}</span>
      </footer>
    </div>
    <!-- 偏好设置面板 -->
    <PreferencesPanel ref="preferencesRef" />
  </div>

</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'

import { useAppStore } from '../stores/app'
import { useMenuStore } from '../stores/menu'
import { useWindowStore } from '../stores/windows'
import { useThemeStore } from '../stores/theme'
import { useI18nStore } from '../stores/i18n'
import { useConfigStore } from '../stores/config'
import { useUserStore } from '../stores/user'
import { useUiSizeStore } from '../stores/size'
import hookManager from '../utils/hook-manager'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { ArrowLeft, ArrowRight, Refresh } from '@element-plus/icons-vue'
import GlobeIcon from '../components/GlobeIcon.vue'
import NotificationBell from '../components/common/NotificationBell.vue'
import GlobalSearch from '../components/common/GlobalSearch.vue'
import PreferencesPanel from '../components/PreferencesPanel.vue'


import { ElMessage } from 'element-plus'


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

// 偏好设置面板
const preferencesRef = ref(null)

// 顶部背景色
const hasHeaderColor = computed(() => !!configStore.get('headerColor', ''))
const headerStyle = computed(() => {
  const color = configStore.get('headerColor', '')
  return color ? { background: color, borderBottom: 'none' } : {}
})

const localeDisplay = computed(() => {

  const map = { 'zh-CN': '中文', 'en': 'English' }
  return map[currentLocale.value] || currentLocale.value
})

const userInitial = computed(() => {
  if (!userStore.user?.nickname) return 'U'
  return userStore.user.nickname.charAt(0)
})

const logoIconSize = computed(() => {
  const collapsed = appStore.sidebarCollapsed
  const baseSizes = { small: collapsed ? 22 : 20, medium: collapsed ? 26 : 22, large: collapsed ? 30 : 26 }
  return baseSizes[uiSizeStore.size] || baseSizes.medium
})

// Tab 刷新计数器（递增使组件重新渲染）
const refreshKey = ref(0)

// Tab 滚动
const tabsWrapperRef = ref(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

function updateScrollState() {
  const el = tabsWrapperRef.value
  if (el) {
    canScrollLeft.value = el.scrollLeft > 0
    canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth
  }
}

function scrollTabs(dir) {
  if (tabsWrapperRef.value) {
    tabsWrapperRef.value.scrollBy({ left: dir * 200, behavior: 'smooth' })
  }
}

onMounted(() => {
  const el = tabsWrapperRef.value
  if (el) {
    el.addEventListener('scroll', updateScrollState)
    // 使用 MutationObserver 监听 tabs 内容变化
    const observer = new MutationObserver(updateScrollState)
    observer.observe(el, { childList: true, subtree: true })
    updateScrollState()
  }
})

onUnmounted(() => {
  const el = tabsWrapperRef.value
  if (el) {
    el.removeEventListener('scroll', updateScrollState)
  }
})


function refreshCurrentTab() {
  refreshKey.value++
  ElMessage.success('已刷新')
}

const pageCache = {}

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

async function handleMenuSelect(index) {
  const item = menuStore.findMenuByComponent(index) || menuStore.findMenuByRoute(index)
  if (item) {
    await hookManager.emit('menu:item-click', item)
    // tabMode=false 时，侧边栏只保留当前一个页面记录
    if (!configStore.get('tabMode', true)) {
      windowStore.closeAll()
    }
    windowStore.open(item)
  }
}


function handleLocaleChange(locale) {
  i18nStore.setLocale(locale)
}

function handleUserCommand(command) {
  if (command === 'preferences') {
    preferencesRef.value?.open()
  } else if (command === 'logout') {
    userStore.logout()
  }
}

</script>

<style scoped>
.nexus-sidebar-layout { display: flex; height: 100vh; overflow: hidden; }
.nexus-sidebar { width: var(--nexus-sidebar-width); background-color: var(--nexus-bg-color-light); border-right: 1px solid var(--nexus-border-color); display: flex; flex-direction: column; transition: width 0.3s; overflow: hidden; }
.nexus-sidebar-collapsed { width: var(--nexus-sidebar-collapsed-width); }
.nexus-sidebar-logo { height: var(--nexus-header-height); display: flex; align-items: center; justify-content: center; border-bottom: 1px solid var(--nexus-border-color); transition: background 0.3s ease; }
.nexus-sidebar-logo-inner { display: flex; align-items: center; gap: 6px; }
.nexus-sidebar-logo-collapsed { justify-content: center; margin-left: 0; gap: 0; }


.nexus-sidebar-logo-icon { color: var(--nexus-text-color) !important; transition: font-size 0.3s ease, color 0.3s ease; }
.nexus-sidebar-logo-text { font-size: calc(var(--nexus-font-size-lg) + 6px); font-weight: 700; color: var(--nexus-text-color); white-space: nowrap; transition: color 0.3s ease; }

/* 自定义顶部背景色时，logo 区域文字/图标变白，边框隐藏 */
.nexus-sidebar-themed { border-right: 0 !important; }
.nexus-sidebar-themed .nexus-sidebar-menu { border-right: 1px solid var(--nexus-border-color) !important; }
.nexus-sidebar-logo-themed { border-bottom-color: transparent !important; }
.nexus-sidebar-logo-themed .nexus-sidebar-logo-icon,
.nexus-sidebar-logo-themed .nexus-sidebar-logo-text { color: #fff !important; }

.nexus-sidebar-menu { flex: 1; overflow-y: auto; border-right: none; padding-top: 10px; }

:deep(.el-menu-item), :deep(.el-sub-menu__title) { font-size: var(--nexus-font-size-base) !important; }
:deep(.el-menu-item .el-icon), :deep(.el-sub-menu__title .el-icon) { font-size: calc(var(--nexus-font-size-base) + 2px) !important; width: calc(var(--nexus-font-size-base) + 2px) !important; }
:deep(.el-menu-item.is-active) { color: var(--el-menu-active-color) !important; }
:deep(.el-menu-item.is-active .el-icon) { color: var(--el-menu-active-color) !important; }

/* 侧边栏收起时，el-menu-item 的 li 及内部 div 默认 padding 导致图标不居中 */
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



.nexus-main-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.nexus-header { display: flex; align-items: center; justify-content: space-between; height: var(--nexus-header-height); padding: 0 16px 0 5px; background-color: var(--nexus-bg-color-light); border-bottom: 1px solid var(--nexus-border-color); z-index: 100; transition: background 0.3s ease; }

/* 自定义顶部背景色时，header 内所有按钮/文字变白 */
.nexus-header[style*="background"] .nexus-header-right :deep(.el-button),
.nexus-header[style*="background"] .nexus-header-left :deep(.el-button) { color: rgba(255,255,255,0.9) !important; }
.nexus-header[style*="background"] .nexus-header-right :deep(.el-button:hover),
.nexus-header[style*="background"] .nexus-header-left :deep(.el-button:hover) { background-color: rgba(255,255,255,0.15) !important; color: #fff !important; }
.nexus-header[style*="background"] .nexus-user-btn span { color: rgba(255,255,255,0.9) !important; }
.nexus-user-btn { padding-right: 0 !important; }

.nexus-header-right { display: flex; align-items: center; gap: 4px; }

.nexus-header-right :deep(.el-button) { border: none; background-color: transparent; color: var(--nexus-text-color-secondary); transition: all 0.25s ease; margin-left: 0 !important; padding-left: 8px !important; padding-right: 8px !important; }
.nexus-header-right :deep(.el-button:hover) { background-color: var(--nexus-bg-color-dark); color: var(--nexus-primary-color); }
.nexus-header-left :deep(.el-button) { border: none; background-color: transparent; color: var(--nexus-text-color-secondary); transition: all 0.25s ease; margin-left: 0 !important; }
.nexus-header-left :deep(.el-button:hover) { background-color: var(--nexus-bg-color-dark); color: var(--nexus-primary-color); }
[data-theme="dark"] .nexus-header-right :deep(.el-button:hover), [data-theme="dark"] .nexus-header-left :deep(.el-button:hover) { background-color: rgba(255, 255, 255, 0.08); }

.nexus-tabs {  height: var(--nexus-tab-height); background-color: var(--nexus-bg-color); border-bottom: 1px solid var(--nexus-border-color); display: flex; align-items: stretch; overflow: hidden; padding-left: 0px; }


.nexus-tabs-wrapper { display: flex; align-items: stretch; overflow-x: auto; flex: 1; }
.nexus-tab { margin-top: 0px;; display: flex; align-items: center; gap: 6px; padding: 0 14px 0 28px; font-size: var(--nexus-font-size-sm); cursor: pointer; white-space: nowrap; user-select: none; position: relative; color: var(--nexus-text-color-secondary); transition: all 0.2s ease; border-right: 1px solid var(--nexus-border-color);border-top: 0; }
.nexus-tab:last-child { border-right-width: 0px; }
.nexus-tab:hover { background-color: var(--nexus-bg-color-light); color: var(--nexus-text-color); }
.nexus-tab:hover .nexus-tab-close { opacity: 1; }
.nexus-tab-active { background-color: var(--nexus-bg-color-light); color: var(--nexus-primary-color) !important; border-top: 0px solid var(--nexus-border-color);}
.nexus-tab-active::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background-color: var(--nexus-primary-color); border-radius: 1px 1px 0 0; }
.nexus-tab-close { opacity: 0; transition: opacity 0.2s; display: flex; align-items: center; justify-content: center; border-radius: 2px; padding: 1px; }
.nexus-tab-close:hover { background-color: var(--nexus-bg-color-dark); }
.nexus-tab-active .nexus-tab-close { opacity: 0.5; }
.nexus-tab-active:hover .nexus-tab-close { opacity: 1; }

.nexus-header[style*="background"] + .nexus-tabs{background-color: var(--nexus-bg-color-light) !important;}
.nexus-header[style*="background"] + .nexus-tabs .nexus-tab:last-child { border-right-width: 1px; }

.nexus-tabs-actions {
  display: flex;
  align-items: stretch;
  gap: 0;
  /* border-left: 1px solid var(--nexus-border-color); */
  /* padding-right: 16px;*/
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



.nexus-content { flex: 1; overflow: auto; padding: 16px; background-color: var(--nexus-bg-color); }
.nexus-content-pages { position: relative; height: 100%; }
.nexus-content-page { position: absolute; inset: 0; height: 100%; overflow: auto; }
.nexus-content-empty { display: flex; align-items: center; justify-content: center; height: 100%; }
.nexus-footer { display: flex; align-items: center; justify-content: center; height: var(--nexus-footer-height); font-size: var(--nexus-font-size-sm); color: var(--nexus-text-color-secondary); background-color: var(--nexus-bg-color-light); border-top: 1px solid var(--nexus-border-color); }
</style>