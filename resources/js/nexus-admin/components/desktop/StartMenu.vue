<template>
  <el-popover ref="popoverRef" trigger="click" :width="360" :popper-class="'nexus-start-popper'"
    :show-arrow="false" placement="top-start" :offset="8">
    <template #reference>
      <slot name="reference" />
    </template>
    <div class="nexus-start-panel" @click.stop>
      <div class="nexus-start-header">
        <WindowsStartIcon :size="22" />
        <span>{{ t('startMenu.title') }}</span>
      </div>
      <el-alert :title="t('startMenu.dragHint')" :closable="false" show-icon type="info" style="margin-bottom: 10px;" />
      <div class="nexus-start-search">
        <el-input v-model="searchQuery" :placeholder="t('common.searchPlaceholder')" clearable
          prefix-icon="Search" @input="onSearchInput" />
      </div>
      <el-menu ref="menuRef" class="nexus-start-menu" :default-active="activeIndex" @select="onSelect">
        <template v-for="item in filteredMenus" :key="item.id">
          <el-sub-menu v-if="item.children && item.children.length > 0" :index="String(item.id)"
            draggable="true" @dragstart="onDragStart($event, item)">
            <template #title>
             <el-icon>
                <component :is="getIconComponent(item.icon)" />
              </el-icon>
              <span>{{ item.title }}</span>
            </template>
            <el-menu-item v-for="child in item.children" :key="child.id" :index="String(child.id)"
              draggable="true" @dragstart="onDragStart($event, child)">
              <el-icon>
                <component :is="getIconComponent(child.icon)" />
              </el-icon>
              <template #title>
                <span class="nexus-start-leaf-label">{{ child.title }}</span>
                <el-tooltip :content="t('startMenu.pinToShortcuts')" placement="left">
                  <el-icon class="nexus-start-leaf-pin" :class="{ 'nexus-start-leaf-pinned': shortcutsStore.has(child) }"
                    @click.stop="togglePin(child)"><Star /></el-icon>
                </el-tooltip>
              </template>
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item v-else :index="String(item.id)" draggable="true"
            @dragstart="onDragStart($event, item)">
            <el-icon>
              <component :is="getIconComponent(item.icon)" />
            </el-icon>
            <template #title>
              <span class="nexus-start-leaf-label">{{ item.title }}</span>
              <el-tooltip :content="t('startMenu.pinToShortcuts')" placement="left">
                <el-icon class="nexus-start-leaf-pin" :class="{ 'nexus-start-leaf-pinned': shortcutsStore.has(item) }"
                  @click.stop="togglePin(item)"><Star /></el-icon>
              </el-tooltip>
            </template>
          </el-menu-item>
        </template>
      </el-menu>
      <div v-if="filteredMenus.length === 0" class="nexus-start-empty">
        <el-empty :description="t('common.noSearchResults')" :image-size="60" />
      </div>
    </div>
  </el-popover>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useMenuStore } from '../../stores/menu'
import { useI18nStore } from '../../stores/i18n'
import { useShortcutsStore } from '../../stores/shortcuts'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { FolderOpened, Rank, Star } from '@element-plus/icons-vue'
import WindowsStartIcon from './WindowsStartIcon.vue'

const emit = defineEmits(['open-page'])

const menuStore = useMenuStore()
const i18nStore = useI18nStore()
const shortcutsStore = useShortcutsStore()
const { t } = i18nStore

const searchQuery = ref('')
const popoverRef = ref(null)
const menuRef = ref(null)
const isDragging = ref(false)
const activeIndex = ref('')

const filteredMenus = computed(() => {
  const menus = menuStore.menus || []
  if (!searchQuery.value) return menus
  return filterMenus(menus, searchQuery.value.toLowerCase())
})

function onSearchInput() {
  if (searchQuery.value) expandAllMatching(menuStore.menus || [])
}

function expandAllMatching(items) {
  items.forEach(item => {
    if (item.children?.length && item.children.some(c => c.title.toLowerCase().includes(searchQuery.value.toLowerCase()))) {
      // el-sub-menu 会自动展开，不需要手动管理
    }
    if (item.children?.length) expandAllMatching(item.children)
  })
}

function filterMenus(items, q) {
  return items.reduce((r, item) => {
    const match = item.title.toLowerCase().includes(q)
    if (item.children?.length) {
      const filtered = filterMenus(item.children, q)
      if (match || filtered.length) r.push({ ...item, children: match ? item.children : filtered })
    } else if (match) r.push(item)
    return r
  }, [])
}

function onSelect(index) {
  const id = Number(index)
  const item = findItem(menuStore.menus || [], id)
  if (item && item.component) {
    emit('open-page', item)
    hide()
  }
}

function findItem(items, id) {
  for (const item of items) {
    if (item.id === id) return item
    if (item.children?.length) {
      const found = findItem(item.children, id)
      if (found) return found
    }
  }
  return null
}

function togglePin(item) {
  if (shortcutsStore.has(item)) {
    shortcutsStore.remove(item.id)
  } else {
    shortcutsStore.add(item)
  }
}

function onDragStart(event, item) {
  isDragging.value = true
  // 如果是父节点，递归收集所有子节点
  const children = item.children?.length
    ? item.children.map(c => ({
        title: c.title, icon: c.icon, component: c.component, path: c.path, type: 'menu'
      }))
    : []
  const data = JSON.stringify({
    title: item.title, icon: item.icon, component: item.component, path: item.path, type: 'menu',
    children  // 携带子节点信息
  })
  event.dataTransfer.setData('application/json', data)
  event.dataTransfer.setData('text/plain', data)
  event.dataTransfer.effectAllowed = 'copyMove'
  event.currentTarget.addEventListener('dragend', onDragEnd, { once: true })
}

function onDragEnd() {
  isDragging.value = false
  hide()
}

function hide() {
  popoverRef.value?.hide()
}

function getIconComponent(n) {
  return n ? ElementPlusIconsVue[n] || null : null
}

function onKeydown(e) {
  if (e.key === 'Escape') hide()
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.nexus-start-panel {
  max-height: 520px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.nexus-start-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  padding-bottom: 12px;
}

.nexus-start-header .el-icon {
  font-size: 20px;
  color: var(--nexus-primary-color);
}

.nexus-start-search {
  padding: 0 0px 12px;
}

.nexus-start-menu {
  border-right: none;
  max-height: 400px;
  overflow-y: auto;
}

.nexus-start-menu :deep(.el-menu-item) {
  display: flex;
  align-items: center;
  height: 40px;
  line-height: 40px;
  font-size: 13px;
}

.nexus-start-menu :deep(.el-menu-item .el-icon) {
  font-size: 18px;
}

.nexus-start-menu :deep(.el-sub-menu__title) {
  font-size: 14px;
  font-weight: 500;
  height: 42px;
  line-height: 42px;
}

.nexus-start-menu :deep(.el-sub-menu__title .el-icon) {
  font-size: 18px;
}

.nexus-start-leaf-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nexus-start-leaf-pin {
  font-size: 14px;
  color: var(--nexus-text-color-placeholder);
  opacity: 0;
  transition: opacity 0.15s, color 0.15s;
  cursor: pointer;
  margin-right: 2px;
}

.nexus-start-leaf-pinned {
  opacity: 1 !important;
  color: var(--nexus-primary-color, #409eff) !important;
}

.nexus-start-menu :deep(.el-menu-item:hover .nexus-start-leaf-pin) {
  opacity: 0.6;
}

.nexus-start-menu :deep(.el-menu-item:hover .nexus-start-leaf-pin:hover) {
  opacity: 1;
}

.nexus-start-leaf-drag {
  font-size: 14px;
  color: var(--nexus-text-color-placeholder);
  opacity: 0;
  transition: opacity 0.15s;
  cursor: grab;
  margin-left: auto;
}

.nexus-start-menu :deep(.el-menu-item:hover .nexus-start-leaf-drag) {
  opacity: 1;
}

.nexus-start-empty {
  padding: 40px 0;
}
</style>

<style>
.nexus-start-popper {
  background-color: var(--nexus-bg-color-light) !important;
  border: 1px solid var(--nexus-border-color) !important;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.18) !important;
}

[data-theme="dark"] .nexus-start-popper {
  border-color: rgba(255, 255, 255, 0.08) !important;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.4) !important;
}
</style>
