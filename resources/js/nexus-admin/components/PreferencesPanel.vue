<template>
  <el-drawer
    v-model="visible"
    :title="t('preferences.title')"
    direction="rtl"
    size="320px"
  >
    <div class="preferences-body">
      <!-- Tab 栏开关 -->
      <div class="pref-section">
        <h3 class="pref-section-title">{{ t('preferences.tabMode') }}</h3>
        <el-switch
          :model-value="tabMode"
          :active-text="t('preferences.showTabs')"
          :inactive-text="t('preferences.hideTabs')"
          @change="handleTabModeChange"
        />
      </div>

      <!-- 顶部背景色 -->
      <div class="pref-section">
        <h3 class="pref-section-title">{{ t('preferences.headerColor') }}</h3>
        <div class="color-options">
          <div
            v-for="color in headerColors"
            :key="color.value"
            class="color-item"
            :class="{ active: headerColor === color.value }"
            :style="{ background: color.value || 'var(--nexus-bg-color-light)' }"
            @click="handleHeaderColorChange(color.value)"
          >
            <el-icon v-if="headerColor === color.value" class="color-check"><Check /></el-icon>
          </div>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Check } from '@element-plus/icons-vue'
import { useConfigStore } from '../stores/config'
import { useThemeStore } from '../stores/theme'
import { useI18nStore } from '../stores/i18n'

const { t } = useI18nStore()
const configStore = useConfigStore()
const themeStore = useThemeStore()

const visible = ref(false)

const tabMode = computed(() => configStore.get('tabMode', true))
const headerColor = computed(() => configStore.get('headerColor', ''))

const headerColors = [
  { value: '', label: '默认', primary: '#14b8a6' },
  { value: 'linear-gradient(135deg, #14b8a6, #0d9488)', label: '青绿', primary: '#14b8a6' },
  { value: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', label: '深蓝', primary: '#3b82f6' },
  { value: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', label: '紫色', primary: '#8b5cf6' },
  { value: 'linear-gradient(135deg, #f59e0b, #d97706)', label: '橙色', primary: '#f59e0b' },
  { value: 'linear-gradient(135deg, #ef4444, #dc2626)', label: '红色', primary: '#ef4444' },
  { value: 'linear-gradient(135deg, #10b981, #059669)', label: '绿色', primary: '#10b981' },
  { value: 'linear-gradient(135deg, #64748b, #475569)', label: '灰色', primary: '#64748b' },
  { value: 'linear-gradient(135deg, #1e293b, #0f172a)', label: '深色', primary: '#1e293b' },
]

function open() {
  visible.value = true
}

function handleTabModeChange(val) {
  configStore.setUserConfig('tabMode', val)
}

function handleHeaderColorChange(val) {
  configStore.setUserConfig('headerColor', val)
  // 同步设置主色调
  const match = headerColors.find(c => c.value === val)
  if (match) {
    themeStore.setPrimaryColor(match.primary)
  }
}

defineExpose({ open })
</script>


<style scoped>
.preferences-body {
  padding: 0 4px;
}

.pref-section {
  margin-bottom: 24px;
}

.pref-section-title {
  font-size: var(--nexus-font-size-base);
  font-weight: 600;
  margin: 0 0 12px 0;
  color: var(--nexus-text-color);
}

.color-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.color-item {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.color-item:hover {
  transform: scale(1.1);
}

.color-item.active {
  border-color: var(--nexus-primary-color);
  box-shadow: 0 0 0 2px var(--nexus-primary-color), 0 2px 8px rgba(0,0,0,0.15);
}

.color-check {
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}
</style>
