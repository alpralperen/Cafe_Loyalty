<template>
  <div>
    <section class="card card-highlight hero" style="text-align: center; display: flex; flex-direction: column; align-items: center; padding: 3rem 1.5rem;">
      <AppLogo style="transform: scale(1.6); margin-bottom: 2rem;" />
      <p class="page-eyebrow">Dijital sadakat</p>
      <h1 style="margin-top: 0.5rem;">Kahveniz,<br />çekirdekleriniz.</h1>
      <p class="muted">
        Kart taşımadan biriktirin. Her 10 çekirdekte bir fincan bizden.
      </p>
      <div class="chip-row">
        <span class="chip">30 sn kayıt</span>
        <span class="chip">Güvenli QR</span>
        <span class="chip">Uygulama yok</span>
      </div>
      <router-link v-if="!auth.isLoggedIn" to="/kayit" class="btn btn-primary" style="margin-top: 1.5rem">
        Başla
      </router-link>
      <router-link v-else to="/panel" class="btn btn-primary" style="margin-top: 1.5rem">
        Panelime git
      </router-link>
    </section>

    <section v-if="announcements.length" class="card">
      <p class="page-eyebrow">Kafeden</p>
      <h2 class="page-title" style="font-size: 1.25rem; margin-bottom: 1rem">Duyurular</h2>
      <article v-for="a in announcements" :key="a.id" class="announcement">
        <h3>{{ a.title }}</h3>
        <p class="muted">{{ a.content }}</p>
      </article>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { api } from '../api/client'
import AppLogo from '../components/AppLogo.vue'

const auth = useAuthStore()
const announcements = ref([])

onMounted(async () => {
  try {
    const data = await api.publicAnnouncements()
    announcements.value = data.announcements || []
  } catch {
    announcements.value = []
  }
})
</script>
