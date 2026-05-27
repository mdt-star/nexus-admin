<template>
  <div class="nexus-login">
    <div class="nexus-login-card">
      <div class="nexus-login-logo">
        <el-icon :size="40" color="var(--nexus-primary-color)"><Monitor /></el-icon>
      </div>
      <h2 class="nexus-login-title">{{ appName }}</h2>
      <p class="nexus-login-subtitle">{{ t('login.subtitle') }}</p>

      <el-form ref="formRef" :model="form" :rules="rules" @keyup.enter="handleLogin" class="nexus-login-form">
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            :prefix-icon="User"
            :placeholder="t('login.username')"
            size="large"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            :prefix-icon="Lock"
            type="password"
            show-password
            :placeholder="t('login.password')"
            size="large"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" :loading="loading" @click="handleLogin" class="nexus-login-btn">
            {{ t('login.submit') }}
          </el-button>
        </el-form-item>
      </el-form>

      <p class="nexus-login-hint">{{ t('login.hint') }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { User, Lock } from '@element-plus/icons-vue'
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
.nexus-login {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: var(--nexus-bg-color);
}

.nexus-login-card {
  width: 380px;
  padding: 40px 32px 32px;
  background-color: var(--nexus-bg-color-light);
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.nexus-login-logo {
  margin-bottom: 12px;
}

.nexus-login-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 4px;
  color: var(--nexus-text-color);
}

.nexus-login-subtitle {
  font-size: 13px;
  color: var(--nexus-text-color-secondary);
  margin: 0 0 28px;
}

.nexus-login-form {
  text-align: left;
}

.nexus-login-btn {
  width: 100%;
}

.nexus-login-hint {
  margin-top: 16px;
  font-size: 12px;
  color: var(--nexus-text-color-placeholder);
}
</style>