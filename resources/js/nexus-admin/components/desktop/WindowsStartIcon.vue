<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    :width="size"
    :height="size"
    fill="none"
    stroke="currentColor"
    stroke-width="1.6"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <!-- 原创开始图标：保留四象限布局（让人识别为"开始"），但用圆角菱形替代方块 -->
    <rect x="2.5" y="2.5" width="8.5" height="8.5" rx="2" ry="2" fill="var(--el-color-primary, #409eff)" stroke="none" opacity="0.85" />
    <rect x="13" y="2.5" width="8.5" height="8.5" rx="2" ry="2" fill="var(--el-color-success, #67c23a)" stroke="none" opacity="0.85" />
    <rect x="2.5" y="13" width="8.5" height="8.5" rx="2" ry="2" fill="var(--el-color-warning, #e6a23c)" stroke="none" opacity="0.85" />
    <rect x="13" y="13" width="8.5" height="8.5" rx="2" ry="2" fill="var(--el-color-danger, #f56c6c)" stroke="none" opacity="0.85" />
  </svg>
</template>

<script setup>
defineProps({
  size: { type: [Number, String], default: 24 }
})
</script>
