<template>
  <div class="page-admin">
    <header class="auth-header" style="display: flex; flex-direction: column; align-items: center; justify-content: center; margin-bottom: 2rem; margin-top: 1rem;">
      <AppLogo style="transform: scale(1.6);" />
      <h2 style="margin-top: 1.5rem; font-size: 1.25rem;">Yönetici Paneli</h2>
    </header>

    <div v-if="activeTab === 'cashiers'">
      <div class="card">
        <p class="page-eyebrow">Ekip</p>
        <h2>Kasiyer Ekle</h2>
        <div v-if="cashierErr" class="alert alert-error">{{ cashierErr }}</div>
        <div v-if="cashierSuccess" class="alert alert-success">{{ cashierSuccess }}</div>
        <label>İsim Soyisim</label>
        <input v-model="cashierForm.display_name" placeholder="Ahmet Yılmaz" />
        <label>Kullanıcı Adı (Giriş için)</label>
        <input v-model="cashierForm.username" placeholder="kasiyer_ahmet" />
        <label>Şifre</label>
        <input v-model="cashierForm.password" type="password" />
        <button class="btn btn-primary" :disabled="cashierBusy" @click="createCashier">
          {{ cashierBusy ? 'Ekleniyor...' : 'Kasiyer Ekle' }}
        </button>
      </div>

      <div class="card">
        <p class="page-eyebrow">Performans</p>
        <h2>Kasiyerler</h2>
        <div v-if="cashiers.length === 0" class="muted">Kayıtlı kasiyer bulunmuyor.</div>
        <div v-for="c in cashiers" :key="c.id" class="announcement" style="margin-top: 1rem; border: 1px solid var(--border); padding: 1rem; border-radius: 8px;">
          <h3>{{ c.display_name }} <span class="muted">({{ c.username }})</span></h3>
          <p style="margin-top: 0.5rem; font-size: 0.95rem; line-height: 1.5;">
            Bugün okutulan çekirdek: <strong>{{ c.successful_qr_scans }}</strong><br />
            Bugün verilen kahve: <strong>{{ c.successful_redeems }}</strong>
          </p>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'announcements'">
      <div class="card">
        <p class="page-eyebrow">Müşterilere</p>
        <h2>Duyuru Ekle</h2>
        <label>Başlık</label>
        <input v-model="annForm.title" />
        <label>İçerik</label>
        <textarea v-model="annForm.content" rows="3"></textarea>
        <button class="btn btn-primary" @click="saveAnnouncement">Yayınla</button>
      </div>

      <div class="card">
        <p class="page-eyebrow">Yönetim</p>
        <h2>Mevcut Duyurular</h2>
        <div v-if="announcements.length === 0" class="muted" style="margin-top: 1rem;">Kayıtlı duyuru bulunmuyor.</div>
        <div v-for="a in announcements" :key="a.id" class="announcement" style="margin-top: 1rem;">
          <h3>{{ a.title }}</h3>
          <p class="muted">{{ a.content }}</p>
          <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem">
            <button class="btn btn-outline btn-sm" @click="toggleAnnouncement(a)">
              {{ a.is_active ? 'Pasif yap' : 'Aktif yap' }}
            </button>
            <button class="btn btn-outline btn-sm" style="color: var(--error); border-color: var(--error);" @click="deleteAnnouncement(a.id)">
              Sil
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Manager Bottom Nav -->
    <nav class="bottom-nav">
      <button class="nav-item" :class="{ active: activeTab === 'announcements' }" @click="activeTab = 'announcements'; loadManagerData()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        <span>Duyurular</span>
      </button>
      <button class="nav-item" :class="{ active: activeTab === 'cashiers' }" @click="activeTab = 'cashiers'; loadManagerData()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <span>Kasiyerler</span>
      </button>
      <button class="nav-item" @click="logout">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        <span>Çıkış</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../../api/client'
import { useAuthStore } from '../../stores/auth'
import AppLogo from '../../components/AppLogo.vue'

const router = useRouter()
const auth = useAuthStore()

const activeTab = ref('cashiers')

const cashiers = ref([])
const cashierForm = reactive({ username: '', password: '', display_name: '' })
const cashierErr = ref('')
const cashierSuccess = ref('')
const cashierBusy = ref(false)

const announcements = ref([])
const annForm = reactive({ title: '', content: '' })

async function loadManagerData() {
  try {
    const cashRes = await api.managerCashiers(auth.adminToken)
    cashiers.value = cashRes.cashiers || []
    
    const annRes = await api.adminAnnouncements(auth.adminToken)
    announcements.value = annRes.announcements || []
  } catch (e) {
    if (e.status === 401 || e.status === 403) logout()
  }
}

async function createCashier() {
  cashierErr.value = ''
  cashierSuccess.value = ''
  cashierBusy.value = true
  try {
    await api.managerCashiers(auth.adminToken, 'POST', cashierForm)
    cashierSuccess.value = 'Kasiyer başarıyla eklendi!'
    cashierForm.username = ''
    cashierForm.password = ''
    cashierForm.display_name = ''
    await loadManagerData()
  } catch (e) {
    cashierErr.value = e.message
  } finally {
    cashierBusy.value = false
  }
}

async function saveAnnouncement() {
  if (!annForm.title || !annForm.content) return
  await api.adminAnnouncements(auth.adminToken, 'POST', annForm)
  annForm.title = ''
  annForm.content = ''
  await loadManagerData()
}

async function toggleAnnouncement(a) {
  await api.adminAnnouncements(auth.adminToken, 'PUT', {
    id: a.id,
    is_active: !a.is_active
  })
  await loadManagerData()
}

async function deleteAnnouncement(id) {
  if (confirm('Bu duyuruyu silmek istediğinize emin misiniz?')) {
    await api.adminAnnouncements(auth.adminToken, 'DELETE', { id })
    await loadManagerData()
  }
}

function logout() {
  auth.logoutAdmin()
  router.push('/giris')
}

onMounted(() => {
  if (auth.adminToken && auth.admin?.role === 'owner') {
    loadManagerData()
  } else {
    router.push('/giris')
  }
})
</script>

<style scoped>
.page-admin {
  padding-bottom: 5rem;
}
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4.5rem;
  background: var(--surface);
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 50;
}
.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 0.75rem;
  cursor: pointer;
  padding: 0.5rem;
}
.nav-item.active {
  color: var(--primary);
}
.nav-item svg {
  width: 1.5rem;
  height: 1.5rem;
}
</style>
