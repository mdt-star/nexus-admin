<template>
  <div class="nexus-home-page" :class="{ 'nexus-home-sidebar': isSidebar }">
    <!-- 侧边栏模式：双列布局；桌面模式：单列 -->
    <div class="nexus-home-main">
      <!-- 快捷菜单卡片 -->
      <el-card shadow="never" class="nexus-home-card nexus-home-shortcuts-card">
          <template #header>
            <div class="nexus-home-card-header">
              <div class="nexus-home-card-header-left">
                <el-icon><Star /></el-icon>
                <span>{{ t('home.shortcuts') }}</span>
              </div>
              <div v-if="shortcutsStore.items.length > 0" class="nexus-home-card-header-right">
                <el-tooltip :content="t('home.clearShortcuts')" placement="top">
                  <el-button :icon="Delete" circle size="small" @click="clearShortcuts" />
                </el-tooltip>
              </div>
            </div>
          </template>
          <div class="nexus-home-shortcuts">
            <div v-if="shortcutsStore.items.length === 0" class="nexus-home-shortcuts-empty">
              <el-empty :description="t('home.noShortcuts')" :image-size="48" />
            </div>
            <div v-else class="nexus-home-shortcuts-grid">
              <div v-for="item in shortcutsStore.items" :key="item.id" class="nexus-home-shortcut-item"
                @click="openShortcut(item)">
                <div class="nexus-home-shortcut-icon-wrap">
                  <el-icon class="nexus-home-shortcut-icon">
                    <component :is="getIconComponent(item.icon)" />
                  </el-icon>
                  <el-icon class="nexus-home-shortcut-remove" @click.stop="removeShortcut(item)">
                    <Close />
                  </el-icon>
                </div>
                <span class="nexus-home-shortcut-title">{{ item.title }}</span>
              </div>
            </div>
          </div>
        </el-card>

        <el-card shadow="never" class="nexus-home-card" style="margin-top: 16px;">
          <template #header> 
            <div class="nexus-home-card-header">
              <div class="nexus-home-card-header-left">
                <el-icon><Monitor /></el-icon>
                <span>{{ t('home.serverInfo') }}</span>
              </div>
              <div class="nexus-home-card-header-right">
                <el-tooltip :content="t('home.refresh')" placement="top">
                  <el-button :icon="Refresh" circle size="small" :loading="refreshing" @click="refresh" />
                </el-tooltip>
                <el-tooltip :content="t('home.trend')" placement="top">
                  <el-button :icon="DataAnalysis" circle size="small" @click="trendVisible = true" />
                </el-tooltip>
              </div>
            </div>
          </template>
          <div class="nexus-home-server">
            <div class="nexus-home-metrics">
              <div class="nexus-home-metric">
                <div class="nexus-home-metric-label">{{ t('home.cpu') }}</div>
                <div class="nexus-home-metric-bar">
                  <template v-if="serverInfo.cpu !== null">
                    <el-progress :percentage="serverInfo.cpu" :color="cpuColor" :stroke-width="16" />
                  </template>
                  <template v-else>
                    <div class="nexus-home-metric-na">
                      <el-icon><WarningFilled /></el-icon>
                      <span>{{ t('home.noCollector') }}</span>
                    </div>
                  </template>
                </div>
                <div class="nexus-home-metric-value">
                  <template v-if="serverInfo.cpu !== null">{{ serverInfo.cpu }}%</template>
                  <template v-else>--</template>
                </div>
              </div>
              <div class="nexus-home-metric">
                <div class="nexus-home-metric-label">{{ t('home.memory') }}</div>
                <div class="nexus-home-metric-bar">
                  <template v-if="serverInfo.memory !== null">
                    <el-progress :percentage="serverInfo.memory" :color="memColor" :stroke-width="16" />
                  </template>
                  <template v-else>
                    <div class="nexus-home-metric-na">
                      <el-icon><WarningFilled /></el-icon>
                      <span>{{ t('home.noCollector') }}</span>
                    </div>
                  </template>
                </div>
                <div class="nexus-home-metric-value">
                  <template v-if="serverInfo.memory !== null">{{ serverInfo.memory }}%</template>
                  <template v-else>--</template>
                </div>
              </div>
              <div class="nexus-home-metric">
                <div class="nexus-home-metric-label">{{ t('home.disk') }}</div>
                <div class="nexus-home-metric-bar">
                  <template v-if="serverInfo.disk !== null">
                    <el-progress :percentage="serverInfo.disk" :color="diskColor" :stroke-width="16" />
                  </template>
                  <template v-else>
                    <div class="nexus-home-metric-na">
                      <el-icon><WarningFilled /></el-icon>
                      <span>{{ t('home.noCollector') }}</span>
                    </div>
                  </template>
                </div>
                <div class="nexus-home-metric-value">
                  <template v-if="serverInfo.disk !== null">{{ serverInfo.disk }}%</template>
                  <template v-else>--</template>
                </div>
              </div>
            </div>
            <el-divider />
            <div class="nexus-home-server-detail">
              <el-descriptions :column="2" size="small" border>
                <el-descriptions-item :label="t('home.serverOS')">{{ serverInfo.os }}</el-descriptions-item>
                <el-descriptions-item :label="t('home.serverUptime')">{{ serverInfo.uptime }}</el-descriptions-item>
                <el-descriptions-item :label="t('home.serverLoad')">{{ serverInfo.load }}</el-descriptions-item>
                <el-descriptions-item :label="t('home.serverProcesses')">{{ serverInfo.processes }}</el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </el-card>

        <el-card shadow="never" class="nexus-home-card" style="margin-top: 16px;">
          <template #header>
            <div class="nexus-home-card-header">
              <div class="nexus-home-card-header-left">
                <el-icon><InfoFilled /></el-icon>
                <span>{{ t('home.phpEnv') }}</span>
              </div>
            </div>
          </template>
          <el-descriptions :column="2" size="small" border>
            <el-descriptions-item :label="t('home.phpVersion')">{{ phpInfo.version }}</el-descriptions-item>
            <el-descriptions-item :label="t('home.phpSapi')">{{ phpInfo.sapi }}</el-descriptions-item>
            <el-descriptions-item :label="t('home.phpMemoryLimit')">{{ phpInfo.memoryLimit }}</el-descriptions-item>
            <el-descriptions-item :label="t('home.phpMaxExecTime')">{{ phpInfo.maxExecTime }}</el-descriptions-item>
            <el-descriptions-item :label="t('home.phpUploadMax')">{{ phpInfo.uploadMax }}</el-descriptions-item>
            <el-descriptions-item :label="t('home.phpPostMax')">{{ phpInfo.postMax }}</el-descriptions-item>
          </el-descriptions>
      </el-card>
    </div>

    <!-- 侧边栏模式：系统信息卡片展示在右侧 -->
    <div class="nexus-home-side">
      <el-card shadow="never" class="nexus-home-card">
        <template #header>
          <div class="nexus-home-card-header">
            <div class="nexus-home-card-header-left">
              <el-icon><Connection /></el-icon>
              <span>{{ t('home.systemInfo') }}</span>
            </div>
          </div>
        </template>
        <div class="nexus-home-system">
          <div class="nexus-home-logo">
            <el-icon :size="48" color="var(--nexus-primary-color)"><Monitor /></el-icon>
          </div>
          <div class="nexus-home-app-name">{{ systemInfo.appName }}</div>
          <div class="nexus-home-version">{{ t('home.version') }}: {{ systemInfo.version }}</div>
          <el-divider />
          <div class="nexus-home-links">
            <el-link :href="systemInfo.website" target="_blank" :icon="Link">
              {{ t('home.website') }}
            </el-link>
            <span class="nexus-home-links-divider" />
            <el-link :href="systemInfo.docs" target="_blank" :icon="Document">
              {{ t('home.documentation') }}
            </el-link>
            <span class="nexus-home-links-divider" />
            <el-link :href="systemInfo.github" target="_blank" :icon="Star">
              {{ t('home.github') }}
            </el-link>
          </div>
          <el-divider />
          <div class="nexus-home-updates">
            <div class="nexus-home-updates-title">
              <el-icon><Bell /></el-icon>
              <span>{{ t('home.updateAnnouncements') }}</span>
            </div>
            <div v-if="systemInfo.updates.length === 0" class="nexus-home-updates-empty">
              {{ t('home.noUpdates') }}
            </div>
            <div v-for="update in systemInfo.updates" :key="update.date" class="nexus-home-update-item">
              <el-tag size="small" :type="update.type === 'security' ? 'danger' : 'info'">
                {{ update.version }}
              </el-tag>
              <span class="nexus-home-update-text">{{ update.title }}</span>
              <span class="nexus-home-update-date">{{ update.date }}</span>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 实时趋势弹窗 -->
    <el-dialog v-model="trendVisible" :title="t('home.trendTitle')" width="520px" destroy-on-close>
      <div class="nexus-home-trend">
        <div class="nexus-home-trend-item">
          <div class="nexus-home-trend-label">{{ t('home.cpu') }}</div>
          <div class="nexus-home-trend-chart">
            <div class="nexus-home-trend-bars">
              <div v-for="(v, i) in trendData.cpu" :key="i" class="nexus-home-trend-bar-group">
                <div class="nexus-home-trend-bar" :style="{ height: v + '%', background: trendColor(v) }" />
                <div class="nexus-home-trend-bar-value">{{ v }}%</div>
              </div>
            </div>
            <div class="nexus-home-trend-axis">
              <span v-for="(_, i) in trendData.cpu" :key="i" class="nexus-home-trend-axis-label">{{ i + 1 }}m</span>
            </div>
          </div>
        </div>
        <div class="nexus-home-trend-item">
          <div class="nexus-home-trend-label">{{ t('home.memory') }}</div>
          <div class="nexus-home-trend-chart">
            <div class="nexus-home-trend-bars">
              <div v-for="(v, i) in trendData.memory" :key="i" class="nexus-home-trend-bar-group">
                <div class="nexus-home-trend-bar" :style="{ height: v + '%', background: trendColor(v) }" />
                <div class="nexus-home-trend-bar-value">{{ v }}%</div>
              </div>
            </div>
            <div class="nexus-home-trend-axis">
              <span v-for="(_, i) in trendData.memory" :key="i" class="nexus-home-trend-axis-label">{{ i + 1 }}m</span>
            </div>
          </div>
        </div>
        <div class="nexus-home-trend-item">
          <div class="nexus-home-trend-label">{{ t('home.disk') }}</div>
          <div class="nexus-home-trend-chart">
            <div class="nexus-home-trend-bars">
              <div v-for="(v, i) in trendData.disk" :key="i" class="nexus-home-trend-bar-group">
                <div class="nexus-home-trend-bar" :style="{ height: v + '%', background: trendColor(v) }" />
                <div class="nexus-home-trend-bar-value">{{ v }}%</div>
              </div>
            </div>
            <div class="nexus-home-trend-axis">
              <span v-for="(_, i) in trendData.disk" :key="i" class="nexus-home-trend-axis-label">{{ i + 1 }}m</span>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '../stores/app'
import { useI18nStore } from '../stores/i18n'
import { useConfigStore } from '../stores/config'
import { useShortcutsStore } from '../stores/shortcuts'
import { useWindowStore } from '../stores/windows'
import { useMenuStore } from '../stores/menu'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { Monitor, InfoFilled, Connection, Link, Document, Star, Bell, Refresh, DataAnalysis, WarningFilled, Delete, Close } from '@element-plus/icons-vue'

const { t } = useI18nStore()
const appStore = useAppStore()
const configStore = useConfigStore()
const shortcutsStore = useShortcutsStore()
const windowStore = useWindowStore()
const menuStore = useMenuStore()

// 是否为侧边栏模式（侧边栏模式使用双列布局，系统信息在右侧）
const isSidebar = computed(() => appStore.layout === 'sidebar')

const refreshing = ref(false)
const trendVisible = ref(false)

const serverInfo = ref({
  cpu: null,
  memory: null,
  disk: null,
  os: '-',
  uptime: '-',
  load: '-',
  processes: '-'
})

const phpInfo = ref({
  version: '-',
  sapi: '-',
  memoryLimit: '-',
  maxExecTime: '-',
  uploadMax: '-',
  postMax: '-'
})

const systemInfo = ref({
  appName: 'Nexus Admin',
  version: '1.0.0',
  website: 'https://nexus-admin.com',
  docs: 'https://nexus-admin.com/docs',
  github: 'https://github.com/nexus-admin/nexus-admin',
  updates: []
})

// 模拟趋势数据（最近 6 分钟）
const trendData = ref({
  cpu: [],
  memory: [],
  disk: []
})

function generateTrend(base) {
  const arr = []
  for (let i = 0; i < 6; i++) {
    const v = base + Math.round((Math.random() - 0.5) * 20)
    arr.push(Math.max(0, Math.min(100, v)))
  }
  return arr
}

function trendColor(v) {
  if (v < 50) return '#67c23a'
  if (v < 80) return '#e6a23c'
  return '#f56c6c'
}

const cpuColor = computed(() => {
  const v = serverInfo.value.cpu
  if (v === null) return '#909399'
  if (v < 50) return '#67c23a'
  if (v < 80) return '#e6a23c'
  return '#f56c6c'
})

const memColor = computed(() => {
  const v = serverInfo.value.memory
  if (v === null) return '#909399'
  if (v < 50) return '#67c23a'
  if (v < 80) return '#e6a23c'
  return '#f56c6c'
})

const diskColor = computed(() => {
  const v = serverInfo.value.disk
  if (v === null) return '#909399'
  if (v < 50) return '#67c23a'
  if (v < 80) return '#e6a23c'
  return '#f56c6c'
})

async function loadSystemInfo() {
  try {
    const { default: systemApi } = await import('../services/system.js')
    const res = await systemApi.info()
    if (res.data) {
      serverInfo.value = { ...serverInfo.value, ...res.data.server }
      phpInfo.value = { ...phpInfo.value, ...res.data.php }
      systemInfo.value = { ...systemInfo.value, ...res.data.system }
    }
  } catch (e) {
    // API 不可用时使用默认值
  }
}

async function refresh() {
  refreshing.value = true
  await loadSystemInfo()
  // 同时刷新趋势数据
  if (serverInfo.value.cpu !== null) {
    trendData.value.cpu = generateTrend(serverInfo.value.cpu)
  }
  if (serverInfo.value.memory !== null) {
    trendData.value.memory = generateTrend(serverInfo.value.memory)
  }
  if (serverInfo.value.disk !== null) {
    trendData.value.disk = generateTrend(serverInfo.value.disk)
  }
  refreshing.value = false
}

function getIconComponent(iconName) {
  return iconName ? ElementPlusIconsVue[iconName] || null : null
}

function openShortcut(item) {
  // 先从 menuStore 查找完整菜单项
  const menuItem = menuStore.findMenuByComponent(item.component) || menuStore.findMenuByRoute(item.path)
  if (menuItem) {
    windowStore.open(menuItem)
  } else {
    // 如果找不到，直接用快捷方式数据打开
    windowStore.open(item)
  }
}

function removeShortcut(item) {
  shortcutsStore.remove(item.id)
}

function clearShortcuts() {
  shortcutsStore.items.slice().forEach(item => shortcutsStore.remove(item.id))
}

onMounted(() => {
  loadSystemInfo()
})
</script>

<style scoped>
.nexus-home-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 侧边栏模式：双列网格布局，系统信息在右侧 */
.nexus-home-sidebar {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 16px;
  align-items: start;
  max-width: 1400px;
}

.nexus-home-sidebar .nexus-home-main {
  min-width: 0;
}

.nexus-home-sidebar .nexus-home-side {
  min-width: 0;
  position: sticky;
  top: 16px;
}

/* 桌面模式单列，隐藏侧边容器 */
.nexus-home-side {
  display: none;
}

.nexus-home-sidebar .nexus-home-side {
  display: block;
}

.nexus-home-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 15px;
  font-weight: 600;
}

.nexus-home-card-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nexus-home-card-header-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nexus-home-card-header .el-icon {
  font-size: 18px;
  color: var(--nexus-primary-color);
}

.nexus-home-metrics {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.nexus-home-metric {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nexus-home-metric-label {
  width: 60px;
  font-size: 13px;
  color: var(--nexus-text-color-secondary);
  flex-shrink: 0;
}

.nexus-home-metric-bar {
  flex: 1;
}

.nexus-home-metric-na {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 16px;
  font-size: 12px;
  color: var(--nexus-text-color-disabled, #bbb);
  padding: 0 4px;
}

.nexus-home-metric-na .el-icon {
  font-size: 14px;
  color: var(--nexus-text-color-disabled, #bbb);
}

.nexus-home-metric-value {
  width: 48px;
  text-align: right;
  font-size: 13px;
  font-weight: 600;
  color: var(--nexus-text-color);
  flex-shrink: 0;
}

.nexus-home-server-detail {
  margin-top: 8px;
}

.nexus-home-system {
  text-align: center;
}

.nexus-home-logo {
  margin-bottom: 12px;
}

.nexus-home-app-name {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 4px;
}

.nexus-home-version {
  font-size: 13px;
  color: var(--nexus-text-color-secondary);
}

.nexus-home-links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

.nexus-home-links-divider {
  width: 1px;
  height: 14px;
  background-color: var(--nexus-border-color);
}

.nexus-home-updates-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
}

.nexus-home-updates-empty {
  text-align: center;
  color: var(--nexus-text-color-secondary);
  font-size: 13px;
  padding: 20px 0;
}

.nexus-home-update-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid var(--nexus-border-color);
  font-size: 13px;
}

.nexus-home-update-item:last-child {
  border-bottom: none;
}

.nexus-home-update-text {
  flex: 1;
  text-align: left;
}

.nexus-home-update-date {
  color: var(--nexus-text-color-secondary);
  font-size: 12px;
  flex-shrink: 0;
}

/* 快捷菜单卡片样式 */
.nexus-home-shortcuts-card :deep(.el-card__body) {
  padding: 12px 16px;
}

.nexus-home-shortcuts-empty {
  padding: 8px 0;
}

.nexus-home-shortcuts-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.nexus-home-shortcut-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 14px 8px;
  border-radius: var(--nexus-border-radius-sm, 6px);
  cursor: pointer;
  transition: background-color 0.15s;
  position: relative;
  min-width: 72px;
}

.nexus-home-shortcut-item:hover {
  background-color: var(--nexus-bg-color-dark);
}

.nexus-home-shortcut-icon-wrap {
  position: relative;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nexus-home-shortcut-icon {
  font-size: 26px;
  color: var(--nexus-text-color-secondary);
  transition: color 0.15s;
}

.nexus-home-shortcut-item:hover .nexus-home-shortcut-icon {
  color: var(--nexus-primary-color);
}

.nexus-home-shortcut-remove {
  position: absolute;
  top: -4px;
  right: -6px;
  font-size: 11px;
  color: var(--nexus-text-color-placeholder);
  opacity: 0;
  transition: opacity 0.15s, color 0.15s;
  background: var(--nexus-bg-color);
  border-radius: 50%;
  padding: 1px;
}

.nexus-home-shortcut-item:hover .nexus-home-shortcut-remove {
  opacity: 0.6;
}

.nexus-home-shortcut-item:hover .nexus-home-shortcut-remove:hover {
  opacity: 1;
  color: var(--el-color-danger, #f56c6c);
}

.nexus-home-shortcut-title {
  font-size: 12px;
  color: var(--nexus-text-color);
  white-space: nowrap;
  max-width: 72px;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  line-height: 1.3;
}

/* 趋势弹窗样式 */
.nexus-home-trend {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 8px 0;
}

.nexus-home-trend-item {
  display: flex;
  align-items: stretch;
  gap: 16px;
}

.nexus-home-trend-label {
  width: 60px;
  font-size: 13px;
  font-weight: 600;
  color: var(--nexus-text-color-secondary);
  flex-shrink: 0;
  line-height: 160px;
  text-align: right;
}

.nexus-home-trend-chart {
  flex: 1;
}

.nexus-home-trend-bars {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  height: 140px;
}

.nexus-home-trend-bar-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  height: 100%;
  justify-content: flex-end;
}

.nexus-home-trend-bar {
  width: 100%;
  max-width: 40px;
  border-radius: 4px 4px 0 0;
  transition: height 0.3s ease;
  min-height: 4px;
}

.nexus-home-trend-bar-value {
  font-size: 11px;
  color: var(--nexus-text-color-secondary);
}

.nexus-home-trend-axis {
  display: flex;
  gap: 12px;
  margin-top: 4px;
}

.nexus-home-trend-axis-label {
  flex: 1;
  text-align: center;
  font-size: 11px;
  color: var(--nexus-text-color-secondary);
}
</style>
