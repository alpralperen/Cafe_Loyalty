<template>
  <nav class="bottom-nav">
    <router-link to="/firsatlar" class="nav-item" active-class="active">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
      </svg>
    </router-link>
    <router-link to="/panel" class="nav-item" active-class="active">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" transform="rotate(45 12 12)"></rect>
      </svg>
    </router-link>
    <router-link to="/tara" class="nav-item" active-class="active">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 7V4h3M20 7V4h-3M4 17v3h3M20 17v3h-3"></path>
        <rect x="9" y="9" width="6" height="6"></rect>
      </svg>
    </router-link>
  </nav>
</template>

<script setup>
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 65px;
  background: var(--surface-solid);
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 100;
  padding-bottom: env(safe-area-inset-bottom);
}

.nav-item {
  color: var(--muted);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.nav-item svg {
  width: 24px;
  height: 24px;
}

.nav-item.active {
  color: var(--ink);
  background: var(--border);
}
</style>
