<template>
  <div class="app-shell">
    <header v-if="showHeader" class="top-bar">
      <router-link to="/" class="brand">
        <AppLogo />
      </router-link>
      <nav class="top-nav" aria-label="Ana menü">
        <router-link v-if="!auth.isLoggedIn" to="/giris">Giriş</router-link>
        <router-link v-if="!auth.isLoggedIn" to="/kayit">Kayıt</router-link>
        <router-link v-if="auth.isLoggedIn" to="/panel">Panel</router-link>
        <router-link to="/kasiyer">Kasiyer</router-link>
      </nav>
    </header>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import AppLogo from './components/AppLogo.vue'

const route = useRoute()
const auth = useAuthStore()

const showHeader = computed(() => !route.meta.hideHeader)
</script>
