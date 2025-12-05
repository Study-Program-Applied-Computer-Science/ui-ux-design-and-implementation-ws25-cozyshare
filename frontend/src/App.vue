<template>
  <div class="app-root">
    <!-- BEFORE LOGIN: only show branded login screen -->
    <div v-if="!user" class="login-shell">
      <header class="app-header">
        <h1>CozyShare</h1>
        <p class="tagline">Your shared home, beautifully organized</p>
      </header>

      <div class="login-card">
        <!-- use the event name that Login.vue emits -->
        <Login @authenticated="setUser" />
        <!-- If your Login emits 'user-authenticated',
             change to:  @user-authenticated="setUser" -->
      </div>
    </div>

    <!-- AFTER LOGIN: full app with tabs -->
    <div v-else class="app-shell">
      <header class="app-header app-header-logged">
        <div>
          <h1>CozyShare</h1>
          <p class="tagline">Hi {{ user.name }}, welcome back to your cozy home</p>
          <p class="household">
            Household code:
            <strong>{{ user.householdCode || 'N/A' }}</strong>
          </p>
        </div>

        <button class="btn logout-btn" @click="logout">Logout</button>
      </header>

      <!-- Navigation tabs -->
      <nav class="nav-bar">
        <button
          v-for="t in tabs"
          :key="t.id"
          :class="['nav-btn', { active: activeTab === t.id }]"
          @click="activeTab = t.id"
        >
          {{ t.label }}
        </button>
      </nav>

      <!-- Main content card -->
      <main class="content-area">
        <NoticeBoard v-if="activeTab === 'home'" :currentUser="user" />

        <Chores v-else-if="activeTab === 'chores'" :currentUser="user" />

        <Groceries v-else-if="activeTab === 'groceries'" :currentUser="user" />
      </main>
    </div>
  </div>
</template>

<script>
import Login from './views/Login.vue'
import NoticeBoard from './views/NoticeBoard.vue'
import Chores from './views/Chores.vue'
import Groceries from './views/Groceries.vue'

export default {
  name: 'App',

  components: {
    Login,
    NoticeBoard,
    Chores,
    Groceries,
  },

  data() {
    return {
      user: null,
      activeTab: 'home',
      tabs: [
        { id: 'home', label: 'Home' },
        { id: 'chores', label: 'Chores' },
        { id: 'groceries', label: 'Groceries' },
      ],
    }
  },

  methods: {
    setUser(userData) {
      this.user = userData
      this.activeTab = 'home'
      localStorage.setItem('cozyshare_user', JSON.stringify(userData))
    },
    logout() {
      this.user = null
      this.activeTab = 'home'
      localStorage.removeItem('cozyshare_user')
    },
  },

  mounted() {
    const stored = localStorage.getItem('cozyshare_user')
    if (stored) {
      this.user = JSON.parse(stored)
      this.activeTab = 'home'
    }
  },
}
</script>

<style scoped>
.app-root {
  min-height: 100vh;
  background: var(--cream);
}

/* ---------- BEFORE LOGIN ---------- */
.login-shell {
  max-width: 900px;
  margin: 0 auto;
  padding: 30px 16px 40px;
}

.login-card {
  max-width: 480px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 18px;
  padding: 20px 18px;
  box-shadow: var(--soft-shadow);
}

/* ---------- AFTER LOGIN ---------- */
.app-shell {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px 16px 40px;
}

/* HEADER (shared) */
.app-header {
  text-align: center;
  margin-bottom: 16px;
}

.app-header-logged {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  text-align: left;
}

.app-header h1 {
  color: var(--navy);
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: 0.03em;
}

.tagline {
  font-size: 0.9rem;
  color: var(--text-light);
  margin-top: 4px;
}

.household {
  margin-top: 4px;
  font-size: 0.85rem;
  color: var(--text-light);
}

/* LOGOUT BUTTON */
.logout-btn {
  border: none;
  border-radius: 999px;
  padding: 8px 16px;
  background: var(--peach);
  color: var(--navy);
  font-weight: 600;
  cursor: pointer;
}

/* NAV TABS */
.nav-bar {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 18px;
}

.nav-btn {
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid var(--primary);
  background: var(--primary-light);
  color: var(--navy);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.nav-btn.active {
  background: var(--primary);
  color: #ffffff;
}

/* CONTENT CARD */
.content-area {
  background: var(--card-bg);
  border-radius: 18px;
  padding: 18px 16px 22px;
  box-shadow: var(--soft-shadow);
}
</style>
