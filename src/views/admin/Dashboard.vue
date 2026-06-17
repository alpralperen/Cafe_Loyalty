<template>
  <div class="page-admin">
    <header class="auth-header" style="display: flex; flex-direction: column; align-items: center; justify-content: center; margin-bottom: 2rem; margin-top: 1rem;">
      <AppLogo style="transform: scale(1.6);" />
      <h2 style="margin-top: 1.5rem; font-size: 1.25rem;">Merhaba, {{ auth.admin?.display_name }}</h2>
    </header>

    <div>
      <div v-if="warnings.length" class="alert alert-warn">
        <div v-for="(w, i) in warnings" :key="i">{{ w }}</div>
      </div>


      <div class="card">
        <p class="page-eyebrow">Kazanma</p>
        <h2>Çekirdek QR</h2>
        <label>Kahve adedi</label>
        <input v-model.number="beansAmount" type="number" min="1" max="20" />
        <button class="btn btn-primary" :disabled="creating" @click="createQr">
          {{ creating ? 'Oluşturuluyor…' : 'QR oluştur' }}
        </button>
        <div v-if="scanSuccessMsg" class="alert alert-success" style="margin-top:1rem;">{{ scanSuccessMsg }}</div>
        <div v-if="earnToken" class="divider"></div>
        <div v-if="earnToken">
          <p class="qr-frame-label">{{ earnTtl }} sn geçerli · tek kullanımlık</p>
          <QrDisplay :value="earnToken" />
        </div>
      </div>

      <div class="card">
        <p class="page-eyebrow">Ödül</p>
        <h2>Ücretsiz kahve</h2>
        <p class="muted">Müşteri panelindeki QR kodu taratın.</p>
        <div v-if="redeemMsg" class="alert alert-success">{{ redeemMsg }}</div>
        <div v-if="redeemErr" class="alert alert-error">{{ redeemErr }}</div>
        <QrScanner v-if="scanRedeem" hint="Müşteri QR kodunu taratın" @scan="onRedeemScan" />
        <div v-else class="btn-stack">
          <button class="btn btn-accent" @click="scanRedeem = true">Kamerayı aç</button>
        </div>
        <button v-if="scanRedeem" class="btn btn-outline" style="margin-top: 0.65rem" @click="scanRedeem = false">
          İptal
        </button>
      </div>

      <div class="card">
        <p class="page-eyebrow">Müşterilere</p>
        <h2>Duyurular</h2>
        <div v-if="announcements.length === 0" class="muted" style="margin-top: 1rem;">Kayıtlı duyuru bulunmuyor.</div>
        <div v-for="a in announcements" :key="a.id" class="announcement" style="margin-top: 1rem;">
          <h3>{{ a.title }}</h3>
          <p class="muted">{{ a.content }}</p>
          <button class="btn btn-outline btn-sm" @click="toggleAnnouncement(a)">
            {{ a.is_active ? 'Pasif yap' : 'Aktif yap' }}
          </button>
        </div>
      </div>

      <button class="btn btn-outline" @click="logoutAdmin">Çıkış</button>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLogo from '../../components/AppLogo.vue'
import QrDisplay from '../../components/QrDisplay.vue'
import QrScanner from '../../components/QrScanner.vue'
import { api } from '../../api/client'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const auth = useAuthStore()
const creating = ref(false)
const error = ref('')
const beansAmount = ref(1)
const earnToken = ref('')
const earnTtl = ref(300)
const stats = ref(null)
const warnings = ref([])
const scanRedeem = ref(false)
const redeemMsg = ref('')
const redeemErr = ref('')
const announcements = ref([])
const scanSuccessMsg = ref('')
let pollInterval = null
let redeemBusy = false


async function loadAdminData() {
  const s = await api.adminStats(auth.adminToken)
  stats.value = s.today
  const ann = await api.adminAnnouncements(auth.adminToken)
  announcements.value = ann.announcements || []
}

async function createQr() {
  creating.value = true
  warnings.value = []
  scanSuccessMsg.value = ''
  if (pollInterval) clearInterval(pollInterval)
  try {
    const data = await api.adminQrCreate(auth.adminToken, beansAmount.value)
    earnToken.value = data.token
    earnTtl.value = data.expires_in_seconds
    warnings.value = data.warnings || []
    stats.value = data.daily_stats
    startPolling(data.token)
  } catch (e) {
    error.value = e.message
  } finally {
    creating.value = false
  }
}

function startPolling(tokenId) {
  if (pollInterval) clearInterval(pollInterval)
  pollInterval = setInterval(async () => {
    try {
      const res = await api.adminQrStatus(auth.adminToken, tokenId)
      if (res.status === 'used') {
        clearInterval(pollInterval)
        earnToken.value = ''
        scanSuccessMsg.value = `Müşteri başarıyla taradı! (${res.beans_amount} çekirdek eklendi)`
        await loadAdminData()
      }
    } catch (e) {
      // ignore
    }
  }, 2500)
}

async function onRedeemScan(token) {
  if (redeemBusy) return
  redeemBusy = true
  redeemErr.value = ''
  redeemMsg.value = ''
  try {
    const data = await api.adminRedeemScan(auth.adminToken, token.trim())
    redeemMsg.value = `${data.message} — ${data.user.name_surname}`
    scanRedeem.value = false
    await loadAdminData()
  } catch (e) {
    redeemErr.value = e.message
    redeemBusy = false
  }
}

async function toggleAnnouncement(a) {
  await api.adminAnnouncements(auth.adminToken, 'PUT', {
    id: a.id,
    is_active: !a.is_active
  })
  await loadAdminData()
}

function logoutAdmin() {
  auth.logoutAdmin()
  stats.value = null
  earnToken.value = ''
  scanSuccessMsg.value = ''
  if (pollInterval) clearInterval(pollInterval)
  router.push('/giris')
}

onMounted(() => {
  if (auth.adminToken) {
    loadAdminData().catch(() => auth.logoutAdmin())
  } else {
    router.push('/giris')
  }
})

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
})
</script>
