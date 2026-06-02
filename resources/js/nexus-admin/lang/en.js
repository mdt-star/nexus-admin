/**
 * 英文语言包
 *
 * 基座内置英文翻译，不依赖后端。
 * 后端或第三方可通过 addMessages() 深合并覆盖。
 */
export default {
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