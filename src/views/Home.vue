<template>
  <div>
    <section class="hero card">
      <h1>Dijital Sadakat Kartınız</h1>
      <p class="muted">
        Fiziksel kart yok — telefonunuzla çekirdek biriktirin, ücretsiz kahve kazanın.
      </p>
      <div class="chip-row">
        <span class="chip">&lt; 1 dk kayıt</span>
        <span class="chip">Tek kullanımlık QR</span>
        <span class="chip">Kasiyer dostu</span>
      </div>
      <router-link v-if="!auth.isLoggedIn" to="/kayit" class="btn btn-primary" style="margin-top: 1.25rem">
        Hemen Kayıt Ol
      </router-link>
      <router-link v-else to="/panel" class="btn btn-primary" style="margin-top: 1.25rem">
        Panelime Git
      </router-link>
    </section>

    <section v-if="announcements.length" class="card">
      <h2>Duyurular</h2>
      <article v-for="a in announcements" :key="a.id" style="margin-bottom: 1rem">
        <strong>{{ a.title }}</strong>
        <p class="muted" style="margin: 0.35rem 0 0">{{ a.content }}</p>
      </article>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { api } from '../api/client'

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
