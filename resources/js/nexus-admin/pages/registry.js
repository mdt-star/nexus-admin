/**
 * 基座内置页面注册表
 *
 * 此文件用于开发环境（直接使用 index.html 时）的注册信息注入。
 * 在生产环境中，注册信息由 PHP 端通过 composer.json 的 extra.nexus 配置收集，
 * 并通过 Blade 视图注入到 window.__NEXUS_ADMIN_REGISTRY__。
 *
 * 开发环境使用方式：
 * 在 index.html 中引入此文件，赋值给 window.__NEXUS_ADMIN_REGISTRY__
 */
import Dashboard from './demo/Dashboard.vue'
import ContentArticle from './demo/ContentArticle.vue'
import ContentCategory from './demo/ContentCategory.vue'
import User from './system/User.vue'
import Role from './system/Role.vue'
import Config from './system/Config.vue'

export default {
  pages: {
    'dashboard': Dashboard,
    'content-article': ContentArticle,
    'content-category': ContentCategory,
    'system-user': User,
    'system-role': Role,
    'system-config': Config
  },
  components: {},
  directives: {},
  plugins: {}
}
