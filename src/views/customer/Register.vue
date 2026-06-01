<template>
  <div class="card">
    <h2>Kayıt Ol</h2>
    <p class="muted">1 dakikadan kısa — ad, telefon ve şifre yeterli.</p>
    <div v-if="error" class="alert alert-error">{{ error }}</div>
    <form @submit.prevent="submit">
      <label>Ad Soyad</label>
      <input v-model="form.name_surname" required placeholder="Ayşe Yılmaz" />
      <label>Telefon</label>
      <input v-model="form.phone" type="tel" required placeholder="05xx xxx xx xx" />
      <label>E-posta (isteğe bağlı)</label>
      <input v-model="form.email" type="email" placeholder="ornek@mail.com" />
      <label>Şifre</label>
      <input v-model="form.password" type="password" required minlength="6" />
      <button class="btn btn-primary" type="submit" :disabled="loading">
        {{ loading ? 'Kaydediliyor…' : 'Kayıt Ol' }}
      </button>
    </form>
    <p class="muted" style="text-align: center; margin-top: 1rem">
      Google / iCloud ile giriş — V2 yol haritasında eklenecek.
    </p>
    <router-link to="/giris" class="muted" style="display: block; text-align: center">
      Zaten hesabınız var mı? Giriş yapın
    </router-link>
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
