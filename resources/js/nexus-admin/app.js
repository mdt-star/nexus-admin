/**
 * nexus-admin 应用入口
 *
 * 职责：传入差异化的应用配置，启动框架。
 */

import 'nexus-admin-core/dist/nexus-admin-core.css'
import { createNexusApp, nexusAdminProvider } from 'nexus-admin-core'
import router from './router/index'
import appProvider from './providers/app'

;(async () => {
  await createNexusApp({
    router,
    baseProviders: [nexusAdminProvider, appProvider]
  })
})()

export { createNexusApp }
