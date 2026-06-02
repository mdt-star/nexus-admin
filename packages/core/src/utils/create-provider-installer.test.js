/**
 * installProvider 和 routeStore 单元测试
 *
 * installProvider 是基座内部安装 Provider 的核心函数，
 * 由 app.js 调用，自动完成路由捕获、标记来源、分组存储。
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { installProvider, routeStore } from './create-provider-installer'

// 模拟 Vue Router 实例
function createMockRouter() {
  const routes = []
  return {
    addRoute(route) {
      routes.push(route)
    },
    getRoutes() {
      return routes
    }
  }
}

describe('installProvider', () => {
  beforeEach(() => {
    routeStore.providers = {}
  })

  it('安装 provider 时捕获 addRoute 的路由并存入 routeStore', () => {
    const router = createMockRouter()
    const provider = {
      install({ router }, providerName) {
        router.addRoute({
          path: '/blog',
          meta: { title: '博客', icon: 'Document' },
          component: {}
        })
      }
    }

    installProvider({ router, app: null, hookManager: null, pinia: null }, 'nexus-blog', provider)

    expect(routeStore.getProviderRoutes('nexus-blog')).toHaveLength(1)
    expect(routeStore.getProviderRoutes('nexus-blog')[0].name).toBe('blog')
    expect(routeStore.getProviderRoutes('nexus-blog')[0].meta._provider).toBe('nexus-blog')
  })

  it('providerName 由外部传入，provider 内部不需要重复声明', () => {
    const router = createMockRouter()
    const captured = []

    const provider = {
      install(ctx, name) {
        captured.push(name)
      }
    }

    installProvider({ router, app: null, hookManager: null, pinia: null }, 'nexus-shop', provider)

    expect(captured).toEqual(['nexus-shop'])
    expect(routeStore.getProviderRoutes('nexus-shop')).toEqual([])
  })

  it('支持 addRoute 双参数签名（父路由+子路由）', () => {
    const router = createMockRouter()
    const provider = {
      install({ router }) {
        router.addRoute({
          path: '/shop',
          meta: { title: '商城', icon: 'ShoppingCart' },
          component: {}
        })
        router.addRoute('shop', {
          path: 'products',
          meta: { title: '商品管理', icon: 'Goods' },
          component: {}
        })
      }
    }

    installProvider({ router, app: null, hookManager: null, pinia: null }, 'nexus-shop', provider)

    expect(routeStore.getProviderRoutes('nexus-shop')).toHaveLength(2)
    expect(routeStore.getProviderRoutes('nexus-shop')[0].name).toBe('shop')
    expect(routeStore.getProviderRoutes('nexus-shop')[1].name).toBe('shop-products')
  })

  it('多次安装各自分组不冲突', () => {
    const router = createMockRouter()

    const pkgA = { install({ router }) { router.addRoute({ path: '/a', meta: { title: 'A' }, component: {} }) } }
    const pkgB = { install({ router }) { router.addRoute({ path: '/b', meta: { title: 'B' }, component: {} }) } }

    installProvider({ router, app: null, hookManager: null, pinia: null }, 'pkg-a', pkgA)
    installProvider({ router, app: null, hookManager: null, pinia: null }, 'pkg-b', pkgB)

    expect(Object.keys(routeStore.providers)).toEqual(['pkg-a', 'pkg-b'])
    expect(routeStore.getProviderRoutes('pkg-a')).toHaveLength(1)
    expect(routeStore.getProviderRoutes('pkg-b')).toHaveLength(1)
  })

  it('install 内异常被抛出时不会污染 routeStore', () => {
    const router = createMockRouter()
    const provider = {
      install() {
        throw new Error('安装失败')
      }
    }

    expect(() => {
      installProvider({ router, app: null, hookManager: null, pinia: null }, 'broken-pkg', provider)
    }).toThrow('安装失败')

    expect(routeStore.getProviderRoutes('broken-pkg')).toEqual([])
  })

  it('支持函数形态的 provider（兼容写法）', () => {
    const router = createMockRouter()
    const fn = ({ router }) => {
      router.addRoute({ path: '/fn', meta: { title: '函数' }, component: {} })
    }

    installProvider({ router, app: null, hookManager: null, pinia: null }, 'fn-pkg', fn)

    expect(routeStore.getProviderRoutes('fn-pkg')).toHaveLength(1)
    expect(routeStore.getProviderRoutes('fn-pkg')[0].name).toBe('fn')
  })

  it('支持数组批量注册', () => {
    const router = createMockRouter()
    const provider = {
      install({ router }) {
        router.addRoute([
          { path: '/a', meta: { title: 'A' }, component: {} },
          { path: '/b', meta: { title: 'B' }, component: {} }
        ])
      }
    }

    installProvider({ router, app: null, hookManager: null, pinia: null }, 'multi-pkg', provider)

    expect(routeStore.getProviderRoutes('multi-pkg')).toHaveLength(2)
  })

  describe('自动推演 (normalizeRoute)', () => {
    it('未提供 name 时从 path 自动推演', () => {
      const router = createMockRouter()
      const provider = {
        install({ router }) {
          router.addRoute({ path: '/system/config', meta: { title: '配置' }, component: {} })
        }
      }

      installProvider({ router, app: null, hookManager: null, pinia: null }, 'pkg', provider)

      const routes = routeStore.getProviderRoutes('pkg')
      expect(routes[0].name).toBe('system-config')
    })

    it('子路由未提供 name 时自动拼接父 name', () => {
      const router = createMockRouter()
      const provider = {
        install({ router }) {
          router.addRoute({
            path: '/blog',
            meta: { title: '博客' },
            component: {},
            children: [
              { path: 'posts', meta: { title: '文章' }, component: {} },
              { path: 'settings', meta: { title: '设置' }, component: {} }
            ]
          })
        }
      }

      installProvider({ router, app: null, hookManager: null, pinia: null }, 'pkg', provider)

      const routes = routeStore.getProviderRoutes('pkg')
      expect(routes[0].children[0].name).toBe('blog-posts')
      expect(routes[0].children[1].name).toBe('blog-settings')
    })

    it('permission: true 自动推演为 name 值', () => {
      const router = createMockRouter()
      const provider = {
        install({ router }) {
          router.addRoute({
            path: '/user',
            permission: true,
            meta: { title: '用户' },
            component: {}
          })
        }
      }

      installProvider({ router, app: null, hookManager: null, pinia: null }, 'pkg', provider)

      const routes = routeStore.getProviderRoutes('pkg')
      expect(routes[0].meta.permission).toBe('user')
    })

    it('permission: true 在子路由上自动推演', () => {
      const router = createMockRouter()
      const provider = {
        install({ router }) {
          router.addRoute({
            path: '/system',
            meta: { title: '系统' },
            component: {},
            children: [
              { path: 'user', permission: true, meta: { title: '用户' }, component: {} }
            ]
          })
        }
      }

      installProvider({ router, app: null, hookManager: null, pinia: null }, 'pkg', provider)

      const routes = routeStore.getProviderRoutes('pkg')
      expect(routes[0].children[0].meta.permission).toBe('system-user')
    })

    it('permission 显式字符串保持原样', () => {
      const router = createMockRouter()
      const provider = {
        install({ router }) {
          router.addRoute({
            path: '/custom',
            permission: 'my.custom.perm',
            meta: { title: '自定义' },
            component: {}
          })
        }
      }

      installProvider({ router, app: null, hookManager: null, pinia: null }, 'pkg', provider)

      const routes = routeStore.getProviderRoutes('pkg')
      expect(routes[0].meta.permission).toBe('my.custom.perm')
    })

    it('permission 数组保持原样', () => {
      const router = createMockRouter()
      const provider = {
        install({ router }) {
          router.addRoute({
            path: '/multi',
            permission: ['perm.a', 'perm.b'],
            meta: { title: '多权限' },
            component: {}
          })
        }
      }

      installProvider({ router, app: null, hookManager: null, pinia: null }, 'pkg', provider)

      const routes = routeStore.getProviderRoutes('pkg')
      expect(routes[0].meta.permission).toEqual(['perm.a', 'perm.b'])
    })

    it('path: / 不自动推演 name', () => {
      const router = createMockRouter()
      const provider = {
        install({ router }) {
          router.addRoute({
            path: '/',
            name: 'home',
            meta: { title: '首页' },
            component: {}
          })
        }
      }

      installProvider({ router, app: null, hookManager: null, pinia: null }, 'pkg', provider)

      const routes = routeStore.getProviderRoutes('pkg')
      expect(routes[0].name).toBe('home')
    })

    it('显式提供的 name 不被推演覆盖', () => {
      const router = createMockRouter()
      const provider = {
        install({ router }) {
          router.addRoute({
            path: '/my-path',
            name: 'custom-name',
            meta: { title: '自定义' },
            component: {}
          })
        }
      }

      installProvider({ router, app: null, hookManager: null, pinia: null }, 'pkg', provider)

      const routes = routeStore.getProviderRoutes('pkg')
      expect(routes[0].name).toBe('custom-name')
    })

    it('path 含 /:id 参数时 name 推演为 -id 后缀', () => {
      const router = createMockRouter()
      const provider = {
        install({ router }) {
          router.addRoute({ path: '/user/:id', permission: true, meta: { title: '用户详情' }, component: {} })
        }
      }

      installProvider({ router, app: null, hookManager: null, pinia: null }, 'pkg', provider)

      const routes = routeStore.getProviderRoutes('pkg')
      expect(routes[0].name).toBe('user-id')
      expect(routes[0].meta.permission).toBe('user-id')
    })

    it('path 含 /:id 不与普通 /user 冲突', () => {
      const router = createMockRouter()
      const provider = {
        install({ router }) {
          router.addRoute([
            { path: '/user', meta: { title: '用户列表' }, component: {} },
            { path: '/user/:id', meta: { title: '用户详情' }, component: {} }
          ])
        }
      }

      installProvider({ router, app: null, hookManager: null, pinia: null }, 'pkg', provider)

      const routes = routeStore.getProviderRoutes('pkg')
      expect(routes[0].name).toBe('user')
      expect(routes[1].name).toBe('user-id')
    })

    it('path 含多层参数 /:id/:cid 正确推演', () => {
      const router = createMockRouter()
      const provider = {
        install({ router }) {
          router.addRoute({ path: '/user/:id/post/:cid', meta: { title: '详情' }, component: {} })
        }
      }

      installProvider({ router, app: null, hookManager: null, pinia: null }, 'pkg', provider)

      const routes = routeStore.getProviderRoutes('pkg')
      expect(routes[0].name).toBe('user-id-post-cid')
    })

    it('path 含可选参数 /:id? 正确推演', () => {
      const router = createMockRouter()
      const provider = {
        install({ router }) {
          router.addRoute({ path: '/user/:id?', meta: { title: '用户' }, component: {} })
        }
      }

      installProvider({ router, app: null, hookManager: null, pinia: null }, 'pkg', provider)

      const routes = routeStore.getProviderRoutes('pkg')
      expect(routes[0].name).toBe('user-id')
    })

    it('权限标记 _provider 来源', () => {
      const router = createMockRouter()
      const provider = {
        install({ router }) {
          router.addRoute({ path: '/test', meta: { title: '测试' }, component: {} })
        }
      }

      installProvider({ router, app: null, hookManager: null, pinia: null }, 'my-pkg', provider)

      const routes = routeStore.getProviderRoutes('my-pkg')
      expect(routes[0].meta._provider).toBe('my-pkg')
    })
  })
})

describe('routeStore', () => {
  beforeEach(() => {
    routeStore.providers = {}
  })

  it('初始状态 providers 为空', () => {
    expect(routeStore.getAllProviderRoutes()).toEqual({})
  })

  it('getProviderRoutes 返回指定 provider 的路由列表', () => {
    routeStore.providers['nexus-blog'] = [
      { name: 'blog', meta: { title: '博客', _provider: 'nexus-blog' } }
    ]
    expect(routeStore.getProviderRoutes('nexus-blog')).toHaveLength(1)
    expect(routeStore.getProviderRoutes('unknown')).toEqual([])
  })

  it('getAllProviderRoutes 返回所有 provider 的快照', () => {
    routeStore.providers['pkg-a'] = []
    routeStore.providers['pkg-b'] = []
    const snap = routeStore.getAllProviderRoutes()
    expect(Object.keys(snap)).toEqual(['pkg-a', 'pkg-b'])
  })

  describe('getMenuTree', () => {
    beforeEach(() => {
      routeStore.providers['nexus-admin'] = [
        {
          path: '/system',
          name: 'system',
          meta: { title: '系统管理', icon: 'Setting', sort: 100, _provider: 'nexus-admin' },
          component: {},
          children: [
            {
              path: 'user',
              name: 'system.user',
              meta: { title: '用户管理', icon: 'User', _provider: 'nexus-admin' },
              component: {}
            },
            {
              path: 'config',
              name: 'system.config',
              meta: { title: '系统配置', icon: 'Setting', _provider: 'nexus-admin' },
              component: {}
            }
          ]
        }
      ]
      routeStore.providers['nexus-blog'] = [
        {
          path: '/blog',
          name: 'blog',
          meta: { title: '博客管理', icon: 'Document', sort: 200, _provider: 'nexus-blog' },
          component: {},
          children: [
            {
              path: 'posts',
              name: 'blog.posts',
              meta: { title: '文章列表', _provider: 'nexus-blog' },
              component: {}
            }
          ]
        }
      ]
    })

    it('getMenuTree 返回按 sort 排序的菜单树', () => {
      const tree = routeStore.getMenuTree()
      expect(tree).toHaveLength(2)
      expect(tree[0].id).toBe('system')
      expect(tree[1].id).toBe('blog')
    })

    it('getMenuTree 过滤掉 meta.hidden=true 的路由', () => {
      routeStore.providers['nexus-admin'].push({
        path: '/hidden',
        name: 'hidden',
        meta: { title: '隐藏项', hidden: true, _provider: 'nexus-admin' }
      })
      const tree = routeStore.getMenuTree()
      expect(tree.find(m => m.id === 'hidden')).toBeUndefined()
    })

    it('getMenuTree 过滤掉无 meta.title 的路由', () => {
      routeStore.providers['nexus-admin'].push({
        path: '/notitle',
        name: 'notitle',
        meta: { _provider: 'nexus-admin' }
      })
      const tree = routeStore.getMenuTree()
      expect(tree.find(m => m.id === 'notitle')).toBeUndefined()
    })

    it('getMenuTree 的 provider 参数仅返回指定提供者的菜单', () => {
      const tree = routeStore.getMenuTree({ provider: 'nexus-blog' })
      expect(tree).toHaveLength(1)
      expect(tree[0].id).toBe('blog')
    })

    it('getMenuTree 的 filter 参数支持自定义过滤', () => {
      const tree = routeStore.getMenuTree({
        filter: route => route.meta?.permission !== 'admin'
      })
      expect(tree).toHaveLength(2)
    })

    it('菜单项包含 children 时递归展开', () => {
      const tree = routeStore.getMenuTree()
      const system = tree.find(m => m.id === 'system')
      expect(system.children).toHaveLength(2)
      expect(system.children[0].id).toBe('system.user')
      expect(system.children[1].id).toBe('system.config')
    })
  })
})