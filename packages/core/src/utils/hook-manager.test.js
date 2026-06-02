/**
 * Hook Manager 单元测试
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import hookManager from './hook-manager'

describe('HookManager', () => {
  beforeEach(() => {
    // 手动清除所有钩子（全局单例，通过 off 清理）
    hookManager.getEvents().forEach(event => hookManager.off(event))
  })

  it('初始化时无事件', () => {
    expect(hookManager.getEvents()).toEqual([])
  })

  it('注册单个钩子并触发', async () => {
    const fn = vi.fn()
    hookManager.on('test:event', fn)

    await hookManager.emit('test:event', 'arg1', 'arg2')
    expect(fn).toHaveBeenCalledOnce()
    expect(fn).toHaveBeenCalledWith('arg1', 'arg2')
  })

  it('注册多个钩子并依次触发', async () => {
    const order = []
    hookManager.on('test:event', () => order.push(1))
    hookManager.on('test:event', () => order.push(2))

    await hookManager.emit('test:event')
    expect(order).toEqual([1, 2])
  })

  it('取消注册特定钩子', async () => {
    const fn1 = vi.fn()
    const fn2 = vi.fn()
    hookManager.on('test:event', fn1)
    hookManager.on('test:event', fn2)

    hookManager.off('test:event', fn1)
    await hookManager.emit('test:event')

    expect(fn1).not.toHaveBeenCalled()
    expect(fn2).toHaveBeenCalledOnce()
  })

  it('取消注册整个事件的所有钩子', async () => {
    const fn = vi.fn()
    hookManager.on('test:event', fn)
    hookManager.on('other:event', fn)

    hookManager.off('test:event')
    expect(hookManager.getEvents()).toEqual(['other:event'])

    await hookManager.emit('test:event')
    await hookManager.emit('other:event')

    expect(fn).toHaveBeenCalledOnce() // 只有 other:event 触发
  })

  it('处理异步钩子函数', async () => {
    const fn = vi.fn(async () => {
      await new Promise(resolve => setTimeout(resolve, 10))
    })
    hookManager.on('test:event', fn)

    await hookManager.emit('test:event')
    expect(fn).toHaveBeenCalledOnce()
  })

  it('事件名不存在时不报错', async () => {
    await expect(hookManager.emit('nonexistent', 'data')).resolves.toBeUndefined()
  })

  it('获取已注册的事件名称列表', () => {
    hookManager.on('event:a', () => {})
    hookManager.on('event:b', () => {})

    const events = hookManager.getEvents()
    expect(events).toContain('event:a')
    expect(events).toContain('event:b')
  })

  it('获取指定事件的监听器数量', () => {
    expect(hookManager.getListenerCount('test')).toBe(0)

    hookManager.on('test', () => {})
    hookManager.on('test', () => {})
    expect(hookManager.getListenerCount('test')).toBe(2)
  })

  it('钩子抛出异常时不影响其他钩子执行', async () => {
    const fn2 = vi.fn()
    hookManager.on('test:event', () => { throw new Error('fail') })
    hookManager.on('test:event', fn2)

    // 不应该抛出异常
    await expect(hookManager.emit('test:event')).resolves.toBeUndefined()
    expect(fn2).toHaveBeenCalledOnce()
  })
})