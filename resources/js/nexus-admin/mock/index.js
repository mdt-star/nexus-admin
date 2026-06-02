/**
 * 模拟接口数据
 * 在后端接口未就绪时，提供模拟数据用于前端开发
 */

const mockMenus = [
  {
    id: 1,
    title: '控制台',
    icon: 'Monitor',
    component: 'dashboard',
    path: '/dashboard',
    tags: [],
    children: []
  },
  {
    id: 2,
    title: '系统管理',
    icon: 'Setting',
    component: '',
    path: '',
    tags: ['admin'],
    children: [
      {
        id: 3,
        title: '用户管理',
        icon: 'User',
        component: 'system-user',
        path: '/system/user',
        tags: ['admin'],
        children: []
      },
      {
        id: 4,
        title: '角色管理',
        icon: 'Avatar',
        component: 'system-role',
        path: '/system/role',
        tags: ['admin'],
        children: []
      },
      {
        id: 5,
        title: '系统配置',
        icon: 'Tools',
        component: 'system-config',
        path: '/system/config',
        tags: ['admin'],
        children: []
      }
    ]
  },
  {
    id: 6,
    title: '内容管理',
    icon: 'Document',
    component: '',
    path: '',
    tags: [],
    children: [
      {
        id: 7,
        title: '文章管理',
        icon: 'Notebook',
        component: 'content-article',
        path: '/content/article',
        tags: [],
        children: []
      },
      {
        id: 8,
        title: '分类管理',
        icon: 'Collection',
        component: 'content-category',
        path: '/content/category',
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

export {
  mockMenus,
  mockPermissionTags,
  mockConfig
}
