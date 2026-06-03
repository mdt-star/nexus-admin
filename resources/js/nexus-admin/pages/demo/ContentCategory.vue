<template>
  <div class="nexus-page">
    <div class="nexus-page-header">
      <h2><el-icon><Collection /></el-icon> {{ t('menu.content-category') }}</h2>
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

      <el-table :data="categories" border stripe style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column v-if="columnVisibility.id" prop="id" :label="t('common.id')" width="60" />
        <el-table-column v-if="columnVisibility.name" prop="name" :label="t('category.name')" min-width="150" />
        <el-table-column v-if="columnVisibility.slug" prop="slug" :label="t('category.slug')" min-width="120" />
        <el-table-column v-if="columnVisibility.sort" prop="sort" :label="t('category.sort')" min-width="60" />
        <el-table-column v-if="columnVisibility.articleCount" prop="articleCount" :label="t('category.articleCount')" min-width="60" />
        <el-table-column v-if="columnVisibility.createdAt" prop="createdAt" :label="t('common.createdAt')" min-width="140" />
        <el-table-column v-if="columnVisibility.operation" :label="t('common.operation')" width="200" fixed="right">
          <template #default="{ row }">
            <el-link :icon="Edit" @click="handleEdit(row)">{{ t('common.edit') }}</el-link>
            <el-link :icon="Delete" @click="handleDelete(row)">{{ t('common.delete') }}</el-link>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? t('common.edit') : t('common.create')"
      width="500px"
    >
      <el-form :model="form" label-width="80px">
        <el-form-item :label="t('category.name')">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item :label="t('category.slug')">
          <el-input v-model="form.slug" />
        </el-form-item>
        <el-form-item :label="t('category.sort')">
          <el-input-number v-model="form.sort" :min="0" />
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

const form = reactive({ id: null, name: '', slug: '', sort: 0 })

// 列可见性配置
const columnDefs = [
  { key: 'id', label: '#ID' },
  { key: 'name', label: '名称' },
  { key: 'slug', label: '标识' },
  { key: 'sort', label: '排序' },
  { key: 'articleCount', label: '文章数' },
  { key: 'createdAt', label: '创建时间' },
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

const categories = ref([
  { id: 1, name: '技术文章', slug: 'tech', sort: 1, articleCount: 12, createdAt: '2026-01-01 00:00:00' },
  { id: 2, name: '产品动态', slug: 'product', sort: 2, articleCount: 5, createdAt: '2026-01-01 00:00:00' },
  { id: 3, name: '行业资讯', slug: 'industry', sort: 3, articleCount: 8, createdAt: '2026-01-15 10:00:00' }
])

function handleRefresh() {
  ElMessage.success(t('common.save'))
}

function handleSelectionChange(selection) {
  selectedIds.value = selection.map(row => row.id)
}

function handleBatchDelete() {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的分类')
    return
  }
  ElMessageBox.confirm(`确定删除选中的 ${selectedIds.value.length} 个分类？`, t('common.confirm'), { type: 'warning' })
    .then(() => {
      categories.value = categories.value.filter(c => !selectedIds.value.includes(c.id))
      selectedIds.value = []
      ElMessage.success(t('common.save'))
    }).catch(() => {})
}

function handleBatchEdit() {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要修改的分类')
    return
  }
  const row = categories.value.find(c => c.id === selectedIds.value[0])
  if (row) handleEdit(row)
}

function handleExport() {
  ElMessage.success('导出任务已提交，请稍后下载')
}

function handleCreate() {
  isEditing.value = false
  form.id = null
  form.name = ''
  form.slug = ''
  form.sort = 0
  dialogVisible.value = true
}

function handleEdit(row) {
  isEditing.value = true
  Object.assign(form, row)
  dialogVisible.value = true
}

function handleDelete(row) {
  ElMessageBox.confirm(t('common.confirm'), t('common.loading'), {
    type: 'warning'
  }).then(() => {
    categories.value = categories.value.filter(c => c.id !== row.id)
    ElMessage.success(t('common.save'))
  }).catch(() => {})
}

function handleSave() {
  if (isEditing.value) {
    const index = categories.value.findIndex(c => c.id === form.id)
    if (index !== -1) {
      categories.value[index] = { ...form }
    }
  } else {
    form.id = Date.now()
    form.articleCount = 0
    form.createdAt = new Date().toISOString().replace('T', ' ').substring(0, 19)
    categories.value.push({ ...form })
  }
  dialogVisible.value = false
  ElMessage.success(isEditing.value ? t('common.save') : t('common.create'))
}
</script>

<style scoped>
.nexus-page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.nexus-table-card { margin-bottom: 16px; }
</style>
