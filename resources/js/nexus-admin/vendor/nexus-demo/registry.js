/**
 * nexus-demo 扩展包注册表
 *
 * 此文件用于开发环境（直接使用 index.html 时）的注册信息注入。
 * 在生产环境中，注册信息由 PHP 端通过 composer.json 的 extra.nexus 配置收集，
 * 并通过 Blade 视图注入到 window.__NEXUS_ADMIN_REGISTRY__。
 *
 * 开发环境使用方式：
 * 在 index.html 中引入此文件，或直接在 app.js 中 import 后赋值给 window.__NEXUS_ADMIN_REGISTRY__
 */
import Dashboard from './pages/Dashboard.vue'
import ContentArticle from './pages/ContentArticle.vue'
import ContentCategory from './pages/ContentCategory.vue'
import SystemUser from './pages/SystemUser.vue'
import SystemRole from './pages/SystemRole.vue'
import SystemConfig from './pages/SystemConfig.vue'

export default {
  pages: {
    'dashboard': Dashboard,
    'content-article': ContentArticle,
    'content-category': ContentCategory,
    'system-user': SystemUser,
    'system-role': SystemRole,
    'system-config': SystemConfig
  },
  components: {},
  directives: {},
  plugins: {}
}
