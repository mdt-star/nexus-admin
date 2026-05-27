/**
 * 内置钩子事件清单
 *
 * 定义 nexus-admin 所有内置钩子事件的名称、触发时机和参数说明。
 * 插件开发者可参考此清单来注册需要响应的钩子。
 *
 * 使用方式：
 *   import hookManager from './hook-manager'
 *   import { HOOKS } from './hook-events'
 *   hookManager.on(HOOKS.APP.INIT, (app) => { ... })
 */

export const HOOKS = {
  // ==================== 应用生命周期 ====================
  APP: {
    /** 应用创建后，注册基础组件前触发
     *  参数: (app: Vue 应用实例) */
    INIT: 'app:init',

    /** 应用挂载到 DOM 后触发
     *  参数: (el: 挂载的 DOM 元素) */
    MOUNTED: 'app:mounted',

    /** 应用卸载前触发
     *  参数: (app: Vue 应用实例) */
    BEFORE_UNMOUNT: 'app:before-unmount',
  },

  // ==================== 配置生命周期 ====================
  CONFIG: {
    /** 加载配置前触发
     *  参数: (无) */
    BEFORE_LOAD: 'config:before-load',

    /** 配置加载完成后触发
     *  参数: (config: 合并后的完整配置对象) */
    LOADED: 'config:loaded',

    /** 配置项变更时触发
     *  参数: (key: 变更的键名, newValue: 新值, fullConfig: 完整配置) */
    CHANGED: 'config:changed',
  },

  // ==================== 主题生命周期 ====================
  THEME: {
    /** 主题切换前触发
     *  参数: (theme: 目标主题 'light'|'dark') */
    BEFORE_CHANGE: 'theme:before-change',

    /** 主题切换后触发
     *  参数: ({ theme: 当前主题, primaryColor: 当前主色调 }) */
    CHANGED: 'theme:changed',

    /** 主色调变更时触发
     *  参数: (color: 新的十六进制颜色值) */
    COLOR_CHANGE: 'theme:color-change',
  },

  // ==================== 多语言生命周期 ====================
  I18N: {
    /** 语言切换前触发
     *  参数: (locale: 目标语言代码) */
    BEFORE_CHANGE: 'i18n:before-change',

    /** 语言切换后触发
     *  参数: (locale: 当前语言代码, messages: 当前语言包) */
    CHANGED: 'i18n:changed',

    /** 语言包加载完成后触发
     *  参数: (locale: 语言代码, messages: 加载的语言包) */
    LOADED: 'i18n:loaded',
  },

  // ==================== 菜单生命周期 ====================
  MENU: {
    /** 加载菜单前触发
     *  参数: (无) */
    BEFORE_LOAD: 'menu:before-load',

    /** 菜单加载完成后触发（插件可在此修改菜单数据）
     *  参数: (menus: 菜单数组，可直接修改) */
    LOADED: 'menu:loaded',

    /** 菜单项被点击时触发
     *  参数: (item: 被点击的菜单项对象) */
    ITEM_CLICK: 'menu:item-click',
  },

  // ==================== 权限生命周期 ====================
  PERMISSION: {
    /** 权限标签加载完成后触发
     *  参数: (tags: 权限标签数组) */
    LOADED: 'permission:loaded',

    /** 权限检查时触发
     *  参数: (tag: 被检查的标签, result: 检查结果 boolean) */
    CHECK: 'permission:check',
  },

  // ==================== 窗口/Tab 生命周期 ====================
  WINDOW: {
    /** 窗口/Tab 打开时触发
     *  参数: (item: 窗口项对象) */
    OPEN: 'window:open',

    /** 窗口/Tab 关闭时触发
     *  参数: (item: 被关闭的窗口项对象) */
    CLOSE: 'window:close',

    /** 窗口/Tab 激活时触发
     *  参数: (item: 被激活的窗口项对象) */
    ACTIVATE: 'window:activate',
  },

  // ==================== 布局生命周期 ====================
  LAYOUT: {
    /** 布局切换前触发
     *  参数: (layout: 目标布局 'desktop'|'sidebar') */
    BEFORE_CHANGE: 'layout:before-change',

    /** 布局切换后触发
     *  参数: (layout: 当前布局 'desktop'|'sidebar') */
    CHANGED: 'layout:changed',
  },
}

export default HOOKS
