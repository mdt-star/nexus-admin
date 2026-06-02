<template>
  <template v-if="hasPermission">
    <slot />
  </template>
</template>

<script setup>
import { computed } from 'vue'
import { usePermissionStore } from '../../stores/permission'

const props = defineProps({
  /**
   * 权限标签，可以是单个字符串或数组
   */
  tags: {
    type: [String, Array],
    required: true
  },
  /**
   * 权限模式：any（任一标签即可）| all（需要所有标签）
   */
  mode: {
    type: String,
    default: 'any',
    validator: (val) => ['any', 'all'].includes(val)
  }
})

const store = usePermissionStore()

const hasPermission = computed(() => {
  const tagList = Array.isArray(props.tags) ? props.tags : [props.tags]
  return props.mode === 'all'
    ? tagList.every(tag => store.hasTag(tag))
    : tagList.some(tag => store.hasTag(tag))
})
</script>
