/**
 * 路由配置
 * 将菜单 route 映射到页面组件，支持 URL 同步
 */
import { createRouter, createWebHistory } from 'vue-router'

// 页面组件映射表
const pageComponents = {
  'dashboard': () => import('../pages/demo/Dashboard.vue'),
  'content-article': () => import('../pages/demo/ContentArticle.vue'),
  'content-category': () => import('../pages/demo/ContentCategory.vue'),
  'system-user': () => import('../pages/system/User.vue'),
  'system-role': () => import('../pages/system/Role.vue'),
  'system-config': () => import('../pages/system/Config.vue')
}

const routes = [
  {
    path: '/:pathMatch(.*)*',
    name: 'app',
    component: () => import('../AppRoot.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export { pageComponents }
export default router
