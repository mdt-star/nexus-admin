<template>
  <aside class="nexus-sidebar" :class="{
    'nexus-sidebar-collapsed': appStore.sidebarCollapsed,
    'nexus-sidebar-themed': hasHeaderColor,
    'nexus-sidebar-dragover': isDragOver
  }" @dragenter="onSidebarDragEnter" @dragover.prevent="onSidebarDragOver" @dragleave="onSidebarDragLeave"
    @drop.prevent="onSidebarDrop">

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
      <StartMenu placement="right-start" @open-page="(item) => $emit('open-page', item)">
        <template #reference>
          <div class="nexus-start-btn-wrapper">
            <el-button class="nexus-start-btn">
              <WindowsStartIcon :size="20" />
            </el-button>
          </div>
        </template>
      </StartMenu>
    </div>

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
        <div class="nexus-context-item" :class="{ 'nexus-context-item-disabled': sidebarContextIsFolder }"
          @click="!sidebarContextIsFolder && pinToShortcuts()">
          <el-icon><Star /></el-icon><span>{{ t('startMenu.pinToShortcuts') }}</span>
        </div>
        <div class="nexus-context-divider" />
        <div class="nexus-context-item" @click="addSidebarFolder">
          <el-icon><FolderAdd /></el-icon><span>{{ t('startMenu.newProject') }}</span>
        </div>
      </div>
    </Teleport>
  </aside>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useAppStore } from '../../stores/app'
import { useMenuStore } from '../../stores/menu'
import { useDisktopStore } from '../../stores/disktop'
import { useWindowStore } from '../../stores/windows'
import { useI18nStore } from '../../stores/i18n'
import { useConfigStore } from '../../stores/config'
import { useUiSizeStore } from '../../stores/size'
import { useShortcutsStore } from '../../stores/shortcuts'
import hookManager from '../../utils/hook-manager'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { TrendCharts, Edit, Delete, FolderAdd } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import StartMenu from '../desktop/StartMenu.vue'
import WindowsStartIcon from '../desktop/WindowsStartIcon.vue'
import ItemEditor from '../desktop/ItemEditor.vue'

defineEmits(['open-page'])

const appStore = useAppStore()
const menuStore = useMenuStore()
const disktopStore = useDisktopStore()
const windowStore = useWindowStore()
const i18nStore = useI18nStore()
const configStore = useConfigStore()
const uiSizeStore = useUiSizeStore()
const shortcutsStore = useShortcutsStore()
const { t } = i18nStore

// ==================== 计算属性 ====================
const appName = computed(() => configStore.get('appName', 'Nexus Admin'))
const hasHeaderColor = computed(() => !!configStore.get('headerColor', ''))
const headerStyle = computed(() => {
  const color = configStore.get('headerColor', '')
  return color ? { background: color, borderBottom: 'none' } : {}
})
const logoIconSize = computed(() => {
  const collapsed = appStore.sidebarCollapsed
  return { small: collapsed ? 22 : 20, medium: collapsed ? 26 : 22, large: collapsed ? 30 : 26 }[uiSizeStore.size] || (collapsed ? 26 : 22)
})

// ==================== 菜单选中同步 ====================
const menuActiveId = ref('')
watch(() => windowStore.activeId, (id) => {
  menuActiveId.value = id ? String(id) : ''
})

// ==================== 菜单选择 ====================
async function handleMenuSelect(index) {
  let item = disktopStore.items.find(i => String(i.id) === index)
  if (!item) item = menuStore.findMenuByComponent(index) || menuStore.findMenuByRoute(index)
  if (item) {
    await hookManager.emit('menu:item-click', item)
    if (!configStore.get('tabMode', true)) windowStore.closeAll()
    windowStore.open(item)
  }
}

// ==================== 侧边栏拖放（从 StartMenu 拖入） ====================
const isDragOver = ref(false)
let dragEnterCounter = 0

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
  clearFolderHoverTimer()
  document.querySelectorAll('.nexus-drag-before, .nexus-drag-after, .nexus-drag-into')
    .forEach(el => el.classList.remove('nexus-drag-before', 'nexus-drag-after', 'nexus-drag-into'))

  let item = pendingStartMenuData
  pendingStartMenuData = null
  if (!item) {
    try {
      const raw = event.dataTransfer.getData('application/json')
      if (raw) item = JSON.parse(raw)
    } catch (_) {}
  }
  if (!item) return

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

// ==================== 侧边栏内部拖拽排序 ====================
const dragItem = ref(null)
const dragTarget = ref(null)
const dragInsertAfter = ref(false)
const sidebarMenuRef = ref(null)
let nativeDragOverHandler = null
let nativeDragEndHandler = null
let pendingStartMenuData = null
let pendingDropTarget = null
let pendingDropAfter = false
let pendingDropIntoFolder = false
let folderHoverTimer = null
let folderHoverTarget = null
const FOLDER_HOVER_DELAY = 1000

function onDragStart(event, item) {
  dragItem.value = item
  dragTarget.value = null
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', String(item.id))
  event.target.classList.add('nexus-dragging')
}

function handleNativeDragOver(event) {
  event.preventDefault()
  const isFromStartMenu = event.dataTransfer.types.includes('application/json')
  if (!dragItem.value && !isFromStartMenu) return
  event.dataTransfer.dropEffect = dragItem.value ? 'move' : 'copy'

  if (isFromStartMenu && !dragItem.value && !pendingStartMenuData) {
    try {
      const raw = event.dataTransfer.getData('application/json')
      if (raw) pendingStartMenuData = JSON.parse(raw)
    } catch (_) {}
  }

  const el = document.elementFromPoint(event.clientX, event.clientY)
  let itemEl = el?.closest('.el-menu-item')
  let isSubMenu = false
  if (!itemEl) {
    const subEl = el?.closest('.el-sub-menu')
    if (subEl) {
      itemEl = subEl
      isSubMenu = true
    }
  }
  if (!itemEl) {
    clearFolderHoverTimer()
    const rootItems = disktopStore.rootItems
    if (rootItems.length > 0) {
      const lastRoot = rootItems[rootItems.length - 1]
      const lastEl = sidebarMenuRef.value?.$el?.querySelector(`[data-item-id="${lastRoot.id}"]`)
      if (lastEl) {
        document.querySelectorAll('.nexus-drag-before, .nexus-drag-after, .nexus-drag-into')
          .forEach(el => el.classList.remove('nexus-drag-before', 'nexus-drag-after', 'nexus-drag-into'))
        lastEl.classList.add('nexus-drag-after')
        pendingDropTarget = lastRoot
        pendingDropAfter = true
        pendingDropIntoFolder = false
      }
    }
    return
  }

  const targetId = Number(itemEl.dataset.itemId)
  if (!targetId) return
  if (dragItem.value && targetId === dragItem.value.id) return

  const target = disktopStore.items.find(i => i.id === targetId)
  if (!target) return
  dragTarget.value = target

  const highlightEl = isSubMenu ? itemEl.querySelector('.el-sub-menu__title') : itemEl
  if (!highlightEl) return

  const rect = highlightEl.getBoundingClientRect()
  const y = event.clientY - rect.top
  const isFolder = isSubMenu || target.type === 'folder'

  if (pendingDropIntoFolder && folderHoverTarget === targetId) {
    document.querySelectorAll('.nexus-drag-before, .nexus-drag-after, .nexus-drag-into')
      .forEach(el => el.classList.remove('nexus-drag-before', 'nexus-drag-after', 'nexus-drag-into'))
    highlightEl.classList.add('nexus-drag-into')
    return
  }

  document.querySelectorAll('.nexus-drag-before, .nexus-drag-after, .nexus-drag-into')
    .forEach(el => el.classList.remove('nexus-drag-before', 'nexus-drag-after', 'nexus-drag-into'))

  if (isFolder) {
    const isInTitleArea = y >= 0 && y <= rect.height
    const isUpperHalf = isInTitleArea && y < rect.height / 2
    if (isUpperHalf) {
      pendingDropIntoFolder = false
      dragInsertAfter.value = false
      highlightEl.classList.add('nexus-drag-before')
      pendingDropTarget = target
      pendingDropAfter = false
    } else {
      pendingDropIntoFolder = false
      dragInsertAfter.value = true
      highlightEl.classList.add('nexus-drag-after')
      pendingDropTarget = target
      pendingDropAfter = true
    }
    startFolderHoverTimer(targetId, highlightEl)
  } else {
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

function handleNativeDragStart(event) {
  const el = document.elementFromPoint(event.clientX, event.clientY)
  const itemEl = el?.closest('[data-item-id]')
  if (!itemEl) return
  const itemId = Number(itemEl.dataset.itemId)
  if (!itemId) return
  const item = disktopStore.items.find(i => i.id === itemId)
  if (!item) return
  dragItem.value = item
  dragTarget.value = null
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', String(item.id))
  itemEl.classList.add('nexus-dragging')
}

function handleNativeDragEnd() {
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

  let newParentId, newSort
  if (intoFolder) {
    newParentId = target.id
    const children = disktopStore.items
      .filter(i => i.parent_id === newParentId)
      .sort((a, b) => (a.sort || 0) - (b.sort || 0))
    newSort = children.length > 0 ? (children[children.length - 1].sort || 0) + 1 : 0
  } else {
    newParentId = target.parent_id
    const siblings = disktopStore.items
      .filter(i => i.parent_id === newParentId)
      .sort((a, b) => (a.sort || 0) - (b.sort || 0))
    const targetIdx = siblings.findIndex(i => i.id === target.id)
    if (targetIdx === -1) return
    if (dragInsertAfter.value) {
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

  if (source) {
    if (source.id === target.id) return
    disktopStore.reorderItem(source.id, newSort, newParentId)
  } else if (pendingStartMenuData) {
    const item = pendingStartMenuData
    pendingStartMenuData = null
    addStartMenuItemWithChildren(item, newParentId, newSort)
  }
}

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

function startFolderHoverTimer(targetId, highlightEl) {
  if (folderHoverTimer && folderHoverTarget === targetId) return
  clearFolderHoverTimer()
  folderHoverTarget = targetId
  folderHoverTimer = setTimeout(() => {
    pendingDropIntoFolder = true
    document.querySelectorAll('.nexus-drag-before, .nexus-drag-after, .nexus-drag-into')
      .forEach(el => el.classList.remove('nexus-drag-before', 'nexus-drag-after', 'nexus-drag-into'))
    if (highlightEl) {
      highlightEl.classList.add('nexus-drag-into')
      showFolderDropMark(highlightEl)
    }
    folderHoverTimer = null
  }, FOLDER_HOVER_DELAY)
}

function showFolderDropMark(highlightEl) {
  removeFolderDropMark(highlightEl)
  const mark = document.createElement('span')
  mark.className = 'nexus-folder-drop-mark'
  mark.textContent = '📂'
  mark.title = '悬停1秒放入文件夹内部'
  highlightEl.appendChild(mark)
}

function removeFolderDropMark(highlightEl) {
  highlightEl?.querySelector('.nexus-folder-drop-mark')?.remove()
}

function clearFolderHoverTimer() {
  if (folderHoverTimer) {
    clearTimeout(folderHoverTimer)
    folderHoverTimer = null
  }
  folderHoverTarget = null
  document.querySelectorAll('.nexus-folder-drop-mark').forEach(el => el.remove())
}

// ==================== 右键菜单 ====================
const sidebarContextVisible = ref(false)
const sidebarContextItem = ref(null)
const sidebarContextStyle = ref({})
const sidebarContextHasItem = computed(() => sidebarContextItem.value !== null)
const sidebarContextIsFolder = computed(() => {
  const item = sidebarContextItem.value
  return !item || (item.children && item.children.length > 0) || item.type === 'folder'
})

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
      t('common.confirmDelete', { title: item.title }),
      t('common.confirm'),
      { type: 'warning', confirmButtonText: t('common.confirm'), cancelButtonText: t('common.cancel') }
    )
    disktopStore.removeItem(item.id)
  } catch (_) {}
}

function pinToShortcuts() {
  sidebarContextVisible.value = false
  const item = sidebarContextItem.value
  if (!item) return
  if (shortcutsStore.has(item)) {
    shortcutsStore.remove(item.id)
  } else {
    shortcutsStore.add(item)
  }
}

async function addSidebarFolder() {
  sidebarContextVisible.value = false
  const contextItem = sidebarContextItem.value
  let parentId = null
  let sort
  if (contextItem) {
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
    const rootItems = disktopStore.rootItems
    sort = rootItems.length > 0 ? (rootItems[rootItems.length - 1].sort || 0) + 1 : 0
  }
  const unnamed = t('startMenu.unnamed')
  const siblings = disktopStore.items.filter(i => i.parent_id === parentId)
  const unnamedCount = siblings.filter(i => i.title?.startsWith(unnamed)).length
  const title = unnamedCount === 0 ? unnamed : `${unnamed} ${unnamedCount + 1}`
  editingItem.value = { title, icon: 'FolderOpened', type: 'folder', parent_id: parentId, sort }
  isNewItem.value = true
  editorVisible.value = true
}

// ==================== 编辑器 ====================
const editorVisible = ref(false)
const editingItem = ref(null)
const isNewItem = ref(false)

function onEditorSave(data) {
  if (isNewItem.value) {
    disktopStore.addItem({ ...editingItem.value, ...data, _skipDedup: true })
  } else if (editingItem.value) {
    disktopStore.updateItem(editingItem.value.id, data)
  }
  editorVisible.value = false
}

// ==================== 生命周期 ====================
onMounted(async () => {
  if (!disktopStore.loaded) await disktopStore.loadDisktops()
  if (disktopStore.activeDisktopId) await disktopStore.loadItems()
  menuActiveId.value = windowStore.activeId ? String(windowStore.activeId) : ''

  document.addEventListener('click', closeSidebarContext)

  await nextTick()
  const menuEl = sidebarMenuRef.value?.$el
  if (menuEl) {
    menuEl.addEventListener('dragover', handleNativeDragOver)
    menuEl.addEventListener('dragstart', handleNativeDragStart)
    nativeDragOverHandler = menuEl
  }
  document.addEventListener('dragend', handleNativeDragEnd)
  nativeDragEndHandler = document
})

// 折叠/展开后重新绑定拖拽事件
watch(() => appStore.sidebarCollapsed, async () => {
  await nextTick()
  if (nativeDragOverHandler) {
    nativeDragOverHandler.removeEventListener('dragover', handleNativeDragOver)
    nativeDragOverHandler.removeEventListener('dragstart', handleNativeDragStart)
  }
  const menuEl = sidebarMenuRef.value?.$el
  if (menuEl) {
    menuEl.addEventListener('dragover', handleNativeDragOver)
    menuEl.addEventListener('dragstart', handleNativeDragStart)
    nativeDragOverHandler = menuEl
  }
})

onUnmounted(() => {
  document.removeEventListener('click', closeSidebarContext)
  if (nativeDragOverHandler) {
    nativeDragOverHandler.removeEventListener('dragover', handleNativeDragOver)
    nativeDragOverHandler.removeEventListener('dragstart', handleNativeDragStart)
  }
  if (nativeDragEndHandler) {
    nativeDragEndHandler.removeEventListener('dragend', handleNativeDragEnd)
  }
})

// ==================== 工具函数 ====================
function getIconComponent(iconName) { return iconName ? ElementPlusIconsVue[iconName] || null : null }
</script>

<style scoped>
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

.nexus-sidebar-dragover {
  position: relative;
  outline: 2px dashed var(--nexus-primary-color);
  outline-offset: -2px;
  background-color: color-mix(in srgb, var(--nexus-primary-color) 6%, transparent);
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
  border-color: var(--nexus-border-color) !important;
}

/* 拖拽排序样式（scoped 内用 :deep 穿透 el-menu） */
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
