/**
 * 应用层英文翻译（业务页面专用）
 * 通过 i18n.addMessages() 注入，与核心包翻译合并
 */
export default {
  menu: {
    dashboard: 'Dashboard',
    system: 'System',
    'system-user': 'Users',
    'system-role': 'Roles',
    'system-config': 'Configuration',
    content: 'Content',
    'content-article': 'Articles',
    'content-category': 'Categories'
  },
  dashboard: {
    totalUsers: 'Total Users',
    todayActive: 'Active Today',
    totalArticles: 'Total Articles',
    systemNotifications: 'Notifications'
  },
  article: {
    title: 'Title',
    category: 'Category',
    author: 'Author',
    status: 'Status',
    techArticle: 'Tech Article',
    productNews: 'Product News',
    industryInfo: 'Industry Info'
  },
  category: {
    name: 'Category Name',
    slug: 'Slug',
    sort: 'Sort Order',
    articleCount: 'Articles'
  },
  config: {
    basic: 'Basic',
    mail: 'Mail',
    security: 'Security',
    siteName: 'Site Name',
    siteDesc: 'Site Description',
    siteKeywords: 'Keywords',
    icp: 'ICP Number',
    smtpHost: 'SMTP Host',
    smtpPort: 'SMTP Port',
    encryption: 'Encryption',
    none: 'None',
    emailAccount: 'Email',
    emailPassword: 'Password'
  },
  user: {
    username: 'Username',
    email: 'Email',
    role: 'Role',
    registeredAt: 'Registered',
    admin: 'Admin',
    editor: 'Editor'
  },
  role: {
    name: 'Role Name',
    slug: 'Role Slug',
    description: 'Description',
    memberCount: 'Members'
  },
  home: {
    serverInfo: 'Server Info',
    cpu: 'CPU',
    memory: 'Memory',
    disk: 'Disk',
    serverOS: 'Operating System',
    serverUptime: 'Uptime',
    serverLoad: 'System Load',
    serverProcesses: 'Processes',
    phpEnv: 'PHP Environment',
    phpVersion: 'PHP Version',
    phpSapi: 'PHP SAPI',
    phpMemoryLimit: 'Memory Limit',
    phpMaxExecTime: 'Max Execution Time',
    phpUploadMax: 'Upload Limit',
    phpPostMax: 'POST Limit',
    systemInfo: 'System Info',
    version: 'Version',
    website: 'Website',
    documentation: 'Documentation',
    github: 'GitHub',
    updateAnnouncements: 'Updates',
    noUpdates: 'No updates yet',
    refresh: 'Refresh',
    trend: 'Real-time Trend',
    trendTitle: 'Server Real-time Trend (Last 6 min)',
    noCollector: 'No collector installed',
    shortcuts: 'Shortcuts',
    noShortcuts: 'No shortcuts yet. Click ⭐ in Start Menu to add.',
    clearShortcuts: 'Clear all'
  }
}