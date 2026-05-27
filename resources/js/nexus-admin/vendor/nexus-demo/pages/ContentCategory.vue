<template>
  <div class="nexus-page">
    <div class="nexus-page-header">
      <h2><el-icon><Collection /></el-icon> {{ t('menu.content-category') }}</h2>
      <div class="nexus-page-actions">
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          {{ t('common.create') }}
        </el-button>
      </div>
    </div>

    <el-card class="nexus-table-card">
      <el-table :data="categories" border stripe style="width: 100%">
        <el-table-column prop="id" :label="t('common.id')" width="60" />
        <el-table-column prop="name" :label="t('category.name')" min-width="150" />
        <el-table-column prop="slug" :label="t('category.slug')" min-width="120" />
        <el-table-column prop="sort" :label="t('category.sort')" min-width="60" />
        <el-table-column prop="articleCount" :label="t('category.articleCount')" min-width="60" />
        <el-table-column prop="createdAt" :label="t('common.createdAt')" min-width="140" />

        <el-table-column :label="t('common.operation')" width="200" fixed="right">
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

const form = reactive({
  id: null,
  name: '',
  slug: '',
  sort: 0
})

const categories = ref([
  { id: 1, name: '技术文章', slug: 'tech', sort: 1, articleCount: 12, createdAt: '2026-01-01 00:00:00' },
  { id: 2, name: '产品动态', slug: 'product', sort: 2, articleCount: 5, createdAt: '2026-01-01 00:00:00' },
  { id: 3, name: '行业资讯', slug: 'industry', sort: 3, articleCount: 8, createdAt: '2026-01-15 10:00:00' }
])

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
.nexus-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}


.nexus-table-card {
  margin-bottom: 16px;
}
</style>