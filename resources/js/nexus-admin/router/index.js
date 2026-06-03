/**
 * 路由配置
 *
 * internalRoutes 为应用层业务路由，由 app-provider 通过 router.addRoute() 注册。
 * 框架级路由（catch-all + 首页）已在 createNexusRouter() 中内置。
 */
import { createNexusRouter } from 'nexus-admin-core'

import Dashboard from '../pages/demo/Dashboard.vue'
import ContentArticle from '../pages/demo/ContentArticle.vue'
import ContentCategory from '../pages/demo/ContentCategory.vue'
import User from '../pages/system/User.vue'
import Role from '../pages/system/Role.vue'
import Config from '../pages/system/Config.vue'

const router = createNexusRouter()

/**
 * 应用层业务路由，由 app-provider 统一注册
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
  }
]

export default router