<template>
  <div>
    <header style="margin-bottom: 1.25rem">
      <p class="page-eyebrow">Tekrar hoş geldin</p>
      <h1 class="page-title">Giriş yap</h1>
    </header>

    <div class="card">
      <div v-if="error" class="alert alert-error">{{ error }}</div>
      <form @submit.prevent="submit">
        <label>Telefon</label>
        <input v-model="form.phone" type="tel" required placeholder="05xx xxx xx xx" autocomplete="tel" />
        <label>Şifre</label>
        <input v-model="form.password" type="password" required autocomplete="current-password" />
        <button class="btn btn-primary" type="submit" :disabled="loading">
          {{ loading ? 'Giriş yapılıyor…' : 'Giriş yap' }}
        </button>
      </form>
      <router-link to="/kayit" class="text-link">Hesabınız yok mu? Kayıt olun</router-link>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { api } from '../../api/client'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const loading = ref(false)
const error = ref('')
const form = reactive({ phone: '', password: '' })

async function submit() {
  loading.value = true
  error.value = ''
  try {
    const data = await api.login(form)
    auth.setUserSession(data.token, data.user)
    router.push(route.query.redirect || '/panel')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>
