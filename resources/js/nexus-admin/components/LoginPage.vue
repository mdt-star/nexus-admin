<template>
  <div class="nexus-login">
    <!-- 装饰性背景层 -->
    <div class="nexus-login-bg">
      <div class="nexus-login-shape nexus-login-shape-1"></div>
      <div class="nexus-login-shape nexus-login-shape-2"></div>
      <div class="nexus-login-shape nexus-login-shape-3"></div>
      <div class="nexus-login-shape nexus-login-shape-4"></div>
    </div>

    <!-- 主容器 -->
    <div class="nexus-login-container">
      <!-- 左侧品牌区 -->
      <div class="nexus-login-brand">
        <div class="nexus-login-brand-inner">
          <div class="nexus-login-brand-logo">
            <el-icon :size="48" color="#ffffff"><Monitor /></el-icon>
          </div>
          <h1 class="nexus-login-brand-title">{{ appName }}</h1>
          <p class="nexus-login-brand-desc">{{ t('login.subtitle') }}</p>

          <div class="nexus-login-brand-features">
            <div class="nexus-login-brand-feature">
              <el-icon :size="18"><Monitor /></el-icon>
              <span>{{ t('login.feature1') || '桌面式管理界面' }}</span>
            </div>
            <div class="nexus-login-brand-feature">
              <el-icon :size="18"><Grid /></el-icon>
              <span>{{ t('login.feature2') || '灵活布局切换' }}</span>
            </div>
            <div class="nexus-login-brand-feature">
              <el-icon :size="18"><Setting /></el-icon>
              <span>{{ t('login.feature3') || '深度可定制' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧登录表单区 -->
      <div class="nexus-login-form-wrap">
        <div class="nexus-login-card">
          <div class="nexus-login-card-header">
            <h2 class="nexus-login-welcome">{{ t('login.welcome') || '欢迎回来' }}</h2>
            <p class="nexus-login-hint-text">{{ t('login.hint') }}</p>
          </div>

          <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            @keyup.enter="handleLogin"
            class="nexus-login-form"
            size="large"
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
                size="large"
                :loading="loading"
                @click="handleLogin"
                class="nexus-login-btn"
              >
                <span v-if="!loading">{{ t('login.submit') }}</span>
              </el-button>
            </el-form-item>
          </el-form>

          <div class="nexus-login-footer-text">
            <span>{{ t('login.noAccount') || '还没有账号？' }}</span>
            <a href="javascript:void(0)" class="nexus-login-link">{{ t('login.register') || '联系管理员' }}</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { User, Lock, Monitor, Grid, Setting } from '@element-plus/icons-vue'
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
/* ========== 基础布局 ========== */
.nexus-login {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  overflow: hidden;
  background: var(--nexus-bg-color);
}

/* ========== 背景装饰 - 浮动光晕 ========== */
.nexus-login-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.nexus-login-shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.08;
  filter: blur(60px);
}

.nexus-login-shape-1 {
  width: 500px; height: 500px;
  top: -10%; right: -5%;
  background: var(--nexus-primary-color);
  animation: nexus-float 8s ease-in-out infinite;
}

.nexus-login-shape-2 {
  width: 400px; height: 400px;
  bottom: -8%; left: -5%;
  background: var(--nexus-primary-color-dark);
  animation: nexus-float 10s ease-in-out infinite reverse;
}

.nexus-login-shape-3 {
  width: 250px; height: 250px;
  top: 40%; left: 15%;
  background: var(--nexus-primary-color-light);
  animation: nexus-float 12s ease-in-out infinite 2s;
}

.nexus-login-shape-4 {
  width: 180px; height: 180px;
  bottom: 25%; right: 20%;
  background: var(--nexus-primary-color);
  animation: nexus-float 7s ease-in-out infinite 1s;
}

@keyframes nexus-float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.05); }
  66% { transform: translate(-20px, 20px) scale(0.95); }
}

/* ========== 主容器 ========== */
.nexus-login-container {
  position: relative;
  z-index: 1;
  display: flex;
  width: 960px;
  max-width: calc(100vw - 48px);
  min-height: 600px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08), 0 8px 24px rgba(0, 0, 0, 0.04);
  background: var(--nexus-bg-color-light);
  animation: nexus-login-enter 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes nexus-login-enter {
  from { opacity: 0; transform: translateY(30px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* ========== 左侧品牌区 ========== */
.nexus-login-brand {
  flex: 1.2;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  background: linear-gradient(135deg, var(--nexus-primary-color) 0%, var(--nexus-primary-color-dark) 100%);
  position: relative;
  overflow: hidden;
}

.nexus-login-brand::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 20% 50%, rgba(255,255,255,0.12) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 80%, rgba(255,255,255,0.06) 0%, transparent 50%);
}

.nexus-login-brand::after {
  content: '';
  position: absolute;
  width: 300px; height: 300px;
  border-radius: 50%;
  top: -60px; right: -60px;
  background: rgba(255,255,255,0.06);
}

.nexus-login-brand-inner {
  position: relative;
  z-index: 1;
  text-align: center;
}

.nexus-login-brand-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px; height: 80px;
  border-radius: 24px;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(10px);
  margin-bottom: 24px;
  transition: transform 0.3s ease;
}

.nexus-login-brand-logo:hover {
  transform: scale(1.05) rotate(-5deg);
}

.nexus-login-brand-title {
  font-size: 32px;
  font-weight: 800;
  color: #fff;
  margin: 0 0 12px;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 10px rgba(0,0,0,0.08);
}

.nexus-login-brand-desc {
  font-size: 15px;
  color: rgba(255,255,255,0.75);
  margin: 0 0 48px;
  font-weight: 400;
  line-height: 1.6;
}

.nexus-login-brand-features {
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: left;
  max-width: 260px;
  margin: 0 auto;
}

.nexus-login-brand-feature {
  display: flex;
  align-items: center;
  gap: 14px;
  color: rgba(255,255,255,0.85);
  font-size: 14px;
  padding: 10px 16px;
  border-radius: 12px;
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
}

.nexus-login-brand-feature:hover {
  background: rgba(255,255,255,0.15);
  transform: translateX(6px);
}

.nexus-login-brand-feature .el-icon {
  flex-shrink: 0;
  color: rgba(255,255,255,0.9);
}

/* ========== 右侧登录表单区 ========== */
.nexus-login-form-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  background: var(--nexus-bg-color-light);
}

.nexus-login-card {
  width: 100%;
  max-width: 380px;
}

.nexus-login-card-header {
  margin-bottom: 36px;
}

.nexus-login-welcome {
  font-size: 26px;
  font-weight: 700;
  color: var(--nexus-text-color);
  margin: 0 0 8px;
  letter-spacing: -0.3px;
}

.nexus-login-hint-text {
  font-size: 14px;
  color: var(--nexus-text-color-secondary);
  margin: 0;
  line-height: 1.5;
}

/* ========== 表单样式 ========== */
.nexus-login-form {
  text-align: left;
}

.nexus-login-form :deep(.el-form-item) {
  margin-bottom: 22px;
}

.nexus-login-form :deep(.el-form-item:last-child) {
  margin-bottom: 0;
}

.nexus-login-input :deep(.el-input__wrapper) {
  padding: 4px 16px;
  height: 48px;
  border-radius: 12px;
  border: 2px solid transparent;
  box-shadow: 0 0 0 1px var(--nexus-border-color);
  background: var(--nexus-bg-color);
  transition: all 0.25s ease;
}

.nexus-login-input :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px var(--nexus-primary-color);
  border-color: var(--nexus-primary-color);
}

.nexus-login-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px var(--nexus-primary-color), 0 4px 12px rgba(20,184,166,0.1);
  border-color: var(--nexus-primary-color);
  background: var(--nexus-bg-color-light);
}

.nexus-login-input :deep(.el-input__inner) {
  height: 48px;
  font-size: 15px;
  color: var(--nexus-text-color);
}

.nexus-login-input :deep(.el-input__inner::placeholder) {
  color: var(--nexus-text-color-placeholder);
  font-size: 14px;
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

.nexus-login-form :deep(.el-input__suffix-inner .el-icon) {
  font-size: 16px;
  color: var(--nexus-text-color-placeholder);
  transition: color 0.2s ease;
}

.nexus-login-form :deep(.el-input__suffix-inner .el-icon:hover) {
  color: var(--nexus-text-color-secondary);
}

/* ========== 登录按钮 ========== */
.nexus-login-btn {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.3px;
  border: none;
  margin-top: 8px;
  background: linear-gradient(135deg, var(--nexus-primary-color) 0%, var(--nexus-primary-color-dark) 100%);
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(20,184,166,0.25);
}

.nexus-login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(20,184,166,0.35);
  filter: brightness(1.05);
}

.nexus-login-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(20,184,166,0.25);
}

.nexus-login-btn.is-loading {
  opacity: 0.8;
}

/* ========== 底部文字 ========== */
.nexus-login-footer-text {
  margin-top: 28px;
  text-align: center;
  font-size: 13px;
  color: var(--nexus-text-color-secondary);
}

.nexus-login-link {
  color: var(--nexus-primary-color);
  font-weight: 500;
  margin-left: 4px;
  text-decoration: none;
  transition: color 0.2s ease;
}

.nexus-login-link:hover {
  color: var(--nexus-primary-color-dark);
  text-decoration: underline;
}

/* ========== 错误校验 ========== */
.nexus-login-form :deep(.el-form-item.is-error .el-input__wrapper) {
  box-shadow: 0 0 0 2px var(--el-color-danger) !important;
  border-color: var(--el-color-danger) !important;
}

.nexus-login-form :deep(.el-form-item__error) {
  padding-top: 6px;
  font-size: 12px;
  color: var(--el-color-danger);
}

/* ========== 响应式：平板 ========== */
@media (max-width: 820px) {
  .nexus-login-container {
    flex-direction: column;
    width: 100%;
    max-width: 480px;
    min-height: auto;
    border-radius: 20px;
  }
  .nexus-login-brand {
    flex: none;
    padding: 40px 32px 32px;
  }
  .nexus-login-brand-title { font-size: 26px; }
  .nexus-login-brand-desc { margin-bottom: 28px; }
  .nexus-login-brand-features { display: none; }
  .nexus-login-brand-logo {
    width: 64px; height: 64px;
    border-radius: 20px;
    margin-bottom: 16px;
  }
  .nexus-login-brand-logo :deep(.el-icon) { font-size: 36px !important; }
  .nexus-login-form-wrap { padding: 36px 32px 40px; }
  .nexus-login-card-header { margin-bottom: 28px; }
  .nexus-login-welcome { font-size: 22px; }
}

/* ========== 响应式：手机 ========== */
@media (max-width: 480px) {
  .nexus-login-container {
    max-width: 100%;
    border-radius: 16px;
    margin: 0 12px;
  }
  .nexus-login-brand { padding: 32px 24px 24px; }
  .nexus-login-form-wrap { padding: 28px 24px 32px; }
  .nexus-login-welcome { font-size: 20px; }
  .nexus-login-input :deep(.el-input__wrapper) { height: 44px; }
  .nexus-login-btn { height: 44px; font-size: 15px; }
}
</style>
