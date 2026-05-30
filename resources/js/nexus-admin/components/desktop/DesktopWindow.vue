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
  </div>
</template>

<script setup>
import { computed, ref, watch, onUnmounted } from 'vue'
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
})

// 被激活时自动还原（取消最小化）
watch(() => props.isActive, (val) => {
  if (val && minimized.value) minimized.value = false
})

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
  background: rgba(0, 0, 0, 0.15);
  border-bottom-color: rgba(255, 255, 255, 0.04);
}
</style>
