<template>
  <div class="card">
    <h2>Giriş Yap</h2>
    <div v-if="error" class="alert alert-error">{{ error }}</div>
    <form @submit.prevent="submit">
      <label>Telefon</label>
      <input v-model="form.phone" type="tel" required placeholder="05xx xxx xx xx" />
      <label>Şifre</label>
      <input v-model="form.password" type="password" required />
      <button class="btn btn-primary" type="submit" :disabled="loading">
        {{ loading ? 'Giriş…' : 'Giriş Yap' }}
      </button>
    </form>
    <router-link to="/kayit" class="muted" style="display: block; text-align: center; margin-top: 1rem">
      Hesabınız yok mu? Kayıt olun
    </router-link>
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
