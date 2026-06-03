import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/nexus-admin/',
  title: 'Nexus Admin',
  description: '基于 Vue 3 + Element Plus 的现代化后台管理界面基座',
  lang: 'zh-CN',
  ignoreDeadLinks: true,

  themeConfig: {
    logo: '/logo.svg',

    socialLinks: [
      { icon: 'github', link: 'https://github.com/mdt-star/nexus-admin' }
    ],

    editLink: {
      pattern: 'https://github.com/mdt-star/nexus-admin/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    },

    search: {
      provider: 'local'
    },

    nav: [
      { text: '指南', link: '/guide/getting-started', activeMatch: '/guide/' },
      { text: '核心概念', link: '/concepts/provider', activeMatch: '/concepts/' },
      { text: '组件', link: '/components/' },
      { text: 'Stores', link: '/stores/' },
      { text: 'API', link: '/api/' },
      { text: '更新日志', link: '/changelog' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '入门',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装', link: '/guide/installation' },
            { text: '项目结构', link: '/guide/structure' }
          ]
        },
        {
          text: '基础功能',
          items: [
            { text: '布局模式', link: '/guide/layouts' },
            { text: '路由系统', link: '/guide/router' },
            { text: '国际化', link: '/guide/i18n' },
            { text: '主题定制', link: '/guide/theme' },
            { text: '权限控制', link: '/guide/permission' },
            { text: 'API 通信', link: '/guide/api' }
          ]
        },
        {
          text: '进阶',
          items: [
            { text: 'Provider 插件开发', link: '/guide/provider-dev' },
            { text: '桌面模式开发', link: '/guide/desktop' },
            { text: 'Mock 数据', link: '/guide/mock' },
            { text: '迁移指南', link: '/guide/migration' }
          ]
        }
      ],
      '/components/': [
        {
          text: '布局组件',
          items: [
            { text: 'AppRoot', link: '/components/app-root' },
            { text: 'MainLayout', link: '/components/main-layout' },
            { text: 'DesktopLayout', link: '/components/desktop-layout' },
            { text: 'SidebarLayout', link: '/components/sidebar-layout' }
          ]
        },
        {
          text: '通用组件',
          items: [
            { text: 'LoginPage', link: '/components/login-page' },
            { text: 'PreferencesPanel', link: '/components/preferences-panel' },
            { text: 'GlobalSearch', link: '/components/global-search' },
            { text: 'NotificationBell', link: '/components/notification-bell' },
            { text: 'PermissionTag', link: '/components/permission-tag' }
          ]
        },
        {
          text: '桌面模式',
          items: [
            { text: 'DesktopWindow', link: '/components/desktop-window' },
            { text: 'FolderView', link: '/components/folder-view' },
            { text: 'ItemEditor', link: '/components/item-editor' },
            { text: 'StartMenu', link: '/components/start-menu' },
            { text: 'TaskBar', link: '/components/task-bar' }
          ]
        },
        {
          text: '侧边栏',
          items: [
            { text: 'SidebarMenu', link: '/components/sidebar-menu' }
          ]
        },
        {
          text: '其他',
          items: [
            { text: 'GlobeIcon', link: '/components/globe-icon' }
          ]
        }
      ],
      '/stores/': [
        {
          text: '状态管理',
          items: [
            { text: '概述', link: '/stores/' },
            { text: 'useAppStore', link: '/stores/app' },
            { text: 'useConfigStore', link: '/stores/config' },
            { text: 'useI18nStore', link: '/stores/i18n' },
            { text: 'useMenuStore', link: '/stores/menu' },
            { text: 'usePermissionStore', link: '/stores/permission' },
            { text: 'useThemeStore', link: '/stores/theme' },
            { text: 'useUserStore', link: '/stores/user' },
            { text: 'useWindowStore', link: '/stores/window' },
            { text: 'useDisktopStore', link: '/stores/disktop' },
            { text: 'useNotificationStore', link: '/stores/notification' },
            { text: 'useShortcutsStore', link: '/stores/shortcuts' },
            { text: 'useUiSizeStore', link: '/stores/size' }
          ]
        }
      ],
      '/concepts/': [
        {
          text: '核心概念',
          items: [
            { text: 'Provider 机制', link: '/concepts/provider' },
            { text: '菜单系统', link: '/concepts/menu' },
            { text: '钩子系统', link: '/concepts/hooks' }
          ]
        }
      ]
    },

    footer: {
      message: '基于 MIT 协议开源',
      copyright: 'Copyright © 2024-present mdt-star'
    }
  },

  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      title: 'Nexus Admin',
      description: '基于 Vue 3 + Element Plus 的现代化后台管理界面基座',
      themeConfig: {
        nav: [
          { text: '指南', link: '/guide/getting-started' },
          { text: '核心概念', link: '/concepts/provider' },
          { text: '组件', link: '/components/' },
          { text: 'Stores', link: '/stores/' }
        ],
        outline: { label: '本页目录' },
        docFooter: {
          prev: '上一篇',
          next: '下一篇'
        },
        darkModeSwitchLabel: '切换主题',
        sidebarMenuLabel: '菜单',
        returnToTopLabel: '返回顶部',
        langMenuLabel: '切换语言'
      }
    },
    en: {
      label: 'English',
      lang: 'en-US',
      title: 'Nexus Admin',
      description: 'Modern Admin Dashboard Framework based on Vue 3 + Element Plus',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/en/guide/getting-started' },
          { text: 'Concepts', link: '/en/concepts/provider' },
          { text: 'Components', link: '/en/components/' },
          { text: 'Stores', link: '/en/stores/' }
        ],
        outline: { label: 'On this page' },
        docFooter: {
          prev: 'Previous',
          next: 'Next'
        },
        darkModeSwitchLabel: 'Theme',
        sidebarMenuLabel: 'Menu',
        returnToTopLabel: 'Return to top',
        langMenuLabel: 'Language'
      }
    }
  }
})