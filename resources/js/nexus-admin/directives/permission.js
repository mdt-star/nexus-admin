/**
 * v-permission 权限指令
 * 基于标签（Tag）的细粒度组件可见权限控制
 *
 * 用法：
 * <el-button v-permission="'user:create'">创建用户</el-button>
 * <el-button v-permission="['user:create', 'admin']">创建用户</el-button>
 * <el-button v-permission="'user:create'" v-permission-mode="all">需要所有标签</el-button>
 */
import { usePermissionStore } from '../stores/permission'

const permissionDirective = {
  mounted(el, binding) {
    const store = usePermissionStore()
    const tags = Array.isArray(binding.value) ? binding.value : [binding.value]
    const mode = el.getAttribute('v-permission-mode') || 'any'

    const hasPermission = mode === 'all'
      ? tags.every(tag => store.hasTag(tag))
      : tags.some(tag => store.hasTag(tag))

    if (!hasPermission) {
      el.parentNode?.removeChild(el)
    }
  },

  updated(el, binding) {
    // 权限标签变化时重新检查
    const store = usePermissionStore()
    const tags = Array.isArray(binding.value) ? binding.value : [binding.value]
    const mode = el.getAttribute('v-permission-mode') || 'any'

    const hasPermission = mode === 'all'
      ? tags.every(tag => store.hasTag(tag))
      : tags.some(tag => store.hasTag(tag))

    if (!hasPermission && el.parentNode) {
      el.parentNode.removeChild(el)
    }
  }
}

export default permissionDirective
