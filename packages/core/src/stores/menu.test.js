/**
 * Menu Store 单元测试
 *
 * 数据来源从后端 API 改为 routeStore，由各 Provider 注册的路由自动构建。
 * 测试直接操作 routeStore 来验证 menuStore 的计算逻辑。
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useMenuStore } from './menu'
import { routeStore } from '../utils/create-provider-installer'

vi.mock('../utils/hook-manager', () => ({
  default: {
    emit: vi.fn(() => Promise.resolve())
  }
}))

describe('MenuStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // 清空 routeStore
    routeStore.providers = {}
  })

  it('初始状态为空（routeStore 无数据）', () => {
    const store = useMenuStore()
    expect(store.menus).toEqual([])
    expect(store.loaded).toBe(true)
  })

  it('menus 自动从 routeStore 读取', () => {
    // 向 routeStore 注入测试数据
    routeStore.providers['nexus-admin'] = [
      {
        path: '/system',
        name: 'system',
        meta: { title: '系统管理', icon: 'Setting', _provider: 'nexus-admin' },
        component: {},
        children: [
          {
            path: 'user',
            name: 'system-user',
            meta: { title: '用户管理', icon: 'User', _provider: 'nexus-admin' },
            component: {}
          }
        ]
      }
    ]

    const store = useMenuStore()
    expect(store.menus).toHaveLength(1)
    expect(store.menus[0].id).toBe('system')
    expect(store.menus[0].title).toBe('系统管理')
    expect(store.menus[0].children).toHaveLength(1)
    expect(store.menus[0].children[0].id).toBe('system-user')
  })

  it('desktopItems 过滤出叶子节点和文件夹，排除无 component 项', () => {
    routeStore.providers['nexus-admin'] = [
      {
        path: '/dashboard',
        name: 'dashboard',
        meta: { title: '控制台', icon: 'Monitor', _provider: 'nexus-admin' },
        components: { default: {} } // 有 component（Vue Router 内部格式）
      },
      {
        path: '/system',
        name: 'system',
        meta: { title: '系统管理', icon: 'Setting', _provider: 'nexus-admin' },
        components: { default: {} },
        children: [
          {
            path: 'user',
            name: 'system-user',
            meta: { title: '用户管理', icon: 'User', _provider: 'nexus-admin' },
            components: { default: {} }
          }
        ]
      },
      {
        path: '/empty',
        name: 'empty',
        meta: { title: '无组件', _provider: 'nexus-admin' }
        // 无 component
      }
    ]

    const store = useMenuStore()
    expect(store.desktopItems).toHaveLength(2)
    expect(store.desktopItems[0].id).toBe('dashboard')
    expect(store.desktopItems[0].isFolder).toBe(false)
    expect(store.desktopItems[1].id).toBe('system')
    expect(store.desktopItems[1].isFolder).toBe(true)
  })

  it('sidebarMenus 返回与 menus 相同的数据', () => {
    routeStore.providers['nexus-admin'] = [
      {
        path: '/dashboard',
        name: 'dashboard',
        meta: { title: '控制台', icon: 'Monitor', _provider: 'nexus-admin' },
        components: { default: {} }
      }
    ]

    const store = useMenuStore()
    expect(store.sidebarMenus).toBe(store.menus)
  })

  it('findMenuByComponent() 递归查找组件', () => {
    routeStore.providers['nexus-admin'] = [
      {
        path: '/system',
        name: 'system',
        meta: { title: '系统', _provider: 'nexus-admin' },
        components: { default: {} },
        children: [
          {
            path: 'user',
            name: 'system-user',
            meta: { title: '用户管理', _provider: 'nexus-admin' },
            components: { default: {} }
          }
        ]
      }
    ]

    const store = useMenuStore()
    const found = store.findMenuByComponent('system-user')
    expect(found).toBeTruthy()
    expect(found.id).toBe('system-user')
    expect(found.title).toBe('用户管理')
  })

  it('findMenuByComponent() 未找到时返回 null', () => {
    routeStore.providers['nexus-admin'] = [
      {
        path: '/a',
        name: 'a',
        meta: { title: 'A', _provider: 'nexus-admin' },
        components: { default: {} }
      }
    ]

    const store = useMenuStore()
    expect(store.findMenuByComponent('nonexistent')).toBeNull()
  })

  it('findMenuByRoute() 通过 path 查找', () => {
    routeStore.providers['nexus-admin'] = [
      {
        path: '/system',
        name: 'system',
        meta: { title: '系统', _provider: 'nexus-admin' },
        components: { default: {} },
        children: [
          {
            path: 'user',
            name: 'system-user',
            meta: { title: '用户管理', _provider: 'nexus-admin' },
            components: { default: {} }
          }
        ]
      }
    ]

    const store = useMenuStore()
    // _routeToMenuItem 的 path 取 route.path
    // 父路由 path 是 '/system'
    const found = store.findMenuByRoute('/system')
    expect(found).toBeTruthy()
    expect(found.id).toBe('system')
  })

  it('多个 provider 的数据合并展示', () => {
    routeStore.providers['pkg-a'] = [
      {
        path: '/blog',
        name: 'blog',
        meta: { title: '博客', icon: 'Document', sort: 200, _provider: 'pkg-a' },
        component: {}
      }
    ]
    routeStore.providers['pkg-b'] = [
      {
        path: '/shop',
        name: 'shop',
        meta: { title: '商城', icon: 'Shopping', sort: 100, _provider: 'pkg-b' },
        component: {}
      }
    ]

    const store = useMenuStore()
    expect(store.menus).toHaveLength(2)
    // 按 sort 排序：shop(100) 在前，blog(200) 在后
    expect(store.menus[0].id).toBe('shop')
    expect(store.menus[1].id).toBe('blog')
  })

  it('loadMenus() 为空函数，数据已就绪', async () => {
    routeStore.providers['nexus-admin'] = [
      {
        path: '/test',
        name: 'test',
        meta: { title: '测试', _provider: 'nexus-admin' },
        component: {}
      }
    ]

    const store = useMenuStore()
    await store.loadMenus()
    // 调用后数据不受影响
    expect(store.menus).toHaveLength(1)
    expect(store.loaded).toBe(true)
  })
})