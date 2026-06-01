<template>
  <div class="qr-wrap">
    <img v-if="dataUrl" :src="dataUrl" :alt="label" width="220" height="220" />
    <p v-else class="muted">QR oluşturuluyor…</p>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import QRCode from 'qrcode'

const props = defineProps({
  value: { type: String, required: true },
  label: { type: String, default: 'QR Kod' }
})

const dataUrl = ref('')

async function render() {
  if (!props.value) return
  dataUrl.value = await QRCode.toDataURL(props.value, {
    width: 220,
    margin: 2,
    color: { dark: '#1c1612', light: '#fffdf9' }
  })
}

watch(() => props.value, render)
onMounted(render)
</script>
