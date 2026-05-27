<template>
  <div class="nexus-page">
    <div class="nexus-page-header">
      <h2><el-icon><Avatar /></el-icon> {{ t('menu.system-role') }}</h2>
      <div class="nexus-page-actions">
        <el-button type="primary" @click="handleCreate"><el-icon><Plus /></el-icon> {{ t('common.create') }}</el-button>
      </div>
    </div>

    <el-card class="nexus-table-card">
      <el-table :data="roles" border stripe style="width: 100%">
        <el-table-column prop="id" :label="t('common.id')" width="60" />
        <el-table-column prop="name" :label="t('role.name')" width="150" />
        <el-table-column prop="code" :label="t('role.slug')" width="150" />
        <el-table-column prop="description" :label="t('role.description')" min-width="200" />
        <el-table-column prop="userCount" :label="t('role.memberCount')" width="80" />
        <el-table-column prop="status" :label="t('common.status')" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">{{ row.status === 'active' ? '启用' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="t('common.operation')" width="200" fixed="right">
          <template #default="{ row }">
            <el-link :icon="Edit" @click="handleEdit(row)">{{ t('common.edit') }}</el-link>
            <el-link :icon="Delete" @click="handleDelete(row)">{{ t('common.delete') }}</el-link>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEditing ? t('common.edit') : t('common.create')" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item :label="t('role.name')"><el-input v-model="form.name" /></el-form-item>
        <el-form-item :label="t('role.slug')"><el-input v-model="form.code" /></el-form-item>
        <el-form-item :label="t('role.description')"><el-input v-model="form.description" /></el-form-item>
        <el-form-item :label="t('common.status')">
          <el-radio-group v-model="form.status">
            <el-radio value="active">启用</el-radio>
            <el-radio value="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSave">{{ t('common.save') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Delete } from "@element-plus/icons-vue"
import { useI18nStore } from '../../../stores/i18n'

const { t } = useI18nStore()

const dialogVisible = ref(false)
const isEditing = ref(false)
const form = reactive({ id: null, name: '', code: '', description: '', status: 'active' })
const roles = ref([
  { id: 1, name: '超级管理员', code: 'super_admin', description: '系统超级管理员', userCount: 1, status: 'active', createdAt: '2025-01-01 00:00:00' },
  { id: 2, name: '编辑', code: 'editor', description: '内容编辑人员', userCount: 3, status: 'active', createdAt: '2025-01-01 00:00:00' },
  { id: 3, name: '普通用户', code: 'user', description: '普通注册用户', userCount: 100, status: 'active', createdAt: '2025-06-01 00:00:00' }
])

function handleCreate() { isEditing.value = false; form.id = null; form.name = ''; form.code = ''; form.description = ''; form.status = 'active'; dialogVisible.value = true }
function handleEdit(row) { isEditing.value = true; Object.assign(form, row); dialogVisible.value = true }
function handleDelete(row) {
  ElMessageBox.confirm(t('common.confirm'), t('common.loading'), { type: 'warning' }).then(() => {
    roles.value = roles.value.filter(r => r.id !== row.id); ElMessage.success(t('common.save'))
  }).catch(() => {})
}
function handleSave() {
  if (isEditing.value) { const idx = roles.value.findIndex(r => r.id === form.id); if (idx !== -1) roles.value[idx] = { ...form } }
  else { form.id = Date.now(); form.userCount = 0; form.createdAt = new Date().toISOString().replace('T', ' ').substring(0, 19); roles.value.push({ ...form }) }
  dialogVisible.value = false; ElMessage.success(isEditing.value ? t('common.save') : t('common.create'))
}
</script>

<style scoped>
.nexus-page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }

.nexus-table-card { margin-bottom: 16px; }
</style>