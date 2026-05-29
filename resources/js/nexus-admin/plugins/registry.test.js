/**
 * Plugin Registry 单元测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import pluginRegistry from './registry'
import hookManager from '../utils/hook-manager'

vi.mock('../utils/hook-manager', () => ({
  default: {
    on: vi.fn(),
    emit: vi.fn(() => Promise.resolve())
  }
}))

describe('PluginRegistry', () => {
  beforeEach(() => {
    // 清空已注册的插件
    pluginRegistry.plugins = {}
    vi.clearAllMocks()
  })

  it('初始状态无插件', () => {
    expect(pluginRegistry.getPlugins()).toEqual([])
  })

  it('register() 注册单个插件', () => {
    pluginRegistry.register('vendor/pkg', 'my-plugin', {
      hooks: ['app:init'],
      loader: () => import('./registry')
    })

    const plugins = pluginRegistry.getPlugins()
    expect(plugins).toHaveLength(1)
    expect(plugins[0].pkg).toBe('vendor/pkg')
    expect(plugins[0].id).toBe('my-plugin')
  })

  it('register() 注册钩子监听', () => {
    pluginRegistry.register('vendor/pkg', 'my-plugin', {
      hooks: ['app:init', 'app:mounted'],
      handler: vi.fn()
    })

    expect(hookManager.on).toHaveBeenCalledTimes(2)
    expect(hookManager.on).toHaveBeenCalledWith('app:init', expect.any(Function))
    expect(hookManager.on).toHaveBeenCalledWith('app:mounted', expect.any(Function))
  })

  it('registerAll() 批量注册', () => {
    pluginRegistry.registerAll({
      'vendor/pkg': {
        'plugin-a': { hooks: ['app:init'] },
        'plugin-b': { hooks: ['app:mounted'] }
      }
    })

    expect(pluginRegistry.getPlugins()).toHaveLength(2)
  })

  it('getPackagePlugins() 获取指定扩展包的插件', () => {
    pluginRegistry.registerAll({
      'pkg-a': {
        'p1': { hooks: [] },
        'p2': { hooks: [] }
      },
      'pkg-b': {
        'p3': { hooks: [] }
      }
    })

    expect(pluginRegistry.getPackagePlugins('pkg-a')).toHaveLength(2)
    expect(pluginRegistry.getPackagePlugins('pkg-b')).toHaveLength(1)
    expect(pluginRegistry.getPackagePlugins('pkg-nonexistent')).toEqual([])
  })

  it('register() 返回自身以支持链式调用', () => {
    const result = pluginRegistry.register('pkg', 'id', { hooks: [] })
    expect(result).toBe(pluginRegistry)
  })
})
