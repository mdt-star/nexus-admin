<template>
  <el-config-provider :size="uiSizeStore.elementSize" :locale="elementLocale">
    <MainLayout />
  </el-config-provider>
</template>

<script setup>
import { computed } from 'vue'
import { ElConfigProvider } from 'element-plus'
import { useUiSizeStore, useI18nStore } from '@nexus-admin/core'
import { MainLayout } from '@nexus-admin/core'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import en from 'element-plus/dist/locale/en.mjs'

const uiSizeStore = useUiSizeStore()
const i18nStore = useI18nStore()

const localeMap = { 'zh-CN': zhCn, 'en': en }

const elementLocale = computed(() => {
  return localeMap[i18nStore.locale] || zhCn
})
</script>

<style scoped>
</style>

