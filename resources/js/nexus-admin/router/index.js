/**
 * 路由配置
 * 将菜单 route 映射到页面组件，支持 URL 同步
 */
import { createRouter, createWebHistory } from 'vue-router'

// 页面组件映射表
const pageComponents = {
  'dashboard': () => import('../vendor/nexus-demo/pages/Dashboard.vue'),
  'content-article': () => import('../vendor/nexus-demo/pages/ContentArticle.vue'),
  'content-category': () => import('../vendor/nexus-demo/pages/ContentCategory.vue'),
  'system-user': () => import('../vendor/nexus-demo/pages/SystemUser.vue'),
  'system-role': () => import('../vendor/nexus-demo/pages/SystemRole.vue'),
  'system-config': () => import('../vendor/nexus-demo/pages/SystemConfig.vue')
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
