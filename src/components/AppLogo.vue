<template>
  <span class="logo" :class="{ compact }" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
      <line x1="6" y1="2" x2="6" y2="4" />
      <line x1="10" y1="2" x2="10" y2="4" />
      <line x1="14" y1="2" x2="14" y2="4" />
    </svg>
    <span v-if="!compact" class="logo-text">Cafe Loyalty</span>
  </span>
</template>

<script setup>
defineProps({
  compact: { type: Boolean, default: false }
})
</script>

<style scoped>
.logo {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  color: inherit;
}

.logo svg {
  width: 1.75rem;
  height: 1.75rem;
  flex-shrink: 0;
}

.logo.compact svg {
  width: 1.5rem;
  height: 1.5rem;
}

.logo-text {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.05rem;
  letter-spacing: -0.02em;
}
</style>
