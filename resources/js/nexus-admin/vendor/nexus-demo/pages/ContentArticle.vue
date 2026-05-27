<template>
  <div class="nexus-page">
    <div class="nexus-page-header">
      <h2><el-icon><Notebook /></el-icon> {{ t('menu.content-article') }}</h2>
      <div class="nexus-page-actions">
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          {{ t('common.create') }}
        </el-button>
      </div>
    </div>

    <el-card class="nexus-search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item :label="t('common.search')">
          <el-input v-model="searchForm.keyword" :placeholder="t('common.search')" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">{{ t('common.search') }}</el-button>
          <el-button @click="handleReset">{{ t('common.reset') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="nexus-table-card">
      <el-table :data="articles" border stripe v-loading="loading" style="width: 100%">
        <el-table-column prop="id" :label="t('common.id')" width="60" />
        <el-table-column prop="title" :label="t('article.title')" min-width="200" show-overflow-tooltip />
        <el-table-column prop="category" :label="t('article.category')" width="120" />
        <el-table-column prop="author" :label="t('article.author')" width="120" />
        <el-table-column prop="status" :label="t('article.status')" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'published' ? 'success' : 'info'">
              {{ row.status === 'published' ? t('common.published') : t('common.draft') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" :label="t('common.createdAt')" width="180" />
        <el-table-column :label="t('common.operation')" width="200" fixed="right">
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
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Delete } from "@element-plus/icons-vue"
import { useI18nStore } from '../../../stores/i18n'

const { t } = useI18nStore()

const loading = ref(false)
const dialogVisible = ref(false)
const isEditing = ref(false)
const formLabelWidth = ref('80px')

const searchForm = reactive({
  keyword: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const form = reactive({
  id: null,
  title: '',
  category: '',
  status: 'draft',
  content: ''
})

const articles = ref([
  { id: 1, title: 'Nexus Admin 入门指南', category: '技术文章', author: 'Admin', status: 'published', createdAt: '2026-01-15 10:00:00' },
  { id: 2, title: 'Vue 3 组合式 API 最佳实践', category: '技术文章', author: 'Admin', status: 'published', createdAt: '2026-01-20 14:30:00' },
  { id: 3, title: '2026 年产品路线图', category: '产品动态', author: 'Admin', status: 'draft', createdAt: '2026-02-01 09:00:00' },
  { id: 4, title: '行业安全公告', category: '行业资讯', author: 'Admin', status: 'published', createdAt: '2026-02-10 16:00:00' },
  { id: 5, title: 'Element Plus 主题定制教程', category: '技术文章', author: 'Admin', status: 'draft', createdAt: '2026-03-05 11:20:00' }
])

pagination.total = articles.value.length

function handleSearch() {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 300)
}

function handleReset() {
  searchForm.keyword = ''
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
  setTimeout(() => {
    loading.value = false
  }, 300)
}
</script>

<style scoped>
.nexus-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}


.nexus-search-card {
  margin-bottom: 16px;
}

.nexus-table-card {
  margin-bottom: 16px;
}

.nexus-pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>