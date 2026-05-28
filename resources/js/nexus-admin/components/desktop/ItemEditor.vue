<template>
  <Teleport to="body">
    <transition name="nexus-editor">
      <div v-if="visible" class="nexus-editor-overlay" @click.self="close">
        <div class="nexus-editor-panel" :style="panelStyle" @mousedown="onPanelMouseDown">
          <div class="nexus-editor-header" @mousedown.prevent="onHeaderMouseDown">
            <span class="nexus-editor-title">{{ isNew ? '添加项' : '编辑项' }}</span>
            <el-button text :icon="Close" @click="close" />
          </div>

          <div class="nexus-editor-body">
            <!-- 标题 -->
            <el-form :model="form" label-position="top" size="small">
              <el-form-item label="标题">
                <el-input v-model="form.title" placeholder="输入标题" />
              </el-form-item>

              <!-- 图标选择 -->
              <el-form-item label="图标">
                <div class="nexus-editor-icon-select">
                  <el-input
                    v-model="form.icon"
                    placeholder="输入图标名或选择"
                    clearable
                  >
                    <template #prefix>
                      <el-icon v-if="form.icon" :size="16">
                        <component :is="getIconComponent(form.icon)" />
                      </el-icon>
                    </template>
                  </el-input>
                  <div class="nexus-editor-icon-grid">
                    <div
                      v-for="icon in popularIcons"
                      :key="icon"
                      class="nexus-editor-icon-item"
                      :class="{ 'nexus-editor-icon-active': form.icon === icon }"
                      @click="form.icon = icon"
                    >
                      <el-icon :size="18">
                        <component :is="getIconComponent(icon)" />
                      </el-icon>
                    </div>
                  </div>
                </div>
              </el-form-item>

              <!-- 类型 -->
              <el-form-item label="类型">
                <el-select v-model="form.type" style="width: 100%" teleported="false" :popper-options="{ modifiers: [{ name: 'offset', options: { offset: [0, 0] } }] }">
                  <el-option label="菜单项" value="menu" />
                  <el-option label="文件夹" value="folder" />
                  <el-option label="分隔线" value="divider" />
                  <el-option label="链接" value="link" />
                </el-select>
              </el-form-item>

              <!-- 组件名（仅 menu 类型） -->
              <el-form-item v-if="form.type === 'menu'" label="组件">
                <el-input v-model="form.component" placeholder="组件名，如 dashboard" />
              </el-form-item>

              <!-- 路径（仅 menu/link 类型） -->
              <el-form-item v-if="form.type === 'menu' || form.type === 'link'" label="路径">
                <el-input v-model="form.path" placeholder="路由路径，如 /dashboard" />
              </el-form-item>
            </el-form>
          </div>

          <div class="nexus-editor-footer">
            <el-button size="small" @click="close">取消</el-button>
            <el-button size="small" type="primary" @click="save">保存</el-button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { Close } from '@element-plus/icons-vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  item: {
    type: Object,
    default: null
  },
  isNew: {
    type: Boolean,
    default: false
  },
  position: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  }
})

const emit = defineEmits(['close', 'save'])

const form = reactive({
  title: '',
  icon: '',
  type: 'menu',
  component: '',
  path: '',
  custom: {}
})

// 常用图标列表
const popularIcons = [
  'Monitor', 'Setting', 'User', 'Avatar', 'Tools',
  'Document', 'Notebook', 'Collection', 'Message', 'Bell',
  'DataBoard', 'PieChart', 'TrendCharts', 'Histogram',
  'FolderOpened', 'Files', 'CopyDocument', 'Reading',
  'Edit', 'Search', 'Share', 'Star'
]

const pos = reactive({ x: props.position.x, y: props.position.y })
let dragging = false
let dragOffset = { x: 0, y: 0 }

watch(() => props.position, (p) => {
  pos.x = p.x
  pos.y = p.y
}, { deep: true })

const panelStyle = computed(() => ({
  left: `${pos.x}px`,
  top: `${pos.y}px`
}))

function onHeaderMouseDown(e) {
  dragging = true
  dragOffset = { x: e.clientX - pos.x, y: e.clientY - pos.y }
  document.addEventListener('mousemove', onDragMove)
  document.addEventListener('mouseup', onDragEnd)
}

function onPanelMouseDown(e) {
  // 防止点击面板内部非 header 区域触发拖拽
}

function onDragMove(e) {
  if (!dragging) return
  pos.x = e.clientX - dragOffset.x
  pos.y = e.clientY - dragOffset.y
}

function onDragEnd() {
  dragging = false
  document.removeEventListener('mousemove', onDragMove)
  document.removeEventListener('mouseup', onDragEnd)
}

watch(() => props.visible, (val) => {
  if (val) {
    pos.x = props.position.x
    pos.y = props.position.y
  }
  if (val && props.item) {
    form.title = props.item.title || ''
    form.icon = props.item.icon || ''
    form.type = props.item.type || 'menu'
    form.component = props.item.component || ''
    form.path = props.item.path || ''
    form.custom = props.item.custom || {}
  } else if (val && props.isNew) {
    form.title = ''
    form.icon = ''
    form.type = 'menu'
    form.component = ''
    form.path = ''
    form.custom = {}
  }
})

function close() {
  emit('close')
}

function save() {
  emit('save', { ...form })
  close()
}

function getIconComponent(iconName) {
  if (!iconName) return null
  return ElementPlusIconsVue[iconName] || null
}
</script>

<style scoped>
.nexus-editor-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
}

.nexus-editor-panel {
  position: absolute;
  width: 320px;
  background-color: var(--nexus-bg-color-light);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--nexus-border-color);
}

.nexus-editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--nexus-border-color);
  cursor: grab;
  user-select: none;
}

.nexus-editor-header:active {
  cursor: grabbing;
}

.nexus-editor-title {
  font-weight: 600;
  font-size: 14px;
  color: var(--nexus-text-color);
}

.nexus-editor-body {
  padding: 16px;
  max-height: 400px;
  overflow-y: auto;
}

.nexus-editor-icon-select {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nexus-editor-icon-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.nexus-editor-icon-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  color: var(--nexus-text-color-secondary);
}

.nexus-editor-icon-item:hover {
  background-color: var(--nexus-bg-color-dark);
  color: var(--nexus-primary-color);
}

.nexus-editor-icon-active {
  background-color: var(--nexus-primary-color-light);
  color: var(--nexus-primary-color);
}

.nexus-editor-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--nexus-border-color);
}

/* 过渡动画 */
.nexus-editor-enter-active {
  transition: opacity 0.15s ease-out;
}
.nexus-editor-leave-active {
  transition: opacity 0.1s ease-in;
}
.nexus-editor-enter-from,
.nexus-editor-leave-to {
  opacity: 0;
}

[data-theme="dark"] .nexus-editor-panel {
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}
</style>

<style>
/* 确保 el-select 下拉菜单在弹窗内部时 z-index 高于 overlay */
.nexus-editor-panel .el-select__popper {
  z-index: 3001 !important;
}
</style>
