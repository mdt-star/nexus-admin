<template>
  <Teleport to="body">
    <div class="nexus-folder-overlay" :class="{ 'nexus-folder-entering': entering, 'nexus-folder-leaving': leaving }" @click.self="onBackdropClick">
      <div class="nexus-folder-backdrop" @click="doClose" />
      <div class="nexus-folder-popup" :style="popupStyle">
        <div class="nexus-folder-grid">
          <div
            v-for="child in folder.children"
            :key="child.id"
            class="nexus-folder-item"
            :data-folder-child-id="child.id"
            @mousedown="onChildMouseDown($event,child)"
            @dblclick="openChild(child)"
          >
            <div class="nexus-folder-item-icon">
              <el-icon :size="32">
                <component :is="getIconComponent(child.icon)" />
              </el-icon>
            </div>
            <span class="nexus-folder-item-label">{{ child.title }}</span>
          </div>
        </div>
        <div class="nexus-folder-title">{{ folder.title }}</div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const props = defineProps({
  folder: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['open', 'close', 'drag-start'])

const entering = ref(true)
const leaving = ref(false)
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

  // 播放离开动画
  popupStyle.value = {
    transform: 'scale(0.85)',
    opacity: '0',
    transition: 'transform 0.15s ease-in, opacity 0.15s ease-in'
  }

  // 动画完成后通知父组件销毁
  setTimeout(() => emit('close'), 160)
}

function openChild(item) {
  emit('open', item)
  doClose()
}

function getIconComponent(iconName) {
  if (!iconName) return null
  return ElementPlusIconsVue[iconName] || null
}

// 从文件夹拖出图标
function onChildMouseDown(e,child){
  if(e.button!==0)return
  const rect=e.currentTarget.getBoundingClientRect()
  // 通知父组件开始拖拽
  emit('drag-start',{item:child,offsetX:e.clientX-rect.left,offsetY:e.clientY-rect.top,clientX:e.clientX,clientY:e.clientY})
  // 点击也可打开，但如果有拖拽则由父组件处理
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
  padding: 24px 20px 16px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.2);
  width: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.nexus-folder-grid {
  display: grid;
  grid-template-columns: repeat(3, 72px);
  gap: 8px;
  justify-content: center;
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

.nexus-folder-title {
  margin-top: 12px;
  font-size: 12px;
  font-weight: 500;
  color: var(--nexus-text-color-secondary);
  text-align: center;
}

[data-theme="dark"] .nexus-folder-backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}

[data-theme="dark"] .nexus-folder-leaving .nexus-folder-backdrop {
  background-color: rgba(0, 0, 0, 0);
}
</style>