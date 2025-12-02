<template>
  <div>
    <!-- If NOT logged in → show login page -->
    <Login v-if="!user" @authenticated="setUser" />

    <!-- If logged in → show dashboard with tabs -->
    <div v-else class="cozyshare">
      <header class="top-header">
        <div>
          <h1>Welcome to CozyShare, {{ user.name }}!</h1>
          <p class="household">
            Household code:
            <strong>{{ user.householdCode || 'N/A' }}</strong>
          </p>
        </div>

        <button class="btn logout" @click="logout">Logout</button>
      </header>

      <!-- Simple tab buttons -->
      <div class="nav-tabs">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'home' }"
          @click="activeTab = 'home'"
        >
          Home / NoticeBoard
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'chores' }"
          @click="activeTab = 'chores'"
        >
          Chores
        </button>
      </div>

      <!-- Home tab = NoticeBoard -->
      <NoticeBoard v-if="activeTab === 'home'" :currentUser="user" />

      <!-- Chores tab -->
      <Chores v-else-if="activeTab === 'chores'" :currentUser="user" />
    </div>
  </div>
</template>

<script>
import Login from './views/Login.vue'
import Chores from './views/Chores.vue'
import NoticeBoard from './views/NoticeBoard.vue'

export default {
  name: 'App',

  components: {
    Login,
    Chores,
    NoticeBoard,
  },

  data() {
    return {
      user: null,
      activeTab: 'home', // 'home' | 'chores'
    }
  },

  methods: {
    setUser(userData) {
      this.user = userData
      this.activeTab = 'home' // always start on Home after login
    },

    logout() {
      this.user = null
      this.activeTab = 'home'
      localStorage.removeItem('cozyshare_user')
    },
  },

  mounted() {
    const storedUser = localStorage.getItem('cozyshare_user')
    if (storedUser) {
      this.user = JSON.parse(storedUser)
      this.activeTab = 'home'
    }
  },
}
</script>

<style scoped>
.cozyshare {
  max-width: 900px;
  margin: 2rem auto;
}

.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 1rem;
}

.household {
  margin: 0.25rem 0 0;
  color: #555;
}

.logout {
  width: auto;
  padding: 8px 14px;
}

.nav-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.5rem;
}

.tab-btn {
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid #d1d5db;
  background: #f9fafb;
  cursor: pointer;
  font-size: 0.9rem;
}

.tab-btn.active {
  background: #4f46e5;
  color: #fff;
  border-color: #4f46e5;
}

.btn {
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
</style>
