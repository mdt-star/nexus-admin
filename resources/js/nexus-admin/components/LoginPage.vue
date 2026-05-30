<template>
  <div class="nexus-login">
    <!-- 科技感粒子背景 -->
    <div class="nexus-login-particles">
      <div
        v-for="i in 50"
        :key="i"
        class="nexus-login-particle"
        :style="{
          '--x': ((i * 7 + 3) % 100) + '%',
          '--d': (i % 6 + 3) + 's',
          '--s': (i % 3 + 1) * 1.5 + 1 + 'px',
          '--delay': (i * 0.25) + 's',
          '--op': (i % 5 + 2) * 0.1,
        }"
      ></div>
    </div>

    <!-- 科技感扫描线网格 -->
    <div class="nexus-login-grid">
      <div class="nexus-login-grid-h" v-for="i in 20" :key="'h' + i" :style="{ '--p': i * 5 + '%' }"></div>
      <div class="nexus-login-grid-v" v-for="i in 20" :key="'v' + i" :style="{ '--p': i * 5 + '%' }"></div>
    </div>

    <!-- 渐变光晕 -->
    <div class="nexus-login-glow">
      <div class="nexus-login-glow-orb nexus-login-glow-1"></div>
      <div class="nexus-login-glow-orb nexus-login-glow-2"></div>
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
/* ========== 页面容器 ========== */
.nexus-login {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  overflow: hidden;
  background: #0b0f1a;
}

/* ========== 暗色背景覆盖（亮色模式下也保持科技感） ========== */
:root:not(.dark) .nexus-login {
  background: #0b0f1a;
}

/* ========== 粒子系统 ========== */
.nexus-login-particles {
  position: fixed;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

.nexus-login-particle {
  position: absolute;
  bottom: -8px;
  left: var(--x);
  width: var(--s);
  height: var(--s);
  border-radius: 50%;
  background: #5eead4;
  box-shadow: 0 0 6px #5eead4, 0 0 12px rgba(94, 234, 212, 0.3);
  opacity: var(--op);
  animation: nexus-rise var(--d) ease-in infinite;
  animation-delay: var(--delay);
}

@keyframes nexus-rise {
  0% {
    transform: translateY(0) scale(1);
    opacity: var(--op);
  }
  60% {
    opacity: calc(var(--op) * 3);
  }
  100% {
    transform: translateY(-110vh) scale(0.3);
    opacity: 0;
  }
}

/* ========== 科技网格 ========== */
.nexus-login-grid {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.3;
}

.nexus-login-grid-h {
  position: absolute;
  left: 0; right: 0;
  top: var(--p);
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(94, 234, 212, 0.15), transparent);
  animation: nexus-grid-pulse 4s ease-in-out infinite;
  animation-delay: calc(var(--p) * 0.1s);
}

.nexus-login-grid-v {
  position: absolute;
  top: 0; bottom: 0;
  left: var(--p);
  width: 1px;
  background: linear-gradient(to bottom, transparent, rgba(94, 234, 212, 0.08), transparent);
  animation: nexus-grid-pulse 5s ease-in-out infinite reverse;
  animation-delay: calc(var(--p) * 0.08s);
}

@keyframes nexus-grid-pulse {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 1; }
}

/* ========== 光晕 ========== */
.nexus-login-glow {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.nexus-login-glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
}

.nexus-login-glow-1 {
  width: 600px; height: 600px;
  top: -20%; right: -10%;
  background: #14b8a6;
  opacity: 0.12;
  animation: nexus-glow-drift 14s ease-in-out infinite;
}

.nexus-login-glow-2 {
  width: 500px; height: 500px;
  bottom: -15%; left: -8%;
  background: #0d9488;
  opacity: 0.1;
  animation: nexus-glow-drift 18s ease-in-out infinite reverse;
}

@keyframes nexus-glow-drift {
  0%, 100% { transform: translate(0, 0); }
  33% { transform: translate(40px, -30px); }
  66% { transform: translate(-30px, 40px); }
}

/* ========== 登录卡片 ========== */
.nexus-login-card {
  position: relative;
  z-index: 2;
  width: 400px;
  padding: 48px 40px 40px;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(94, 234, 212, 0.08);
  box-shadow:
    0 0 40px rgba(20, 184, 166, 0.06),
    0 4px 24px rgba(0, 0, 0, 0.2),
    0 20px 60px rgba(0, 0, 0, 0.3);
  animation: nexus-card-in 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes nexus-card-in {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.96);
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
  background: rgba(94, 234, 212, 0.1);
  color: #5eead4;
  margin-bottom: 20px;
  box-shadow: 0 0 20px rgba(94, 234, 212, 0.15);
}

.nexus-login-title {
  font-size: 24px;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0 0 8px;
  letter-spacing: -0.3px;
}

.nexus-login-desc {
  font-size: 14px;
  color: rgba(148, 163, 184, 0.9);
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
  background: rgba(30, 41, 59, 0.6);
  box-shadow: 0 0 0 1px rgba(94, 234, 212, 0.1);
  transition: all 0.25s ease;
}

.nexus-login-input :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(94, 234, 212, 0.3);
  background: rgba(30, 41, 59, 0.8);
}

.nexus-login-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px #14b8a6, 0 0 20px rgba(20, 184, 166, 0.15);
  background: rgba(30, 41, 59, 0.9);
}

.nexus-login-input :deep(.el-input__inner) {
  height: 44px;
  font-size: 14px;
  color: #f1f5f9;
}

.nexus-login-input :deep(.el-input__inner::placeholder) {
  color: rgba(148, 163, 184, 0.5);
}

.nexus-login-input :deep(.el-input__prefix) {
  margin-right: 10px;
}

.nexus-login-input :deep(.el-input__prefix-inner .el-icon) {
  font-size: 18px;
  color: rgba(148, 163, 184, 0.6);
  transition: color 0.25s ease;
}

.nexus-login-input :deep(.el-input__wrapper.is-focus .el-input__prefix-inner .el-icon) {
  color: #5eead4;
}

.nexus-login-form :deep(.el-input__suffix-inner .el-icon) {
  font-size: 16px;
  color: rgba(148, 163, 184, 0.6);
  transition: color 0.2s ease;
}

.nexus-login-form :deep(.el-input__suffix-inner .el-icon:hover) {
  color: rgba(148, 163, 184, 0.8);
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
  background: linear-gradient(135deg, #14b8a6, #0d9488) !important;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(20, 184, 166, 0.25);
}

.nexus-login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(20, 184, 166, 0.4);
  filter: brightness(1.1);
}

.nexus-login-btn:active {
  transform: translateY(0);
}

/* ========== 底部提示 ========== */
.nexus-login-hint {
  margin-top: 24px;
  text-align: center;
  font-size: 13px;
  color: rgba(148, 163, 184, 0.5);
}

/* ========== 校验错误 ========== */
.nexus-login-form :deep(.el-form-item.is-error .el-input__wrapper) {
  box-shadow: 0 0 0 2px #ef4444 !important;
}

.nexus-login-form :deep(.el-form-item__error) {
  padding-top: 6px;
  font-size: 12px;
  color: #ef4444;
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