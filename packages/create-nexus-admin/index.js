#!/usr/bin/env node

import { existsSync, copyFileSync, mkdirSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import prompts from 'prompts'
import { cyan, green, yellow, bold, dim } from 'kolorist'

const __dirname = dirname(fileURLToPath(import.meta.url))
const templateDir = resolve(__dirname, 'template')

async function main() {
  const args = process.argv.slice(2)
  const projectName = args[0] || ''

  console.log(`\n  ${bold('✨')} 欢迎使用 ${cyan(bold('Nexus Admin'))} 脚手架\n`)

  let response
  try {
    response = await prompts([
      {
        type: projectName ? null : 'text',
        name: 'projectName',
        message: '项目名称',
        initial: 'my-nexus-app',
        validate: v => /^[a-z0-9-]+$/.test(v) || '只允许小写字母、数字和连字符'
      },
      {
        type: 'select',
        name: 'layoutMode',
        message: '选择布局模式',
        initial: 2,
        choices: [
          { title: '侧边栏模式 (sidebar)', value: 'sidebar' },
          { title: '桌面模式 (desktop)', value: 'desktop' },
          { title: '双模式 (推荐)', value: 'both' }
        ]
      },
      {
        type: 'toggle',
        name: 'mockData',
        message: '是否需要 Mock 数据？',
        initial: true,
        active: '是',
        inactive: '否'
      },
      {
        type: 'select',
        name: 'packageManager',
        message: '选择包管理器',
        initial: 0,
        choices: [
          { title: 'npm', value: 'npm' },
          { title: 'pnpm', value: 'pnpm' },
          { title: 'yarn', value: 'yarn' }
        ]
      }
    ])
  } catch {
    console.log(`${yellow('✖')} 已取消\n`)
    process.exit(1)
  }

  const { projectName: name, layoutMode, mockData, packageManager } = response
  const finalName = projectName || name
  const targetDir = resolve(process.cwd(), finalName)

  if (existsSync(targetDir)) {
    console.error(`\n  ${red('✖')} 目录 ${cyan(finalName)} 已存在\n`)
    process.exit(1)
  }

  console.log(`\n  ${green('✔')} 正在创建项目 ${cyan(finalName)} ...\n`)

  // 创建目标目录
  const dirs = [
    'src/router',
    'src/providers',
    'src/pages',
    'src/layouts',
    'public'
  ]
  for (const dir of dirs) {
    mkdirSync(resolve(targetDir, dir), { recursive: true })
  }

  // 生成 package.json
  const pkg = {
    name: finalName,
    version: '0.1.0',
    private: true,
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview'
    },
    dependencies: {
      'nexus-admin-core': '^0.1.0',
      vue: '^3.4.0',
      pinia: '^2.3.0',
      'element-plus': '^2.9.0',
      'vue-router': '^4.6.4',
      '@element-plus/icons-vue': '^2.3.0',
      axios: '^1.16.1'
    },
    devDependencies: {
      '@vitejs/plugin-vue': '^5.2.0',
      vite: '^6.3.0',
      sass: '^1.86.0'
    }
  }
  if (mockData) {
    pkg.devDependencies['mockjs'] = '^1.1.0'
  }
  writeFileSync(resolve(targetDir, 'package.json'), JSON.stringify(pkg, null, 2) + '\n')
  console.log(`  ${green('✓')} package.json`)

  // vite.config.js
  writeFileSync(resolve(targetDir, 'vite.config.js'), `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()]
})
`)
  console.log(`  ${green('✓')} vite.config.js`)

  // index.html
  writeFileSync(resolve(targetDir, 'index.html'), `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${finalName}</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
`)
  console.log(`  ${green('✓')} index.html`)

  // .env
  writeFileSync(resolve(targetDir, '.env'), `# API 基础路径（可选，前后端分离时使用）
# VITE_API_BASE_URL=https://api.example.com
`)
  console.log(`  ${green('✓')} .env`)

  // src/main.js
  const mainContent = `import 'nexus-admin-core/src/styles/global.scss'
import { createNexusApp, nexusAdminProvider } from 'nexus-admin-core'
import { createRouter, createWebHistory } from 'vue-router'
import routes from './router/index'
import appProvider from './providers/app'

const router = createRouter({
  history: createWebHistory(),
  routes
})

await createNexusApp({
  router,
  baseProviders: [nexusAdminProvider, appProvider]
})
`
  writeFileSync(resolve(targetDir, 'src/main.js'), mainContent)
  console.log(`  ${green('✓')} src/main.js`)

  // src/App.vue
  writeFileSync(resolve(targetDir, 'src/App.vue'), `<template>
  <AppRoot />
</template>

<script setup>
import { AppRoot } from 'nexus-admin-core'
</script>
`)
  console.log(`  ${green('✓')} src/App.vue`)

  // src/router/index.js
  const routerContent = `export default [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../pages/Dashboard.vue'),
    meta: { title: '控制台', icon: 'Platform', sort: 1 }
  }
]
`
  writeFileSync(resolve(targetDir, 'src/router/index.js'), routerContent)
  console.log(`  ${green('✓')} src/router/index.js`)

  // src/providers/app.js
  const providerContent = `export default {
  name: '${finalName}',

  install({ app, router }) {
    // 在此注册业务组件、指令、路由
  },

  async init({ configStore, userStore, i18nStore }) {
    // 在此初始化业务逻辑
  }
}
`
  writeFileSync(resolve(targetDir, 'src/providers/app.js'), providerContent)
  console.log(`  ${green('✓')} src/providers/app.js`)

  // src/pages/Dashboard.vue
  const pageContent = `<template>
  <div class="dashboard">
    <h1>{{ t('dashboard.title') }}</h1>
    <p>{{ t('dashboard.welcome') }}</p>
  </div>
</template>

<script setup>
import { useI18nStore } from 'nexus-admin-core'

const { t } = useI18nStore()
</script>

<style scoped>
.dashboard {
  padding: 24px;
}
.dashboard h1 {
  font-size: 24px;
  margin-bottom: 12px;
}
</style>
`
  writeFileSync(resolve(targetDir, 'src/pages/Dashboard.vue'), pageContent)
  console.log(`  ${green('✓')} src/pages/Dashboard.vue`)

  // Mock 数据
  if (mockData) {
    mkdirSync(resolve(targetDir, 'src/mock'))
    writeFileSync(resolve(targetDir, 'src/mock/index.js'), `import { MockManager } from 'nexus-admin-core'
import { MockManager as Mock } from 'mockjs'

// 在此添加 Mock 数据
// Mock.mock('/api/user', { id: 1, name: '张三' })

export default new MockManager()
`)
    console.log(`  ${green('✓')} src/mock/index.js`)
  }

  console.log(`\n  ${green('✔')} 项目创建完成！\n`)
  console.log(`  ${bold('下一步：')}\n`)
  console.log(`    cd ${cyan(finalName)}`)
  console.log(`    ${cyan(packageManager === 'yarn' ? 'yarn' : packageManager + ' install')}`)
  console.log(`    ${cyan(packageManager === 'yarn' ? 'yarn dev' : packageManager + ' run dev')}`)
  console.log()
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})