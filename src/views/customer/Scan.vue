<template>
  <div>
    <header style="margin-bottom: 1.25rem">
      <p class="page-eyebrow">Kasadaki kod</p>
      <h1 class="page-title">QR tara</h1>
      <p class="muted" style="margin-top: 0.35rem">Tek kullanımlık çekirdek kodunu okutun.</p>
    </header>

    <div class="card">
      <div v-if="error" class="alert alert-error">{{ error }}</div>
      <div v-if="success" class="alert alert-success">{{ success }}</div>
      <QrScanner v-if="!success" hint="QR kodu çerçeveye hizalayın" @scan="onScan" />
      <router-link to="/panel" class="btn btn-outline" style="margin-top: 1rem">Panele dön</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import QrScanner from '../../components/QrScanner.vue'
import { api } from '../../api/client'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()
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
