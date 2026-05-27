/**
 * 多语言状态管理
 * 语言包由后端提供，前端动态加载
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import hookManager from '../utils/hook-manager'
import { useConfigStore } from './config'

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
   * 设置语言
   * @param {string} lang - 语言代码，如 'zh-CN', 'en'
   */
  async function setLocale(lang) {
    // 触发语言切换前钩子
    await hookManager.emit('i18n:before-change', lang)

    if (!messages.value[lang]) {
      await loadLocale(lang)
    }
    locale.value = lang
    await configStore.setUserConfig('locale', lang)
    await hookManager.emit('i18n:changed', lang, messages.value[lang])
  }

  /**
   * 从后端加载语言包
   * @param {string} lang
   */
  async function loadLocale(lang) {
    try {
      const { getI18nMessages } = await import('../services/api')
      const response = await getI18nMessages(lang)
      messages.value[lang] = response.data || {}
    } catch (e) {
      console.warn(`[NexusAdmin] 加载语言包 "${lang}" 失败:`, e)
      messages.value[lang] = {}
    }

    // 触发语言包加载完成钩子
    await hookManager.emit('i18n:loaded', lang, messages.value[lang])
  }

  /**
   * 初始化语言
   */
  async function init() {
    if (!messages.value[locale.value]) {
      await loadLocale(locale.value)
    }
  }

  return {
    locale,
    messages,
    currentMessages,
    t,
    setLocale,
    loadLocale,
    init
  }
})
