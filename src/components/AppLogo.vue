<template>
  <span class="logo" :class="{ compact }" aria-hidden="true">
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="15" stroke="currentColor" stroke-width="1.2" opacity="0.35" />
      <path
        d="M11 14c0-3 2.2-5 5-5s5 2 5 5v2c0 4-2.5 6-5 6s-5-2-5-6v-2z"
        stroke="currentColor"
        stroke-width="1.4"
        stroke-linecap="round"
      />
      <ellipse cx="16" cy="21" rx="5" ry="2" fill="currentColor" opacity="0.85" />
      <circle cx="16" cy="10" r="1.2" fill="currentColor" />
    </svg>
    <span v-if="!compact" class="logo-text">Kafe Sadakat</span>
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
