/**
 * 国际化消息收集器
 *
 * 在 Provider install 阶段收集所有 i18n 消息到内部队列，
 * init 阶段由基座 Provider 回放并合并到 i18nStore。
 *
 * 使用方式：
 *   const ctx = {
 *     i18n: new I18nCollector({ 'zh-CN': zh, 'en': en })
 *   }
 *   // install 阶段自动收集
 *   provider.install(ctx)
 *   // init 阶段消费队列
 *   await loadAndInstallProviders(ctx, baseProvider)
 */
export class I18nCollector {
  /**
   * @param {object} [appMessages] - 应用层业务翻译 { 'zh-CN': {...}, 'en': {...} }
   */
  constructor(appMessages) {
    this._pending = []
    if (appMessages) {
      this._pending.push(appMessages)
    }
  }

  /**
   * 添加消息到队列
   * 支持两种调用方式：
   *   addMessages({ 'zh-CN': {...}, 'en': {...} })   — 批量
   *   addMessages('zh-CN', { ... })                   — 单语言
   */
  addMessages(lang, msgs) {
    if (typeof lang === 'object') {
      this._pending.push(lang)
    } else {
      this._pending.push([lang, msgs])
    }
  }

  /**
   * 获取暂存队列并清空
   * @returns {Array}
   */
  flush() {
    const items = this._pending
    this._pending = []
    return items
  }
}