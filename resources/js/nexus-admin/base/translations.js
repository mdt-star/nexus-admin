/**
 * 基座内置语言包
 *
 * 提供基础翻译，不依赖后端。
 * 后端或第三方可通过 addMessages() 深合并覆盖。
 *
 * 合并顺序（后层优先）：基座 → Provider → 后端
 */
const cn = {
  common: {
    save: '保存',
    cancel: '取消',
    confirm: '确认',
    confirmDelete: '确定删除「{title}」？',
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

  error: {
    network: '网络连接失败，请检查网络后重试',
    timeout: '请求超时，请稍后重试',
    unauthorized: '登录已过期，请重新登录',
    forbidden: '没有权限执行此操作',
    notFound: '请求的资源不存在',
    rateLimit: '请求过于频繁，请稍后重试',
    serverError: '服务器内部错误，请稍后重试',
    unknown: '请求失败（{status}）'
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
    profile: '个人信息',
    welcome: '欢迎回来',
    noAccount: '还没有账号？',
    register: '联系管理员',
    feature1: '桌面式管理界面',
    feature2: '灵活布局切换',
    feature3: '深度可定制'
  },
  tab: {
    close: '关闭',
    closeOthers: '关闭其他',
    closeRight: '关闭右侧标签页',
    closeAll: '关闭全部'
  },
  itemEditor: {
    addItem: '新增项',
    addItemHere: '在此新增项',
    addItemIn: '在 {location} 中添加项',
    editItem: '编辑项',
    title: '标题',
    titlePlaceholder: '输入标题',
    icon: '图标',
    iconPlaceholder: '选择图标',
    selectIcon: '选择图标',
    searchIcon: '搜索图标...',
    customIcon: '自定义图标',
    iconNamePlaceholder: '输入图标名称...',
    type: '类型',
    typeMenu: '菜单项',
    typeFolder: '文件夹',
    typeDivider: '分隔线',
    typeLink: '链接',
    component: '组件',
    componentPlaceholder: '组件名，如 dashboard',
    path: '路径',
    pathPlaceholder: '路由路径，如 /dashboard'
  },
  startMenu: {
    title: '开始菜单',
    dragHint: '可以拖动菜单到桌面或侧边栏',
    newProject: '新建项目',
    unnamed: '未命名',
    copy: '副本',
    pinToShortcuts: '添加到快捷菜单',
    unpinFromShortcuts: '取消快捷菜单'
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
    confirmDelete: 'Are you sure to delete "{title}"?',
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

  error: {
    network: 'Network connection failed, please check and retry',
    timeout: 'Request timed out, please try again',
    unauthorized: 'Session expired, please login again',
    forbidden: 'You do not have permission to perform this action',
    notFound: 'The requested resource was not found',
    rateLimit: 'Too many requests, please try again later',
    serverError: 'Server error, please try again later',
    unknown: 'Request failed ({status})'
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
    profile: 'Profile',
    welcome: 'Welcome Back',
    noAccount: 'No account yet?',
    register: 'Contact Admin',
    feature1: 'Desktop-like Interface',
    feature2: 'Flexible Layouts',
    feature3: 'Deep Customization'
  },
  tab: {
    close: 'Close',
    closeOthers: 'Close Others',
    closeRight: 'Close Right Tabs',
    closeAll: 'Close All'
  },
  itemEditor: {
    addItem: 'Add Item',
    addItemHere: 'Add Item Here',
    editItem: 'Edit Item',
    title: 'Title',
    titlePlaceholder: 'Enter title',
    icon: 'Icon',
    iconPlaceholder: 'Select icon',
    selectIcon: 'Select Icon',
    searchIcon: 'Search icons...',
    customIcon: 'Custom Icon',
    iconNamePlaceholder: 'Enter icon name...',
    type: 'Type',
    typeMenu: 'Menu',
    typeFolder: 'Folder',
    typeDivider: 'Divider',
    typeLink: 'Link',
    component: 'Component',
    componentPlaceholder: 'Component name, e.g. dashboard',
    path: 'Path',
    pathPlaceholder: 'Route path, e.g. /dashboard'
  },
  startMenu: {
    title: 'Start Menu',
    dragHint: 'Drag menus to desktop or sidebar',
    newProject: 'New Project',
    unnamed: 'Untitled',
    copy: 'Copy',
    pinToShortcuts: 'Pin to shortcuts',
    unpinFromShortcuts: 'Unpin from shortcuts'
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
  },

  preferences: {
    title: 'Preferences',
    tabMode: 'Tab Mode',
    showTabs: 'Show Tabs',
    hideTabs: 'Hide Tabs (Single Page)',
    headerColor: 'Header Background'
  }
}

export const baseMessages = {
  'zh-CN': cn,
  'en': en
}