---
layout: home
titleTemplate: false

hero:
  name: Nexus Admin
  text: 企业级后台管理框架
  tagline: 基于 Vue 3 + Element Plus 的现代化后台管理界面基座，支持插件化扩展和双模式布局
  actions:
    - theme: brand
      text: 🚀 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 在 GitHub 上查看
      link: https://github.com/mdt-star/nexus-admin

features:
  - icon: 🧩
    title: Provider 插件机制
    details: 编程式 Provider 模型，第三方扩展包通过 install/init 方法自由注册组件、指令、路由，实现真正的插件化架构。
  - icon: 🎨
    title: 双模式布局
    details: 侧边栏模式（企业级标配）与桌面模式（Windows 风格），满足不同场景需求，响应式自动适配。
  - icon: 🌐
    title: 国际化三层合并
    details: 内置语言包 → 第三方 Provider → 后端 API 三层深合并，完美支持多语言场景。
  - icon: 🚀
    title: 开箱即用
    details: 12 个 Pinia Store、14+ 组件、路由系统、权限控制、API 封装、主题定制，全套后台能力即装即用。
  - icon: 🔌
    title: 钩子系统
    details: 全局事件系统，支持应用生命周期监听（主题切换、语言切换、菜单加载等），方便插件集成。
  - icon: 🔧
    title: Monorepo 架构
    details: npm workspace 管理，核心包与应用层分离，核心包可独立发布 npm，方便跨项目复用。
---
