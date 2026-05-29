<template>
  <div class="nexus-sidebar-layout">
    <aside class="nexus-sidebar" :class="{
      'nexus-sidebar-collapsed': appStore.sidebarCollapsed,
      'nexus-sidebar-themed': hasHeaderColor,
      'nexus-sidebar-dragover': isDragOver
    }" @dragenter="onSidebarDragEnter" @dragover.prevent="onSidebarDragOver" @dragleave="onSidebarDragLeave"
      @drop.prevent="onSidebarDrop">
      <!--
      <div v-if="isDragOver" class="nexus-sidebar-drop-overlay">
        <div class="nexus-sidebar-drop-hint">
          <el-icon :size="32">
            <Plus />
          </el-icon>
          <span>释放以添加到快捷菜单</span>
        </div>
      </div>
      -->

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
        <el-menu ref="sidebarMenuRef" :default-active="menuActiveId" class="nexus-sidebar-menu" :collapse="appStore.sidebarCollapsed"
          :collapse-transition="false" @contextmenu.prevent="openSidebarContextMenu($event, null)" @select="handleMenuSelect">
          <template v-for="item in disktopStore.treeItems" :key="item.id">
            <el-sub-menu v-if="item.children && item.children.length > 0" :index="String(item.id)"
              :data-folder-id="item.type === 'folder' ? item.id : ''" :data-item-id="item.id"
              draggable="true"
              @dragstart="onDragStart($event, item)"
              @contextmenu.prevent.stop="openSidebarContextMenu($event, item)">
              <template #title>
                <el-icon v-if="item.icon">
                  <component :is="getIconComponent(item.icon)" />
                </el-icon>
                <span>{{ item.title }}</span>
              </template>
              <el-menu-item v-for="child in item.children" :key="child.id" :index="String(child.id)"
                :data-folder-id="child.type === 'folder' ? child.id : ''" :data-item-id="child.id"
                draggable="true"
                @dragstart.stop="onDragStart($event, child)"
                @contextmenu.prevent.stop="openSidebarContextMenu($event, child)">
                <el-icon v-if="child.icon">
                  <component :is="getIconComponent(child.icon)" />
                </el-icon>
                <template #title>
                  <span>{{ child.title }}</span>
                </template>
              </el-menu-item>
            </el-sub-menu>
            <el-menu-item v-else :index="String(item.id)" :data-folder-id="item.type === 'folder' ? item.id : ''"
              :data-item-id="item.id" draggable="true"
              @dragstart="onDragStart($event, item)"
              @contextmenu.prevent.stop="openSidebarContextMenu($event, item)">
              <el-icon v-if="item.icon">
                <component :is="getIconComponent(item.icon)" />
              </el-icon>
              <template #title>
                <span>{{ item.title }}</span>
              </template>
            </el-menu-item>
          </template>
        </el-menu>
        <StartMenu @open-page="onStartMenuOpenPage">
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
              <el-avatar :size="22" :src="userStore.user?.avatar || ''" :class="{'nexus-user-avatar': true, 'nexus-user-avatar-themed': hasHeaderColor}"
               >{{ userInitial }}</el-avatar>
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

    <ItemEditor :visible="editorVisible" :item="editingItem" :is-new="isNewItem" @close="editorVisible = false" @save="onEditorSave" />

    <Teleport to="body">
      <div v-if="sidebarContextVisible" class="nexus-context-menu" :style="sidebarContextStyle" @click.stop>
        <div class="nexus-context-item" :class="{ 'nexus-context-item-disabled': !sidebarContextHasItem }"
          @click="sidebarContextHasItem && editSidebarItem()">
          <el-icon><Edit /></el-icon><span>{{ t('common.edit') }}</span>
        </div>
        <div class="nexus-context-item" :class="{ 'nexus-context-item-disabled': !sidebarContextHasItem }"
          @click="sidebarContextHasItem && deleteSidebarItem()">
          <el-icon><Delete /></el-icon><span>{{ t('common.delete') }}</span>
        </div>
        <div class="nexus-context-divider" />
        <div class="nexus-context-item" @click="addSidebarFolder">
          <el-icon><FolderAdd /></el-icon><span>{{ t('startMenu.newProject') }}</span>
        </div>
      </div>
    </Teleport>

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
import { computed, ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
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
import { ElMessageBox } from 'element-plus'
import GlobeIcon from '../components/GlobeIcon.vue'
import NotificationBell from '../components/common/NotificationBell.vue'
import GlobalSearch from '../components/common/GlobalSearch.vue'
import PreferencesPanel from '../components/PreferencesPanel.vue'
import StartMenu from '../components/desktop/StartMenu.vue'
import WindowsStartIcon from '../components/desktop/WindowsStartIcon.vue'
import ItemEditor from '../components/desktop/ItemEditor.vue'

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
  windowStore.open({ id: item.id, title: item.title, icon: item.icon, component: item.component, path: item.path })
}

async function onStartMenuAddItem(item) {
  await disktopStore.addItem({ title: item.title, icon: item.icon, component: item.component, path: item.path, type: 'menu', _copySuffix: ` ${t('startMenu.copy')}` })
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
  // 清除定时器和拖拽高亮
  clearFolderHoverTimer()
  document.querySelectorAll('.nexus-drag-before, .nexus-drag-after, .nexus-drag-into')
    .forEach(el => el.classList.remove('nexus-drag-before', 'nexus-drag-after', 'nexus-drag-into'))
  // 优先使用 dragover 时缓存的数据（包含 sort 信息）
  let item = pendingStartMenuData
  pendingStartMenuData = null
  if (!item) {
    try {
      const raw = event.dataTransfer.getData('application/json')
      if (raw) item = JSON.parse(raw)
    } catch (_) {}
  }
  if (!item) return
  // 使用 handleNativeDragOver 缓存的拖拽目标信息（不依赖 DOM class）
  const target = pendingDropTarget
  const insertAfter = pendingDropAfter
  const intoFolder = pendingDropIntoFolder
  pendingDropTarget = null
  pendingDropAfter = false
  pendingDropIntoFolder = false
  let parentId = null
  let newSort
  if (target) {
    if (intoFolder) {
      // 放入文件夹内部：parent_id 设为文件夹 id，追加到子节点末尾
      parentId = target.id
      const children = disktopStore.items
        .filter(i => i.parent_id === parentId)
        .sort((a, b) => (a.sort || 0) - (b.sort || 0))
      newSort = children.length > 0 ? (children[children.length - 1].sort || 0) + 1 : 0
    } else {
      parentId = target.parent_id
      const siblings = disktopStore.items
        .filter(i => i.parent_id === parentId)
        .sort((a, b) => (a.sort || 0) - (b.sort || 0))
      const targetIdx = siblings.findIndex(i => i.id === target.id)
      if (targetIdx !== -1) {
        if (insertAfter) {
          if (targetIdx + 1 < siblings.length) {
            newSort = ((siblings[targetIdx].sort || 0) + (siblings[targetIdx + 1].sort || 0)) / 2
          } else {
            newSort = (siblings[targetIdx].sort || 0) + 1
          }
        } else {
          if (targetIdx > 0) {
            newSort = ((siblings[targetIdx - 1].sort || 0) + (siblings[targetIdx].sort || 0)) / 2
          } else {
            newSort = (siblings[0].sort || 0) - 1
          }
        }
      }
    }
  }
  if (newSort === undefined) {
    // 拖到空白区域 → 追加到根级
    parentId = null
    const siblings = disktopStore.items
      .filter(i => i.parent_id === null)
      .sort((a, b) => (a.sort || 0) - (b.sort || 0))
    newSort = siblings.length > 0 ? (siblings[siblings.length - 1].sort || 0) + 1 : 0
  }
  const copySuffix = ` ${t('startMenu.copy')}`
  const newItem = await disktopStore.addItem({
    title: item.title, icon: item.icon, component: item.component, path: item.path,
    type: item.type || 'menu', parent_id: parentId, sort: newSort, _copySuffix: copySuffix
  })
  // 如果有子节点，递归添加
  if (item.children?.length && newItem?.id) {
    for (let i = 0; i < item.children.length; i++) {
      const child = item.children[i]
      await disktopStore.addItem({
        title: child.title, icon: child.icon, component: child.component, path: child.path,
        type: child.type || 'menu', parent_id: newItem.id, sort: i, _copySuffix: copySuffix
      })
    }
  }
}

// ==================== 侧边栏拖拽排序 ====================
const dragItem = ref(null)
const dragTarget = ref(null)
const dragInsertAfter = ref(false)
const sidebarMenuRef = ref(null)
let nativeDragOverHandler = null
let nativeDragEndHandler = null
// 缓存来自 StartMenu 的拖拽数据（dragend 中 dataTransfer 不可读）
let pendingStartMenuData = null
// 缓存当前拖拽目标节点和插入方向（drop 时直接使用，不依赖 DOM class）
let pendingDropTarget = null
let pendingDropAfter = false
let pendingDropIntoFolder = false
// 文件夹悬停定时器：拖到文件夹上悬停一段时间后切换为"放入文件夹内部"模式
let folderHoverTimer = null
let folderHoverTarget = null
const FOLDER_HOVER_DELAY = 1000 // ms


function onDragStart(event, item) {
  console.log('开始拖动:', item)
  dragItem.value = item
  dragTarget.value = null
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', String(item.id))
  event.target.classList.add('nexus-dragging')
}

function handleNativeDragOver(event) {
  event.preventDefault()
  // 检查是否来自 StartMenu（有 application/json 数据）
  const isFromStartMenu = event.dataTransfer.types.includes('application/json')
  if (!dragItem.value && !isFromStartMenu) return
  event.dataTransfer.dropEffect = dragItem.value ? 'move' : 'copy'
  // 缓存 StartMenu 的拖拽数据（dragend 中 dataTransfer 不可读）
  if (isFromStartMenu && !dragItem.value && !pendingStartMenuData) {
    try {
      const raw = event.dataTransfer.getData('application/json')
      if (raw) pendingStartMenuData = JSON.parse(raw)
    } catch (_) {}
  }
  // 用 elementFromPoint 找到鼠标下方的菜单项（绕过 el-menu 事件拦截）
  const el = document.elementFromPoint(event.clientX, event.clientY)
  // 优先匹配 el-menu-item，其次匹配 el-sub-menu（父节点）
  let itemEl = el?.closest('.el-menu-item')
  let isSubMenu = false
  if (!itemEl) {
    const subEl = el?.closest('.el-sub-menu')
    if (subEl) {
      // el-sub-menu 的 data-item-id 在 el-sub-menu 元素上，不在 .el-sub-menu__title 上
      itemEl = subEl
      isSubMenu = true
    }
  }
  if (!itemEl) {
    // 鼠标在空白区域 → 高亮最后一个根级菜单项（追加到末尾）
    clearFolderHoverTimer()
    const rootItems = disktopStore.rootItems
    if (rootItems.length > 0) {
      const lastRoot = rootItems[rootItems.length - 1]
      const lastEl = sidebarMenuRef.value?.$el?.querySelector(`[data-item-id="${lastRoot.id}"]`)
      if (lastEl) {
        // 清除其他高亮
        document.querySelectorAll('.nexus-drag-before, .nexus-drag-after, .nexus-drag-into')
          .forEach(el => el.classList.remove('nexus-drag-before', 'nexus-drag-after', 'nexus-drag-into'))
        lastEl.classList.add('nexus-drag-after')
        // 缓存拖拽目标信息
        pendingDropTarget = lastRoot
        pendingDropAfter = true
        pendingDropIntoFolder = false
      }
    }
    return
  }
  const targetId = Number(itemEl.dataset.itemId)
  if (!targetId) return
  // 如果是侧边栏内部拖拽，跳过自身
  if (dragItem.value && targetId === dragItem.value.id) return
  const target = disktopStore.items.find(i => i.id === targetId)
  if (!target) return
  dragTarget.value = target
  // 高亮和位置计算使用标题元素（el-sub-menu 用 .el-sub-menu__title，el-menu-item 用自身）
  const highlightEl = isSubMenu ? itemEl.querySelector('.el-sub-menu__title') : itemEl
  if (!highlightEl) return
  const rect = highlightEl.getBoundingClientRect()
  const y = event.clientY - rect.top

  // 判断当前目标是否为文件夹（el-sub-menu 或 type === 'folder' 的 el-menu-item）
  const isFolder = isSubMenu || target.type === 'folder'

  // 如果当前已经有"放入文件夹"定时器且目标没变，保持状态不重置
  if (pendingDropIntoFolder && folderHoverTarget === targetId) {
    // 已经处于"放入文件夹"模式，只更新高亮位置
    document.querySelectorAll('.nexus-drag-before, .nexus-drag-after, .nexus-drag-into')
      .forEach(el => el.classList.remove('nexus-drag-before', 'nexus-drag-after', 'nexus-drag-into'))
    highlightEl.classList.add('nexus-drag-into')
    return
  }

  // 清除其他高亮
  document.querySelectorAll('.nexus-drag-before, .nexus-drag-after, .nexus-drag-into')
    .forEach(el => el.classList.remove('nexus-drag-before', 'nexus-drag-after', 'nexus-drag-into'))

  if (isFolder) {
    // 文件夹：根据上下半区分 before/after，同时显示📂标记并启动悬停定时器
    const isInTitleArea = y >= 0 && y <= rect.height
    const isUpperHalf = isInTitleArea && y < rect.height / 2

    if (isUpperHalf) {
      // 上半部分 → 插入到该文件夹之前
      pendingDropIntoFolder = false
      dragInsertAfter.value = false
      highlightEl.classList.add('nexus-drag-before')
      pendingDropTarget = target
      pendingDropAfter = false
    } else {
      // 下半部分或子菜单区域 → 插入到该文件夹之后
      pendingDropIntoFolder = false
      dragInsertAfter.value = true
      highlightEl.classList.add('nexus-drag-after')
      pendingDropTarget = target
      pendingDropAfter = true
    }

    // 启动/重置悬停定时器：悬停一段时间后切换为"放入文件夹内部"
    startFolderHoverTimer(targetId, highlightEl)
  } else {
    // 非文件夹：根据上下半区分 before/after
    clearFolderHoverTimer()
    pendingDropIntoFolder = false
    const isLowerHalf = y >= rect.height / 2
    dragInsertAfter.value = isLowerHalf
    highlightEl.classList.toggle('nexus-drag-before', !dragInsertAfter.value)
    highlightEl.classList.toggle('nexus-drag-after', dragInsertAfter.value)
    pendingDropTarget = target
    pendingDropAfter = dragInsertAfter.value
  }
}

/**
 * 启动文件夹悬停定时器：悬停一段时间后切换为"放入文件夹内部"模式
 */
function startFolderHoverTimer(targetId, highlightEl) {
  // 如果定时器已存在且目标相同，不重置（让用户持续悬停即可触发）
  if (folderHoverTimer && folderHoverTarget === targetId) return
  clearFolderHoverTimer()
  folderHoverTarget = targetId
  folderHoverTimer = setTimeout(() => {
    // 切换为"放入文件夹内部"模式
    pendingDropIntoFolder = true
    // 清除 before/after 高亮，改为"放入"高亮（上下都亮）
    document.querySelectorAll('.nexus-drag-before, .nexus-drag-after, .nexus-drag-into')
      .forEach(el => el.classList.remove('nexus-drag-before', 'nexus-drag-after', 'nexus-drag-into'))
    if (highlightEl) {
      highlightEl.classList.add('nexus-drag-into')
      // 同时显示📂标记
      showFolderDropMark(highlightEl)
    }
    folderHoverTimer = null
  }, FOLDER_HOVER_DELAY)
}

/**
 * 显示"悬停放入文件夹"标记
 */
function showFolderDropMark(highlightEl) {
  removeFolderDropMark(highlightEl)
  const mark = document.createElement('span')
  mark.className = 'nexus-folder-drop-mark'
  mark.textContent = '📂'
  mark.title = '悬停1秒放入文件夹内部'
  highlightEl.appendChild(mark)
}

/**
 * 清除"悬停放入文件夹"标记
 */
function removeFolderDropMark(highlightEl) {
  highlightEl?.querySelector('.nexus-folder-drop-mark')?.remove()
}

/**
 * 清除文件夹悬停定时器
 */
function clearFolderHoverTimer() {
  if (folderHoverTimer) {
    clearTimeout(folderHoverTimer)
    folderHoverTimer = null
  }
  folderHoverTarget = null
  // 清除所有"放入文件夹"标记
  document.querySelectorAll('.nexus-folder-drop-mark').forEach(el => el.remove())
}

function handleNativeDragStart(event) {
  // 通过 data-item-id 找到被拖拽的菜单项
  const el = document.elementFromPoint(event.clientX, event.clientY)
  const itemEl = el?.closest('[data-item-id]')
  if (!itemEl) return
  const itemId = Number(itemEl.dataset.itemId)
  if (!itemId) return
  const item = disktopStore.items.find(i => i.id === itemId)
  if (!item) return
  console.log('开始拖动:', item)
  dragItem.value = item
  dragTarget.value = null
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', String(item.id))
  itemEl.classList.add('nexus-dragging')
}

function handleNativeDragEnd(event) {
  // 清除样式和定时器
  clearFolderHoverTimer()
  document.querySelectorAll('.nexus-dragging, .nexus-drag-before, .nexus-drag-after, .nexus-drag-into')
    .forEach(el => el.classList.remove('nexus-dragging', 'nexus-drag-before', 'nexus-drag-after', 'nexus-drag-into'))

  const source = dragItem.value
  const target = dragTarget.value
  const intoFolder = pendingDropIntoFolder
  dragItem.value = null
  dragTarget.value = null
  pendingDropIntoFolder = false

  if (!target) return

  let newParentId
  let newSort

  if (intoFolder) {
    // 放入文件夹内部：parent_id 设为文件夹 id，追加到子节点末尾
    newParentId = target.id
    const children = disktopStore.items
      .filter(i => i.parent_id === newParentId)
      .sort((a, b) => (a.sort || 0) - (b.sort || 0))
    newSort = children.length > 0 ? (children[children.length - 1].sort || 0) + 1 : 0
  } else {
    // 同级插入 before/after
    newParentId = target.parent_id
    const siblings = disktopStore.items
      .filter(i => i.parent_id === newParentId)
      .sort((a, b) => (a.sort || 0) - (b.sort || 0))

    const targetIdx = siblings.findIndex(i => i.id === target.id)
    if (targetIdx === -1) return

    if (dragInsertAfter.value) {
      if (targetIdx + 1 < siblings.length) {
        const next = siblings[targetIdx + 1]
        newSort = ((siblings[targetIdx].sort || 0) + (next.sort || 0)) / 2
      } else {
        newSort = (siblings[targetIdx].sort || 0) + 1
      }
    } else {
      if (targetIdx > 0) {
        const prev = siblings[targetIdx - 1]
        newSort = ((prev.sort || 0) + (siblings[targetIdx].sort || 0)) / 2
      } else {
        newSort = (siblings[0].sort || 0) - 1
      }
    }
  }

  if (source) {
    // 侧边栏内部拖拽排序
    if (source.id === target.id) return
    disktopStore.reorderItem(source.id, newSort, newParentId)
  } else if (pendingStartMenuData) {
    // 来自 StartMenu 的拖拽添加（使用 dragover 时缓存的数据）
    const item = pendingStartMenuData
    pendingStartMenuData = null
    // 异步添加（dragend 事件不能 await）
    addStartMenuItemWithChildren(item, newParentId, newSort)
  }
}

/**
 * 异步添加 StartMenu 拖拽的菜单项及其子节点
 */
async function addStartMenuItemWithChildren(item, parentId, sort) {
  const copySuffix = ` ${t('startMenu.copy')}`
  const newItem = await disktopStore.addItem({
    title: item.title, icon: item.icon, component: item.component, path: item.path, type: 'menu',
    parent_id: parentId, sort, _copySuffix: copySuffix
  })
  if (item.children?.length && newItem?.id) {
    for (let i = 0; i < item.children.length; i++) {
      const child = item.children[i]
      await disktopStore.addItem({
        title: child.title, icon: child.icon, component: child.component, path: child.path,
        type: child.type || 'menu', parent_id: newItem.id, sort: i, _copySuffix: copySuffix
      })
    }
  }
}

// 顶部背景色
const hasHeaderColor = computed(() => !!configStore.get('headerColor', ''))
const headerStyle = computed(() => {
  const color = configStore.get('headerColor', '')
  return color ? { background: color, borderBottom: 'none' } : {}
})

const localeDisplay = computed(() => ({ 'zh-CN': '中文', 'en': 'English' })[currentLocale.value] || currentLocale.value)
const userInitial = computed(() => (userStore.user?.username || 'U').charAt(0).toUpperCase())

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

  // 使用原生 DOM 事件监听 dragover/dragend/dragstart，绕过 el-menu 事件拦截
  await nextTick()
  const menuEl = sidebarMenuRef.value?.$el
  if (menuEl) {
    menuEl.addEventListener('dragover', handleNativeDragOver)
    menuEl.addEventListener('dragstart', handleNativeDragStart)
    nativeDragOverHandler = menuEl
  }
  // 在 document 上监听 dragend，确保从 StartMenu 拖拽取消时也能清除高亮
  document.addEventListener('dragend', handleNativeDragEnd)
  nativeDragEndHandler = document
})

// 监听 activeId 变化，同步侧边栏选中状态
watch(() => windowStore.activeId, (id) => {
  menuActiveId.value = id ? String(id) : ''
})

onUnmounted(() => {
  tabsWrapperRef.value?.removeEventListener('scroll', updateScrollState)
  document.removeEventListener('click', closeSidebarContext)
  // 移除原生事件监听
  if (nativeDragOverHandler) {
    nativeDragOverHandler.removeEventListener('dragover', handleNativeDragOver)
    nativeDragOverHandler.removeEventListener('dragstart', handleNativeDragStart)
  }
  if (nativeDragEndHandler) {
    nativeDragEndHandler.removeEventListener('dragend', handleNativeDragEnd)
  }
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
// ==================== 侧边栏编辑器 ====================
const editorVisible = ref(false)
const editingItem = ref(null)
const isNewItem = ref(false)

function onEditorSave(data) {
  if (isNewItem.value) {
    // 新建项目：title 已在 addSidebarFolder 中计算好，不需要副本逻辑
    disktopStore.addItem({ ...editingItem.value, ...data, _skipDedup: true })
  } else if (editingItem.value) {
    disktopStore.updateItem(editingItem.value.id, data)
  }
  editorVisible.value = false
}

// ==================== 侧边栏右键菜单 ====================
const sidebarContextVisible = ref(false)
const sidebarContextItem = ref(null)
const sidebarContextStyle = ref({})
const sidebarContextHasItem = computed(() => sidebarContextItem.value !== null)

function openSidebarContextMenu(event, item) {
  sidebarContextVisible.value = true
  sidebarContextItem.value = item
  sidebarContextStyle.value = { left: `${event.clientX}px`, top: `${event.clientY}px` }
}

function closeSidebarContext() { sidebarContextVisible.value = false }

function editSidebarItem() {
  sidebarContextVisible.value = false
  const item = sidebarContextItem.value
  if (!item) return
  editingItem.value = { ...item }
  isNewItem.value = false
  editorVisible.value = true
}

async function deleteSidebarItem() {
  sidebarContextVisible.value = false
  const item = sidebarContextItem.value
  if (!item) return
  try {
    await ElMessageBox.confirm(
      `确定删除「${item.title}」？`,
      t('common.confirm'),
      { type: 'warning', confirmButtonText: t('common.confirm'), cancelButtonText: t('common.cancel') }
    )
    disktopStore.removeItem(item.id)
  } catch (_) {
    // 用户取消
  }
}

async function addSidebarFolder() {
  sidebarContextVisible.value = false
  const contextItem = sidebarContextItem.value
  let parentId = null
  let sort
  if (contextItem) {
    // 在右键节点的同级后面插入
    parentId = contextItem.parent_id
    const siblings = disktopStore.items
      .filter(i => i.parent_id === parentId)
      .sort((a, b) => (a.sort || 0) - (b.sort || 0))
    const idx = siblings.findIndex(i => i.id === contextItem.id)
    if (idx !== -1 && idx + 1 < siblings.length) {
      sort = ((siblings[idx].sort || 0) + (siblings[idx + 1].sort || 0)) / 2
    } else {
      sort = (siblings[idx]?.sort || 0) + 1
    }
  } else {
    // 空白区域右键 → 追加到根级末尾
    const rootItems = disktopStore.rootItems
    sort = rootItems.length > 0 ? (rootItems[rootItems.length - 1].sort || 0) + 1 : 0
  }
  // 计算同级未命名的序号
  const unnamed = t('startMenu.unnamed')
  const siblings = disktopStore.items.filter(i => i.parent_id === parentId)
  const unnamedCount = siblings.filter(i => i.title?.startsWith(unnamed)).length
  const title = unnamedCount === 0 ? unnamed : `${unnamed} ${unnamedCount + 1}`
  editingItem.value = { title, icon: 'FolderOpened', type: 'folder', parent_id: parentId, sort }
  isNewItem.value = true
  editorVisible.value = true
}

// ==================== Tab 右键菜单 ====================
const tabContextVisible = ref(false)
const tabContextItem = ref(null)
const tabContextStyle = ref({})
const tabContextIsActive = ref(false)

function openTabContextMenu(event, tab) {
  tabContextVisible.value = true
  tabContextItem.value = tab
  // tab 为 null 表示在 tabs 空白区域右键 → 只有关闭全部可点
  // tab 不为 null 表示在某个 tab 上右键 → 全部可点
  tabContextIsActive.value = tab !== null
  tabContextStyle.value = { left: `${event.clientX}px`, top: `${event.clientY}px` }
  // 点击其他地方关闭
  setTimeout(() => document.addEventListener('click', closeTabContext, { once: true }), 0)
}

function closeTabContext() {
  tabContextVisible.value = false
}

function closeCurrentTab() {
  tabContextVisible.value = false
  const id = tabContextItem.value?.id
  if (id) windowStore.close(id)
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
  // 从右向左关闭，避免索引偏移
  const toClose = items.slice(idx + 1).map(t => t.id)
  for (let i = toClose.length - 1; i >= 0; i--) {
    windowStore.close(toClose[i])
  }
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
  user-select: none !important;
  -webkit-user-select: none !important;
}

:deep(.el-menu-item .el-icon),
:deep(.el-sub-menu__title .el-icon) {
  font-size: calc(var(--nexus-font-size-base) + 2px) !important;
  width: calc(var(--nexus-font-size-base) + 2px) !important;
}

:deep(.el-menu-item.is-active) {
  background-color: color-mix(in srgb, var(--nexus-primary-color) 6%, transparent) !important;
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



.nexus-header[style*="background"] .nexus-user-btn span.nexus-user-avatar-themed{
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

/* 拖拽排序样式 */
:deep(.nexus-dragging) {
  opacity: 0.4 !important;
}

:deep(.nexus-drag-before) {
  box-shadow: inset 0 2px 0 0 var(--nexus-primary-color) !important;
}

:deep(.nexus-drag-after) {
  box-shadow: inset 0 -2px 0 0 var(--nexus-primary-color) !important;
}

:deep(.nexus-drag-into) {
  box-shadow: inset 0 2px 0 0 var(--nexus-primary-color), inset 0 -2px 0 0 var(--nexus-primary-color) !important;
  background-color: color-mix(in srgb, var(--nexus-primary-color) 8%, transparent) !important;
}

/* 文件夹悬停放入标记 */
:deep(.nexus-folder-drop-mark) {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  line-height: 1;
  opacity: 0.7;
  pointer-events: none;
  animation: nexus-folder-mark-pulse 1s ease-in-out infinite;
}

@keyframes nexus-folder-mark-pulse {
  0%, 100% { opacity: 0.5; transform: translateY(-50%) scale(1); }
  50% { opacity: 1; transform: translateY(-50%) scale(1.15); }
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
