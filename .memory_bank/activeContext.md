# 当前活动上下文

## 当前工作
第三方注册机制架构重构已完成：从「声明式清单」（pages/components/directives/plugins）转变为「编程式 Provider + routeStore」模型。

## 改动总结

### 新增文件
| 文件 | 说明 |
|------|------|
| `utils/create-provider-installer.js` | Provider 安装器工厂 + routeStore 路由注册中心 |
| `utils/create-provider-installer.test.js` | 14 个测试用例 |
| `providers/nexus-admin.js` | 基座自身 Provider，注册内置路由 |

### 修改文件
| 文件 | 操作 | 说明 |
|------|------|------|
| `app.js` | 重写 | 移除四类解析函数，改为 provider 加载流程；引入 routeStore；通过 router.getRoutes() 构建页面映射 |
| `NexusAdminManager.php` | 重写 | 从四类清单 → 仅收集 provider 路径；保留 collectRegistry() 兼容 |
| `NexusAdminServiceProvider.php` | 修改 | 注入 nexusProviders 替代 nexusRegistry |
| `app.blade.php` | 修改 | 注入 `__NEXUS_ADMIN_PROVIDERS__` 替代 `__NEXUS_ADMIN_REGISTRY__` |
| `index.html` | 修改 | 开发环境使用新的 provider 机制 |

### 移除文件
| 文件 | 说明 |
|------|------|
| `pages/registry.js` | 不再需要（开发环境环境直接用 index.html 的 __NEXUS_ADMIN_PROVIDERS__）|
| `plugins/registry.js` | 插件注册中心（被 provider 机制取代）|
| `plugins/registry.test.js` | 对应测试 |

## 测试情况
- 15 个测试文件，170 个测试用例，全部通过
- 构建成功，零报错