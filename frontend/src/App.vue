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
/* CSS Reset & Base Styles */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family:
    system-ui,
    -apple-system,
    'Segoe UI',
    Roboto,
    sans-serif;
  background: var(--cream);
  color: var(--text-dark);
}

/* App Container */
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Main Content Area */
.main_container {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px 40px;
}

/* Responsive Adjustments */
@media (max-width: 1024px) {
  .main_container {
    max-width: 960px;
    padding: 20px 16px 32px;
  }
}

@media (max-width: 768px) {
  .main_container {
    padding: 16px 12px 24px;
  }
}

/* Global Form Input Alignment */
input,
select,
textarea,
button {
  font-family: inherit;
}

input[type='text'],
input[type='email'],
input[type='password'],
input[type='date'],
input[type='number'],
select,
textarea {
  width: 100%;
  box-sizing: border-box;
}
</style>
