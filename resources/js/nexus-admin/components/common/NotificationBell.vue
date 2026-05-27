<template>
  <el-popover
    placement="bottom-end"
    :width="360"
    trigger="click"
    :visible="popoverVisible"
    @show="handleShow"
    @hide="popoverVisible = false"
  >
    <template #reference>
      <el-badge :value="notificationStore.unreadCount" :hidden="!notificationStore.hasUnread" :max="99" class="nexus-notification-badge">
        <el-button
          :icon="notificationStore.hasUnread ? 'BellFilled' : 'Bell'"
          circle
          class="nexus-notification-btn"
          @click="popoverVisible = !popoverVisible"
        />
      </el-badge>
    </template>

    <div class="nexus-notification-panel">
      <div class="nexus-notification-header">
        <span class="nexus-notification-title">消息通知</span>
        <el-button
          v-if="notificationStore.unreadCount > 0"
          text
          size="small"
          @click="handleMarkAllRead"
        >
          全部已读
        </el-button>
      </div>

      <div class="nexus-notification-list" v-loading="notificationStore.loading">
        <div
          v-for="item in notificationStore.list"
          :key="item.id"
          class="nexus-notification-item"
          :class="{ 'nexus-notification-unread': !item.read_at }"
          @click="handleItemClick(item)"
        >
          <div class="nexus-notification-item-dot" v-if="!item.read_at" />
          <div class="nexus-notification-item-content">
            <div class="nexus-notification-item-title">{{ item.data?.title }}</div>
            <div class="nexus-notification-item-body">{{ item.data?.body }}</div>
            <div class="nexus-notification-item-time">{{ formatTime(item.created_at) }}</div>
          </div>
        </div>

        <div v-if="notificationStore.list.length === 0 && !notificationStore.loading" class="nexus-notification-empty">
          暂无通知
        </div>
      </div>
    </div>
  </el-popover>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useNotificationStore } from '../../stores/notification'
import { useWindowStore } from '../../stores/windows'

const notificationStore = useNotificationStore()
const windowStore = useWindowStore()

const popoverVisible = ref(false)

onMounted(() => {
  notificationStore.init()
})

onUnmounted(() => {
  notificationStore.destroy()
})

function handleShow() {
  notificationStore.fetchNotifications()
}

function handleItemClick(item) {
  popoverVisible.value = false
  notificationStore.handleNotificationClick(item, (menuItem) => {
    windowStore.open(menuItem)
  })
}

function handleMarkAllRead() {
  notificationStore.markAllAsReadNotification()
}

function formatTime(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  const now = new Date()
  const diff = now - date

  // 1 分钟内
  if (diff < 60000) return '刚刚'
  // 1 小时内
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
  // 今天内
  if (date.toDateString() === now.toDateString()) {
    return `今天 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }
  // 昨天
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return `昨天 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }
  // 更早
  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}
</script>

<style scoped>
.nexus-notification-badge {
  display: flex;
  align-items: center;
}

.nexus-notification-btn {
  border: none !important;
  background-color: transparent !important;
  color: var(--nexus-text-color-secondary) !important;
  transition: all 0.25s ease;
}

.nexus-notification-btn:hover {
  color: var(--nexus-primary-color) !important;
  background-color: var(--nexus-bg-color-dark) !important;
}

.nexus-notification-panel {
  max-height: 420px;
  display: flex;
  flex-direction: column;
}

.nexus-notification-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0 12px 0;
  border-bottom: 1px solid var(--nexus-border-color);
}

.nexus-notification-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--nexus-text-color);
}

.nexus-notification-list {
  flex: 1;
  overflow-y: auto;
  margin: 0 -12px;
  padding: 0 12px;
  max-height: 340px;
}

.nexus-notification-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 0;
  cursor: pointer;
  border-bottom: 1px solid var(--nexus-border-color-light);
  transition: background-color 0.2s;
}

.nexus-notification-item:last-child {
  border-bottom: none;
}

.nexus-notification-item:hover {
  background-color: var(--nexus-bg-color-light);
  margin: 0 -12px;
  padding-left: 12px;
  padding-right: 12px;
  border-radius: 6px;
}

.nexus-notification-unread {
  background-color: rgba(64, 158, 255, 0.03);
}

.nexus-notification-item-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--nexus-primary-color);
  flex-shrink: 0;
  margin-top: 6px;
}

.nexus-notification-item-content {
  flex: 1;
  min-width: 0;
}

.nexus-notification-item-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--nexus-text-color);
  margin-bottom: 4px;
}

.nexus-notification-item-body {
  font-size: 12px;
  color: var(--nexus-text-color-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 6px;
}

.nexus-notification-item-time {
  font-size: 11px;
  color: var(--nexus-text-color-placeholder);
}

.nexus-notification-empty {
  text-align: center;
  padding: 40px 0;
  color: var(--nexus-text-color-placeholder);
  font-size: 13px;
}
</style>
