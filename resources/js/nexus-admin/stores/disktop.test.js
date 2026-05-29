/**
 * Disktop Store 单元测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useDisktopStore } from './disktop'

vi.mock('../services/disktops', () => ({
  default: {
    list: vi.fn(),
    items: {
      list: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn()
    }
  }
}))

describe('DisktopStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('初始状态', () => {
    const store = useDisktopStore()
    expect(store.disktops).toEqual([])
    expect(store.activeDisktopId).toBeNull()
    expect(store.items).toEqual([])
    expect(store.loaded).toBe(false)
    expect(store.loading).toBe(false)
    expect(store.currentDisktop).toBeNull()
    expect(store.rootItems).toEqual([])
    expect(store.treeItems).toEqual([])
  })

  it('loadDisktops() 加载桌面列表并选中默认桌面', async () => {
    const { default: disktopsApi } = await import('../services/disktops')
    disktopsApi.list.mockResolvedValue({
      data: [
        { id: 1, name: '默认桌面', is_default: true },
        { id: 2, name: '工作桌面', is_default: false }
      ]
    })

    const store = useDisktopStore()
    await store.loadDisktops()
    expect(store.disktops).toHaveLength(2)
    expect(store.activeDisktopId).toBe(1)
    expect(store.loaded).toBe(true)
  })

  it('loadDisktops() 无默认桌面时选中第一个', async () => {
    const { default: disktopsApi } = await import('../services/disktops')
    disktopsApi.list.mockResolvedValue({
      data: [
        { id: 1, name: '桌面1', is_default: false },
        { id: 2, name: '桌面2', is_default: false }
      ]
    })

    const store = useDisktopStore()
    await store.loadDisktops()
    expect(store.activeDisktopId).toBe(1)
  })

  it('loadDisktops() API 失败时使用空数组', async () => {
    const { default: disktopsApi } = await import('../services/disktops')
    disktopsApi.list.mockRejectedValue(new Error('Network error'))

    const store = useDisktopStore()
    await store.loadDisktops()
    expect(store.disktops).toEqual([])
    expect(store.loaded).toBe(true)
  })

  it('loadItems() 加载当前桌面项', async () => {
    const { default: disktopsApi } = await import('../services/disktops')
    disktopsApi.list.mockResolvedValue({ data: [{ id: 1, name: '默认桌面', is_default: true }] })
    disktopsApi.items.list.mockResolvedValue({
      data: [
        { id: 1, title: '控制台', icon: 'Monitor', parent_id: null, sort: 0 },
        { id: 2, title: '用户管理', icon: 'User', parent_id: null, sort: 1 }
      ]
    })

    const store = useDisktopStore()
    await store.loadDisktops()
    await store.loadItems()
    expect(store.items).toHaveLength(2)
    expect(store.rootItems).toHaveLength(2)
  })

  it('switchDisktop() 切换桌面并加载项', async () => {
    const { default: disktopsApi } = await import('../services/disktops')
    disktopsApi.list.mockResolvedValue({ data: [
      { id: 1, name: '桌面1', is_default: true },
      { id: 2, name: '桌面2', is_default: false }
    ]})
    disktopsApi.items.list.mockResolvedValue({ data: [] })

    const store = useDisktopStore()
    await store.loadDisktops()
    await store.switchDisktop(2)
    expect(store.activeDisktopId).toBe(2)
  })

  it('rootItems 返回根级项并按 sort 排序', () => {
    const store = useDisktopStore()
    store.items = [
      { id: 1, title: 'B', parent_id: null, sort: 2 },
      { id: 2, title: 'A', parent_id: null, sort: 1 },
      { id: 3, title: '子项', parent_id: 1, sort: 0 }
    ]
    expect(store.rootItems.map(i => i.title)).toEqual(['A', 'B'])
  })

  it('getChildren() 返回指定父级的子项', () => {
    const store = useDisktopStore()
    store.items = [
      { id: 1, title: '父', parent_id: null, sort: 0 },
      { id: 2, title: '子1', parent_id: 1, sort: 1 },
      { id: 3, title: '子2', parent_id: 1, sort: 0 }
    ]
    const children = store.getChildren(1)
    expect(children).toHaveLength(2)
    expect(children[0].title).toBe('子2') // sort 0 在前
    expect(children[1].title).toBe('子1') // sort 1 在后
  })

  it('treeItems 构建树结构', () => {
    const store = useDisktopStore()
    store.items = [
      { id: 1, title: '根1', parent_id: null, sort: 0 },
      { id: 2, title: '子1', parent_id: 1, sort: 0 },
      { id: 3, title: '孙1', parent_id: 2, sort: 0 }
    ]
    expect(store.treeItems).toHaveLength(1)
    expect(store.treeItems[0].children).toHaveLength(1)
    expect(store.treeItems[0].children[0].children).toHaveLength(1)
  })

  it('addItem() 添加项到当前桌面', async () => {
    const { default: disktopsApi } = await import('../services/disktops')
    disktopsApi.list.mockResolvedValue({ data: [{ id: 1, name: '默认桌面', is_default: true }] })
    disktopsApi.items.create.mockResolvedValue({
      data: { id: 100, title: '新项', icon: 'Star', parent_id: null, type: 'menu' }
    })

    const store = useDisktopStore()
    await store.loadDisktops()
    const item = await store.addItem({ title: '新项', icon: 'Star' })
    expect(item.id).toBe(100)
    expect(store.items).toHaveLength(1)
  })

  it('addItem() 同级同名自动加副本后缀', async () => {
    const { default: disktopsApi } = await import('../services/disktops')
    disktopsApi.list.mockResolvedValue({ data: [{ id: 1, name: '默认桌面', is_default: true }] })
    disktopsApi.items.create.mockResolvedValue({
      data: { id: 101, title: '新项 副本', icon: 'Star', parent_id: null, type: 'menu' }
    })

    const store = useDisktopStore()
    await store.loadDisktops()
    store.items = [{ id: 1, title: '新项', parent_id: null, sort: 0 }]

    const item = await store.addItem({ title: '新项', icon: 'Star' })
    expect(item.title).toBe('新项 副本')
  })

  it('addItem() API 失败时使用本地 fallback', async () => {
    const { default: disktopsApi } = await import('../services/disktops')
    disktopsApi.list.mockResolvedValue({ data: [{ id: 1, name: '默认桌面', is_default: true }] })
    disktopsApi.items.create.mockRejectedValue(new Error('Network error'))

    const store = useDisktopStore()
    await store.loadDisktops()
    const item = await store.addItem({ title: '离线项', icon: 'File' })
    expect(item.title).toBe('离线项')
    expect(item.id).toBeTruthy()
    expect(store.items).toHaveLength(1)
  })

  it('updateItem() 更新项', async () => {
    const { default: disktopsApi } = await import('../services/disktops')
    disktopsApi.items.update.mockResolvedValue({})

    const store = useDisktopStore()
    store.items = [{ id: 1, title: '旧标题', icon: 'Star', parent_id: null, sort: 0 }]

    await store.updateItem(1, { title: '新标题' })
    expect(store.items[0].title).toBe('新标题')
  })

  it('removeItem() 删除项及子项', async () => {
    const { default: disktopsApi } = await import('../services/disktops')
    disktopsApi.items.remove.mockResolvedValue({})

    const store = useDisktopStore()
    store.items = [
      { id: 1, title: '父', parent_id: null, sort: 0 },
      { id: 2, title: '子', parent_id: 1, sort: 0 },
      { id: 3, title: '其他', parent_id: null, sort: 1 }
    ]

    await store.removeItem(1)
    expect(store.items).toHaveLength(1)
    expect(store.items[0].id).toBe(3)
  })

  it('reorderItem() 重新排序', async () => {
    const { default: disktopsApi } = await import('../services/disktops')
    disktopsApi.items.update.mockResolvedValue({})

    const store = useDisktopStore()
    store.items = [{ id: 1, title: '项', parent_id: null, sort: 0 }]

    await store.reorderItem(1, 5)
    expect(store.items[0].sort).toBe(5)
  })

  it('reorderItem() 支持跨父级移动', async () => {
    const { default: disktopsApi } = await import('../services/disktops')
    disktopsApi.items.update.mockResolvedValue({})

    const store = useDisktopStore()
    store.items = [{ id: 1, title: '项', parent_id: null, sort: 0 }]

    await store.reorderItem(1, 0, 2)
    expect(store.items[0].parent_id).toBe(2)
  })
})
