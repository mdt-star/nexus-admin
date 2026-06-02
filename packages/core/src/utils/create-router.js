/**
 * 路由工厂
 *
 * 封装框架级路由配置：
 *   - 根通配路由 → AppRoot
 *   - 默认首页路由 → HomePage（无页面打开时显示）
 *
 * 应用层只需创建 router，业务路由通过 app-provider 的 router.addRoute() 注册。
 *
 * 使用方式：
 *   import { createNexusRouter } from '@nexus-admin/core'
 *   const router = createNexusRouter()
 *   export default router
 */
import { createRouter, createWebHistory } from 'vue-router'

/**
 * 创建框架路由实例
 *
 * @returns {import('vue-router').Router}
 */
export function createNexusRouter() {
  return createRouter({
    history: createWebHistory(),
    routes: [
      {
        path: '/',
        name: 'nexus-home',
        meta: { title: '首页', icon: 'HomeFilled', hidden: true, sort: -1 },
        component: () => import('../pages/HomePage.vue')
      },
      {
        path: '/:pathMatch(.*)*',
        name: 'app',
        component: () => import('../AppRoot.vue')
      }
    ]
  })
}
