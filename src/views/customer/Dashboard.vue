<template>
  <div>
    <div class="card">
      <h2>Merhaba, {{ profile?.name_surname?.split(' ')[0] || 'Misafir' }}</h2>
      <div class="stat-grid">
        <div class="stat-box">
          <div class="value">{{ profile?.beans_count ?? 0 }}</div>
          <div class="label">Çekirdek</div>
        </div>
        <div class="stat-box">
          <div class="value">{{ profile?.free_coffees ?? 0 }}</div>
          <div class="label">Ücretsiz kahve</div>
        </div>
      </div>
      <p class="muted" style="margin-top: 0.75rem; text-align: center">
        Ücretsiz kahveye {{ beansUntilFree }} çekirdek kaldı (10 çekirdek = 1 kahve)
      </p>
    </div>

    <div v-if="message" class="alert alert-success">{{ message }}</div>
    <div v-if="error" class="alert alert-error">{{ error }}</div>

    <div class="card">
      <h2>İşlemler</h2>
      <router-link to="/tara" class="btn btn-primary" style="margin-bottom: 0.75rem">
        QR Tara (Çekirdek Kazan)
      </router-link>
      <button class="btn btn-accent" :disabled="!profile?.free_coffees" @click="useCoffee">
        Kahvemi Kullan
      </button>
    </div>

    <div v-if="redeemToken" class="card">
      <h2>Kasiyere Gösterin</h2>
      <p class="muted">Bu kod {{ redeemTtl }} sn geçerlidir.</p>
      <QrDisplay :value="redeemToken" label="Ücretsiz kahve QR" />
    </div>

    <div class="card">
      <h2>Geçmiş</h2>
      <div v-if="!logs.length" class="muted">Henüz işlem yok.</div>
      <div v-for="log in logs" :key="log.id" class="history-item">
        <strong>{{ log.description || log.action_type }}</strong>
        <div class="muted">{{ formatDate(log.created_at) }}</div>
      </div>
    </div>

    <button class="btn btn-outline" @click="logout">Çıkış</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import QrDisplay from '../../components/QrDisplay.vue'
import { api } from '../../api/client'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const profile = ref(auth.user)
const beansUntilFree = ref(10)
const logs = ref([])
const message = ref('')
const error = ref('')
const redeemToken = ref('')
const redeemTtl = ref(120)

function formatDate(d) {
  return new Date(d).toLocaleString('tr-TR')
}

async function refresh() {
  const data = await api.me(auth.userToken)
  profile.value = data.user
  beansUntilFree.value = data.beans_until_free
  auth.setUserSession(auth.userToken, data.user)
  const hist = await api.history(auth.userToken)
  logs.value = hist.logs || []
}

async function useCoffee() {
  error.value = ''
  message.value = ''
  try {
    const data = await api.redeemRequest(auth.userToken)
    redeemToken.value = data.token
    redeemTtl.value = data.expires_in_seconds
    message.value = 'QR kodunuz hazır — kasiyere gösterin.'
    await refresh()
  } catch (e) {
    error.value = e.message
  }
}

function logout() {
  auth.logoutUser()
  router.push('/')
}

onMounted(async () => {
  try {
    await refresh()
  } catch {
    auth.logoutUser()
    router.push('/giris')
  }
})
</script>
