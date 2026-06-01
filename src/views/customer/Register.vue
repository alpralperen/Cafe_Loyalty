<template>
  <div>
    <header style="margin-bottom: 1.25rem">
      <p class="page-eyebrow">Aramıza katıl</p>
      <h1 class="page-title">Kayıt ol</h1>
      <p class="muted" style="margin-top: 0.35rem">Bir dakikadan kısa sürer.</p>
    </header>

    <div class="card">
      <div v-if="error" class="alert alert-error">{{ error }}</div>
      <form @submit.prevent="submit">
        <label>Ad soyad</label>
        <input v-model="form.name_surname" required placeholder="Ayşe Yılmaz" autocomplete="name" />
        <label>Telefon</label>
        <input v-model="form.phone" type="tel" required placeholder="05xx xxx xx xx" autocomplete="tel" />
        <label>E-posta <span class="muted" style="text-transform: none; letter-spacing: 0">(isteğe bağlı)</span></label>
        <input v-model="form.email" type="email" placeholder="ornek@mail.com" autocomplete="email" />
        <label>Şifre</label>
        <input v-model="form.password" type="password" required minlength="6" autocomplete="new-password" />
        <button class="btn btn-primary" type="submit" :disabled="loading">
          {{ loading ? 'Kaydediliyor…' : 'Hesap oluştur' }}
        </button>
      </form>
      <p class="muted" style="text-align: center; margin-top: 1rem; font-size: 0.8rem">
        Google / iCloud — yakında
      </p>
      <router-link to="/giris" class="text-link">Zaten üye misiniz? Giriş yapın</router-link>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../../api/client'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const auth = useAuthStore()
const loading = ref(false)
const error = ref('')
const form = reactive({
  name_surname: '',
  phone: '',
  email: '',
  password: ''
})

async function submit() {
  loading.value = true
  error.value = ''
  try {
    const data = await api.register(form)
    auth.setUserSession(data.token, data.user)
    router.push('/panel')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>
