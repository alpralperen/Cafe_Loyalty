<template>
  <div>
    <header class="top-bar-custom">
      <h1 class="greeting">Merhaba {{ firstName }}</h1>
      <AppLogo class="mini-logo" />
    </header>

    <div class="card">
      <div v-if="error" class="alert alert-error">{{ error }}</div>
      <div v-if="success" class="alert alert-success">{{ success }}</div>
      <QrScanner v-if="!success" hint="QR kodu çerçeveye hizalayın" @scan="onScan" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import QrScanner from '../../components/QrScanner.vue'
import AppLogo from '../../components/AppLogo.vue'
import { api } from '../../api/client'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()
const firstName = computed(() => auth.user?.name_surname?.split(' ')[0] || 'Misafir')
const error = ref('')
const success = ref('')
let busy = false

async function onScan(token) {
  if (busy) return
  busy = true
  error.value = ''
  try {
    const data = await api.scanEarn(auth.userToken, token.trim())
    success.value = data.message
    if (data.new_free_coffees > 0) {
      success.value += ` — ${data.new_free_coffees} ücretsiz kahve kazandınız!`
    }
  } catch (e) {
    error.value = e.message
    busy = false
  }
}
</script>
