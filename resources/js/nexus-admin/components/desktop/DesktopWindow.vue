<template>
  <div
    ref="elRef"
    class="nexus-desktop-window"
    :class="{ 'nexus-window-active': isActive, 'nexus-window-minimized': minimized, 'nexus-window-dragging': isDragging }"
    :style="windowStyle"
    @mousedown="onActivate"
  >
    <div class="nexus-window-titlebar" @mousedown.prevent="onStartDrag">
      <div class="nexus-window-titlebar-drag">
        <el-icon v-if="win.icon" class="nexus-window-title-icon" :size="16">
          <component :is="getIconComponent(win.icon)" />
        </el-icon>
        <span class="nexus-window-title">{{ win.title }}</span>
      </div>
      <div class="nexus-window-titlebar-actions">
        <el-button class="nexus-win-btn nexus-win-min" :icon="Minus" circle size="small" text @click.stop="onMinimize" />
        <el-button class="nexus-win-btn nexus-win-max" :icon="CopyDocument" circle size="small" text @click.stop="onMaximize" />
        <el-button class="nexus-win-btn nexus-win-close" :icon="Close" circle size="small" text @click.stop="onClose" />
      </div>
    </div>
    <div class="nexus-window-content">
      <component :is="getPage(win.component)" />
    </div>
    <!-- 缩放手柄 -->
    <div v-if="!maximized" class="nexus-resize-handle nexus-resize-l" @mousedown.prevent.stop="onResizeStart($event,'l')" />
    <div v-if="!maximized" class="nexus-resize-handle nexus-resize-r" @mousedown.prevent.stop="onResizeStart($event,'r')" />
    <div v-if="!maximized" class="nexus-resize-handle nexus-resize-b" @mousedown.prevent.stop="onResizeStart($event,'b')" />
    <div v-if="!maximized" class="nexus-resize-handle nexus-resize-bl" @mousedown.prevent.stop="onResizeStart($event,'bl')" />
    <div v-if="!maximized" class="nexus-resize-handle nexus-resize-br" @mousedown.prevent.stop="onResizeStart($event,'br')">
      <div class="nexus-resize-grip" />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useWindowStore } from '../../stores/windows'
import * as Icons from '@element-plus/icons-vue'
import { Minus, CopyDocument, Close } from '@element-plus/icons-vue'

const props = defineProps({
  win: { type: Object, required: true },
  isActive: { type: Boolean, default: false },
  rect: { type: Object, default: () => ({ left: 0, top: 0, width: 600, height: 400 }) },
  zIndex: { type: Number, default: 10 }
})
const emit = defineEmits(['activate', 'minimize', 'maximize', 'close'])

const windowStore = useWindowStore()
const minimized = ref(false)
const maximized = ref(false)
const isDragging = ref(false)
const elRef = ref(null)

// 基础位置（初始 rect）
const basePos = ref({ left: props.rect.left, top: props.rect.top })
const size = ref({ width: props.rect.width, height: props.rect.height })

// 拖动偏移量（transform translate，不触发 layout）
const dragOffset = ref({ x: 0, y: 0 })

const cache = {}
function getPage(name) {
  return cache[name] || (cache[name] = (window.__NEXUS_ADMIN_PAGES__ || {})[name] || null)
}
function getIconComponent(n) { return n ? Icons[n] || null : null }

function onActivate() { emit('activate', props.win.id) }

function onMinimize() {
  minimized.value = true
  // 取消激活，同步隐藏任务栏指示器/Tab 底部横线
  windowStore.deactivate()
  emit('minimize', props.win.id)
}

function onMaximize() {
  maximized.value = !maximized.value
}

function onClose() {
  windowStore.close(props.win.id)
  emit('close', props.win.id)
}

function onStartDrag(event) {
  if (maximized.value) return
  isDragging.value = true
  const rect = elRef.value?.getBoundingClientRect()
  dragOffset.value = { x: 0, y: 0 }
  // 记录拖拽起始信息
  const drag = { startX: event.clientX, startY: event.clientY, baseLeft: basePos.value.left, baseTop: basePos.value.top }
  window.__nexusDrag = drag
  document.addEventListener('mousemove', onDragMove)
  document.addEventListener('mouseup', onDragEnd)
  document.body.classList.add('nexus-dragging')
  document.body.style.cursor = 'move'
  if (elRef.value) elRef.value.style.backdropFilter = 'none'
}

function onDragMove(event) {
  const drag = window.__nexusDrag
  if (!drag) return
  const dx = event.clientX - drag.startX
  const dy = event.clientY - drag.startY
  // 直接更新 offset，无 rAF 延迟，避免回弹
  dragOffset.value = { x: dx, y: dy }
}

function onDragEnd() {
  const drag = window.__nexusDrag
  if (!drag) return
  // 合并最终偏移到 basePos
  const dx = dragOffset.value.x
  const dy = dragOffset.value.y
  basePos.value.left = Math.max(0, drag.baseLeft + dx)
  basePos.value.top = Math.max(0, drag.baseTop + dy)
  dragOffset.value = { x: 0, y: 0 }
  isDragging.value = false
  window.__nexusDrag = null
  document.removeEventListener('mousemove', onDragMove)
  document.removeEventListener('mouseup', onDragEnd)
  document.body.classList.remove('nexus-dragging')
  document.body.style.cursor = ''
  if (elRef.value) elRef.value.style.backdropFilter = ''
}

onUnmounted(() => {
  if (window.__nexusDrag) {
    document.removeEventListener('mousemove', onDragMove)
    document.removeEventListener('mouseup', onDragEnd)
    document.body.classList.remove('nexus-dragging')
    document.body.style.cursor = ''
    window.__nexusDrag = null
  }
  if (window.__nexusResize) {
    document.removeEventListener('mousemove', onResizeMove)
    document.removeEventListener('mouseup', onResizeEnd)
    document.body.classList.remove('nexus-dragging')
    window.__nexusResize = null
  }
})

// 被激活时自动还原（取消最小化）
watch(() => props.isActive, (val) => {
  if (val && minimized.value) minimized.value = false
})

// 收到 taskbar 切换事件：最小化 ↔ 恢复（当前窗口已激活的场景）
function onToggleRequest(e) {
  if (e.detail.id === props.win.id) {
    minimized.value = !minimized.value
  }
}
// 收到恢复事件（从桌面图标重新打开时）
function onRestoreRequest(e) {
  if (e.detail.id === props.win.id && minimized.value) {
    minimized.value = false
  }
}
onMounted(() => {
  window.addEventListener('nexus-toggle-window', onToggleRequest)
  window.addEventListener('nexus-restore-window', onRestoreRequest)
})
onUnmounted(() => {
  window.removeEventListener('nexus-toggle-window', onToggleRequest)
  window.removeEventListener('nexus-restore-window', onRestoreRequest)
})

// ===== 尺寸缩放（Resize） =====
const MIN_W = 300, MIN_H = 200
function onResizeStart(event, mode) {
  if (maximized.value) return
  const rect = elRef.value?.getBoundingClientRect()
  window.__nexusResize = { startX: event.clientX, startY: event.clientY, baseLeft: basePos.value.left, baseWidth: size.value.width || rect?.width || MIN_W, baseHeight: size.value.height || rect?.height || MIN_H, mode }
  document.addEventListener('mousemove', onResizeMove)
  document.addEventListener('mouseup', onResizeEnd)
  document.body.classList.add('nexus-dragging')
  if (elRef.value) elRef.value.style.backdropFilter = 'none'
}
function onResizeMove(event) {
  const r = window.__nexusResize
  if (!r) return
  const dx = event.clientX - r.startX, dy = event.clientY - r.startY
  let w = r.baseWidth, h = r.baseHeight
  if (r.mode === 'r' || r.mode === 'br') w = Math.max(MIN_W, r.baseWidth + dx)
  if (r.mode === 'l' || r.mode === 'bl') w = Math.max(MIN_W, r.baseWidth - dx)
  if (r.mode === 'b' || r.mode === 'br' || r.mode === 'bl') h = Math.max(MIN_H, r.baseHeight + dy)
  size.value = { width: w, height: h }
  // 左侧缩放时同步调整 left，右侧不动
  if (r.mode === 'l' || r.mode === 'bl') basePos.value.left = r.baseLeft + (r.baseWidth - w)
}
function onResizeEnd() {
  window.__nexusResize = null
  document.removeEventListener('mousemove', onResizeMove)
  document.removeEventListener('mouseup', onResizeEnd)
  document.body.classList.remove('nexus-dragging')
  if (elRef.value) elRef.value.style.backdropFilter = ''
}

const windowStyle = computed(() => {
  if (maximized.value) {
    return { left: '8px', top: '8px', width: 'calc(100% - 16px)', height: 'calc(100% - 16px)', zIndex: props.zIndex, borderRadius: 'var(--nexus-window-radius)' }
  }
  const dx = dragOffset.value.x
  const dy = dragOffset.value.y
  const hasOffset = dx !== 0 || dy !== 0
  const transform = hasOffset ? `translate(${dx}px, ${dy}px)` : 'none'
  return {
    left: basePos.value.left + 'px',
    top: basePos.value.top + 'px',
    width: size.value.width + 'px',
    height: size.value.height + 'px',
    zIndex: props.zIndex,
    transform,
    willChange: isDragging.value ? 'transform' : 'auto'
  }
})
</script>

<style scoped>
.nexus-desktop-window {
  position: absolute;
  background: var(--nexus-window-bg);
  backdrop-filter: blur(var(--nexus-window-blur));
  -webkit-backdrop-filter: blur(var(--nexus-window-blur));
  border-radius: var(--nexus-window-radius);
  box-shadow: var(--nexus-window-shadow);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.18);
  /* 预声明 transform 启用 GPU 合成层 */
  will-change: transform, opacity;
  /* 只用阴影过渡，不用 left/top */
  transition: box-shadow 0.3s ease, opacity 0.2s ease;
}

.nexus-desktop-window:hover {
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* 拖动时禁用 backdrop-filter 和过渡，保证帧率 */
.nexus-window-dragging {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  transition: none !important;
  user-select: none;
}

.nexus-window-active {
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.18), 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}

.nexus-window-minimized {
  display: none;
}

.nexus-window-titlebar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--nexus-window-header-height);
  padding: 0 8px;
  cursor: move;
  user-select: none;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.08);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.nexus-window-titlebar-drag {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.nexus-window-title-icon {
  flex-shrink: 0;
  opacity: 0.7;
}

.nexus-window-title {
  font-size: var(--nexus-font-size-sm);
  font-weight: 500;
  color: var(--nexus-text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nexus-window-titlebar-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

.nexus-win-btn {
  width: 28px;
  height: 28px;
  --el-button-size: 28px !important;
  transition: all 0.15s ease;
}

.nexus-win-btn:hover {
  background: rgba(255, 255, 255, 0.12) !important;
}

.nexus-win-close:hover {
  background: rgba(239, 68, 68, 0.3) !important;
  color: #ef4444 !important;
}

.nexus-window-content {
  flex: 1;
  overflow: auto;
  padding: 12px 16px;
  background: var(--nexus-bg-color-light);
}

html.dark .nexus-desktop-window {
  border-color: rgba(255, 255, 255, 0.06);
}

html.dark .nexus-window-titlebar {
  background: linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.02));
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

/* ===== 缩放手柄 ===== */
.nexus-resize-handle{position:absolute;z-index:10}
.nexus-resize-l{left:0;top:0;width:6px;height:100%;cursor:w-resize}
.nexus-resize-r{right:0;top:0;width:6px;height:100%;cursor:e-resize}
.nexus-resize-b{left:0;bottom:0;width:100%;height:6px;cursor:s-resize}
.nexus-resize-bl{left:0;bottom:0;width:20px;height:20px;cursor:sw-resize;z-index:11}
.nexus-resize-br{right:0;bottom:0;width:20px;height:20px;cursor:se-resize;z-index:11}
/* 右下角拖拽角标 */
.nexus-resize-grip{position:absolute;right:4px;bottom:4px;width:8px;height:8px}
.nexus-resize-grip::after{content:'';position:absolute;right:0;bottom:0;width:7px;height:7px;border-right:2px solid rgba(255,255,255,0.35);border-bottom:2px solid rgba(255,255,255,0.35);border-radius:1px}
</style>
