<template>
  <div class="nexus-login">
    <!-- 动态网格背景 -->
    <div class="nexus-login-grid">
      <div class="nexus-login-grid-line" v-for="i in 6" :key="i" :style="{ '--i': i }"></div>
    </div>

    <!-- 渐变光晕动画背景 -->
    <div class="nexus-login-bg">
      <div class="nexus-login-orb nexus-login-orb-1"></div>
      <div class="nexus-login-orb nexus-login-orb-2"></div>
      <div class="nexus-login-orb nexus-login-orb-3"></div>
    </div>

    <!-- 登录卡片 -->
    <div class="nexus-login-card">
      <div class="nexus-login-card-header">
        <div class="nexus-login-logo">
          <el-icon :size="32"><Monitor /></el-icon>
        </div>
        <h1 class="nexus-login-title">{{ appName }}</h1>
        <p class="nexus-login-desc">{{ t('login.subtitle') }}</p>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        @keyup.enter="handleLogin"
        class="nexus-login-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            :prefix-icon="User"
            :placeholder="t('login.username')"
            class="nexus-login-input"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            :prefix-icon="Lock"
            type="password"
            show-password
            :placeholder="t('login.password')"
            class="nexus-login-input"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            @click="handleLogin"
            class="nexus-login-btn"
          >
            <span v-if="!loading">{{ t('login.submit') }}</span>
          </el-button>
        </el-form-item>
      </el-form>

      <p class="nexus-login-hint">{{ t('login.hint') }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { User, Lock, Monitor } from '@element-plus/icons-vue'
import { useUserStore } from '../stores/user'
import { useI18nStore } from '../stores/i18n'
import { useConfigStore } from '../stores/config'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()
const i18nStore = useI18nStore()
const configStore = useConfigStore()

const { t } = i18nStore
const appName = computed(() => configStore.get('appName', 'Nexus Admin'))

const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

async function handleLogin() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    const success = await userStore.login(form.username, form.password)
    if (success) {
      ElMessage.success(t('login.success'))
    }
  } catch (e) {
    ElMessage.error(e.message || t('login.failed'))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* ========== 容器 ========== */
.nexus-login {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  overflow: hidden;
  background: var(--nexus-bg-color);
}

/* ========== 动态网格背景 ========== */
.nexus-login-grid {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.nexus-login-grid-line {
  position: absolute;
  width: 2px;
  height: 100%;
  left: calc(var(--i) * 20% - 1px);
  background: linear-gradient(to bottom,
    transparent,
    var(--nexus-primary-color) 20%,
    var(--nexus-primary-color) 80%,
    transparent
  );
  opacity: 0.04;
  animation: nexus-grid-move 6s ease-in-out infinite alternate;
  animation-delay: calc(var(--i) * -0.8s);
}

@keyframes nexus-grid-move {
  0% { transform: translateY(-100%); opacity: 0.02; }
  50% { opacity: 0.06; }
  100% { transform: translateY(100%); opacity: 0.02; }
}

/* ========== 渐变光晕 ========== */
.nexus-login-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.nexus-login-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
}

.nexus-login-orb-1 {
  width: 600px; height: 600px;
  top: -15%; right: -10%;
  background: var(--nexus-primary-color);
  opacity: 0.06;
  animation: nexus-orb-drift 12s ease-in-out infinite;
}

.nexus-login-orb-2 {
  width: 500px; height: 500px;
  bottom: -20%; left: -8%;
  background: var(--nexus-primary-color-dark);
  opacity: 0.05;
  animation: nexus-orb-drift 15s ease-in-out infinite reverse;
}

.nexus-login-orb-3 {
  width: 300px; height: 300px;
  top: 30%; left: 30%;
  background: var(--nexus-primary-color-light);
  opacity: 0.04;
  animation: nexus-orb-drift 10s ease-in-out infinite 3s;
}

@keyframes nexus-orb-drift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(40px, -30px) scale(1.08); }
  66% { transform: translate(-20px, 40px) scale(0.92); }
}

/* ========== 登录卡片 ========== */
.nexus-login-card {
  position: relative;
  z-index: 1;
  width: 400px;
  padding: 48px 40px 40px;
  background: var(--nexus-bg-color-light);
  border-radius: 20px;
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.02),
    0 4px 24px rgba(0, 0, 0, 0.04),
    0 20px 60px rgba(0, 0, 0, 0.04);
  animation: nexus-card-enter 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes nexus-card-enter {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.nexus-login-card-header {
  text-align: center;
  margin-bottom: 40px;
}

.nexus-login-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px; height: 56px;
  border-radius: 16px;
  background: color-mix(in srgb, var(--nexus-primary-color) 8%, transparent);
  color: var(--nexus-primary-color);
  margin-bottom: 20px;
}

.nexus-login-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--nexus-text-color);
  margin: 0 0 8px;
  letter-spacing: -0.3px;
}

.nexus-login-desc {
  font-size: 14px;
  color: var(--nexus-text-color-secondary);
  margin: 0;
  line-height: 1.6;
}

/* ========== 表单 ========== */
.nexus-login-form {
  text-align: left;
}

.nexus-login-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.nexus-login-form :deep(.el-form-item:last-child) {
  margin-bottom: 0;
}

.nexus-login-input :deep(.el-input__wrapper) {
  padding: 2px 16px;
  height: 48px;
  border-radius: 12px;
  box-shadow: 0 0 0 1px var(--nexus-border-color);
  background: var(--nexus-bg-color);
  transition: all 0.25s ease;
}

.nexus-login-input :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px var(--nexus-primary-color);
  background: var(--nexus-bg-color-light);
}

.nexus-login-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px var(--nexus-primary-color);
  background: var(--nexus-bg-color-light);
}

.nexus-login-input :deep(.el-input__inner) {
  height: 44px;
  font-size: 14px;
  color: var(--nexus-text-color);
}

.nexus-login-input :deep(.el-input__inner::placeholder) {
  color: var(--nexus-text-color-placeholder);
}

.nexus-login-input :deep(.el-input__prefix) {
  margin-right: 10px;
}

.nexus-login-input :deep(.el-input__prefix-inner .el-icon) {
  font-size: 18px;
  color: var(--nexus-text-color-placeholder);
  transition: color 0.25s ease;
}

.nexus-login-input :deep(.el-input__wrapper.is-focus .el-input__prefix-inner .el-icon) {
  color: var(--nexus-primary-color);
}

/* 密码可见按钮 */
.nexus-login-form :deep(.el-input__suffix-inner .el-icon) {
  font-size: 16px;
  color: var(--nexus-text-color-placeholder);
  transition: color 0.2s ease;
}

.nexus-login-form :deep(.el-input__suffix-inner .el-icon:hover) {
  color: var(--nexus-text-color-secondary);
}

/* ========== 提交按钮 ========== */
.nexus-login-btn {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  border: none;
  margin-top: 4px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 14px color-mix(in srgb, var(--nexus-primary-color) 20%, transparent);
}

.nexus-login-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 24px color-mix(in srgb, var(--nexus-primary-color) 30%, transparent);
  filter: brightness(1.05);
}

.nexus-login-btn:active {
  transform: translateY(0);
}

/* ========== 底部提示 ========== */
.nexus-login-hint {
  margin-top: 24px;
  text-align: center;
  font-size: 13px;
  color: var(--nexus-text-color-placeholder);
}

/* ========== 校验错误 ========== */
.nexus-login-form :deep(.el-form-item.is-error .el-input__wrapper) {
  box-shadow: 0 0 0 2px var(--el-color-danger) !important;
}

.nexus-login-form :deep(.el-form-item__error) {
  padding-top: 6px;
  font-size: 12px;
  color: var(--el-color-danger);
}

/* ========== 响应式 ========== */
@media (max-width: 520px) {
  .nexus-login-card {
    width: calc(100vw - 32px);
    padding: 40px 24px 36px;
    border-radius: 16px;
  }
  .nexus-login-card-header {
    margin-bottom: 32px;
  }
  .nexus-login-title {
    font-size: 22px;
  }
  .nexus-login-input :deep(.el-input__wrapper) {
    height: 44px;
  }
  .nexus-login-input :deep(.el-input__inner) {
    height: 40px;
  }
  .nexus-login-btn {
    height: 44px;
    font-size: 14px;
  }
}
</style>