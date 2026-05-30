<template>
  <Teleport to="body">
    <div class="nexus-folder-overlay" :class="{ 'nexus-folder-entering': entering, 'nexus-folder-leaving': leaving }" @click.self="onBackdropClick" @dragover.prevent @drop.prevent="onOverlayDrop">
      <div class="nexus-folder-backdrop" @click="doClose" />
      <div class="nexus-folder-popup" :style="popupStyle">
        <div class="nexus-folder-header">
          <span class="nexus-folder-title">{{ folder.title }}</span>
        </div>
        <div class="nexus-folder-grid">
          <div v-if="folderPath && folderPath.length > 0"
            class="nexus-folder-item nexus-folder-back-item"
            :class="{ 'nexus-drag-over-back': isDragOverBack }"
            @dragover.prevent="isDragOverBack = true"
            @dragleave="isDragOverBack = false"
            @drop.prevent.stop="onBackDrop"
            @click="goBack"
          >
            <div class="nexus-folder-item-icon">
              <el-icon :size="32"><ArrowLeft /></el-icon>
            </div>
            <span class="nexus-folder-item-label">返回上级</span>
          </div>
          <template v-if="folder.children && folder.children.length > 0">
            <div
              v-for="child in folder.children"
              :key="child.id"
              class="nexus-folder-item"
              :class="{
                'nexus-folder-item-folder': child.type === 'folder',
                'nexus-drag-over-folder': child.type === 'folder' && dragOverFolderId === child.id
              }"
              :data-folder-child-id="child.id"
              :data-folder-id="child.type === 'folder' ? child.id : ''"
              draggable="true"
              @dragstart="onChildDragStart($event, child)"
              @dragover.prevent="dragOverFolderId = child.type === 'folder' ? child.id : null"
              @dragleave="dragOverFolderId = null"
              @dblclick="openChild(child)"
              @contextmenu.prevent.stop="onChildContextMenu($event, child)"
            >
              <div class="nexus-folder-item-icon">
                <el-icon :size="32">
                  <component :is="getIconComponent(child.icon)" />
                </el-icon>
              </div>
              <span class="nexus-folder-item-label">{{ child.title }}</span>
            </div>
          </template>
          <div v-else-if="!(folderPath && folderPath.length > 0)" class="nexus-folder-empty">
            <div class="nexus-folder-empty-icon">
              <el-icon :size="40"><component :is="getIconComponent('FolderOpened')" /></el-icon>
            </div>
            <span class="nexus-folder-empty-text">请将图标拖动到文件夹图标上悬停片刻释放</span>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useDisktopStore } from '../../stores/disktop'

const props = defineProps({
  folder: {
    type: Object,
    required: true
  },
  folderPath: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['open', 'close', 'drag-start', 'back', 'context-menu', 'children-changed'])
const ds = useDisktopStore()

const entering = ref(true)
const leaving = ref(false)
const isDragOverBack = ref(false)
const dragOverFolderId = ref(null)
const popupStyle = ref({
  transform: 'scale(0.85)',
  opacity: '0',
  transition: 'none'
})
onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  // 触发进入动画
  requestAnimationFrame(() => {
    popupStyle.value = {
      transform: 'scale(1)',
      opacity: '1',
      transition: 'transform 0.2s ease-out, opacity 0.2s ease-out'
    }
    requestAnimationFrame(() => {
      entering.value = false
    })
  })
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
})

function onKeydown(e) {
  if (e.key === 'Escape') doClose()
}

function onBackdropClick() {
  doClose()
}

function doClose() {
  if (leaving.value) return
  leaving.value = true
  popupStyle.value = {
    transform: 'scale(0.85)',
    opacity: '0',
    transition: 'transform 0.15s ease-in, opacity 0.15s ease-in'
  }
  setTimeout(() => emit('close'), 160)
}

function openChild(item) {
  emit('open', item)
  // 文件夹类型在当前视图内导航，不关闭视图；其他类型（menu）关闭视图并打开窗口
  if (item.type !== 'folder') {
    doClose()
  }
}

function getIconComponent(iconName) {
  if (!iconName) return null
  return ElementPlusIconsVue[iconName] || null
}

// 返回上级目录
// 拖拽到返回上级图标：移回上级目录（.stop 阻止冒泡到 overlay）
function onBackDrop(e) {
  isDragOverBack.value = false
  const raw = e.dataTransfer.getData('application/json')
  if (!raw) return
  try {
    const dragItem = JSON.parse(raw)
    if (!dragItem._fromFolder) return
    const path = props.folderPath
    const parent = path.length > 0 ? path[path.length - 1] : null
    const pid = parent ? parent.id : null
    if (pid !== dragItem.parent_id) {
      ds.updateItem(dragItem.id, { parent_id: pid })
      emit('children-changed')
    }
  } catch (ex) { /* ignore */ }
}

function goBack() {
  emit('back')
}

// 文件夹内部子项右键菜单
function onChildContextMenu(e, child) {
  emit('context-menu', { event: e, item: child })
}

// 原生 HTML5 拖拽：从文件夹拖出图标，使用原 DOM 克隆作为拖拽图像
function onChildDragStart(e, child) {
  e.dataTransfer.setData('application/json', JSON.stringify({ ...child, _fromFolder: true }))
  e.dataTransfer.effectAllowed = 'move'
  // 克隆当前元素作为原生拖拽图像（保持图标原样）
  const clone = e.currentTarget.cloneNode(true)
  clone.style.position = 'fixed'
  clone.style.left = '-9999px'
  clone.style.top = '-9999px'
  clone.style.opacity = '0.85'
  clone.style.transform = 'scale(0.95)'
  document.body.appendChild(clone)
  e.dataTransfer.setDragImage(clone, e.offsetX, e.offsetY)
  // 通知父组件拖拽开始
  const rect = e.currentTarget.getBoundingClientRect()
  emit('drag-start', {
    item: child,
    offsetX: e.offsetX,
    offsetY: e.offsetY,
    clientX: e.clientX,
    clientY: e.clientY
  })
  setTimeout(() => document.body.removeChild(clone), 0)
}

// 在文件夹遮罩上释放拖拽（返回上级由 onBackDrop 独立处理，此处不重复）
function onOverlayDrop(e) {
  dragOverFolderId.value = null
  const data = e.dataTransfer.getData('application/json')
  if (!data) return
  try {
    const item = JSON.parse(data)
    if (!item._fromFolder) return

    // 1. 释放到弹出层内的子文件夹图标上 → 移入该文件夹
    const target = document.elementFromPoint(e.clientX, e.clientY)
    const folderTarget = target?.closest('[data-folder-id]')
    const targetFolderId = folderTarget ? Number(folderTarget.dataset.folderId) : null
    if (targetFolderId && targetFolderId !== item.id) {
      ds.updateItem(item.id, { parent_id: targetFolderId })
      emit('children-changed')
      return
    }

    // 2. 在弹出层内部释放（不在子文件夹上）→ 不移动，不关闭
    const popup = document.querySelector('.nexus-folder-popup')
    if (popup) {
      const rect = popup.getBoundingClientRect()
      const insidePopup = e.clientX >= rect.left && e.clientX <= rect.right &&
                          e.clientY >= rect.top && e.clientY <= rect.bottom
      if (insidePopup) return
    }

    // 3. 在桌面区域释放 → 移出文件夹到鼠标位置
    const maxSort = ds.items.reduce((max, i) => Math.max(max, i.sort || 0), 0)
    ds.updateItem(item.id, {
      parent_id: null,
      sort: maxSort + 1,
      custom: { x: Math.max(0, e.clientX - 40), y: Math.max(0, e.clientY - 45) }
    })
    emit('close')
  } catch (ex) { /* ignore */ }
}
</script>

<style scoped>
.nexus-folder-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  -webkit-user-select: none;
}

.nexus-folder-backdrop {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.35);
  transition: background-color 0.2s;
}

.nexus-folder-leaving .nexus-folder-backdrop {
  background-color: rgba(0, 0, 0, 0);
}

.nexus-folder-popup {
  position: relative;
  background-color: var(--nexus-bg-color-light);
  border-radius: 20px;
  padding: 16px 20px 16px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.2);
  width: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.nexus-folder-header {
  width: 100%;
  margin-bottom: 12px;
  text-align: center;
}

.nexus-folder-grid {
  display: grid;
  grid-template-columns: repeat(3, 72px);
  gap: 8px;
  justify-content: center;
}

/* 返回上级图标 — 与普通图标尺寸一致，带视觉动效 */
.nexus-folder-back-item {
  opacity: 0.7;
  transition: all 0.2s ease;
}
.nexus-folder-back-item:hover {
  opacity: 1;
  background-color: var(--nexus-bg-color-dark);
}
.nexus-folder-back-item .nexus-folder-item-icon {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}
/* 拖拽悬浮在返回上级图标上时的动效 */
.nexus-folder-back-item.nexus-drag-over-back {
  opacity: 1;
  transform: scale(1.1);
  background-color: var(--el-color-primary-light-8);
}
.nexus-folder-back-item.nexus-drag-over-back .nexus-folder-item-icon {
  background-color: var(--el-color-primary-light-5);
  color: #fff;
  box-shadow: 0 0 16px var(--el-color-primary-light-5);
}

/* 拖拽悬浮在子文件夹图标上时的动效 */
.nexus-drag-over-folder {
  transform: scale(1.08);
  background-color: var(--el-color-primary-light-9) !important;
}
.nexus-drag-over-folder .nexus-folder-item-icon {
  background-color: var(--el-color-primary-light-7);
  color: var(--el-color-primary);
  box-shadow: 0 0 12px var(--el-color-primary-light-7);
}

.nexus-folder-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 4px 8px;
  cursor: pointer;
  border-radius: 12px;
  transition: background-color 0.15s;
  user-select: none;
}

.nexus-folder-item:hover {
  background-color: var(--nexus-bg-color-dark);
}

.nexus-folder-item-icon {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--nexus-bg-color);
  border-radius: 14px;
  box-shadow: var(--nexus-box-shadow);
}

.nexus-folder-item-label {
  font-size: 11px;
  text-align: center;
  word-break: break-all;
  line-height: 1.2;
  color: var(--nexus-text-color);
}

.nexus-folder-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px 12px;
  grid-column: 1 / -1;
}

.nexus-folder-empty-icon {
  opacity: 0.3;
  color: var(--nexus-text-color-secondary);
}

.nexus-folder-empty-text {
  font-size: 11px;
  color: var(--nexus-text-color-secondary);
  text-align: center;
  line-height: 1.4;
  opacity: 0.6;
}

.nexus-folder-title {
  font-size: 12px;
  font-weight: 500;
  color: var(--nexus-text-color-secondary);
  text-align: center;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

[data-theme="dark"] .nexus-folder-backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}

[data-theme="dark"] .nexus-folder-leaving .nexus-folder-backdrop {
  background-color: rgba(0, 0, 0, 0);
}
</style>