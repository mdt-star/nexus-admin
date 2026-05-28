<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    :width="size"
    :height="size"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <!-- 原创 Nexus 开始图标：四个菱形花瓣环绕中心圆点，代表星云连接/发散 -->
    <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <path d="M12 3.5 L14.5 9 L12 7.5 L9.5 9 Z" />
    <path d="M20.5 12 L15 14.5 L16.5 12 L15 9.5 Z" />
    <path d="M12 20.5 L9.5 15 L12 16.5 L14.5 15 Z" />
    <path d="M3.5 12 L9 9.5 L7.5 12 L9 14.5 Z" />
  </svg>
</template>

<script setup>
defineProps({
  size: { type: [Number, String], default: 24 }
})
</script>
