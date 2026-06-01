<template>
  <div>
    <div :id="elementId" class="scanner-box"></div>
    <p v-if="hint" class="muted" style="text-align: center; margin-top: 0.5rem">{{ hint }}</p>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'

const props = defineProps({
  hint: { type: String, default: 'QR kodu kameraya gösterin' }
})

const emit = defineEmits(['scan'])
const elementId = `qr-scanner-${Math.random().toString(36).slice(2)}`
const scanner = ref(null)
let handled = false

onMounted(async () => {
  scanner.value = new Html5Qrcode(elementId)
  try {
    await scanner.value.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 240, height: 240 } },
      (decoded) => {
        if (handled) return
        handled = true
        emit('scan', decoded)
        scanner.value?.stop().catch(() => {})
      },
      () => {}
    )
  } catch (e) {
    console.error(e)
  }
})

onUnmounted(() => {
  scanner.value?.stop().catch(() => {})
})
</script>
