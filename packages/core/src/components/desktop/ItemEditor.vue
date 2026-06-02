<template>
  <el-dialog :model-value="visible" :title="editorTitle" width="390px" 
    :draggable="true" append-to-body @close="close" @open="onOpen">
    <el-form :model="form">
      <el-form-item :label="t('itemEditor.title')">
        <el-input v-model="form.title" :placeholder="t('itemEditor.titlePlaceholder')" />
      </el-form-item>

      <el-form-item :label="t('itemEditor.icon')">
        <div class="nexus-editor-icon-select">
          <el-popover v-model:visible="iconPopoverVisible" :title="t('itemEditor.selectIcon')" placement="bottom-start" :width="335" trigger="click">
                <template #reference>
                  <el-input v-model="form.icon" :placeholder="t('itemEditor.iconPlaceholder')" readonly  suffix-icon="el-icon-date">
                    <template #prepend>
                      <el-icon v-if="form.icon" :size="16">
                        <component :is="getIconComponent(form.icon)" />
                      </el-icon>
                    </template>
                  </el-input>
                </template>
                <div class="nexus-icon-picker">
                  <el-input v-model="iconSearch" :placeholder="t('itemEditor.searchIcon')" style="margin-bottom: 10px; margin-top: 5px;" size="small" clearable @input="onIconSearch" />
                  <div class="nexus-icon-picker-grid">
                    <div v-for="icon in filteredIcons" :key="icon" class="nexus-icon-picker-item"
                      :class="{ 'nexus-icon-picker-active': form.icon === icon }" @click="selectIcon(icon)">
                      <el-icon :size="24">
                        <component :is="getIconComponent(icon)" />
                      </el-icon>
                      <span class="nexus-icon-picker-label">{{ icon }}</span>
                    </div>
                  </div>
                  <div class="nexus-icon-picker-custom">
                    <el-divider />
                    <el-button size="small" @click="showCustomInput = true" v-if="!showCustomInput">
                      {{ t('itemEditor.customIcon') }}
                    </el-button>
                    <div v-else class="nexus-icon-picker-custom-input">
                      <el-input v-model="customIconName" :placeholder="t('itemEditor.iconNamePlaceholder')" size="small" />
                      <el-button size="small" type="primary" @click="confirmCustomIcon">{{ t('common.confirm') }}</el-button>
                      <el-button size="small" @click="showCustomInput = false">{{ t('common.cancel') }}</el-button>
                    </div>
                  </div>
                </div>
              </el-popover>
          
        </div>
      </el-form-item>

      <el-form-item :label="t('itemEditor.type')">
        <el-select v-model="form.type" style="width: 100%">
          <el-option :label="t('itemEditor.typeMenu')" value="menu" />
          <el-option :label="t('itemEditor.typeFolder')" value="folder" />
          <el-option :label="t('itemEditor.typeDivider')" value="divider" />
          <el-option :label="t('itemEditor.typeLink')" value="link" />
        </el-select>
      </el-form-item>

      <el-form-item v-if="form.type === 'menu'" :label="t('itemEditor.component')">
        <el-input v-model="form.component" :placeholder="t('itemEditor.componentPlaceholder')" />
      </el-form-item>

      <el-form-item v-if="form.type === 'menu' || form.type === 'link'" :label="t('itemEditor.path')">
        <el-input v-model="form.path" :placeholder="t('itemEditor.pathPlaceholder')" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="close">{{ t('common.cancel') }}</el-button>
      <el-button type="primary" @click="save">{{ t('common.save') }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useI18nStore } from '../../stores/i18n'
import { useDisktopStore } from '../../stores/disktop'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { Search } from '@element-plus/icons-vue'

const { t } = useI18nStore()
const desktopStore = useDisktopStore()

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

// 用于在右键新建时暂存父级 ID
const editorTitle = computed(() => {
  const parentTitle = desktopStore.items.find(i => i.id === props.item?.parent_id)?.title || ''
  if (props.isNew)  return parentTitle ? t('itemEditor.addItemIn', { location: parentTitle }) : t('itemEditor.addItem')
  return t('itemEditor.editItem')
}) // 监听 item 变化以更新表单数据

// 图标选择器
const iconPopoverVisible = ref(false)
const iconSearch = ref('')
const showCustomInput = ref(false)
const customIconName = ref('')

// 获取所有 Element Plus 图标名称
const allIcons = Object.keys(ElementPlusIconsVue).filter(k => k[0] === k[0].toUpperCase())

const filteredIcons = computed(() => {
  if (!iconSearch.value) return allIcons
  const q = iconSearch.value.toLowerCase()
  return allIcons.filter(name => name.toLowerCase().includes(q))
})

function onIconSearch() {
  // 搜索时自动重置自定义输入状态
  showCustomInput.value = false
}

function selectIcon(name) {
  form.icon = name
  iconPopoverVisible.value = false
  iconSearch.value = ''
  showCustomInput.value = false
}

function confirmCustomIcon() {
  if (customIconName.value.trim()) {
    form.icon = customIconName.value.trim()
  }
  iconPopoverVisible.value = false
  iconSearch.value = ''
  showCustomInput.value = false
  customIconName.value = ''
}

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
  width: 100%;
}

.nexus-icon-picker {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 360px;
}

.nexus-icon-picker-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  overflow-y: auto;
  max-height: 260px;
}

.nexus-icon-picker-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 4px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  color: var(--nexus-text-color-secondary);
}

.nexus-icon-picker-item:not(.nexus-icon-picker-active):hover {
  background-color: var(--nexus-bg-color-dark);
  color: var(--nexus-primary-color);
}

.nexus-icon-picker-active {
  background-color: var(--nexus-primary-color);
  color: #fff;
}

.nexus-icon-picker-active .el-icon svg {
  color: #fff;
}

.nexus-icon-picker-label {
  font-size: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  text-align: center;
}

.nexus-icon-picker-custom-input {
  display: flex;
  gap: 4px;
  align-items: center;
}
</style>
