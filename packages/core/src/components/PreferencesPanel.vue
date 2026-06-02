<template>
  <el-drawer
    v-model="visible"
    :title="t('preferences.title')"
    direction="rtl"
    size="320px"
  >
    <div class="preferences-body">
      <!-- 布局切换 -->
      <div class="pref-section">
        <h3 class="pref-section-title">{{ t('layout.toggle') }}</h3>
        <el-radio-group :model-value="layout" @change="handleLayoutChange">
          <el-radio-button value="sidebar">{{ t('layout.sidebar') }}</el-radio-button>
          <el-radio-button value="desktop">{{ t('layout.desktop') }}</el-radio-button>
        </el-radio-group>
      </div>

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

      <!-- 桌面背景设置 -->
      <div class="pref-section">
        <h3 class="pref-section-title">{{ t('preferences.background') || '桌面背景' }}</h3>
        <div class="pref-bg-row">
          <el-radio-group :model-value="backgroundMode" @change="handleBgModeChange" size="small">
            <el-radio-button value="color">纯色</el-radio-button>
            <el-radio-button value="image">图片</el-radio-button>
          </el-radio-group>
        </div>
        <div v-if="backgroundMode === 'image'" class="pref-bg-row">
          <div class="pref-bg-upload">
            <el-upload
              :show-file-list="false"
              :auto-upload="false"
              accept="image/*"
              @change="handleBgUpload"
            >
              <el-button size="small" :icon="Picture">上传图片</el-button>
            </el-upload>
            <el-button v-if="bgPreviewUrl" size="small" type="danger" :icon="Delete" @click="clearBgImage">清除</el-button>
          </div>
          <div v-if="bgPreviewUrl" class="pref-bg-preview">
            <img :src="bgPreviewUrl" alt="背景预览" />
          </div>
          <div class="pref-bg-fit" v-if="bgPreviewUrl">
            <span class="pref-label">显示模式</span>
            <el-radio-group :model-value="backgroundFit" @change="handleBgFitChange" size="small">
              <el-radio-button value="fill">填充</el-radio-button>
              <el-radio-button value="contain">适应</el-radio-button>
              <el-radio-button value="cover">拉伸</el-radio-button>
              <el-radio-button value="center">居中</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Check, Picture, Delete } from '@element-plus/icons-vue'
import { useAppStore } from '../stores/app'
import { useConfigStore } from '../stores/config'
import { useThemeStore } from '../stores/theme'
import { useI18nStore } from '../stores/i18n'

const { t } = useI18nStore()
const appStore = useAppStore()
const configStore = useConfigStore()
const themeStore = useThemeStore()

const visible = ref(false)

const layout = computed(() => appStore.layout)
const tabMode = computed(() => configStore.get('tabMode', true))
const headerColor = computed(() => configStore.get('headerColor', ''))
const backgroundMode = computed(() => configStore.get('backgroundMode', 'color'))
const backgroundFit = computed(() => configStore.get('backgroundFit', 'fill'))
const bgPreviewUrl = computed(() => configStore.get('backgroundImage', null))

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

function handleLayoutChange(val) {
  appStore.toggleLayout()
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

// 背景设置处理
function handleBgModeChange(val) {
  configStore.setUserConfig('backgroundMode', val)
}

function handleBgUpload(uploadFile) {
  const file = uploadFile.raw
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    configStore.setUserConfig('backgroundImage', e.target.result)
  }
  reader.readAsDataURL(file)
}

function clearBgImage() {
  configStore.setUserConfig('backgroundImage', null)
}

function handleBgFitChange(val) {
  configStore.setUserConfig('backgroundFit', val)
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

/* ===== 背景设置样式 ===== */
.pref-bg-row { margin-bottom: 12px; }
.pref-bg-upload { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.pref-bg-preview {
  margin-top: 8px; border-radius: 6px; overflow: hidden;
  max-width: 100%; max-height: 120px; border: 1px solid var(--nexus-border-color);
}
.pref-bg-preview img { width: 100%; height: 100%; object-fit: cover; display: block; }
.pref-bg-fit { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
.pref-label { font-size: 12px; color: var(--nexus-text-color-secondary); }
</style>
