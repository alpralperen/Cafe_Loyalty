import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/', name: 'home', component: () => import('../views/Home.vue') },
  { path: '/kayit', name: 'register', component: () => import('../views/customer/Register.vue') },
  { path: '/giris', name: 'login', component: () => import('../views/customer/Login.vue') },
  {
    path: '/panel',
    name: 'dashboard',
    component: () => import('../views/customer/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/tara',
    name: 'scan',
    component: () => import('../views/customer/Scan.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/kasiyer',
    name: 'admin',
    component: () => import('../views/admin/Dashboard.vue'),
    meta: { hideHeader: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
})

export default router
