# 发布标准操作规程（SOP）

> 永久规范文件，不会被其他任务覆盖。需要发布时读取此文件。

---

## 工作流规则

两个包共用 `v*` 标签触发，通过 `paths` 过滤自动区分：

| 工作流文件 | 发布包 | 触发条件 |
|-----------|-------|---------|
| `.github/workflows/publish-core.yml` | `nexus-admin-core` | tag `v*` + `packages/core/**` 有变化 |
| `.github/workflows/publish-create.yml` | `create-nexus-admin` | tag `v*` + `packages/create-nexus-admin/**` 有变化 |

## 发布流程

**两个包流程完全统一**，只需改包名和版本号：

```bash
# 1. bump 版本（patch/minor/major 按需）
npm version patch -w <包名> --no-git-tag-version

# 2. 提交 + 打标签 + 推送
git add <包的 package.json>
git commit -m "chore: bump <包名> to v<新版本>"
git tag v<新版本>
git push && git push origin v<新版本>
```

## 发布示例

**发布 nexus-admin-core：**
```bash
npm version patch -w nexus-admin-core --no-git-tag-version
git add packages/core/package.json
git commit -m "chore: bump nexus-admin-core to v0.2.6"
git tag v0.2.6
git push && git push origin v0.2.6
```

**发布 create-nexus-admin：**
```bash
npm version patch -w create-nexus-admin --no-git-tag-version
git add packages/create-nexus-admin/package.json
git commit -m "chore: bump create-nexus-admin to v0.3.0"
git tag v0.3.0
git push && git push origin v0.3.0
```

## ⚠️ 注意事项

1. **标签是全局命名空间**：务必 `git diff --stat` 确认只改了目标包的 `package.json`，避免标签版本号与包版本号不一致
2. **不要一次发两个包**：不同包分开发布，各自打对应版本的标签
3. **version 字段必须递增**：`npm version patch` 会自动处理