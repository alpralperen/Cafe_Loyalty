import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const USER_KEY = 'cafe_sadakat_user'
const ADMIN_KEY = 'cafe_sadakat_admin'

export const useAuthStore = defineStore('auth', () => {
  const userToken = ref(localStorage.getItem(`${USER_KEY}_token`) || '')
  const user = ref(JSON.parse(localStorage.getItem(`${USER_KEY}_profile`) || 'null'))
  const adminToken = ref(localStorage.getItem(`${ADMIN_KEY}_token`) || '')
  const admin = ref(JSON.parse(localStorage.getItem(`${ADMIN_KEY}_profile`) || 'null'))

  const isLoggedIn = computed(() => !!userToken.value)

  function setUserSession(token, profile) {
    userToken.value = token
    user.value = profile
    localStorage.setItem(`${USER_KEY}_token`, token)
    localStorage.setItem(`${USER_KEY}_profile`, JSON.stringify(profile))
  }

  function logoutUser() {
    userToken.value = ''
    user.value = null
    localStorage.removeItem(`${USER_KEY}_token`)
    localStorage.removeItem(`${USER_KEY}_profile`)
  }

  function setAdminSession(token, profile) {
    adminToken.value = token
    admin.value = profile
    localStorage.setItem(`${ADMIN_KEY}_token`, token)
    localStorage.setItem(`${ADMIN_KEY}_profile`, JSON.stringify(profile))
  }

  function logoutAdmin() {
    adminToken.value = ''
    admin.value = null
    localStorage.removeItem(`${ADMIN_KEY}_token`)
    localStorage.removeItem(`${ADMIN_KEY}_profile`)
  }

  return {
    userToken,
    user,
    adminToken,
    admin,
    isLoggedIn,
    setUserSession,
    logoutUser,
    setAdminSession,
    logoutAdmin
  }
})
