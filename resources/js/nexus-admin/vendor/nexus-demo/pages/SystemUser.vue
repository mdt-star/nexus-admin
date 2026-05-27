<template>
  <div class="nexus-page">
    <div class="nexus-page-header">
      <h2><el-icon><User /></el-icon> {{ t('menu.system-user') }}</h2>
      <div class="nexus-page-actions">
        <el-button type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            {{ t('common.create') }}
          </el-button>
        <el-button-group style="margin-left: 10px;">
          <el-button :icon="Refresh" @click="handleRefresh"></el-button>
          <el-button :icon="Setting" @click="columnSettingsVisible = true"></el-button>
        </el-button-group>


      </div>
    </div>

    <el-card class="nexus-search-card nexus-sticky-search">
      <el-form :inline="true" :model="searchForm">
        <el-form-item :label="t('user.username')">
          <el-input v-model="searchForm.keyword" :placeholder="t('user.username')" clearable />
        </el-form-item>
        <el-form-item :label="t('common.status')">
          <el-select v-model="searchForm.status" clearable style="width: 120px">
            <el-option :label="t('common.search')" value="" />
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button  @click="handleSearch">{{ t('common.search') }}</el-button>
          <el-button @click="handleReset">{{ t('common.reset') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>

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


      <el-table :data="users" border stripe v-loading="loading" style="width: 100%" max-height="calc(100vh - 320px)" @selection-change="handleSelectionChange">

        <el-table-column type="selection" width="55" />

        <el-table-column v-if="columnVisibility.id" prop="id" label="#ID" min-width="60" />
        <el-table-column v-if="columnVisibility.username" prop="username" :label="t('user.username')" min-width="100" />
        <el-table-column v-if="columnVisibility.email" prop="email" :label="t('user.email')" min-width="160" />
        <el-table-column v-if="columnVisibility.role" prop="role" :label="t('user.role')" min-width="100" />
        <el-table-column v-if="columnVisibility.status" prop="status" :label="t('common.status')" min-width="80">

          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="columnVisibility.lastLoginAt" prop="lastLoginAt" label="最后登录" min-width="140" />
        <el-table-column v-if="columnVisibility.createdAt" prop="createdAt" :label="t('common.createdAt')" min-width="140" />
        <el-table-column v-if="columnVisibility.operation" :label="t('common.operation')" min-width="160" fixed="right">

          <template #default="{ row }">
            <el-link :icon="Edit" @click="handleEdit(row)">{{ t('common.edit') }}</el-link>
            <el-link :icon="Delete" @click="handleDelete(row)">{{ t('common.delete') }}</el-link>
          </template>
        </el-table-column>
      </el-table>


      <div class="nexus-pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="handlePageChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? t('common.edit') : t('common.create')"
      width="500px"
    >
      <el-form :model="form" label-width="80px">
        <el-form-item :label="t('user.username')">
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item :label="t('user.email')">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item :label="t('user.role')">
          <el-select v-model="form.role" style="width: 100%">
            <el-option label="超级管理员" value="超级管理员" />
            <el-option :label="t('user.admin')" value="管理员" />
            <el-option :label="t('user.editor')" value="编辑" />
            <el-option label="普通用户" value="普通用户" />
          </el-select>
        </el-form-item>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Delete, Setting } from "@element-plus/icons-vue"
import { useI18nStore } from '../../../stores/i18n'
import { useWindowStore } from '../../../stores/windows'
import { Refresh } from '@element-plus/icons-vue'

const { t } = useI18nStore()
const route = useRoute()
const windowStore = useWindowStore()

const props = defineProps({ searchParams: Object })

const loading = ref(false)
const dialogVisible = ref(false)
const isEditing = ref(false)
const selectedIds = ref([])
const columnSettingsVisible = ref(false)

const searchForm = reactive({ keyword: '', status: '' })
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
const form = reactive({ id: null, username: '', email: '', role: '', status: 'active' })

// 列可见性配置
const columnDefs = [
  { key: 'id', label: '#ID' },
  { key: 'username', label: '用户名' },
  { key: 'email', label: '邮箱' },
  { key: 'role', label: '角色' },
  { key: 'status', label: '状态' },
  { key: 'lastLoginAt', label: '最后登录' },
  { key: 'createdAt', label: '创建时间' },
  { key: 'operation', label: '操作' },
]
const columnVisibility = ref(Object.fromEntries(columnDefs.map(c => [c.key, true])))
const visibleColumns = computed(() => columnDefs.filter(c => columnVisibility.value[c.key]))
const selectedColumnKeys = ref(columnDefs.map(c => c.key))

function applyColumnSettings() {
  const newVis = {}
  columnDefs.forEach(c => { newVis[c.key] = selectedColumnKeys.value.includes(c.key) })
  columnVisibility.value = newVis
  columnSettingsVisible.value = false
}



const users = ref([
  { id: 1, username: 'admin', email: 'admin@example.com', role: '超级管理员', status: 'active', lastLoginAt: '2026-03-15 10:00:00', createdAt: '2025-01-01 00:00:00' },
  { id: 2, username: 'editor', email: 'editor@example.com', role: '编辑', status: 'active', lastLoginAt: '2026-03-14 16:30:00', createdAt: '2025-06-01 00:00:00' },
  { id: 3, username: 'user1', email: 'user1@example.com', role: '普通用户', status: 'active', lastLoginAt: '2026-03-10 09:00:00', createdAt: '2025-09-15 10:00:00' },
  { id: 4, username: 'user2', email: 'user2@example.com', role: '普通用户', status: 'disabled', lastLoginAt: '2026-01-20 14:00:00', createdAt: '2025-11-01 10:00:00' }
])
pagination.total = users.value.length

// 从 URL query 恢复搜索条件
onMounted(() => {
  if (route.query.keyword) searchForm.keyword = route.query.keyword
  if (route.query.status) searchForm.status = route.query.status
})

function handleSearch() {
  loading.value = true
  windowStore.updateSearchParams('system-user', { ...searchForm })
  setTimeout(() => { loading.value = false }, 300)
}

function handleReset() {
  searchForm.keyword = ''
  searchForm.status = ''
  windowStore.updateSearchParams('system-user', {})
}

function handleRefresh() {
  loading.value = true
  setTimeout(() => { loading.value = false; ElMessage.success(t('common.save')) }, 300)
}

function handleBatchDelete() {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的用户')
    return
  }
  ElMessageBox.confirm(`确定删除选中的 ${selectedIds.value.length} 个用户？`, t('common.confirm'), { type: 'warning' })
    .then(() => {
      users.value = users.value.filter(u => !selectedIds.value.includes(u.id))
      pagination.total = users.value.length
      selectedIds.value = []
      ElMessage.success(t('common.save'))
    }).catch(() => {})
}

function handleBatchEdit() {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要修改的用户')
    return
  }
  const row = users.value.find(u => u.id === selectedIds.value[0])
  if (row) handleEdit(row)
}

function handleSelectionChange(selection) {
  selectedIds.value = selection.map(row => row.id)
}

function handleExport() {
  ElMessage.success('导出任务已提交，请稍后下载')
}


function handleCreate() { isEditing.value = false; form.id = null; form.username = ''; form.email = ''; form.role = ''; form.status = 'active'; dialogVisible.value = true }
function handleEdit(row) { isEditing.value = true; Object.assign(form, row); dialogVisible.value = true }
function handleDelete(row) {
  ElMessageBox.confirm(t('common.confirm'), t('common.loading'), { type: 'warning' })
    .then(() => { users.value = users.value.filter(u => u.id !== row.id); pagination.total = users.value.length; ElMessage.success(t('common.save')) }).catch(() => {})
}
function handleSave() {
  if (isEditing.value) { const idx = users.value.findIndex(u => u.id === form.id); if (idx !== -1) users.value[idx] = { ...form } }
  else { form.id = Date.now(); form.lastLoginAt = '-'; form.createdAt = new Date().toISOString().replace('T', ' ').substring(0, 19); users.value.unshift({ ...form }); pagination.total = users.value.length }
  dialogVisible.value = false; ElMessage.success(isEditing.value ? t('common.save') : t('common.create'))
}
function handlePageChange() { loading.value = true; setTimeout(() => { loading.value = false }, 300) }
</script>


<style scoped>
.nexus-page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }

.nexus-search-card { margin-bottom: 16px; }
.nexus-table-card { margin-bottom: 16px; }
.nexus-pagination { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
