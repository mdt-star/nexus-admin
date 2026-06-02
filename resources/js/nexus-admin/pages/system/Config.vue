<template>
  <div class="nexus-page">
    <div class="nexus-page-header">
      <h2><el-icon><Tools /></el-icon> {{ t('menu.system-config') }}</h2>
    </div>

    <el-card>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本设置" name="basic">
          <el-form :model="basicForm" label-width="120px" style="max-width: 600px; margin-top: 16px;">
            <el-form-item label="站点名称">
              <el-input v-model="basicForm.siteName" />
            </el-form-item>
            <el-form-item label="站点描述">
              <el-input v-model="basicForm.siteDescription" type="textarea" :rows="3" />
            </el-form-item>
            <el-form-item label="站点关键词">
              <el-input v-model="basicForm.siteKeywords" />
            </el-form-item>
            <el-form-item label="ICP 备案号">
              <el-input v-model="basicForm.icp" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSaveBasic">{{ t('common.save') }}</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="邮件设置" name="mail">
          <el-form :model="mailForm" label-width="120px" style="max-width: 600px; margin-top: 16px;">
            <el-form-item label="SMTP 服务器">
              <el-input v-model="mailForm.host" />
            </el-form-item>
            <el-form-item label="SMTP 端口">
              <el-input-number v-model="mailForm.port" :min="1" :max="65535" />
            </el-form-item>
            <el-form-item label="加密方式">
              <el-select v-model="mailForm.encryption" style="width: 100%">
                <el-option label="无" value="" />
                <el-option label="SSL" value="ssl" />
                <el-option label="TLS" value="tls" />
              </el-select>
            </el-form-item>
            <el-form-item label="邮箱账号">
              <el-input v-model="mailForm.username" />
            </el-form-item>
            <el-form-item label="邮箱密码">
              <el-input v-model="mailForm.password" type="password" show-password />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSaveMail">{{ t('common.save') }}</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="安全设置" name="security">
          <el-form :model="securityForm" label-width="160px" style="max-width: 600px; margin-top: 16px;">
            <el-form-item label="登录失败锁定次数">
              <el-input-number v-model="securityForm.lockThreshold" :min="1" :max="20" />
            </el-form-item>
            <el-form-item label="锁定时间（分钟）">
              <el-input-number v-model="securityForm.lockDuration" :min="1" :max="1440" />
            </el-form-item>
            <el-form-item label="密码最小长度">
              <el-input-number v-model="securityForm.passwordMinLength" :min="6" :max="32" />
            </el-form-item>
            <el-form-item label="启用验证码">
              <el-switch v-model="securityForm.enableCaptcha" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSaveSecurity">{{ t('common.save') }}</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useI18nStore } from '@nexus-admin/core'

const { t } = useI18nStore()

const activeTab = ref('basic')

const basicForm = reactive({
  siteName: 'Nexus Admin',
  siteDescription: '基于 Vue 3 + Element Plus 的现代化后台管理界面基座',
  siteKeywords: 'admin, vue, element-plus, laravel',
  icp: '京ICP备XXXXXXXX号-1'
})

const mailForm = reactive({
  host: 'smtp.example.com',
  port: 465,
  encryption: 'ssl',
  username: 'noreply@example.com',
  password: ''
})

const securityForm = reactive({
  lockThreshold: 5,
  lockDuration: 30,
  passwordMinLength: 8,
  enableCaptcha: true
})

function handleSaveBasic() {
  ElMessage.success('基本设置已保存')
}

function handleSaveMail() {
  ElMessage.success('邮件设置已保存')
}

function handleSaveSecurity() {
  ElMessage.success('安全设置已保存')
}
</script>

<style scoped>
.nexus-page-header {
  margin-bottom: 16px;
}
</style>
