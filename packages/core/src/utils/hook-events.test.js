/**
 * Hook Events 常量单元测试
 */
import { describe, it, expect } from 'vitest'
import { HOOKS } from './hook-events'

describe('HOOKS 常量', () => {
  it('APP 生命周期', () => {
    expect(HOOKS.APP.INIT).toBe('app:init')
    expect(HOOKS.APP.MOUNTED).toBe('app:mounted')
    expect(HOOKS.APP.BEFORE_UNMOUNT).toBe('app:before-unmount')
  })

  it('CONFIG 生命周期', () => {
    expect(HOOKS.CONFIG.BEFORE_LOAD).toBe('config:before-load')
    expect(HOOKS.CONFIG.LOADED).toBe('config:loaded')
    expect(HOOKS.CONFIG.CHANGED).toBe('config:changed')
  })

  it('THEME 生命周期', () => {
    expect(HOOKS.THEME.BEFORE_CHANGE).toBe('theme:before-change')
    expect(HOOKS.THEME.CHANGED).toBe('theme:changed')
    expect(HOOKS.THEME.COLOR_CHANGE).toBe('theme:color-change')
  })

  it('I18N 生命周期', () => {
    expect(HOOKS.I18N.BEFORE_CHANGE).toBe('i18n:before-change')
    expect(HOOKS.I18N.CHANGED).toBe('i18n:changed')
    expect(HOOKS.I18N.LOADED).toBe('i18n:loaded')
  })

  it('MENU 生命周期', () => {
    expect(HOOKS.MENU.BEFORE_LOAD).toBe('menu:before-load')
    expect(HOOKS.MENU.LOADED).toBe('menu:loaded')
    expect(HOOKS.MENU.ITEM_CLICK).toBe('menu:item-click')
  })

  it('PERMISSION 生命周期', () => {
    expect(HOOKS.PERMISSION.LOADED).toBe('permission:loaded')
    expect(HOOKS.PERMISSION.CHECK).toBe('permission:check')
  })

  it('WINDOW 生命周期', () => {
    expect(HOOKS.WINDOW.OPEN).toBe('window:open')
    expect(HOOKS.WINDOW.CLOSE).toBe('window:close')
    expect(HOOKS.WINDOW.ACTIVATE).toBe('window:activate')
  })

  it('LAYOUT 生命周期', () => {
    expect(HOOKS.LAYOUT.BEFORE_CHANGE).toBe('layout:before-change')
    expect(HOOKS.LAYOUT.CHANGED).toBe('layout:changed')
  })

  it('所有常量值格式正确（namespace:event）', () => {
    const allValues = Object.values(HOOKS).flatMap(group => Object.values(group))
    allValues.forEach(value => {
      expect(value).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*:[a-z0-9]+(-[a-z0-9]+)*$/)
    })
  })
})
