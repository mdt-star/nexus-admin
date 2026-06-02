/**
 * Nexus Admin 基座提供者
 *
 * 注册内置路由、页面组件到 system 命名空间。
 * providerName 'nexus-admin' 由 app.js 通过 installProvider 自动注入。
 * 第三方 provider 不需要写 providerName，基座会从 PHP 收集的 key 自动传入。
 */
import Dashboard from '../pages/demo/Dashboard.vue'
import ContentArticle from '../pages/demo/ContentArticle.vue'
import ContentCategory from '../pages/demo/ContentCategory.vue'
import User from '../pages/system/User.vue'
import Role from '../pages/system/Role.vue'
import Config from '../pages/system/Config.vue'
import HomePage from '../pages/system/HomePage.vue'

export default {
  /**
   * @param {object}   ctx           - { app, router, hookManager, pinia }
   * @param {string}   providerName  - 由基座自动传入的提供者名称
   */
  install({ router }, providerName) {
    // 路由数组批量注册
    // name 和 permission 可通过简写自动推演
    // name: 从 path 自动推演（/system → system），子路由自动拼父 name
    // permission: true → 自动取 name 值
    router.addRoute([
      {
        path: '/system',
        permission: true,
        meta: { title: '系统管理', icon: 'Setting', sort: 1000 },
        redirect: '/system/user',
        children: [
          // name 显式指定，与 windowStore.open 的 component 引用保持兼容
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
    ])
  }
}
