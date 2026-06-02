<template>
  <!-- 文件夹或包含子项的节点 → 渲染为可展开的 el-sub-menu -->
  <el-sub-menu v-if="isFolderNode" :index="String(item.id)"
    :data-folder-id="item.type === 'folder' ? item.id : ''" :data-item-id="item.id"
    draggable="true"
    @dragstart="onItemDragStart($event, item)"
    @contextmenu.prevent.stop="onItemContextMenu($event, item)">
    <template #title>
      <el-icon v-if="item.icon">
        <component :is="getIconComponent(item.icon)" />
      </el-icon>
      <span>{{ item.title }}</span>
    </template>
    <SidebarMenuNode v-for="child in item.children" :key="child.id" :item="child"
      :depth="depth + 1" @dragstart="onItemDragStart" @contextmenu="onItemContextMenu" />
  </el-sub-menu>
  <!-- 叶子节点 → 渲染为可点击的 el-menu-item -->
  <el-menu-item v-else :index="String(item.id)"
    :data-folder-id="item.type === 'folder' ? item.id : ''" :data-item-id="item.id"
    draggable="true"
    @dragstart="onItemDragStart($event, item)"
    @contextmenu.prevent.stop="onItemContextMenu($event, item)">
    <el-icon v-if="item.icon">
      <component :is="getIconComponent(item.icon)" />
    </el-icon>
    <template #title>
      <span>{{ item.title }}</span>
    </template>
  </el-menu-item>
</template>

<script setup>
import { computed } from 'vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const props = defineProps({
  item: { type: Object, required: true },
  depth: { type: Number, default: 0 }
})

const emit = defineEmits(['dragstart', 'contextmenu'])

/**
 * 判断当前节点是否应渲染为可展开的文件夹节点（含子项时才有展开箭头）：
 * - 仅当 children 数组存在且有内容时渲染为 el-sub-menu
 * - 空文件夹不显示展开箭头，渲染为 el-menu-item（点击由 handleMenuSelect 守卫拦截）
 */
const isFolderNode = computed(() => {
  return props.item.children && props.item.children.length > 0
})

function onItemDragStart(event, item) {
  emit('dragstart', event, item)
}

function onItemContextMenu(event, item) {
  emit('contextmenu', event, item)
}

function getIconComponent(iconName) {
  return iconName ? ElementPlusIconsVue[iconName] || null : null
}
</script>
