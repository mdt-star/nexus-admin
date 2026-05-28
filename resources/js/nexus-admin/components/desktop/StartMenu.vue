<template>
  <Teleport to="body">
    <div
      v-if="visible || isDragging"
      class="nexus-start-overlay"
      :class="{ 'nexus-start-dragging': isDragging }"
      @click.self="onOverlayClick"
    >
      <div class="nexus-start-panel" ref="panelRef" @click.stop>
        <div class="nexus-start-header">
          <el-icon :size="22"><TrendCharts /></el-icon>
          <span class="nexus-start-title">开始菜单</span>
        </div>
        <div class="nexus-start-search">
          <el-input v-model="searchQuery" :placeholder="t('common.searchPlaceholder')" size="small" clearable prefix-icon="Search" @input="onSearchInput" />
        </div>
        <div class="nexus-start-tree" ref="treeRef">
          <div v-for="item in filteredMenus" :key="item.id" class="nexus-start-node">
            <template v-if="item.children && item.children.length > 0">
              <div class="nexus-start-node-header" :class="{ 'nexus-start-node-expanded': expandedFolders.has(item.id) }" @click="toggleFolder(item.id)">
                <el-icon class="nexus-start-node-arrow"><ArrowRight /></el-icon>
                <el-icon class="nexus-start-node-icon"><FolderOpened /></el-icon>
                <span class="nexus-start-node-label">{{ item.title }}</span>
              </div>
              <div v-if="expandedFolders.has(item.id)" class="nexus-start-children">
                <div v-for="child in item.children" :key="child.id" class="nexus-start-leaf" draggable="true" @dragstart="onDragStart($event, child)" @click="onLeafClick(child)">
                  <el-icon class="nexus-start-leaf-icon"><component :is="getIconComponent(child.icon)" /></el-icon>
                  <span class="nexus-start-leaf-label">{{ child.title }}</span>
                  <el-tooltip content="拖拽到桌面或侧边栏添加" placement="left"><el-icon class="nexus-start-leaf-drag"><Rank /></el-icon></el-tooltip>
                </div>
              </div>
            </template>
            <div v-else class="nexus-start-leaf" draggable="true" @dragstart="onDragStart($event, item)" @click="onLeafClick(item)">
              <el-icon class="nexus-start-leaf-icon"><component :is="getIconComponent(item.icon)" /></el-icon>
              <span class="nexus-start-leaf-label">{{ item.title }}</span>
              <el-tooltip content="拖拽到桌面或侧边栏添加" placement="left"><el-icon class="nexus-start-leaf-drag"><Rank /></el-icon></el-tooltip>
            </div>
          </div>
          <div v-if="filteredMenus.length === 0" class="nexus-start-empty"><el-empty :description="t('common.noSearchResults')" :image-size="60" /></div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useMenuStore } from '../../stores/menu'
import { useI18nStore } from '../../stores/i18n'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { ArrowRight, FolderOpened, Rank, TrendCharts } from '@element-plus/icons-vue'

const props = defineProps({ visible: { type: Boolean, default: false } })
const emit = defineEmits(['close', 'add-item', 'open-page'])

const menuStore = useMenuStore()
const i18nStore = useI18nStore()
const { t } = i18nStore

const searchQuery = ref('')
const expandedFolders = ref(new Set())
const panelRef = ref(null)
const treeRef = ref(null)
const isDragging = ref(false)

const filteredMenus = computed(() => {
  const menus = menuStore.menus || []
  if (!searchQuery.value) return menus
  return filterMenus(menus, searchQuery.value.toLowerCase())
})

function onSearchInput() { if (searchQuery.value) expandAllMatching(menuStore.menus || []) }
function expandAllMatching(items) {
  items.forEach(item => {
    if (item.children?.length && item.children.some(c => c.title.toLowerCase().includes(searchQuery.value.toLowerCase()))) expandedFolders.value.add(item.id)
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
function toggleFolder(id) { const s = new Set(expandedFolders.value); s.has(id) ? s.delete(id) : s.add(id); expandedFolders.value = s }

function onLeafClick(item) { if (item.component) { emit('open-page', item); close() } }

function onDragStart(event, item) {
  isDragging.value = true
  event.dataTransfer.setData('application/json', JSON.stringify({ title: item.title, icon: item.icon, component: item.component, path: item.route, type: 'menu' }))
  event.dataTransfer.effectAllowed = 'copy'
  // 不调用 close()，DOM 保持在位（v-if="visible || isDragging" 保证不销毁）
  // 拖拽结束后通过 dragend 事件关闭菜单
  // currentTarget 是绑定 @dragstart 的元素本身（nexus-start-leaf），确保 dragend 正确触发
  event.currentTarget.addEventListener('dragend', onGlobalDragEnd, { once: true })
}

function onGlobalDragEnd() {
  isDragging.value = false
  emit('close')
}

function onOverlayClick() { if (!isDragging.value) close() }
function close() { if (isDragging.value) return; emit('close') }

function getIconComponent(n) { return n ? ElementPlusIconsVue[n] || null : null }
function onKeydown(e) { if (e.key === 'Escape') close() }
onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.nexus-start-overlay { position: fixed; inset: 0; z-index: 2000; display: flex; align-items: flex-start; justify-content: flex-start; padding: 60px 0 0 60px; }
/* 拖拽中：overlay 不拦截任何事件，面板视觉隐藏但 DOM 保持在位 */
.nexus-start-dragging { pointer-events: none; }
.nexus-start-dragging .nexus-start-panel { opacity: 0; }
.nexus-start-panel { width: 360px; max-height: 520px; background-color: var(--nexus-bg-color-light); border-radius: 16px; box-shadow: 0 8px 40px rgba(0,0,0,0.18); display: flex; flex-direction: column; overflow: hidden; border: 1px solid var(--nexus-border-color); }
.nexus-start-header { display: flex; align-items: center; gap: 10px; padding: 16px 20px 12px; color: var(--nexus-primary-color); font-weight: 600; font-size: 16px; }
.nexus-start-title { color: var(--nexus-text-color); }
.nexus-start-search { padding: 0 16px 12px; }
.nexus-start-tree { flex: 1; overflow-y: auto; padding: 0 8px 12px; }
.nexus-start-node-header { display: flex; align-items: center; gap: 8px; padding: 8px 12px; cursor: pointer; border-radius: 8px; transition: background-color 0.15s; color: var(--nexus-text-color); font-weight: 500; font-size: 14px; user-select: none; }
.nexus-start-node-header:hover { background-color: var(--nexus-bg-color-dark); }
.nexus-start-node-arrow { font-size: 12px; transition: transform 0.2s; color: var(--nexus-text-color-secondary); }
.nexus-start-node-expanded .nexus-start-node-arrow { transform: rotate(90deg); }
.nexus-start-node-icon { font-size: 18px; color: var(--nexus-text-color-secondary); }
.nexus-start-children { margin-left: 12px; border-left: 1px solid var(--nexus-border-color); margin-bottom: 4px; }
.nexus-start-leaf { pointer-events: auto !important;display: flex; align-items: center; gap: 10px; padding: 8px 12px 8px 28px; cursor: pointer; border-radius: 8px; transition: background-color 0.15s; color: var(--nexus-text-color); font-size: 13px; user-select: none; position: relative; }
.nexus-start-leaf:hover { background-color: var(--nexus-bg-color-dark); }
.nexus-start-leaf:hover .nexus-start-leaf-drag { opacity: 1; }
.nexus-start-leaf-icon { font-size: 18px; color: var(--nexus-text-color-secondary); flex-shrink: 0; }
.nexus-start-leaf-label { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.nexus-start-leaf-drag { font-size: 14px; color: var(--nexus-text-color-placeholder); opacity: 0; transition: opacity 0.15s; cursor: grab; }
.nexus-start-empty { padding: 40px 0; }
[data-theme="dark"] .nexus-start-panel { border-color: rgba(255,255,255,0.08); box-shadow: 0 8px 40px rgba(0,0,0,0.4); }
</style>