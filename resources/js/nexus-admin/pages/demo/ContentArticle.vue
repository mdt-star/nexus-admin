<template>
  <div class="nexus-page">
    <div class="nexus-page-header">
      <h2><el-icon><Notebook /></el-icon> {{ t('menu.content-article') }}</h2>
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
        <el-form-item :label="t('common.search')">
          <el-input v-model="searchForm.keyword" :placeholder="t('common.search')" clearable />
        </el-form-item>
        <el-form-item>
          <el-button @click="handleSearch">{{ t('common.search') }}</el-button>

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

      <el-table :data="articles" border stripe v-loading="loading" style="width: 100%" max-height="calc(100vh - 320px)" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column v-if="columnVisibility.id" prop="id" :label="t('common.id')" width="60" />
        <el-table-column v-if="columnVisibility.title" prop="title" :label="t('article.title')" min-width="200" show-overflow-tooltip />
        <el-table-column v-if="columnVisibility.category" prop="category" :label="t('article.category')" min-width="120" />
        <el-table-column v-if="columnVisibility.author" prop="author" :label="t('article.author')" min-width="120" />
        <el-table-column v-if="columnVisibility.status" prop="status" :label="t('article.status')" min-width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'published' ? 'success' : 'info'">
              {{ row.status === 'published' ? t('common.published') : t('common.draft') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="columnVisibility.createdAt" prop="createdAt" :label="t('common.createdAt')" min-width="140" />
        <el-table-column v-if="columnVisibility.operation" :label="t('common.operation')" width="200" fixed="right">
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
      width="600px"
    >
      <el-form :model="form" :label-width="formLabelWidth">
        <el-form-item :label="t('article.title')">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item :label="t('article.category')">
          <el-select v-model="form.category" style="width: 100%">
            <el-option :label="t('article.techArticle')" value="技术文章" />
            <el-option :label="t('article.productNews')" value="产品动态" />
            <el-option :label="t('article.industryInfo')" value="行业资讯" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('common.status')">
          <el-radio-group v-model="form.status">
            <el-radio value="draft">{{ t('common.draft') }}</el-radio>
            <el-radio value="published">{{ t('common.published') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="t('common.content')">
          <el-input v-model="form.content" type="textarea" :rows="6" />
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
import { useI18nStore } from '@nexus-admin/core'
import { useWindowStore } from '@nexus-admin/core'
import { Refresh } from '@element-plus/icons-vue'

const { t } = useI18nStore()
const route = useRoute()
const windowStore = useWindowStore()

const loading = ref(false)
const dialogVisible = ref(false)
const isEditing = ref(false)
const formLabelWidth = ref('80px')
const selectedIds = ref([])
const columnSettingsVisible = ref(false)

const searchForm = reactive({ keyword: '' })
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
const form = reactive({ id: null, title: '', category: '', status: 'draft', content: '' })

// 列可见性配置
const columnDefs = [
  { key: 'id', label: '#ID' },
  { key: 'title', label: '标题' },
  { key: 'category', label: '分类' },
  { key: 'author', label: '作者' },
  { key: 'status', label: '状态' },
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

const articles = ref([
  { id: 1, title: 'Nexus Admin 入门指南', category: '技术文章', author: 'Admin', status: 'published', createdAt: '2026-01-15 10:00:00' },
  { id: 2, title: 'Vue 3 组合式 API 最佳实践', category: '技术文章', author: 'Admin', status: 'published', createdAt: '2026-01-20 14:30:00' },
  { id: 3, title: '2026 年产品路线图', category: '产品动态', author: 'Admin', status: 'draft', createdAt: '2026-02-01 09:00:00' },
  { id: 4, title: '行业安全公告', category: '行业资讯', author: 'Admin', status: 'published', createdAt: '2026-02-10 16:00:00' },
  { id: 5, title: 'Element Plus 主题定制教程', category: '技术文章', author: 'Admin', status: 'draft', createdAt: '2026-03-05 11:20:00' }
])

pagination.total = articles.value.length

onMounted(() => {
  if (route.query.keyword) searchForm.keyword = route.query.keyword
})

function handleSearch() {
  windowStore.updateSearchParams(windowStore.activeId, { ...searchForm })
  loading.value = true
  setTimeout(() => { loading.value = false }, 300)
}

function handleReset() {
  searchForm.keyword = ''
  windowStore.updateSearchParams(windowStore.activeId, {})
}

function handleRefresh() {
  loading.value = true
  setTimeout(() => { loading.value = false; ElMessage.success(t('common.save')) }, 300)
}

function handleSelectionChange(selection) {
  selectedIds.value = selection.map(row => row.id)
}

function handleBatchDelete() {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的文章')
    return
  }
  ElMessageBox.confirm(`确定删除选中的 ${selectedIds.value.length} 篇文章？`, t('common.confirm'), { type: 'warning' })
    .then(() => {
      articles.value = articles.value.filter(a => !selectedIds.value.includes(a.id))
      pagination.total = articles.value.length
      selectedIds.value = []
      ElMessage.success(t('common.save'))
    }).catch(() => {})
}

function handleBatchEdit() {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要修改的文章')
    return
  }
  const row = articles.value.find(a => a.id === selectedIds.value[0])
  if (row) handleEdit(row)
}

function handleExport() {
  ElMessage.success('导出任务已提交，请稍后下载')
}

function handleCreate() {
  isEditing.value = false
  form.id = null
  form.title = ''
  form.category = ''
  form.status = 'draft'
  form.content = ''
  dialogVisible.value = true
}

function handleEdit(row) {
  isEditing.value = true
  Object.assign(form, row)
  dialogVisible.value = true
}

function handleDelete(row) {
  ElMessageBox.confirm(t('common.confirm'), t('common.loading'), {
    type: 'warning',
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel')
  }).then(() => {
    articles.value = articles.value.filter(a => a.id !== row.id)
    pagination.total = articles.value.length
    ElMessage.success(t('common.save'))
  }).catch(() => {})
}

function handleSave() {
  if (isEditing.value) {
    const index = articles.value.findIndex(a => a.id === form.id)
    if (index !== -1) {
      articles.value[index] = { ...form }
    }
  } else {
    form.id = Date.now()
    form.author = 'Admin'
    form.createdAt = new Date().toISOString().replace('T', ' ').substring(0, 19)
    articles.value.unshift({ ...form })
    pagination.total = articles.value.length
  }
  dialogVisible.value = false
  ElMessage.success(isEditing.value ? t('common.save') : t('common.create'))
}

function handlePageChange() {
  loading.value = true
  setTimeout(() => { loading.value = false }, 300)
}
</script>

<style scoped>
.nexus-page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.nexus-search-card { margin-bottom: 16px; }
.nexus-table-card { margin-bottom: 16px; }
.nexus-pagination { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
