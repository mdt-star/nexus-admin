<template>
  <div class="nexus-page">
    <div class="nexus-page-header">
      <h2><el-icon><Avatar /></el-icon> {{ t('menu.system-role') }}</h2>
      <div class="nexus-page-actions">
        <el-button type="primary" @click="handleCreate"><el-icon><Plus /></el-icon> {{ t('common.create') }}</el-button>
        <el-button-group style="margin-left: 10px;">
          <el-button :icon="Refresh" @click="handleRefresh"></el-button>
          <el-button :icon="Setting" @click="columnSettingsVisible = true"></el-button>
        </el-button-group>
      </div>
    </div>

    <el-card class="nexus-table-card">
      <el-button-group style="margin-bottom: 10px;" v-if="selectedIds.length > 0">
        <el-button type="danger" @click="handleBatchDelete">
          批量删除 ({{ selectedIds.length }})
        </el-button>
        <el-button @click="handleBatchEdit">
          批量修改
        </el-button>
        <el-button @click="handleExport">
          导出数据
        </el-button>
      </el-button-group>

      <el-table :data="roles" border stripe style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column v-if="columnVisibility.id" prop="id" :label="t('common.id')" width="60" />
        <el-table-column v-if="columnVisibility.name" prop="name" :label="t('role.name')" min-width="120" />
        <el-table-column v-if="columnVisibility.code" prop="code" :label="t('role.slug')" min-width="120" />
        <el-table-column v-if="columnVisibility.description" prop="description" :label="t('role.description')" min-width="200" />
        <el-table-column v-if="columnVisibility.userCount" prop="userCount" :label="t('role.memberCount')" min-width="60" />
        <el-table-column v-if="columnVisibility.status" prop="status" :label="t('common.status')" min-width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">{{ row.status === 'active' ? '启用' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="columnVisibility.operation" :label="t('common.operation')" width="200" fixed="right">
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

    <!-- 列设置弹窗 -->
    <el-dialog v-model="columnSettingsVisible" title="列设置" width="400px">
      <el-checkbox-group v-model="selectedColumnKeys">
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div v-for="col in columnDefs" :key="col.key">
            <el-checkbox :label="col.key" :value="col.key">{{ col.label }}</el-checkbox>
          </div>
        </div>
      </el-checkbox-group>
      <template #footer>
        <el-button @click="columnSettingsVisible = false">取消</el-button>
        <el-button type="primary" @click="applyColumnSettings">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Delete, Setting } from "@element-plus/icons-vue"
import { useI18nStore } from 'nexus-admin-core'
import { Refresh } from '@element-plus/icons-vue'

const { t } = useI18nStore()

const dialogVisible = ref(false)
const isEditing = ref(false)
const selectedIds = ref([])
const columnSettingsVisible = ref(false)

const form = reactive({ id: null, name: '', code: '', description: '', status: 'active' })

// 列可见性配置
const columnDefs = [
  { key: 'id', label: '#ID' },
  { key: 'name', label: '名称' },
  { key: 'code', label: '标识' },
  { key: 'description', label: '描述' },
  { key: 'userCount', label: '成员数' },
  { key: 'status', label: '状态' },
  { key: 'operation', label: '操作' },
]
const columnVisibility = ref(Object.fromEntries(columnDefs.map(c => [c.key, true])))
const selectedColumnKeys = ref(columnDefs.map(c => c.key))

function applyColumnSettings() {
  const newVis = {}
  columnDefs.forEach(c => { newVis[c.key] = selectedColumnKeys.value.includes(c.key) })
  columnVisibility.value = newVis
  columnSettingsVisible.value = false
}

const roles = ref([
  { id: 1, name: '超级管理员', code: 'super_admin', description: '系统超级管理员', userCount: 1, status: 'active', createdAt: '2025-01-01 00:00:00' },
  { id: 2, name: '编辑', code: 'editor', description: '内容编辑人员', userCount: 3, status: 'active', createdAt: '2025-01-01 00:00:00' },
  { id: 3, name: '普通用户', code: 'user', description: '普通注册用户', userCount: 100, status: 'active', createdAt: '2025-06-01 00:00:00' }
])

function handleRefresh() {
  ElMessage.success(t('common.save'))
}

function handleSelectionChange(selection) {
  selectedIds.value = selection.map(row => row.id)
}

function handleBatchDelete() {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的角色')
    return
  }
  ElMessageBox.confirm(`确定删除选中的 ${selectedIds.value.length} 个角色？`, t('common.confirm'), { type: 'warning' })
    .then(() => {
      roles.value = roles.value.filter(r => !selectedIds.value.includes(r.id))
      selectedIds.value = []
      ElMessage.success(t('common.save'))
    }).catch(() => {})
}

function handleBatchEdit() {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要修改的角色')
    return
  }
  const row = roles.value.find(r => r.id === selectedIds.value[0])
  if (row) handleEdit(row)
}

function handleExport() {
  ElMessage.success('导出任务已提交，请稍后下载')
}

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
