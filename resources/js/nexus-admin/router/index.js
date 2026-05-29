/**
 * 路由配置
 * 将菜单 route 映射到页面组件，支持 URL 同步
 */
import { createRouter, createWebHistory } from 'vue-router'

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

export default router
