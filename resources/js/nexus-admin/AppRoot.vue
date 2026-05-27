<template>
  <el-config-provider :size="uiSizeStore.elementSize">
    <MainLayout />
  </el-config-provider>
</template>

<script setup>
import { computed } from 'vue'
import { ElConfigProvider } from 'element-plus'
import { useUiSizeStore } from './stores/size'
import MainLayout from './layouts/MainLayout.vue'

const uiSizeStore = useUiSizeStore()
</script>

<style>

</style>