<template>
  <el-dialog :model-value="visible" :title="isNew ? '添加项' : '编辑项'" width="360px" :close-on-click-modal="false"
    :draggable="true" @close="close" @open="onOpen">
    <el-form :model="form" label-position="top" size="small">
      <el-form-item label="标题">
        <el-input v-model="form.title" placeholder="输入标题" />
      </el-form-item>

      <el-form-item label="图标">
        <div class="nexus-editor-icon-select">
          <el-input v-model="form.icon" placeholder="输入图标名或选择" clearable>
            <template #prefix>
              <el-icon v-if="form.icon" :size="16">
                <component :is="getIconComponent(form.icon)" />
              </el-icon>
            </template>
          </el-input>
          <div class="nexus-editor-icon-grid">
            <div v-for="icon in popularIcons" :key="icon" class="nexus-editor-icon-item"
              :class="{ 'nexus-editor-icon-active': form.icon === icon }" @click="form.icon = icon">
              <el-icon :size="18">
                <component :is="getIconComponent(icon)" />
              </el-icon>
            </div>
          </div>
        </div>
      </el-form-item>

      <el-form-item label="类型">
        <el-select v-model="form.type" style="width: 100%">
          <el-option label="菜单项" value="menu" />
          <el-option label="文件夹" value="folder" />
          <el-option label="分隔线" value="divider" />
          <el-option label="链接" value="link" />
        </el-select>
      </el-form-item>

      <el-form-item v-if="form.type === 'menu'" label="组件">
        <el-input v-model="form.component" placeholder="组件名，如 dashboard" />
      </el-form-item>

      <el-form-item v-if="form.type === 'menu' || form.type === 'link'" label="路径">
        <el-input v-model="form.path" placeholder="路由路径，如 /dashboard" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button size="small" @click="close">取消</el-button>
      <el-button size="small" type="primary" @click="save">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { reactive, watch } from 'vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  item: { type: Object, default: null },
  isNew: { type: Boolean, default: false },
  position: { type: Object, default: () => ({ x: 0, y: 0 }) }
})

const emit = defineEmits(['close', 'save'])

const form = reactive({
  title: '', icon: '', type: 'menu', component: '', path: '', custom: {}
})

const popularIcons = [
  'Monitor', 'Setting', 'User', 'Avatar', 'Tools',
  'Document', 'Notebook', 'Collection', 'Message', 'Bell',
  'DataBoard', 'PieChart', 'TrendCharts', 'Histogram',
  'FolderOpened', 'Files', 'CopyDocument', 'Reading',
  'Edit', 'Search', 'Share', 'Star'
]

function onOpen() {
  if (props.item) {
    form.title = props.item.title || ''
    form.icon = props.item.icon || ''
    form.type = props.item.type || 'menu'
    form.component = props.item.component || ''
    form.path = props.item.path || ''
    form.custom = props.item.custom || {}
  } else {
    form.title = ''
    form.icon = ''
    form.type = 'menu'
    form.component = ''
    form.path = ''
    form.custom = {}
  }
}

function close() { emit('close') }

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
</style>
