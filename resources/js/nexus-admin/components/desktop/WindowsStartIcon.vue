<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    :width="size"
    :height="size"
    fill="currentColor"
  >
    <!-- Windows 四色窗口标志 -->
    <path d="M2 3h9.5v9.5H2V3zm0 0" fill="#F25022" />
    <path d="M12.5 3H22v9.5H12.5V3zm0 0" fill="#7FBA00" />
    <path d="M2 13.5h9.5V23H2V13.5zm0 0" fill="#00A4EF" />
    <path d="M12.5 13.5H22V23H12.5V13.5zm0 0" fill="#FFB900" />
  </svg>
</template>

<script setup>
defineProps({
  size: { type: [Number, String], default: 24 }
})
</script>
