/**
 * 路由配置
 * 将菜单 route 映射到页面组件，支持 URL 同步
 *
 * internalRoutes 为基座内置路由，由 providers/nexus-admin.js 通过
 * router.addRoute() 注册，自动进入 routeStore 管理。
 */
import { createRouter, createWebHistory } from 'vue-router'

import Dashboard from '../pages/demo/Dashboard.vue'
import ContentArticle from '../pages/demo/ContentArticle.vue'
import ContentCategory from '../pages/demo/ContentCategory.vue'
import User from '../pages/system/User.vue'
import Role from '../pages/system/Role.vue'
import Config from '../pages/system/Config.vue'
import HomePage from '@nexus-admin/core/src/pages/HomePage.vue'

const routes = [
  {
    path: '/:pathMatch(.*)*',
    name: 'app',
    component: () => import('@nexus-admin/core/src/AppRoot.vue')
  }
]

/**
 * 基座内置路由，由 provider 统一注册
 * 放在此处集中管理路由配置，provider 只负责注册流程
 */
export const internalRoutes = [
  {
    path: '/system',
    permission: true,
    meta: { title: '系统管理', icon: 'Setting', sort: 1000 },
    redirect: '/system/user',
    children: [
      { path: 'user', name: 'system-user', permission: true, meta: { title: '用户管理', icon: 'User' }, component: User },
      { path: 'role', name: 'system-role', permission: true, meta: { title: '角色管理', icon: 'Avatar' }, component: Role },
      { path: 'config', name: 'system-config', permission: true, meta: { title: '系统配置', icon: 'Setting' }, component: Config }
    ]
  },
  {
    path: '/demo',
    permission: true,
    meta: { title: '内容管理', icon: 'Document', sort: 100 },
    children: [
      { path: 'dashboard', name: 'dashboard', permission: true, meta: { title: '仪表盘', icon: 'DataBoard' }, component: Dashboard },
      { path: 'article', name: 'content-article', permission: true, meta: { title: '文章管理', icon: 'Notebook' }, component: ContentArticle },
      { path: 'category', name: 'content-category', permission: true, meta: { title: '分类管理', icon: 'Collection' }, component: ContentCategory }
    ]
  },
  {
    path: '/',
    name: 'nexus-home',
    meta: { title: '首页', icon: 'HomeFilled', hidden: true, sort: -1 },
    component: HomePage
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router