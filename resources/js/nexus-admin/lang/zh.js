/**
 * 应用层中文翻译（业务页面专用）
 * 通过 i18n.addMessages() 注入，与核心包翻译合并
 */
export default {
  menu: {
    dashboard: '控制台',
    system: '系统管理',
    'system-user': '用户管理',
    'system-role': '角色管理',
    'system-config': '系统配置',
    content: '内容管理',
    'content-article': '文章管理',
    'content-category': '分类管理'
  },
  dashboard: {
    totalUsers: '用户总数',
    todayActive: '今日活跃',
    totalArticles: '文章总数',
    systemNotifications: '系统通知'
  },
  article: {
    title: '标题',
    category: '分类',
    author: '作者',
    status: '状态',
    techArticle: '技术文章',
    productNews: '产品动态',
    industryInfo: '行业资讯'
  },
  category: {
    name: '分类名称',
    slug: '标识',
    sort: '排序',
    articleCount: '文章数'
  },
  config: {
    basic: '基本设置',
    mail: '邮件设置',
    security: '安全设置',
    siteName: '站点名称',
    siteDesc: '站点描述',
    siteKeywords: '站点关键词',
    icp: 'ICP 备案号',
    smtpHost: 'SMTP 服务器',
    smtpPort: 'SMTP 端口',
    encryption: '加密方式',
    none: '无',
    emailAccount: '邮箱账号',
    emailPassword: '邮箱密码'
  },
  user: {
    username: '用户名',
    email: '邮箱',
    role: '角色',
    registeredAt: '注册时间',
    admin: '管理员',
    editor: '编辑'
  },
  role: {
    name: '角色名称',
    slug: '角色标识',
    description: '描述',
    memberCount: '成员数'
  },
  home: {
    serverInfo: '服务器信息',
    cpu: 'CPU',
    memory: '内存',
    disk: '磁盘',
    serverOS: '操作系统',
    serverUptime: '运行时间',
    serverLoad: '系统负载',
    serverProcesses: '进程数',
    phpEnv: 'PHP 环境',
    phpVersion: 'PHP 版本',
    phpSapi: 'PHP SAPI',
    phpMemoryLimit: '内存限制',
    phpMaxExecTime: '最大执行时间',
    phpUploadMax: '上传限制',
    phpPostMax: 'POST 限制',
    systemInfo: '系统信息',
    version: '版本',
    website: '官网',
    documentation: '文档',
    github: 'GitHub',
    updateAnnouncements: '更新公告',
    noUpdates: '暂无更新',
    refresh: '刷新',
    trend: '实时趋势',
    trendTitle: '服务器实时趋势（近 6 分钟）',
    noCollector: '未安装采集软件',
    shortcuts: '快捷菜单',
    noShortcuts: '暂无快捷方式，可在开始菜单中点击 ⭐ 添加',
    clearShortcuts: '清空所有'
  }
}