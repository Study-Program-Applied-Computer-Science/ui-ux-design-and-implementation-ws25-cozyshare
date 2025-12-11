<template>
  <div class="app-container">
    <HeaderComponent />
    <div class="main_container">
      <router-view />
    </div>
    <FooterComponent />
  </div>
</template>

<script>
import HeaderComponent from './components/nav/Header.vue'
import FooterComponent from './components/nav/Footer.vue'

export default {
  components: {
    HeaderComponent,
    FooterComponent,
  },
}
</script>

<style>
body {
  margin: 0;
  font-family:
    system-ui,
    -apple-system,
    'Segoe UI',
    Roboto,
    sans-serif;
  background: var(--cream);
  color: var(--text-dark);
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main_container {
  flex: 1;
  max-width: 960px;
  margin: 0 auto;
  padding: 1rem 1rem 2rem;
}
</style>
