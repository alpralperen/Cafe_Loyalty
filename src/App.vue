<template>
  <div class="app-shell">
    <header v-if="showHeader" class="top-bar">
      <router-link to="/" class="brand">
        <AppLogo />
      </router-link>
      <nav class="top-nav" aria-label="Ana menü">
        <router-link v-if="auth.isLoggedIn" to="/panel">Panel</router-link>
      </nav>
    </header>
    <main class="main-content" :class="{ 'with-bottom-nav': showBottomNav }">
      <router-view />
    </main>
    <BottomNav v-if="showBottomNav" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import AppLogo from './components/AppLogo.vue'
import BottomNav from './components/BottomNav.vue'

const route = useRoute()
const auth = useAuthStore()

// Hide header for customer auth pages and app pages (panel, tara, firsatlar, home)
const hideHeaderRoutes = ['home', 'login', 'register', 'dashboard', 'scan', 'offers']
const showHeader = computed(() => !route.meta.hideHeader && !hideHeaderRoutes.includes(route.name))

const bottomNavRoutes = ['dashboard', 'scan', 'offers']
const showBottomNav = computed(() => bottomNavRoutes.includes(route.name))
</script>
