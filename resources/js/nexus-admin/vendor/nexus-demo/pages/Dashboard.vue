<template>
  <div class="nexus-demo-dashboard">
    

    <el-row :gutter="16" style="margin-top: 16px;">
      <el-col :span="6" v-for="stat in stats" :key="stat.label">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top: 16px;">
      <template #header>
        <span>{{ t('common.noData') }}</span>
      </template>
      <el-empty :description="t('common.noData')" />
    </el-card>
  </div>
</template>

<script setup>
import { useI18nStore } from '../../../stores/i18n'

const { t } = useI18nStore()

const stats = [
  { label: t('dashboard.totalUsers'), value: 128 },
  { label: t('dashboard.todayActive'), value: 56 },
  { label: t('dashboard.totalArticles'), value: 342 },
  { label: t('dashboard.systemNotifications'), value: 12 }
]
</script>

<style scoped>
.nexus-demo-dashboard h2 {
  font-size: 20px;
  font-weight: 600;
}

.stat-card {
  text-align: center;
  padding: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--nexus-primary-color);
}

.stat-label {
  font-size: 13px;
  color: var(--nexus-text-color-secondary);
  margin-top: 4px;
}
</style>
