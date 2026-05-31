/**
 * Windows Store 单元测试
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useWindowStore } from './windows'

describe('WindowsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('初始状态为空', () => {
    const store = useWindowStore()
    expect(store.items).toEqual([])
    expect(store.activeId).toBeNull()
    expect(store.active).toBeNull()
    expect(store.history).toEqual([])
  })

  it('打开新窗口/Tab', async () => {
    const store = useWindowStore()
    const menuItem = { id: 'dashboard', title: '控制台', icon: 'Platform', component: 'Dashboard' }

    await store.open(menuItem)

    expect(store.items).toHaveLength(1)
    expect(store.items[0].id).toBe('dashboard')
    expect(store.items[0].title).toBe('控制台')
    expect(store.activeId).toBe('dashboard')
    expect(store.active).toBeTruthy()
  })

  it('打开已存在的窗口切换到它', async () => {
    const store = useWindowStore()
    await store.open({ id: 'a', title: 'A', component: 'A' })
    await store.open({ id: 'b', title: 'B', component: 'B' })

    expect(store.items).toHaveLength(2)

    // 再次打开 a
    await store.open({ id: 'a', title: 'A', component: 'A' })
    expect(store.items).toHaveLength(2) // 不重复添加
    expect(store.activeId).toBe('a')
  })

  it('关闭窗口', async () => {
    const store = useWindowStore()
    await store.open({ id: 'a', title: 'A', component: 'A' })
    await store.open({ id: 'b', title: 'B', component: 'B' })

    await store.close('a')
    expect(store.items).toHaveLength(1)
    expect(store.items[0].id).toBe('b')
    expect(store.activeId).toBe('b')
  })

  it('关闭窗口后 activeId 保持不变（需手动激活）', async () => {
    const store = useWindowStore()
    await store.open({ id: 'a', title: 'A', component: 'A' })
    await store.open({ id: 'b', title: 'B', component: 'B' })

    await store.close('b') // 关闭当前激活的 b，activeId 保持不变
    expect(store.activeId).toBe('b')
  })

  it('关闭最后一个窗口后 activeId 保持不变（需手动激活）', async () => {
    const store = useWindowStore()
    await store.open({ id: 'a', title: 'A', component: 'A' })

    await store.close('a')
    expect(store.items).toHaveLength(0)
    expect(store.activeId).toBe('a')
  })

  it('关闭其他窗口', async () => {
    const store = useWindowStore()
    await store.open({ id: 'a', title: 'A', component: 'A' })
    await store.open({ id: 'b', title: 'B', component: 'B' })
    await store.open({ id: 'c', title: 'C', component: 'C' })

    store.closeOthers('b')
    expect(store.items).toHaveLength(1)
    expect(store.items[0].id).toBe('b')
    expect(store.activeId).toBe('b')
  })

  it('关闭所有窗口', async () => {
    const store = useWindowStore()
    await store.open({ id: 'a', title: 'A', component: 'A' })
    await store.open({ id: 'b', title: 'B', component: 'B' })

    store.closeAll()
    expect(store.items).toHaveLength(0)
    expect(store.activeId).toBeNull()
    expect(store.history).toEqual([])
  })

  it('激活指定窗口', async () => {
    const store = useWindowStore()
    await store.open({ id: 'a', title: 'A', component: 'A' })
    await store.open({ id: 'b', title: 'B', component: 'B' })

    expect(store.activeId).toBe('b')

    await store.activate('a')
    expect(store.activeId).toBe('a')
  })

  it('更新窗口状态', async () => {
    const store = useWindowStore()
    await store.open({ id: 'a', title: 'A', component: 'A' })

    store.update('a', { title: 'Updated A', params: { key: 'value' } })
    expect(store.items[0].title).toBe('Updated A')
    expect(store.items[0].params).toEqual({ key: 'value' })
  })

  it('打开时记录历史', async () => {
    const store = useWindowStore()
    await store.open({ id: 'a', title: 'A', component: 'A' })
    await store.open({ id: 'b', title: 'B', component: 'B' })

    expect(store.history).toEqual(['a', 'b'])
  })
})