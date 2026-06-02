/**
 * I18nCollector 单元测试
 */
import { describe, it, expect } from 'vitest'
import { I18nCollector } from './i18n-collector'

describe('I18nCollector', () => {
  it('空构造器时 pending 为空', () => {
    const collector = new I18nCollector()
    expect(collector.flush()).toEqual([])
  })

  it('构造器接收应用层消息', () => {
    const appMessages = { 'zh-CN': { common: { save: '保存' } } }
    const collector = new I18nCollector(appMessages)
    expect(collector.flush()).toEqual([appMessages])
  })

  it('addMessages 批量添加 ({ locale: msgs })', () => {
    const collector = new I18nCollector()
    collector.addMessages({ 'zh-CN': { common: { save: '保存' } } })
    collector.addMessages({ 'en': { common: { save: 'Save' } } })
    const items = collector.flush()
    expect(items).toHaveLength(2)
    expect(items[0]).toEqual({ 'zh-CN': { common: { save: '保存' } } })
    expect(items[1]).toEqual({ 'en': { common: { save: 'Save' } } })
  })

  it('addMessages 单语言添加 (locale, msgs)', () => {
    const collector = new I18nCollector()
    collector.addMessages('zh-CN', { common: { save: '保存' } })
    const items = collector.flush()
    expect(items).toHaveLength(1)
    expect(items[0]).toEqual(['zh-CN', { common: { save: '保存' } }])
  })

  it('flush 清空队列', () => {
    const collector = new I18nCollector()
    collector.addMessages({ 'zh-CN': { test: true } })
    collector.flush() // 第一次取出
    expect(collector.flush()).toEqual([]) // 第二次应为空
  })

  it('构造器消息 + addMessages 混合', () => {
    const appMessages = { 'zh-CN': { common: { save: '保存' } } }
    const collector = new I18nCollector(appMessages)
    collector.addMessages('en', { common: { save: 'Save' } })
    const items = collector.flush()
    expect(items).toHaveLength(2)
    expect(items[0]).toEqual(appMessages)
    expect(items[1]).toEqual(['en', { common: { save: 'Save' } }])
  })
})