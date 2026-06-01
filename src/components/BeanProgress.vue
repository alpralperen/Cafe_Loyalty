<template>
  <div class="bean-progress">
    <div class="ring" :style="{ '--p': percent }">
      <div class="ring-inner">
        <span class="ring-value">{{ current }}</span>
        <span class="ring-of">/ {{ total }}</span>
      </div>
    </div>
    <p class="bean-progress-label">{{ label }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  current: { type: Number, default: 0 },
  total: { type: Number, default: 10 },
  label: { type: String, default: 'Ücretsiz kahveye kalan çekirdek' }
})

const percent = computed(() => {
  const mod = props.current % props.total
  const filled = mod === 0 && props.current > 0 ? props.total : mod
  return (filled / props.total) * 100
})
</script>

<style scoped>
.bean-progress {
  text-align: center;
  padding: 0.5rem 0 0.25rem;
}

.ring {
  --size: 7.5rem;
  --track: rgba(28, 22, 18, 0.08);
  --fill: var(--accent);
  width: var(--size);
  height: var(--size);
  margin: 0 auto;
  border-radius: 50%;
  background: conic-gradient(var(--fill) calc(var(--p) * 1%), var(--track) 0);
  display: grid;
  place-items: center;
  position: relative;
}

.ring::before {
  content: '';
  position: absolute;
  inset: 5px;
  border-radius: 50%;
  background: var(--surface);
}

.ring-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.1;
}

.ring-value {
  font-family: var(--font-display);
  font-size: 1.65rem;
  font-weight: 600;
  color: var(--ink);
}

.ring-of {
  font-size: 0.75rem;
  color: var(--muted);
  letter-spacing: 0.04em;
}

.bean-progress-label {
  margin: 0.75rem 0 0;
  font-size: 0.82rem;
  color: var(--muted);
  max-width: 14rem;
  margin-left: auto;
  margin-right: auto;
}
</style>
