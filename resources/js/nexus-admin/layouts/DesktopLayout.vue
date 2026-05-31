<template>
  <div class="nexus-desktop-layout">
    <div class="nexus-desktop-bg" :class="{ 'nexus-bg-enhanced': bgIsColor }" :style="bgStyle" />
    <div class="nexus-desktop-body">
      <main class="nexus-desktop" @dragover.prevent="onDragOver" @drop.prevent="onDrop">
        <!-- 加载遮罩（进度条样式） -->
        <div v-if="ds.loading" class="nexus-loading-overlay">
          <div class="nexus-loading-bar">
            <div class="nexus-loading-bar-inner" />
          </div>
          <div class="nexus-loading-text">加载桌面...</div>
        </div>
        <div class="nexus-desktop-icons" ref="iconsRef" @contextmenu.prevent="onDesktopContext"
          @mousedown="onDesktopMouseDown">
          <template v-for="item in ds.rootItems" :key="item.id">
            <div class="nexus-desktop-icon"
              :class="{ 'nexus-drop-folder': dragOverFolder === item.id, 'nexus-desktop-icon-selected': selectedIds.has(item.id) }"
              :style="iconStyle(item)" :data-item-id="item.id" @mousedown="onIconMouseDown($event, item)"
              @dblclick="handleItemClick(item)" @contextmenu.prevent.stop="openContextMenu($event, item)">
              <div class="nexus-desktop-icon-img"><el-icon :size="28">
                  <component :is="item.type === 'folder' ? 'FolderOpened' : getIconComponent(item.icon)" />
                </el-icon></div><span class="nexus-desktop-icon-label">{{ item.title }}</span>
            </div>
          </template>
          <div v-if="!ds.loading && !ds.rootItems.length" class="nexus-desktop-empty"
            style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center"><el-empty
              :description="t('startMenu.dragHint')" :image-size="80" /></div>
          <!-- 框选虚线框 -->
          <div v-if="isSelecting && selectRect" class="nexus-select-rect" :style="selectStyle"></div>
        </div>
        <div class="nexus-desktop-windows">
          <DesktopWindow v-for="(win, idx) in ws.items" :key="win.id" :win="win" :is-active="win.id === ws.activeId"
            :rect="getWindowRect(win.id, idx)" :data-window-id="win.id"
            :z-index="win.id === ws.activeId ? 100 : 10 + idx" @activate="onActivateWindow" @close="autoSwitchWindow"
            :initialMinimized="win.id !== ws.activeId" @minimize="autoSwitchWindow" />
        </div>
        <FolderView v-if="currentFolder" :folder="currentFolder" :folder-path="folderHistory" @open="onFolderChildOpen"
          @close="onFolderClose" @back="goBackFolder" @drag-start="onFolderDragStart"
          @context-menu="onFolderChildContextMenu" @children-changed="refreshFolderChildren" />



        <!-- 首页侧滑面板（从右划出） -->
        <Teleport to="body">
          <div v-if="homeVisible" class="nexus-home-overlay" @click.self="homeVisible = false">
            <div class="nexus-home-panel" :class="{ 'nexus-home-panel-in': homeVisible }" @click.stop>
              <div class="nexus-home-panel-header"><span>欢迎页</span><el-button :icon="Close" circle size="small" text
                  @click="homeVisible = false" /></div>
              <div class="nexus-home-panel-body">
                <component :is="homePage" />
              </div>
            </div>
          </div>
        </Teleport>
      </main>
      <TaskBar @open-page="onMenuOpen" @open-search="searchVisible = true" @switchToWindow="onSwitchToWindow"
        @open-preferences="onOpenPreferences" @open-home="homeVisible = true" @open-profile="onOpenProfile" />
    </div>
    <PreferencesPanel ref="preferencesRef" />
    <div style="display:none">
      <GlobalSearch :visible="searchVisible" @update:visible="searchVisible = $event" />
    </div>
    <ItemEditor :visible="editorVisible" :item="editingItem" :is-new="isNewItem" :position="editorPos"
      @close="editorVisible = false" @save="onEditorSave" />
    <Teleport to="body">
      <div v-if="ctxVisible" class="nexus-ctx" :style="ctxStyle" @click="ctxVisible = false">
        <div v-if="ctxItem" class="nexus-ctx-item" :class="{ 'nexus-ctx-item-disabled': isMultiSelected }"
          @click.stop="!isMultiSelected && editItem(ctxItem)"><el-icon>
            <Edit />
          </el-icon>编辑</div>
        <div v-if="ctxItem" class="nexus-ctx-item"
          @click.stop="isMultiSelected ? batchDeleteItems() : deleteItem(ctxItem)">
          <el-icon>
            <Delete />
          </el-icon>{{ isMultiSelected ? '批量删除' : '删除' }}
        </div>
        <div v-if="ctxItem" class="nexus-ctx-divider" />
        <div class="nexus-ctx-item" @click.stop="addFolder"><el-icon>
            <FolderAdd />
          </el-icon>{{ ctxItem && ctxItem.type === 'folder' ? '在此新增文件夹' : '新建文件夹' }}</div>
        <div class="nexus-ctx-divider" />
        <div class="nexus-ctx-item" @click.stop="arrangeIcons"><el-icon>
            <Grid />
          </el-icon>排列图标</div>
        <div class="nexus-ctx-item" @click.stop="toggleSnap"><el-icon><Select /></el-icon>{{ snapToGrid ? '取消紧贴网格' :
          '紧贴网格'
          }}
        </div>
      </div>
    </Teleport>
  </div>
</template>
<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useDisktopStore } from '../stores/disktop'
import { useWindowStore } from '../stores/windows'
import { useI18nStore } from '../stores/i18n'
import { useConfigStore } from '../stores/config'
import * as I from '@element-plus/icons-vue'
import { Edit, Delete, FolderAdd, Close, Grid, Select } from '@element-plus/icons-vue'
import DesktopWindow from '../components/desktop/DesktopWindow.vue'
import TaskBar from '../components/desktop/TaskBar.vue'
import FolderView from '../components/desktop/FolderView.vue'
import ItemEditor from '../components/desktop/ItemEditor.vue'
import PreferencesPanel from '../components/PreferencesPanel.vue'
import GlobalSearch from '../components/common/GlobalSearch.vue'
const ds = useDisktopStore(), ws = useWindowStore(), i18n = useI18nStore(), cfg = useConfigStore(), { t } = i18n
const bgIsColor = computed(() => cfg.get('backgroundMode', 'color') !== 'image')
const bgStyle = computed(() => { const m = cfg.get('backgroundMode', 'color'); if (m === 'image') { const img = cfg.get('backgroundImage', null), f = cfg.get('backgroundFit', 'fill'), fm = { fill: 'fill', contain: 'contain', cover: 'cover', center: 'center' }; if (img) return { backgroundImage: `url(${img})`, backgroundSize: fm[f] || 'fill', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' } } return { background: 'linear-gradient(135deg,var(--nexus-desktop-bg-start),var(--nexus-desktop-bg-end))' } })
const currentFolder = ref(null), folderHistory = ref([]), preferencesRef = ref(null), searchVisible = ref(false), editorVisible = ref(false), editingItem = ref(null), isNewItem = ref(false), editorPos = ref({ x: 200, y: 100 }), ctxVisible = ref(false), ctxItem = ref(null), ctxStyle = ref({}), homeVisible = ref(false)
// 框选状态
const selectedIds = ref(new Set()), isSelecting = ref(false), selectRect = ref(null), selectStart = ref(null)
const isMultiSelected = computed(() => selectedIds.value.size > 1)

const wp = {}; function getWindowRect(id, idx) { if (!wp[id]) { const vw = window.innerWidth, vh = window.innerHeight, w = Math.min(Math.round(vw * .7), vw - 40), h = Math.min(Math.round(vh * .8), vh - 80); wp[id] = { left: Math.round((vw - w) / 2) + idx * 30, top: Math.round((vh - h) / 2 * .3) + idx * 30, width: w, height: h } } return wp[id] }
onMounted(async () => { if (!ds.loaded) await ds.loadDisktops(); if (ds.activeDisktopId) await ds.loadItems(); document.addEventListener('click', () => ctxVisible.value = false); document.addEventListener('contextmenu', (e) => { if (!e.target.closest('.nexus-ctx,.nexus-desktop,.nexus-desktop-icon,.nexus-desktop-window')) ctxVisible.value = false }) })
function getIconComponent(n) { return n ? I[n] || null : null }
function handleItemClick(item) {
  if (item.type === 'folder') {
    folderHistory.value = []
    currentFolder.value = { ...item, children: ds.getChildren(item.id) }
  } else if (item.component) {
    ws.open(item)
  }
}
// 文件夹子项点击：文件夹类型在当前视图内导航，menu 类型打开新窗口
function onFolderChildOpen(item) {
  if (item.type === 'folder') {
    folderHistory.value.push({ ...currentFolder.value })
    currentFolder.value = { ...item, children: ds.getChildren(item.id) }
  } else if (item.component) {
    ws.open(item)
    currentFolder.value = null
  }
}

// 窗口最小化或关闭时自动切换窗口
function onSwitchToWindow({ id, switchingToActive }) {
  if (switchingToActive) {
    // 已激活的窗口被点击：保持最小化状态（不切换回激活）
    autoSwitchWindow(id)
  }
}

// 窗口最小化或关闭后自动切换到下一个可见窗口
function autoSwitchWindow(id) {
  // 从 history 中从后往前找上一个激活的、仍在 items 中、且 dom 可见的窗口
  for (let i = ws.history.length - 1; i >= 0; i--) {
    const prevId = ws.history[i]
    if (prevId === id) continue
    if (!ws.items.find(w => w.id === prevId)) continue
    const el = document.querySelector(`[data-window-id="${prevId}"]`)
    if (el && !el.classList.contains('nexus-window-minimized')) {
      ws.activate(prevId)
      return
    }
    break // 只回溯到最近一个非当前窗口
  }
  // fallback: DOM 顺序找下一个/上一个可见窗口
  const current = document.querySelector(`[data-window-id="${id}"]`)
  if (!current) return
  let next = current.nextElementSibling
  while (next) {
    if (next.matches('.nexus-desktop-window') && !next.classList.contains('nexus-window-minimized')) {
      ws.activate(Number(next.dataset.windowId))
      return
    }
    next = next.nextElementSibling
  }
  let prev = current.previousElementSibling
  while (prev) {
    if (prev.matches('.nexus-desktop-window') && !prev.classList.contains('nexus-window-minimized')) {
      ws.activate(Number(prev.dataset.windowId))
      return
    }
    prev = prev.previousElementSibling
  }
}


// 关闭文件夹视图
function onFolderClose() { currentFolder.value = null; folderHistory.value = [] }
// 文件夹内部子项右键菜单
function onFolderChildContextMenu({ event, item }) {
  event.preventDefault()
  ctxItem.value = item
  ctxStyle.value = { left: event.clientX + 'px', top: event.clientY + 'px' }
  ctxVisible.value = true
}
// 刷新当前文件夹子项列表（拖移入子文件夹后实时同步视图）
function refreshFolderChildren() {
  if (currentFolder.value) {
    currentFolder.value = { ...currentFolder.value, children: ds.getChildren(currentFolder.value.id) }
  }
}
// 返回上级目录
function goBackFolder() {
  if (folderHistory.value.length > 0) {
    const prev = folderHistory.value.pop()
    // 重新获取子项（数据可能已变化）
    currentFolder.value = { ...prev, children: ds.getChildren(prev.id) }
  } else {
    currentFolder.value = null
  }
}
function onMenuOpen(item) { ws.open(item); }
function onOpenPreferences() { preferencesRef.value?.open() }
function onOpenProfile() {
  ws.open({ id: 'system-profile', title: '个人信息', icon: 'InfoFilled', component: 'system-config' })
}
function onActivateWindow(id) { ws.activate(id) }
function onDragOver(e) { e.dataTransfer.dropEffect = 'copy' }
async function onDrop(e) {
  // 处理从文件夹拖出的图标原生拖拽
  const folderDrop = window.__folderDropData
  window.__folderDropData = null
  if (folderDrop && folderDrop._fromFolder) {
    const existing = ds.items.find(i => i.id === folderDrop.id)
    if (existing) {
      existing.parent_id = null
      const dropX = typeof folderDrop._dropX === 'number' ? folderDrop._dropX : e.clientX
      const dropY = typeof folderDrop._dropY === 'number' ? folderDrop._dropY : e.clientY
      await ds.updateItem(folderDrop.id, { parent_id: null, custom: { x: Math.max(0, dropX - 40), y: Math.max(0, dropY - 45) } })
      currentFolder.value = null
    }
    return
  }
  const d = e.dataTransfer.getData('application/json'); if (!d) return; try { const item = JSON.parse(d), el = document.elementFromPoint(e.clientX, e.clientY), folder = el?.closest('[data-folder-id]'), nextSort = ds.rootItems.reduce((max, i) => Math.max(max, i.sort || 0), 0) + 1; const newItem = await ds.addItem({ title: item.title, icon: item.icon, component: item.component, path: item.path, type: item.type || 'menu', parent_id: folder ? Number(folder.dataset.folderId) || null : null, custom: { x: Math.max(0, e.clientX - 40), y: Math.max(0, e.clientY - 45) }, sort: nextSort, _copySuffix: ` ${t('startMenu.copy')}` }); if (item.children?.length && newItem) { await Promise.all(item.children.map((c, i) => ds.addItem({ title: c.title, icon: c.icon, component: c.component, path: c.path, type: c.type || 'menu', parent_id: newItem.id, sort: i, _skipDedup: true }))) } } catch (ex) { console.warn('drop fail', ex) }
}
function onDesktopContext(e) {
  // 桌面右键 → 显示新建文件夹菜单
  ctxItem.value = null
  ctxStyle.value = { left: e.clientX + 'px', top: e.clientY + 'px' }
  ctxVisible.value = true
}
function openContextMenu(e, item) {
  // 图标右键（排除弹窗和窗口内部）
  if (e.target.closest('.el-dialog,.el-dialog__wrapper,.el-drawer,.el-overlay,.el-drawer__wrapper,.nexus-desktop-window')) return
  ctxVisible.value = true; ctxItem.value = item; ctxStyle.value = { left: e.clientX + 'px', top: e.clientY + 'px' }
}
function editItem(item) { ctxVisible.value = false; editingItem.value = item; isNewItem.value = false; editorPos.value = { x: 200, y: 100 }; editorVisible.value = true }
async function deleteItem(item) {
  ctxVisible.value = false
  const { ElMessageBox } = await import('element-plus')
  try {
    const key = 'common.confirmDelete'
    const translated = t(key, { title: item.title || '' })
    const msg = translated !== key ? translated : '确定删除「{title}」？'.replace('{title}', item.title || '')
    await ElMessageBox.confirm(msg, '提示', { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' })
    ds.removeItem(item.id)
    refreshFolderChildren()
  } catch (ex) {/* cancel */ }
}
// 缓存新建文件夹的 parent_id（防止编辑过程中 editingItem 被意外覆盖）
let _pendingParentId = null

async function addFolder() {
  ctxVisible.value = false
  const ctxX = parseInt(ctxStyle.value.left) || 200
  const ctxY = parseInt(ctxStyle.value.top) || 100
  // 在已有文件夹上右键时，新文件夹创建到该文件夹内部

  _pendingParentId = ctxItem?.value && ctxItem.value.type === 'folder' ? ctxItem.value.id : null

  editingItem.value = {
    title: t('startMenu.newProject'),
    icon: 'FolderOpened',
    type: 'folder',
    parent_id: _pendingParentId,
    _ctxX: ctxX,
    _ctxY: ctxY
  }
  isNewItem.value = true
  editorPos.value = { x: Math.min(ctxX, window.innerWidth - 400), y: Math.min(ctxY, window.innerHeight - 300) }
  editorVisible.value = true
}

async function onEditorSave(data) {
  if (isNewItem.value) {
    const ctxX = editingItem.value?._ctxX, ctxY = editingItem.value?._ctxY
    // 优先使用缓存 parent_id，确保创建到正确父级
    const parentId = _pendingParentId !== null ? _pendingParentId : (editingItem.value?.parent_id ?? null)
    _pendingParentId = null  // 使用后立即清除
    const maxSort = ds.items.reduce((max, i) => Math.max(max, i.sort || 0), 0)
    const itemData = { ...data, parent_id: parentId, _skipDedup: true, sort: maxSort + 1 }
    if (!snapToGrid.value && ctxX != null && ctxY != null) {
      itemData.custom = { x: ctxX, y: ctxY }
    }
    await ds.addItem(itemData)
    // 新建后刷新当前文件夹视图（如果当前打开的是目标父级文件夹）
    if (currentFolder.value && parentId === currentFolder.value.id) {
      currentFolder.value = { ...currentFolder.value, children: ds.getChildren(parentId) }
    }
  } else if (editingItem.value) {
    await ds.updateItem(editingItem.value.id, data)
    refreshFolderChildren()
  }
}
// 桌面图标自由拖拽
const iconsRef = ref(null)
const snapToGrid = ref(false) // 默认关闭紧贴网格，拖拽后保持自由位置
const lastDragItem = ref(null) // 正在拖拽或最近拖拽的图标，保持较高层级
const dragOverFolder = ref(null) // 悬停500ms后允许放入的文件夹 id
let folderHoverTimer = null // 文件夹悬停计时器
let folderHoverId = null    // 正在计时的文件夹 id
const iconPos = {}
const ICON_W = 80, ICON_H = 90, GRID_GAP = 16, GRID_PAD = 20, COLS = 1
let syncTimer = null // 防抖同步定时器
let syncQueue = {}   // 待同步队列 { [id]: data }，相同 id 只保留最后一条
// 双击检测：记录上一次点击的时间与图标 id，300ms 内同一图标两次点击视为双击打开
let lastClickInfo = { time: 0, itemId: null }

function getItemBasePos(item) {
  const c = item.custom || {}
  if (c.x != null && c.y != null && !snapToGrid.value) return { x: c.x, y: c.y }
  const idx = ds.rootItems.findIndex(i => i.id === item.id)
  // 竖向排列：纵向自上而下排满容器可视高度后，流转至下一列
  const container = iconsRef.value
  const containerH = container ? container.clientHeight : window.innerHeight
  const maxRowsPerCol = Math.max(1, Math.floor((containerH - GRID_PAD) / (ICON_H + GRID_GAP)))
  const col = Math.floor(idx / maxRowsPerCol)
  const row = idx % maxRowsPerCol
  return { x: GRID_PAD + col * (ICON_W + GRID_GAP), y: GRID_PAD + row * (ICON_H + GRID_GAP) }
}

function iconStyle(item) {
  const p = getItemBasePos(item)
  return { position: 'absolute', left: p.x + 'px', top: p.y + 'px', zIndex: lastDragItem.value === item.id ? 2 : 1 }
}

// 从文件夹拖出图标（使用原生 HTML5 拖拽，FolderView 中的 dragstart 负责图像）
function onFolderDragStart({ item, offsetX, offsetY, clientX, clientY }) {
  lastDragItem.value = item.id
  // 在桌面创建一个临时位置占位（用 iconPos 保持位置）
  iconPos[item.id] = { x: clientX - offsetX, y: clientY - offsetY }
}

function onIconMouseDown(e, item) {
  lastDragItem.value = item.id
  if (e.button !== 0) return
  const p = getItemBasePos(item)
  const rect = e.currentTarget.getBoundingClientRect()
  iconPos[item.id] = { x: p.x, y: p.y }
  e.currentTarget._dragOffset = { ox: e.clientX - rect.left, oy: e.clientY - rect.top, startX: e.clientX, startY: e.clientY, baseX: p.x, baseY: p.y }
  document.addEventListener('mousemove', onIconDragMove)
  document.addEventListener('mouseup', onIconDragUp)
}

function onIconDragMove(e) {
  if (!lastDragItem.value) return
  const el = document.querySelector(`[data-item-id="${lastDragItem.value}"]`)
  if (!el) return
  const off = el._dragOffset
  if (!off) return
  const dx = e.clientX - off.startX
  const dy = e.clientY - off.startY
  // 用 transform 偏移，保留缩放拖拽效果
  el.style.transform = `translate(${dx}px,${dy}px) scale(0.95)`
  // 如果拖拽来自文件夹，用坐标检测鼠标是否移出文件夹遮罩（避免临时拖拽元素导致 e.target 不匹配）
  if (currentFolder.value) {
    const folderOverlay = document.querySelector('.nexus-folder-overlay')
    if (folderOverlay) {
      const rect = folderOverlay.getBoundingClientRect()
      const isInside = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom
      if (!isInside) currentFolder.value = null
    }
  }
  // 检测拖拽图标下方是否有文件夹
  const oldPointer = el.style.pointerEvents
  el.style.pointerEvents = 'none'
  const under = document.elementFromPoint(e.clientX, e.clientY)
  el.style.pointerEvents = oldPointer
  const target = under?.closest('[data-item-id]')
  const tid = target ? Number(target.dataset.itemId) : null
  const t = tid ? ds.items.find(i => i.id === tid) : null
  const isFolder = t && t.type === 'folder' && tid !== lastDragItem.value
  // 悬停500ms后才允许放入文件夹
  if (isFolder) {
    if (folderHoverId !== tid) {
      folderHoverId = tid
      clearTimeout(folderHoverTimer)
      folderHoverTimer = setTimeout(() => { dragOverFolder.value = tid }, 500)
    }
  } else {
    clearTimeout(folderHoverTimer)
    folderHoverId = null
    dragOverFolder.value = null
  }
}

async function onIconDragUp(e) {
  const id = lastDragItem.value
  if (!id) return
  const dropFolderId = dragOverFolder.value
  clearTimeout(folderHoverTimer); folderHoverId = null; dragOverFolder.value = null
  document.removeEventListener('mousemove', onIconDragMove)
  document.removeEventListener('mouseup', onIconDragUp)
  const el = document.querySelector(`[data-item-id="${id}"]`)
  if (!el) return
  const off = el._dragOffset; el._dragOffset = null
  if (!off) return
  // 鼠标必须移动超过 3px 才算拖拽，否则视为点击跳过
  const dx = e.clientX - off.startX, dy = e.clientY - off.startY
  if (Math.abs(dx) <= 3 && Math.abs(dy) <= 3) {
    if (!document.querySelector('.nexus-desktop-icons')?.contains(el)) el.remove()
    // 双击检测：300ms 内同一图标两次点击 → 打开页面
    const now = Date.now()
    if (now - lastClickInfo.time < 300 && lastClickInfo.itemId === id) {
      const item = ds.items.find(i => i.id === id)
      if (item) handleItemClick(item)
    }
    lastClickInfo = { time: now, itemId: id }
    return
  }
  el.style.transform = ''
  // 检测鼠标释放位置是否仍在文件夹遮罩内——如果是，放弃本次拖拽操作（不移出文件夹）
  if (currentFolder.value) {
    const folderOverlay = document.querySelector('.nexus-folder-overlay')
    if (folderOverlay) {
      const rect = folderOverlay.getBoundingClientRect()
      const isInside = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom
      if (isInside) {
        // 在文件夹内释放，不移动图标，不关闭文件夹
        if (!document.querySelector('.nexus-desktop-icons')?.contains(el)) el.remove()
        return
      }
    }
  }
  const x = Math.max(0, off.baseX + dx), y = Math.max(0, off.baseY + dy)
  const item = ds.items.find(i => i.id === id)
  if (!item) return
  // 检测是否拖到已激活的文件夹上
  if (dropFolderId) {
    item.parent_id = dropFolderId
    scheduleSync(id, { parent_id: dropFolderId })
    return
  }
  // 如果是从文件夹拖出来的，设置 parent_id=null 移出文件夹
  if (item.parent_id) {
    item.parent_id = null
    ds.updateItem(id, { parent_id: null, custom: { x, y, ...(item.custom || {}) } })
  } else {
    const newCustom = { ...(item.custom || {}), x, y }
    item.custom = newCustom
    snapToGrid.value = false
    lastDragItem.value = id
    ds.updateItem(id, { custom: newCustom })
  }
  // 清理临时拖拽元素（从文件夹拖出时创建的）
  if (!document.querySelector('.nexus-desktop-icons')?.contains(el)) el.remove()
}

// 防抖同步到后端：2秒内无新操作才发请求，相同 id 只保留最后一次
function scheduleSync(id, data) {
  syncQueue[id] = data
  if (syncTimer) clearTimeout(syncTimer)
  syncTimer = setTimeout(() => {
    const batch = syncQueue
    syncQueue = {}; syncTimer = null
    Promise.all(Object.entries(batch).map(([i, d]) => ds.updateItem(i, d).catch(() => { })))
  }, 2000)
}

// 排列图标：清除自定义坐标，恢复网格排列
async function arrangeIcons() {
  ctxVisible.value = false
  const items = ds.rootItems
  for (const item of items) {
    const c = item.custom || {}
    // 清除 x,y 但保留其他 custom 属性
    const { x: _, y: __, ...rest } = c
    item.custom = Object.keys(rest).length ? rest : {}
    await ds.updateItem(item.id, { custom: item.custom })
  }
  snapToGrid.value = true
}

function toggleSnap() { ctxVisible.value = false; snapToGrid.value = !snapToGrid.value; if (snapToGrid.value) arrangeIcons() }
const homePage = computed(() => (window.__NEXUS_ADMIN_PAGES__ || {})['nexus-home'] || null)

// ==================== 框选 ====================
const selectStyle = computed(() => {
  if (!selectRect.value) return {}
  const r = selectRect.value
  return { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' }
})

function onDesktopMouseDown(e) {
  if (e.button !== 0) return
  if (!iconsRef.value) return
  // 点击图标时不触发框选
  const iconEl = e.target.closest('.nexus-desktop-icon')
  if (iconEl) return
  // 阻止浏览器原生框选（文本/图片选中变蓝效果）
  e.preventDefault()
  // 清除已有选中
  selectedIds.value = new Set()
  isSelecting.value = true
  const rect = iconsRef.value.getBoundingClientRect()
  selectStart.value = { x: e.clientX - rect.left, y: e.clientY - rect.top, baseLeft: rect.left, baseTop: rect.top }
  selectRect.value = { left: selectStart.value.x, top: selectStart.value.y, width: 0, height: 0 }
  document.addEventListener('mousemove', onSelectMove)
  document.addEventListener('mouseup', onSelectEnd)
}

function onSelectMove(e) {
  if (!isSelecting.value || !selectStart.value) return
  const rect = iconsRef.value.getBoundingClientRect()
  const curX = e.clientX - rect.left
  const curY = e.clientY - rect.top
  const left = Math.min(selectStart.value.x, curX)
  const top = Math.min(selectStart.value.y, curY)
  const width = Math.abs(curX - selectStart.value.x)
  const height = Math.abs(curY - selectStart.value.y)
  selectRect.value = { left, top, width, height }
  // 检测哪些图标被框选（矩形相交检测）
  const newSelected = new Set()
  const selLeft = left + (rect.left - selectStart.value.baseLeft)
  const selTop = top + (rect.top - selectStart.value.baseTop)
  const selRight = selLeft + width
  const selBottom = selTop + height
  ds.rootItems.forEach(item => {
    const el = document.querySelector(`[data-item-id="${item.id}"]`)
    if (el) {
      const iconRect = el.getBoundingClientRect()
      const iLeft = iconRect.left - rect.left
      const iTop = iconRect.top - rect.top
      const iRight = iLeft + iconRect.width
      const iBottom = iTop + iconRect.height
      if (iLeft < selRight && iRight > selLeft && iTop < selBottom && iBottom > selTop) {
        newSelected.add(item.id)
      }
    }
  })
  selectedIds.value = newSelected
}

function onSelectEnd() {
  isSelecting.value = false
  selectRect.value = null
  selectStart.value = null
  document.removeEventListener('mousemove', onSelectMove)
  document.removeEventListener('mouseup', onSelectEnd)
}

async function batchDeleteItems() {
  const ids = Array.from(selectedIds.value)
  if (ids.length === 0) return
  ctxVisible.value = false
  const { ElMessageBox } = await import('element-plus')
  try {
    const key = 'common.confirmDeleteBatch'
    const translated = t(key, { count: ids.length })
    const msg = translated !== key ? translated : '确定删除选中的 {count} 个项目？'.replace('{count}', ids.length)
    await ElMessageBox.confirm(msg, '提示', { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' })
    for (const id of ids) {
      ds.removeItem(id)
    }
    selectedIds.value = new Set()
    refreshFolderChildren()
  } catch (ex) { /* cancel */ }
}
</script>

<style scoped>
.nexus-desktop-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: var(--nexus-bg-color)
}

.nexus-desktop-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  position: relative;
  z-index: 1
}

.nexus-desktop-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  transition: background 0.5s ease
}

/* 桌面背景视觉增强：伪元素叠加层 */
.nexus-bg-enhanced::before,
.nexus-bg-enhanced::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1
}

/* 光泽层：顶部径向渐变，营造柔和光晕 */
.nexus-bg-enhanced::before {
  background: radial-gradient(ellipse 80% 40% at 50% 0%, var(--nexus-desktop-glow), transparent 70%)
}

/* 纹理层：浅淡点阵网格 */
.nexus-bg-enhanced::after {
  background-image: radial-gradient(circle, var(--nexus-desktop-grid-color) 1px, transparent 1px);
  background-size: 32px 32px
}

.nexus-desktop {
  flex: 1;
  position: relative;
  z-index: 1;
  overflow: hidden;
  user-select: none
}

.nexus-desktop-icons {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden
}

.nexus-desktop-icon {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 6px;
  cursor: default;
  border-radius: 10px;
  width: 80px;
  min-height: 90px;
  -webkit-user-select: none;
  user-select: none
}

.nexus-desktop-icon * {
  -webkit-user-select: none;
  user-select: none
}

.nexus-desktop-icon:hover {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(8px)
}

/* 拖到文件夹上：虚线框表示放入 */
.nexus-drop-folder {
  background: rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(8px);
  outline: 2px dashed var(--nexus-primary-color);
  outline-offset: -2px;
  animation: nexus-folder-pulse .8s ease-in-out infinite
}

@keyframes nexus-folder-pulse {

  0%,
  100% {
    transform: scale(1)
  }

  50% {
    transform: scale(1.15)
  }
}

.nexus-desktop-icon-img {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, color-mix(in srgb, var(--el-color-primary) 10%, rgba(255, 255, 255, 0.95)), rgba(255, 255, 255, 0.20));
  border-radius: 14px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12), inset 0 1.5px 0 rgba(255, 255, 255, 0.30), inset 0 -1px 0 rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.10);
  backdrop-filter: blur(6px)
}

/* 图标着色：白色高对比 + 微投影立体感 */
.nexus-desktop-icon-img :deep(.el-icon) {
  color: #fff !important;
  filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.25))
}

.nexus-desktop-icon-label {
  font-size: var(--nexus-font-size-sm);
  text-align: center;
  word-break: break-all;
  color: #fff;
  font-weight: 500;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.5), 0 0 4px rgba(0, 0, 0, 0.25)
}

/* 加载遮罩 */
.nexus-loading-overlay {
  position: absolute;
  inset: 0;
  z-index: 999;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px
}

.nexus-loading-bar {
  width: 240px;
  height: 4px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
  overflow: hidden
}

.nexus-loading-bar-inner {
  width: 30%;
  height: 100%;
  background: var(--nexus-primary-color);
  border-radius: 2px;
  animation: nexus-loading-progress 1.4s ease-in-out infinite
}

@keyframes nexus-loading-progress {
  0% {
    transform: translateX(-100%)
  }

  50% {
    transform: translateX(200%)
  }

  100% {
    transform: translateX(400%)
  }
}

.nexus-loading-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  letter-spacing: 1px
}

.nexus-desktop-empty {
  grid-column: 1/-1;
  display: flex;
  justify-content: center;
  padding: 60px 0
}

.nexus-desktop-windows {
  position: absolute;
  inset: 0;
  pointer-events: none
}

.nexus-desktop-windows>* {
  pointer-events: auto
}

.nexus-ctx {
  position: fixed;
  z-index: 5000;
  background: var(--nexus-bg-color-light);
  border-radius: 10px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.18);
  border: 1px solid var(--nexus-border-color);
  padding: 4px;
  min-width: 140px
}

.nexus-ctx-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 6px;
  font-size: 13px;
  color: var(--nexus-text-color)
}

.nexus-ctx-item:hover {
  background: var(--nexus-bg-color-dark)
}

.nexus-ctx-divider {
  height: 1px;
  background: var(--nexus-border-color);
  margin: 4px 8px
}

html.dark .nexus-desktop-icon-img {
  background: linear-gradient(145deg, color-mix(in srgb, var(--el-color-primary) 8%, rgba(255, 255, 255, 0.92)), rgba(255, 255, 255, 0.32));
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.10), inset 0 1.5px 0 rgba(255, 255, 255, 0.28), inset 0 -1px 0 rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.15)
}

/* 框选虚线框 */
.nexus-select-rect {
  position: absolute;
  z-index: 500;
  border: 1.5px dashed rgba(0, 0, 0, 0.2);
  background: color-mix(in srgb, rgba(0, 0, 0, 0.2) 6%, transparent);
  pointer-events: none;
  border-radius: 4px
}

html.dark .nexus-select-rect {
  border-color: rgba(255, 255, 255, 0.2);
  background: color-mix(in srgb, rgba(255, 255, 255, 0.2) 6%, transparent);
}

/* 选中图标高亮 */
.nexus-desktop-icon-selected {
  background: rgba(255, 255, 255, 0.18) !important;
  backdrop-filter: blur(8px);
  outline: 1.5px solid var(--nexus-primary-color);
  outline-offset: -1.5px
}

/* 暗色模式：白色光晕替代暗投影，图标边缘更清晰 */
html.dark .nexus-desktop-icon-img :deep(.el-icon) {
  filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.20)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15)) !important
}

/* 暗色模式：文字阴影调亮 */
html.dark .nexus-desktop-icon-label {
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.35)
}

/* 首页侧滑面板 */
.nexus-home-overlay {
  position: fixed;
  inset: 0;
  z-index: 5000;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: flex-end
}

.nexus-home-panel {
  width: 520px;
  max-width: 90vw;
  height: 100vh;
  background: var(--nexus-bg-color-light);
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  animation: nexus-slide-in 0.25s ease-out
}

@keyframes nexus-slide-in {
  from {
    transform: translateX(100%)
  }

  to {
    transform: translateX(0)
  }
}

.nexus-home-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--nexus-border-color);
  font-size: 16px;
  font-weight: 600
}

.nexus-home-panel-body {
  flex: 1;
  overflow: auto;
  padding: 16px
}
</style>