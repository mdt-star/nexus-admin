# 当前活动上下文

## 当前工作
将 UI 尺寸（size store）从独立 localStorage 持久化改为通过 ConfigStore 统一管理，数据随用户配置一起保存到后端。

## 改动内容

### size store (`stores/size.js`)
- 移除 localStorage 读写（`getItem('nexus-admin-ui-size')` / `setItem('nexus-admin-ui-size')`）
- 新增 `syncFromConfig(configStore)` 方法，从 ConfigStore 读取 `uiSize` 配置
- `setSize()` 改为通过 `configStore.setUserConfig('uiSize', val)` 持久化，自动同步到后端
- 保留 `elementSize`、`toggleSize`、`applySize`、`init` 等接口不变

### config store (`stores/config.js`)
- `defaults` 中新增 `uiSize: 'medium'` 默认值

### app.js
- 初始化顺序调整：size 初始化移到 config 加载之后
- `uiSizeStore.init()` → `uiSizeStore.syncFromConfig(configStore)`

### 数据流
```
用户切换尺寸 → setSize() → configStore.setUserConfig('uiSize', val)
                                    ↕
                            localStorage + 后端 API
```

## 当前状态
- 11 个测试文件，98 个测试用例，全部通过
- 0 unhandled errors
