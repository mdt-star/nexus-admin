/**
 * 用户认证状态管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as apiLogin, logout as apiLogout, getCurrentUser } from '../services/api'

export const useUserStore = defineStore('nexus-user', () => {
  // 当前用户信息
  const user = ref(null)

  // 是否已登录
  const isLoggedIn = computed(() => !!user.value)

  // 登录 token
  const token = ref(localStorage.getItem('nexus-admin-token') || '')

  /**
   * 登录
   * @param {string} username
   * @param {string} password
   */
  async function login(username, password) {
    const response = await apiLogin(username, password)
    if (response.data && response.data.token) {
      token.value = response.data.token
      user.value = response.data.user
      localStorage.setItem('nexus-admin-token', response.data.token)
      return true
    }
    return false
  }

  /**
   * 从 localStorage 恢复登录状态
   */
  async function restoreSession() {
    if (!token.value) return false
    try {
      const response = await getCurrentUser()
      if (response.data) {
        user.value = response.data
        return true
      }
    } catch (e) {
      // token 无效，清除
      clearSession()
    }
    return false
  }

  /**
   * 退出登录
   */
  async function logout() {
    try {
      await apiLogout()
    } catch (e) {
      // 忽略退出错误
    }
    clearSession()
  }

  /**
   * 清除登录状态
   */
  function clearSession() {
    user.value = null
    token.value = ''
    localStorage.removeItem('nexus-admin-token')
  }

  return {
    user,
    isLoggedIn,
    token,
    login,
    logout,
    restoreSession,
    clearSession
  }
})