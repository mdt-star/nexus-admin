import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve, relative } from 'path'
import { readdirSync, existsSync, readFileSync } from 'fs'

/**
 * nexus-admin Vite 插件
 * 自动扫描 resources/js/nexus-admin/vendor/ 下的扩展包
 * 读取 composer.json 中的 extra.nexus.nexus-admin 配置
 * 或按默认目录自动发现组件、页面、插件、指令
 */
function nexusAdminPlugin() {
  const vendorDir = resolve(__dirname, 'resources/js/nexus-admin/vendor')
  const registry = {}

  function scanVendorPackages() {
    // 只扫描 resources/js/nexus-admin/vendor/，排除 public/vendor/ 等构建产物
    const resolvedVendorDir = resolve(__dirname, 'resources/js/nexus-admin/vendor')
    if (!existsSync(resolvedVendorDir)) return

    const packages = readdirSync(resolvedVendorDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)

    packages.forEach(pkg => {
      const pkgDir = resolve(vendorDir, pkg)
      const config = loadPackageConfig(pkg, pkgDir)
      registry[pkg] = config
    })
  }

  function loadPackageConfig(pkg, pkgDir) {
    // 尝试读取 composer.json
    const composerPath = resolve(pkgDir, '../../../../composer.json')
    let nexusConfig = null

    if (existsSync(composerPath)) {
      try {
        const composer = JSON.parse(readFileSync(composerPath, 'utf-8'))
        nexusConfig = composer.extra?.nexus?.['nexus-admin']
      } catch (e) {
        // 忽略解析错误
      }
    }

    const config = {
      pages: {},
      components: {},
      directives: {},
      plugins: {}
    }

    if (nexusConfig) {
      // 使用 composer.json 中的显式声明
      if (nexusConfig.pages) {
        Object.entries(nexusConfig.pages).forEach(([key, path]) => {
          config.pages[key] = resolve(pkgDir, path)
        })
      }
      if (nexusConfig.components) {
        Object.entries(nexusConfig.components).forEach(([key, path]) => {
          config.components[key] = resolve(pkgDir, path)
        })
      }
      if (nexusConfig.directives) {
        Object.entries(nexusConfig.directives).forEach(([key, path]) => {
          config.directives[key] = resolve(pkgDir, path)
        })
      }
      if (nexusConfig.plugins) {
        Object.entries(nexusConfig.plugins).forEach(([key, pluginConfig]) => {
          config.plugins[key] = {
            ...pluginConfig,
            file: pluginConfig.component ? resolve(pkgDir, pluginConfig.component) : null
          }
        })
      }
    }

    // 如果没有显式声明 pages，自动扫描 pages/ 目录
    if (Object.keys(config.pages).length === 0) {
      const pagesDir = resolve(pkgDir, 'pages')
      if (existsSync(pagesDir)) {
        scanDirectory(pagesDir, '', config.pages, pkgDir)
      }
    }

    // 如果没有显式声明 components，自动扫描 components/ 目录
    if (Object.keys(config.components).length === 0) {
      const compDir = resolve(pkgDir, 'components')
      if (existsSync(compDir)) {
        scanDirectory(compDir, '', config.components, pkgDir, true)
      }
    }

    // 如果没有显式声明 directives，自动扫描 directives/ 目录
    if (Object.keys(config.directives).length === 0) {
      const dirDir = resolve(pkgDir, 'directives')
      if (existsSync(dirDir)) {
        scanDirectory(dirDir, '', config.directives, pkgDir)
      }
    }

    // 如果没有显式声明 plugins，自动扫描 plugins/ 目录
    if (Object.keys(config.plugins).length === 0) {
      const pluginDir = resolve(pkgDir, 'plugins')
      if (existsSync(pluginDir)) {
        scanDirectory(pluginDir, '', config.plugins, pkgDir)
      }
    }

    return config
  }

  function scanDirectory(dir, prefix, result, baseDir, isComponent = false) {
    const entries = readdirSync(dir, { withFileTypes: true })
    entries.forEach(entry => {
      const fullPath = resolve(dir, entry.name)
      if (entry.isDirectory()) {
        scanDirectory(fullPath, `${prefix}${entry.name}/`, result, baseDir, isComponent)
      } else if (entry.isFile() && (entry.name.endsWith('.vue') || entry.name.endsWith('.js'))) {
        const name = entry.name.replace(/\.(vue|js)$/, '')
        const key = isComponent
          ? name // 组件保持原名（PascalCase）
          : `${prefix}${name}`.replace(/\//g, '-').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
        result[key] = fullPath
      }
    })
  }

  return {
    name: 'nexus-admin',
    enforce: 'pre',
    buildStart() {
      scanVendorPackages()
    },
    resolveId(id) {
      if (id === 'virtual:nexus-admin-registry') {
        return '\0virtual:nexus-admin-registry'
      }
    },
    load(id) {
      if (id === '\0virtual:nexus-admin-registry') {
        return generateRegistryCode(registry)
      }
    }
  }
}

function generateRegistryCode(registry) {
  const imports = []
  const registrations = []

  Object.entries(registry).forEach(([pkg, config]) => {
    const pkgVar = pkg.replace(/[^a-zA-Z0-9_$]/g, '_')

    // Pages
    const pageEntries = Object.entries(config.pages)
    if (pageEntries.length > 0) {
      pageEntries.forEach(([key, filePath], index) => {
        const varName = `${pkgVar}_page_${index}`
        imports.push(`import ${varName} from '${filePath}'`)
        registrations.push(`pages['${pkg}']['${key}'] = ${varName}`)
      })
    }

    // Components
    const compEntries = Object.entries(config.components)
    if (compEntries.length > 0) {
      compEntries.forEach(([key, filePath], index) => {
        const varName = `${pkgVar}_comp_${index}`
        imports.push(`import ${varName} from '${filePath}'`)
        registrations.push(`components['${pkg}']['${key}'] = ${varName}`)
      })
    }

    // Directives
    const dirEntries = Object.entries(config.directives)
    if (dirEntries.length > 0) {
      dirEntries.forEach(([key, filePath], index) => {
        const varName = `${pkgVar}_dir_${index}`
        imports.push(`import ${varName} from '${filePath}'`)
        registrations.push(`directives['${pkg}']['${key}'] = ${varName}`)
      })
    }

    // Plugins
    const pluginEntries = Object.entries(config.plugins)
    if (pluginEntries.length > 0) {
      pluginEntries.forEach(([key, pluginConfig], index) => {
        if (pluginConfig.file) {
          const varName = `${pkgVar}_plugin_${index}`
          imports.push(`import ${varName} from '${pluginConfig.file}'`)
          registrations.push(`plugins['${pkg}']['${key}'] = { ...${JSON.stringify(pluginConfig)}, loader: () => ${varName} }`)
        } else {
          registrations.push(`plugins['${pkg}']['${key}'] = ${JSON.stringify(pluginConfig)}`)
        }
      })
    }
  })

  return `
// 自动生成的 nexus-admin 注册文件
// 请勿手动修改

const pages = {}
const components = {}
const directives = {}
const plugins = {}

${imports.join('\n')}

${registrations.join('\n')}

export { pages, components, directives, plugins }
`
}

export default defineConfig({
  plugins: [
    vue(),
    nexusAdminPlugin()
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'resources/js/nexus-admin')
    }
  },
  build: {
    outDir: resolve(__dirname, 'public/vendor/nexus-admin'),
    assetsDir: 'assets',
    copyPublicDir: false,
    rollupOptions: {
      input: resolve(__dirname, 'resources/js/nexus-admin/app.js'),
      output: {
        manualChunks: undefined
      }
    }
  },
  server: {
    port: 5173
  }
})
