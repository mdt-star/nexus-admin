/**
 * 用户认证状态管理
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authApi from '../services/auth'

export const useUserStore = defineStore('nexus-user', () => {
  // 当前用户信息
  const user = ref(null)

  // 是否已登录
  const isLoggedIn = computed(() => !!user.value)

  // 登录 token
  const token = ref(localStorage.getItem('nexus-admin-token') || '')

  /**
   * 登录
   * 成功时返回 response.data（包含 token、user、redirectPath 等字段）
   * @param {string} username
   * @param {string} password
   * @returns {object|null} response.data 或 null
   */
  async function login(username, password) {
    const response = await authApi.login(username, password)
    if (response.data && response.data.token) {
      token.value = response.data.token
      user.value = response.data.user
      localStorage.setItem('nexus-admin-token', response.data.token)
      return response.data
    }
    return null
  }

  /**
   * 从 localStorage 恢复登录状态
   * 使用静默模式（_silentError: true），避免在应用初始化时弹出错误提示
   */
  async function restoreSession() {
    if (!token.value) return false
    try {
      const response = await authApi.currentUser({ _silentError: true })
      if (response.data) {
        console.log('Session restored for user:', response.data)
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
      await authApi.logout()
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