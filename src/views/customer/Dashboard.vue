<template>
  <div>
    <header class="top-bar-custom">
      <h1 class="greeting">Merhaba {{ firstName }}</h1>
      <AppLogo class="mini-logo" />
    </header>

    <div class="card card-highlight">
      <div class="stat-grid" style="margin-bottom: 0.5rem">
        <div class="stat-box">
          <div class="value">{{ profile?.beans_count ?? 0 }}</div>
          <div class="label">Çekirdek</div>
        </div>
        <div class="stat-box accent">
          <div class="value">{{ profile?.free_coffees ?? 0 }}</div>
          <div class="label">Ücretsiz</div>
        </div>
      </div>
      <BeanProgress
        :current="beansInCycle"
        :total="10"
        :label="`${beansUntilFree} çekirdek kaldı — 10’da 1 kahve`"
      />
    </div>

    <div v-if="message" class="alert alert-success">{{ message }}</div>
    <div v-if="error" class="alert alert-error">{{ error }}</div>

      <button class="btn btn-outline" style="width: 100%; border-radius: 99px; margin-top: 1.5rem" :disabled="!profile?.free_coffees" @click="useCoffee">
        Hediye kahve kullanmak için
      </button>

    <div v-if="redeemToken" class="card card-highlight">
      <p class="page-eyebrow">Kasiyere gösterin</p>
      <h2 style="margin-bottom: 0.35rem">Ücretsiz kahve QR</h2>
      <p class="muted qr-frame-label">{{ redeemTtl }} saniye geçerli</p>
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

    <button class="btn btn-outline" @click="logout">Çıkış yap</button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLogo from '../../components/AppLogo.vue'
import QrDisplay from '../../components/QrDisplay.vue'
import BeanProgress from '../../components/BeanProgress.vue'
import { api } from '../../api/client'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const profile = ref(auth.user)
const beansUntilFree = ref(10)
const logs = ref([])
const message = ref('')
const error = ref('')
const error = ref('')
const redeemToken = ref('')
const redeemTtl = ref(120)
let pollInterval = null

const firstName = computed(
  () => profile.value?.name_surname?.split(' ')[0] || 'Misafir'
)

const beansInCycle = computed(() => (profile.value?.beans_count ?? 0) % 10)

function formatDate(d) {
  return new Date(d).toLocaleString('tr-TR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
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
    message.value = 'QR hazır — kasiyere gösterin.'
    await refresh()
    startPolling(data.token)
  } catch (e) {
    error.value = e.message
  }
}

function startPolling(tokenId) {
  if (pollInterval) clearInterval(pollInterval)
  pollInterval = setInterval(async () => {
    try {
      const res = await api.customerQrStatus(auth.userToken, tokenId)
      if (res.status === 'used') {
        clearInterval(pollInterval)
        redeemToken.value = ''
        message.value = 'Ücretsiz kahvenizi afiyetle için!'
        await refresh()
      }
    } catch (e) {
      // ignore errors during polling
    }
  }, 2500)
}

function logout() {
  auth.logoutUser()
  if (pollInterval) clearInterval(pollInterval)
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

import { onUnmounted } from 'vue'
onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
})
</script>
