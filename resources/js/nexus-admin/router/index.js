/**
 * 路由配置
 * 将菜单 route 映射到页面组件，支持 URL 同步
 *
 * 登录页路由由主布局（MainLayout）根据登录态条件渲染，无需独立路由。
 * 所有路径均由 AppRoot 统一分发处理。
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
