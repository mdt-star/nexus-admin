<template>
  <div class="nexus-global-search">
    <!-- 搜索触发按钮 -->
    <el-tooltip :content="t('common.search') + ' (⌘K)'" placement="bottom">
      <el-button class="nexus-search-trigger" @click="visible = true">
        <el-icon><Search /></el-icon>
        <span class="nexus-search-trigger-text">{{ t('common.search') }}</span>
        <span class="nexus-search-trigger-hint">⌘K</span>
      </el-button>
    </el-tooltip>

    <!-- 搜索对话框 -->
    <el-dialog
      v-model="visible"
      :title="t('common.search')"
      width="560px"
      top="15vh"
      :close-on-click-modal="true"
      class="nexus-search-dialog"
      @opened="onOpened"
      @closed="onClosed"
    >
      <div class="nexus-search-body">
        <el-input
          ref="inputRef"
          v-model="query"
          :placeholder="t('common.searchPlaceholder')"
          clearable
          @input="onInput"
          @keydown.up.prevent="onArrowUp"
          @keydown.down.prevent="onArrowDown"
          @keydown.enter.prevent="onEnter"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <!-- 搜索结果 -->
        <div class="nexus-search-results" v-if="filteredResults.length > 0">
          <div
            v-for="(item, index) in filteredResults"
            :key="item.id"
            class="nexus-search-item"
            :class="{ 'nexus-search-item-active': index === activeIndex }"
            @click="selectItem(item)"
            @mouseenter="activeIndex = index"
          >
            <el-icon class="nexus-search-item-icon">
              <component :is="getIconComponent(item.icon)" />
            </el-icon>
            <div class="nexus-search-item-info">
              <span class="nexus-search-item-title">{{ item.title }}</span>
              <span class="nexus-search-item-path" v-if="item.parentTitle">{{ item.parentTitle }}</span>
            </div>
            <span class="nexus-search-item-type">{{ item.type === 'menu' ? t('common.menu') : t('common.page') }}</span>
          </div>
        </div>

        <!-- 空状态 -->
        <div class="nexus-search-empty" v-else-if="query && !loading">
          <el-empty :description="t('common.noSearchResults')" :image-size="80" />
        </div>

        <!-- 分类提示 -->
        <div class="nexus-search-hints" v-if="!query">
          <div class="nexus-search-hint-group">
            <span class="nexus-search-hint-label">{{ t('common.menu') }}</span>
            <span class="nexus-search-hint-count">{{ menuResults.length }} {{ t('common.items') }}</span>
          </div>
          <div class="nexus-search-hint-group" v-if="pageResults.length > 0">
            <span class="nexus-search-hint-label">{{ t('common.page') }}</span>
            <span class="nexus-search-hint-count">{{ pageResults.length }} {{ t('common.items') }}</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { useMenuStore } from '../../stores/menu'
import { useWindowStore } from '../../stores/windows'
import { useI18nStore } from '../../stores/i18n'

const { t } = useI18nStore()
const menuStore = useMenuStore()
const windowStore = useWindowStore()

const visible = ref(false)
const query = ref('')
const activeIndex = ref(0)
const inputRef = ref(null)
const loading = ref(false)

/**
 * 扁平化菜单树，返回所有叶子节点（有 component 的菜单项）
 */
function flattenMenus(items, parentTitle = '') {
  const result = []
  for (const item of items) {
    const hasChildren = item.children && item.children.length > 0
    if (hasChildren) {
      // 递归子菜单
      result.push(...flattenMenus(item.children, item.title))
    } else if (item.component) {
      // 叶子节点
      result.push({
        ...item,
        type: 'menu',
        parentTitle,
      })
    }
  }
  return result
}

// 所有菜单项（扁平化）
const allMenuItems = computed(() => flattenMenus(menuStore.sidebarMenus))

// 已打开的页面
const pageResults = computed(() => {
  return windowStore.items.map(item => ({
    ...item,
    type: 'page',
    parentTitle: '',
  }))
})

// 搜索结果（菜单 + 页面，去重）
const filteredResults = computed(() => {
  if (!query.value) return []
  const q = query.value.toLowerCase().trim()

  const menus = allMenuItems.value.filter(item =>
    item.title.toLowerCase().includes(q) ||
    item.id.toLowerCase().includes(q)
  )

  const pages = pageResults.value.filter(item =>
    item.title.toLowerCase().includes(q) ||
    item.id.toLowerCase().includes(q)
  )

  // 合并，菜单优先
  const seen = new Set()
  const merged = []
  for (const item of [...menus, ...pages]) {
    if (!seen.has(item.id)) {
      seen.add(item.id)
      merged.push(item)
    }
  }
  return merged
})

// 菜单搜索结果（用于提示）
const menuResults = computed(() => allMenuItems.value)

function onInput() {
  activeIndex.value = 0
}

function onArrowUp() {
  if (activeIndex.value > 0) activeIndex.value--
}

function onArrowDown() {
  if (activeIndex.value < filteredResults.value.length - 1) activeIndex.value++
}

function onEnter() {
  if (filteredResults.value[activeIndex.value]) {
    selectItem(filteredResults.value[activeIndex.value])
  }
}

function selectItem(item) {
  visible.value = false
  // 如果是页面且已打开，切换到它
  if (item.type === 'page') {
    windowStore.activate(item.id)
  } else {
    // 菜单项，打开它
    windowStore.open(item)
  }
}

function onOpened() {
  query.value = ''
  activeIndex.value = 0
  // 自动聚焦输入框
  setTimeout(() => {
    inputRef.value?.focus()
  }, 100)
}

function onClosed() {
  query.value = ''
  activeIndex.value = 0
}

function getIconComponent(iconName) {
  if (!iconName) return null
  return ElementPlusIconsVue[iconName] || null
}

// 全局快捷键 Cmd+K / Ctrl+K
function handleKeydown(e) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    visible.value = !visible.value
  }
  // Escape 关闭
  if (e.key === 'Escape' && visible.value) {
    visible.value = false
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.nexus-search-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--nexus-border-color) !important;
  background-color: var(--nexus-bg-color) !important;
  color: var(--nexus-text-color-secondary) !important;
  border-radius: 8px !important;
  padding: 4px 12px !important;
  height: 32px !important;
  transition: all 0.25s ease;
}

.nexus-search-trigger:hover {
  border-color: var(--nexus-primary-color) !important;
  color: var(--nexus-primary-color) !important;
  background-color: var(--nexus-bg-color-light) !important;
}

.nexus-search-trigger-text {
  font-size: 13px;
  font-weight: 400;
}

.nexus-search-trigger-hint {
  font-size: 11px;
  padding: 1px 5px;
  border-radius: 4px;
  background-color: var(--nexus-bg-color-dark);
  color: var(--nexus-text-color-disabled);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', monospace;
}

/* 自定义顶部背景色时适配 */
.nexus-header[style*="background"] .nexus-search-trigger {
  border-color: rgba(255,255,255,0.25) !important;
  background-color: rgba(255,255,255,0.1) !important;
  color: rgba(255,255,255,0.85) !important;
}

.nexus-header[style*="background"] .nexus-search-trigger:hover {
  border-color: rgba(255,255,255,0.5) !important;
  background-color: rgba(255,255,255,0.15) !important;
  color: #fff !important;
}

.nexus-header[style*="background"] .nexus-search-trigger-hint {
  background-color: rgba(255,255,255,0.15);
  color: rgba(255,255,255,0.6);
}

/* 搜索对话框 */
:deep(.nexus-search-dialog .el-dialog__header) {
  display: none;
}

:deep(.nexus-search-dialog .el-dialog__body) {
  padding: 16px;
}

.nexus-search-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nexus-search-body :deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 0 0 1px var(--nexus-border-color) !important;
}

.nexus-search-body :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px var(--nexus-primary-color) !important;
}

.nexus-search-body :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px var(--nexus-primary-color) !important;
}

/* 搜索结果 */
.nexus-search-results {
  max-height: 360px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nexus-search-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.nexus-search-item:hover,
.nexus-search-item-active {
  background-color: var(--nexus-bg-color-light);
}

.nexus-search-item-active {
  background-color: var(--el-color-primary-light-9) !important;
}

.nexus-search-item-icon {
  font-size: 18px;
  color: var(--nexus-text-color-secondary);
  flex-shrink: 0;
}

.nexus-search-item-active .nexus-search-item-icon {
  color: var(--nexus-primary-color);
}

.nexus-search-item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.nexus-search-item-title {
  font-size: 14px;
  color: var(--nexus-text-color);
  font-weight: 500;
}

.nexus-search-item-path {
  font-size: 12px;
  color: var(--nexus-text-color-disabled);
}

.nexus-search-item-type {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: var(--nexus-bg-color-dark);
  color: var(--nexus-text-color-disabled);
  flex-shrink: 0;
}

.nexus-search-empty {
  padding: 24px 0;
}

/* 分类提示 */
.nexus-search-hints {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 4px;
}

.nexus-search-hint-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
}

.nexus-search-hint-label {
  color: var(--nexus-text-color-secondary);
  font-weight: 500;
}

.nexus-search-hint-count {
  color: var(--nexus-text-color-disabled);
  font-size: 12px;
}
</style>
