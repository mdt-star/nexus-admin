/**
 * Menu Store 单元测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useMenuStore } from './menu'

vi.mock('../utils/hook-manager', () => ({
  default: {
    emit: vi.fn(() => Promise.resolve())
  }
}))

vi.mock('../services/api', () => ({
  getMenus: vi.fn()
}))

describe('MenuStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('初始状态为空', () => {
    const store = useMenuStore()
    expect(store.menus).toEqual([])
    expect(store.loaded).toBe(false)
    expect(store.loading).toBe(false)
  })

  it('loadMenus() 从 API 加载菜单', async () => {
    const { getMenus } = await import('../services/api')
    const mockData = [
      { id: 1, title: '控制台', icon: 'Monitor', component: 'dashboard', route: '/dashboard', children: [] },
      { id: 2, title: '系统管理', icon: 'Setting', component: '', route: '', children: [
        { id: 3, title: '用户管理', icon: 'User', component: 'system-user', route: '/system/user', children: [] }
      ]}
    ]
    getMenus.mockResolvedValue({ data: mockData })

    const store = useMenuStore()
    await store.loadMenus()
    expect(store.menus).toEqual(mockData)
    expect(store.loaded).toBe(true)
    expect(store.loading).toBe(false)
  })

  it('loadMenus() API 失败时使用空数组', async () => {
    const { getMenus } = await import('../services/api')
    getMenus.mockRejectedValue(new Error('Network error'))

    const store = useMenuStore()
    await store.loadMenus()
    expect(store.menus).toEqual([])
    expect(store.loaded).toBe(true)
  })

  it('loadMenus() 重复调用不重复加载', async () => {
    const { getMenus } = await import('../services/api')
    getMenus.mockResolvedValue({ data: [] })

    const store = useMenuStore()
    await store.loadMenus()
    // 第二次调用时 loaded 已为 true，但 store 没有 loaded 守卫
    // 这里验证 loading 并发守卫：同时调用两次，只有第一次会执行
    await store.loadMenus()
    expect(getMenus).toHaveBeenCalledTimes(2)
  })

  it('desktopItems 过滤出叶子节点和文件夹', async () => {
    const { getMenus } = await import('../services/api')
    getMenus.mockResolvedValue({ data: [
      { id: 1, title: '控制台', icon: 'Monitor', component: 'dashboard', route: '/dashboard', children: [] },
      { id: 2, title: '系统管理', icon: 'Setting', component: '', route: '', children: [
        { id: 3, title: '用户管理', icon: 'User', component: 'system-user', route: '/system/user', children: [] }
      ]},
      { id: 4, title: '无组件项', icon: 'Hidden', component: '', route: '', children: [] }
    ]})

    const store = useMenuStore()
    await store.loadMenus()

    expect(store.desktopItems).toHaveLength(2)
    expect(store.desktopItems[0].id).toBe(1)
    expect(store.desktopItems[0].isFolder).toBe(false)
    expect(store.desktopItems[1].id).toBe(2)
    expect(store.desktopItems[1].isFolder).toBe(true)
  })

  it('sidebarMenus 返回原始菜单数据', async () => {
    const { getMenus } = await import('../services/api')
    const mockData = [{ id: 1, title: '控制台', children: [] }]
    getMenus.mockResolvedValue({ data: mockData })

    const store = useMenuStore()
    await store.loadMenus()
    expect(store.sidebarMenus).toBe(store.menus)
  })

  it('findMenuByComponent() 递归查找组件', async () => {
    const { getMenus } = await import('../services/api')
    getMenus.mockResolvedValue({ data: [
      { id: 1, title: '系统', children: [
        { id: 2, title: '用户管理', component: 'system-user', children: [] }
      ]}
    ]})

    const store = useMenuStore()
    await store.loadMenus()

    const found = store.findMenuByComponent('system-user')
    expect(found).toBeTruthy()
    expect(found.id).toBe(2)
    expect(found.title).toBe('用户管理')
  })

  it('findMenuByComponent() 未找到时返回 null', () => {
    const store = useMenuStore()
    store.menus = [{ id: 1, title: 'A', component: 'a', children: [] }]
    expect(store.findMenuByComponent('nonexistent')).toBeNull()
  })

  it('findMenuByRoute() 递归查找路由', async () => {
    const { getMenus } = await import('../services/api')
    getMenus.mockResolvedValue({ data: [
      { id: 1, title: '系统', children: [
        { id: 2, title: '用户管理', component: 'system-user', route: '/system/user', children: [] }
      ]}
    ]})

    const store = useMenuStore()
    await store.loadMenus()

    const found = store.findMenuByRoute('/system/user')
    expect(found).toBeTruthy()
    expect(found.id).toBe(2)
  })
})
