<template>
  <div class="admin-shell">
    <header class="admin-header">
      <router-link to="/" class="back-link">← Ana sayfa</router-link>
      <h1>Kasiyer / Admin</h1>
    </header>

    <div v-if="!auth.adminToken" class="card">
      <h2>Giriş</h2>
      <div v-if="error" class="alert alert-error">{{ error }}</div>
      <form @submit.prevent="login">
        <label>Kullanıcı adı</label>
        <input v-model="loginForm.username" required autocomplete="username" />
        <label>Şifre</label>
        <input v-model="loginForm.password" type="password" required autocomplete="current-password" />
        <button class="btn btn-primary" type="submit" :disabled="loading">Giriş Yap</button>
      </form>
      <p class="muted">Varsayılan: admin / admin123 (kurulum sonrası değiştirin)</p>
    </div>

    <template v-else>
      <div v-if="warnings.length" class="alert alert-warn">
        <div v-for="(w, i) in warnings" :key="i">{{ w }}</div>
      </div>

      <div class="card">
        <p class="muted">Hoş geldin, {{ auth.admin?.display_name }}</p>
        <div class="stat-grid">
          <div class="stat-box">
            <div class="value">{{ stats?.qr_today ?? 0 }}</div>
            <div class="label">Bugün QR</div>
          </div>
          <div class="stat-box">
            <div class="value">{{ stats?.beans_today ?? 0 }}</div>
            <div class="label">Dağıtılan çekirdek</div>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>Çekirdek QR Oluştur</h2>
        <label>Kahve adedi</label>
        <input v-model.number="beansAmount" type="number" min="1" max="20" />
        <button class="btn btn-primary" :disabled="creating" @click="createQr">
          {{ creating ? 'Oluşturuluyor…' : 'QR Oluştur' }}
        </button>
        <div v-if="earnToken" style="margin-top: 1rem">
          <p class="muted">Müşteri bu kodu tarasın ({{ earnTtl }} sn geçerli, tek kullanımlık)</p>
          <QrDisplay :value="earnToken" />
        </div>
      </div>

      <div class="card">
        <h2>Ücretsiz Kahve Tarat</h2>
        <p class="muted">Müşterinin "Kahvemi Kullan" ekranındaki QR'ı okutun.</p>
        <div v-if="redeemMsg" class="alert alert-success">{{ redeemMsg }}</div>
        <div v-if="redeemErr" class="alert alert-error">{{ redeemErr }}</div>
        <QrScanner v-if="scanRedeem" hint="Müşteri QR kodunu taratın" @scan="onRedeemScan" />
        <button v-else class="btn btn-accent" @click="scanRedeem = true">Kamerayı Aç</button>
        <button v-if="scanRedeem" class="btn btn-outline" style="margin-top: 0.5rem" @click="scanRedeem = false">
          İptal
        </button>
      </div>

      <div class="card">
        <h2>Duyurular</h2>
        <label>Başlık</label>
        <input v-model="annForm.title" />
        <label>İçerik</label>
        <textarea v-model="annForm.content" rows="3"></textarea>
        <button class="btn btn-primary" @click="saveAnnouncement">Yeni Duyuru Ekle</button>
        <div v-for="a in announcements" :key="a.id" style="margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid #eee">
          <strong>{{ a.title }}</strong>
          <p class="muted">{{ a.content }}</p>
          <button class="btn btn-outline" style="width: auto; padding: 0.4rem 0.8rem" @click="toggleAnnouncement(a)">
            {{ a.is_active ? 'Pasif yap' : 'Aktif yap' }}
          </button>
        </div>
      </div>

      <button class="btn btn-outline" @click="logoutAdmin">Çıkış</button>
    </template>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import QrDisplay from '../../components/QrDisplay.vue'
import QrScanner from '../../components/QrScanner.vue'
import { api } from '../../api/client'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()
const loading = ref(false)
const creating = ref(false)
const error = ref('')
const loginForm = reactive({ username: 'admin', password: '' })
const beansAmount = ref(1)
const earnToken = ref('')
const earnTtl = ref(300)
const stats = ref(null)
const warnings = ref([])
const scanRedeem = ref(false)
const redeemMsg = ref('')
const redeemErr = ref('')
const announcements = ref([])
const annForm = reactive({ title: '', content: '' })
let redeemBusy = false

async function login() {
  loading.value = true
  error.value = ''
  try {
    const data = await api.adminLogin(loginForm)
    auth.setAdminSession(data.token, data.admin)
    await loadAdminData()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function loadAdminData() {
  const s = await api.adminStats(auth.adminToken)
  stats.value = s.today
  const ann = await api.adminAnnouncements(auth.adminToken)
  announcements.value = ann.announcements || []
}

async function createQr() {
  creating.value = true
  warnings.value = []
  try {
    const data = await api.adminQrCreate(auth.adminToken, beansAmount.value)
    earnToken.value = data.token
    earnTtl.value = data.expires_in_seconds
    warnings.value = data.warnings || []
    stats.value = data.daily_stats
  } catch (e) {
    error.value = e.message
  } finally {
    creating.value = false
  }
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

async function saveAnnouncement() {
  await api.adminAnnouncements(auth.adminToken, 'POST', annForm)
  annForm.title = ''
  annForm.content = ''
  await loadAdminData()
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
}

onMounted(() => {
  if (auth.adminToken) loadAdminData().catch(() => auth.logoutAdmin())
})
</script>

<style scoped>
.admin-shell {
  max-width: 520px;
  margin: 0 auto;
  padding: 1rem;
}

.admin-header {
  margin-bottom: 1rem;
}

.admin-header h1 {
  margin: 0.25rem 0 0;
  font-size: 1.35rem;
}

.back-link {
  font-size: 0.9rem;
  color: var(--muted);
}
</style>
