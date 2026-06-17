<template>
  <div>
    <header class="top-bar-custom">
      <h1 class="greeting">Merhaba {{ firstName }}</h1>
      <AppLogo class="mini-logo" />
    </header>

    <div class="card">
      <h2 style="margin-bottom: 1rem">Fırsatlar ve Duyurular</h2>
      <div v-if="loading" class="muted">Yükleniyor...</div>
      <div v-else-if="!announcements.length" class="muted">Şu an için yeni fırsat bulunmuyor.</div>
      <div v-else class="btn-stack">
        <button
          v-for="a in announcements"
          :key="a.id"
          class="btn btn-outline"
          style="width: 100%; border-radius: var(--radius-sm); padding: 1.2rem; justify-content: flex-start; text-align: left; background: var(--surface-solid);"
        >
          <div>
            <strong style="display: block; font-size: 1.05rem; margin-bottom: 0.25rem;">{{ a.title }}</strong>
            <span class="muted" style="font-size: 0.85rem; font-weight: 400">{{ a.content }}</span>
          </div>
        </button>
      </div>

      <!-- Dummy data exactly like mockup if announcements are empty -->
      <div v-if="!loading && !announcements.length" class="btn-stack" style="margin-top: 1rem">
        <button class="btn btn-outline" style="width: 100%; border-radius: var(--radius-sm); padding: 1.2rem; justify-content: flex-start; background: var(--surface-solid);">
          <strong style="font-size: 1.05rem;">%10 İndirim</strong>
        </button>
        <button class="btn btn-outline" style="width: 100%; border-radius: var(--radius-sm); padding: 1.2rem; justify-content: flex-start; background: var(--surface-solid);">
          <strong style="font-size: 1.05rem;">%10 İndirim</strong>
        </button>
        <button class="btn btn-outline" style="width: 100%; border-radius: var(--radius-sm); padding: 1.2rem; justify-content: flex-start; background: var(--surface-solid);">
          <strong style="font-size: 1.05rem;">%10 İndirim</strong>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppLogo from '../../components/AppLogo.vue'
import { api } from '../../api/client'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()
const firstName = computed(() => auth.user?.name_surname?.split(' ')[0] || 'Misafir')

const announcements = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const data = await api.publicAnnouncements()
    announcements.value = data.announcements || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>
