/**
 * 多语言状态管理
 *
 * 语言包合并顺序（后层优先）：
 *   1. 基座内置语言包 (base/translations.js) → addMessages()
 *   2. 第三方 Provider → addMessages()
 *   3. 后端 API → addMessages()
 *
 * 所有来源使用统一的 addMessages() 接口，内部深合并，不会相互覆盖。
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import hookManager from '../utils/hook-manager'
import { useConfigStore } from './config'
import { baseMessages } from '../base/translations'

export const useI18nStore = defineStore('nexus-i18n', () => {
  const configStore = useConfigStore()

  // 当前语言
  const locale = ref(configStore.get('locale', 'zh-CN'))

  // 语言包映射 { locale: messages }
  const messages = ref({})

  // 当前语言的翻译消息
  const currentMessages = computed(() => {
    return messages.value[locale.value] || {}
  })

  /**
   * 翻译
   * @param {string} key - 翻译键，支持点号分隔（如 "common.save"）
   * @param {object} [params] - 插值参数
   */
  function t(key, params = {}) {
    const keys = key.split('.')
    let value = currentMessages.value
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        return key // 未找到翻译，返回键名
      }
    }

    if (typeof value === 'string') {
      // 插值替换
      return value.replace(/\{(\w+)\}/g, (match, p1) => {
        return params[p1] !== undefined ? params[p1] : match
      })
    }

    return key
  }

  /**
   * 添加/合并语言包（深合并）
   *
   * 统一接口，基座、第三方 Provider、后端 API 都通过此方法注册翻译。
   * 后调用的优先级更高（后端 > Provider > 基座）。
   *
   * @param {string} lang - 语言代码，如 'zh-CN', 'en'
   * @param {object} langMessages - 翻译消息对象
   */
  function addMessages(lang, langMessages) {
    if (!messages.value[lang]) {
      messages.value[lang] = {}
    }
    messages.value[lang] = deepMerge(messages.value[lang], langMessages)
  }

  /**
   * 设置语言
   * @param {string} lang - 语言代码，如 'zh-CN', 'en'
   */
  async function setLocale(lang) {
    // 触发语言切换前钩子
    await hookManager.emit('i18n:before-change', lang)

    if (!messages.value[lang]) {
      // 先加载基座内置，再加载后端（后端优先级高）
      if (baseMessages[lang]) {
        addMessages(lang, baseMessages[lang])
      }
      await loadLocale(lang)
    }
    locale.value = lang
    await configStore.setUserConfig('locale', lang)
    await hookManager.emit('i18n:changed', lang, messages.value[lang])
  }

  /**
   * 从后端加载语言包并合并
   * 仅加载后端 API 语言包，不包含基座内置翻译
   * @param {string} lang
   */
  async function loadLocale(lang) {
    try {
      const { default: i18nApi } = await import('../services/i18n')
      const response = await i18nApi.messages(lang)
      if (response.data) {
        addMessages(lang, response.data)
      }
    } catch (e) {
      console.warn(`[NexusAdmin] 加载语言包 "${lang}" 失败:`, e)
      // 即使后端失败，也不覆盖已有翻译
    }

    // 触发语言包加载完成钩子
    await hookManager.emit('i18n:loaded', lang, messages.value[lang] || {})
  }

  /**
   * 初始化语言
   *
   * 合并顺序（后层优先，即后调用的优先级更高）：
   *   1. 基座内置语言包（本地）
   *   2. 第三方 Provider 语言包（来自 pendingMessages 队列）
   *   3. 后端语言包（远程，最高优先级）
   *
   * @param {Array} [pendingMessages] - 第三方暂存的语言包 [[lang, msgs], ...]
   */
  async function init(pendingMessages) {
    // 1. 基座内置语言包
    if (baseMessages[locale.value]) {
      addMessages(locale.value, baseMessages[locale.value])
    }

    // 2. 第三方 Provider 暂存的语言包
    if (Array.isArray(pendingMessages)) {
      for (const [lang, msgs] of pendingMessages) {
        addMessages(lang, msgs)
      }
    }

    // 3. 后端语言包（最高优先级）
    await loadLocale(locale.value)
  }

  return {
    locale,
    messages,
    currentMessages,
    t,
    addMessages,
    setLocale,
    loadLocale,
    init
  }
})

/**
 * 深合并两个对象
 * 将 source 的属性合并到 target 中，返回 target
 * 数组直接替换，对象递归合并
 *
 * @param {object} target
 * @param {object} source
 * @returns {object}
 */
function deepMerge(target, source) {
  if (!source || typeof source !== 'object') return target
  if (!target || typeof target !== 'object') return source

  for (const key of Object.keys(source)) {
    const srcVal = source[key]
    const tgtVal = target[key]

    if (Array.isArray(srcVal)) {
      // 数组直接替换
      target[key] = [...srcVal]
    } else if (srcVal && typeof srcVal === 'object') {
      // 对象递归合并
      target[key] = deepMerge(tgtVal && typeof tgtVal === 'object' ? { ...tgtVal } : {}, { ...srcVal })
    } else {
      // 基本类型直接覆盖
      target[key] = srcVal
    }
  }

  return target
}