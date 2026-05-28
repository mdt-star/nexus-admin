/**
 * 模拟接口数据
 * 在后端接口未就绪时，提供模拟数据用于前端开发
 */

const mockMenus = [
  {
    id: 'dashboard',
    title: '控制台',
    icon: 'Monitor',
    component: 'dashboard',
    route: '/dashboard',
    tags: [],
    children: []
  },
  {
    id: 'system',
    title: '系统管理',
    icon: 'Setting',
    component: '',
    route: '',
    tags: ['admin'],
    children: [
      {
        id: 'system-user',
        title: '用户管理',
        icon: 'User',
        component: 'system-user',
        route: '/system/user',
        tags: ['admin'],
        children: []
      },
      {
        id: 'system-role',
        title: '角色管理',
        icon: 'Avatar',
        component: 'system-role',
        route: '/system/role',
        tags: ['admin'],
        children: []
      },
      {
        id: 'system-config',
        title: '系统配置',
        icon: 'Tools',
        component: 'system-config',
        route: '/system/config',
        tags: ['admin'],
        children: []
      }
    ]
  },
  {
    id: 'content',
    title: '内容管理',
    icon: 'Document',
    component: '',
    route: '',
    tags: [],
    children: [
      {
        id: 'content-article',
        title: '文章管理',
        icon: 'Notebook',
        component: 'content-article',
        route: '/content/article',
        tags: [],
        children: []
      },
      {
        id: 'content-category',
        title: '分类管理',
        icon: 'Collection',
        component: 'content-category',
        route: '/content/category',
        tags: [],
        children: []
      }
    ]
  }
]

const mockPermissionTags = ['admin', 'user:list', 'user:create', 'user:edit', 'user:delete']

const mockConfig = {
  global: {
    appName: 'Nexus Admin',
    appLogo: '',
    footer: '© 2026 Nexus Admin. All rights reserved.'
  },
  user: {}
}

const cn = {
  common: {
    save: '保存',
    cancel: '取消',
    confirm: '确认',
    delete: '删除',
    edit: '编辑',
    create: '新建',
    search: '搜索',
    reset: '重置',
    export: '导出',
    import: '导入',
    loading: '加载中...',
    noData: '暂无数据',
    operation: '操作',
    status: '状态',
    title: '标题',
    content: '内容',
    description: '描述',
    createdAt: '创建时间',
    updatedAt: '更新时间',
    id: 'ID',
    sort: '排序',
    remark: '备注',
    published: '已发布',
    draft: '草稿',
    searchPlaceholder: '搜索菜单或页面...',
    noSearchResults: '未找到匹配结果',
    menu: '菜单',
    page: '页面',
    items: '项'
  },
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
  theme: {
    light: '亮色模式',
    dark: '暗色模式',
    toggle: '切换主题',
    primaryColor: '主色调'
  },
  layout: {
    desktop: '桌面模式',
    sidebar: '侧边栏模式',
    toggle: '切换布局',
    collapse: '折叠菜单',
    expand: '展开菜单'
  },
  login: {
    subtitle: 'Nexus Admin 控制台',
    username: '用户名',
    password: '密码',
    submit: '登录',
    hint: '演示账号: admin / admin',
    success: '登录成功',
    failed: '登录失败',
    logout: '退出登录',
    profile: '个人信息'
  },
  startMenu: {
    dragHint: '可以拖动菜单到桌面或侧边栏'
  },
  preferences: {
    title: '偏好设置',
    tabMode: 'Tab 栏模式',
    showTabs: '显示 Tab 栏',
    hideTabs: '隐藏 Tab 栏（单页模式）',
    headerColor: '顶部背景色'
  }
}


const en = {
  common: {
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    search: 'Search',
    reset: 'Reset',
    export: 'Export',
    import: 'Import',
    loading: 'Loading...',
    noData: 'No Data',
    operation: 'Actions',
    status: 'Status',
    title: 'Title',
    content: 'Content',
    description: 'Description',
    createdAt: 'Created At',
    updatedAt: 'Updated At',
    id: 'ID',
    sort: 'Sort',
    remark: 'Remark',
    published: 'Published',
    draft: 'Draft',
    searchPlaceholder: 'Search menus or pages...',
    noSearchResults: 'No results found',
    menu: 'Menu',
    page: 'Page',
    items: 'items'
  },

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
  theme: {
    light: 'Light',
    dark: 'Dark',
    toggle: 'Toggle Theme',
    primaryColor: 'Primary Color'
  },
  layout: {
    desktop: 'Desktop',
    sidebar: 'Sidebar',
    toggle: 'Toggle Layout',
    collapse: 'Collapse',
    expand: 'Expand'
  },
  login: {
    subtitle: 'Nexus Admin Dashboard',
    username: 'Username',
    password: 'Password',
    submit: 'Sign In',
    hint: 'Demo: admin / admin',
    success: 'Login successful',
    failed: 'Invalid credentials',
    logout: 'Logout',
    profile: 'Profile'
  },
  startMenu: {
    dragHint: 'Drag menus to desktop or sidebar'
  },
  preferences: {
    title: 'Preferences',
    tabMode: 'Tab Mode',
    showTabs: 'Show Tabs',
    hideTabs: 'Hide Tabs (Single Page)',
    headerColor: 'Header Background'
  }
}


const mockI18nMessages = {
  'zh-CN': cn,
  'en': en
}

export {
  mockMenus,
  mockPermissionTags,
  mockConfig,
  mockI18nMessages
}