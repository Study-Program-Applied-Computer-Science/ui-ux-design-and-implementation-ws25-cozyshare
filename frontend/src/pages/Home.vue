<template>
  <section class="home">
    <!-- HEADER + REFRESH -->
    <div class="nb-header">
      <div>
        <h2>Home / NoticeBoard</h2>
        <p class="subtitle">Share updates with your flat so nothing gets lost in chats</p>
        <!-- <p class="household-line">
          Household code:
          <strong>{{ householdCode || 'N/A' }}</strong>
        </p> -->
      </div>
      <button class="refresh-btn" @click="fetchAll">Refresh</button>
    </div>

    <!-- STATS STRIP -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon">🛒</div>
        <div>
          <div class="stat-number">{{ pendingGroceries }}</div>
          <div class="stat-label">Groceries pending</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div>
          <div class="stat-number">{{ todayChores }}</div>
          <div class="stat-label">Chores due today</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📌</div>
        <div>
          <div class="stat-number">{{ totalNotices }}</div>
          <div class="stat-label">Notices posted</div>
        </div>
      </div>
    </div>

    <!-- ADD NEW NOTICE -->
    <div class="card add-card">
      <h3>Create a new post</h3>
      <form class="add-form" @submit.prevent="onSubmit">
        <div class="form-row">
          <div class="form-control">
            <label>Title</label>
            <input
              v-model="title"
              type="text"
              placeholder="e.g. Inspection tomorrow, Party tonight..."
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-control">
            <label>Message</label>
            <textarea
              v-model="message"
              rows="3"
              placeholder="Add the details you want your flatmates to know."
            ></textarea>
          </div>
        </div>

        <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>

        <div class="form-actions">
          <button type="submit" class="btn-primary">Post to NoticeBoard</button>
        </div>
      </form>
    </div>

    <!-- NOTICES LIST -->
    <div class="card list-card">
      <div class="list-header">
        <h3>Recent Notices</h3>
        <p class="list-subtitle">Latest updates from everyone in your household.</p>
      </div>

      <div v-if="isLoading" class="loading">Loading your household feed…</div>

      <div v-else-if="notices.length > 0" class="notices-list">
        <NoticeItem
          v-for="notice in notices"
          :key="notice._id"
          :notice="notice"
          :currentUser="currentUser"
          @toggle-like="handleToggleLike"
          @add-comment="handleAddComment"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </div>

      <p v-else class="empty-message">No notices yet. Be the first to post something nice!</p>
    </div>
  </section>
</template>

<script>
import axios from 'axios'
import NoticeItem from '../components/noticeboard/NoticeItem.vue'

export default {
  name: 'HomePage',
  components: { NoticeItem },

  data() {
    return {
      title: '',
      message: '',
      notices: [],
      allGroceries: [],
      allChores: [],
      allExpenses: [],
      isLoading: false,
      errorMessage: '',
    }
  },

  computed: {
    currentUser() {
      return this.$store.getters.currentUser
    },
    householdCode() {
      return this.$store.getters.householdCode
    },
    isAuthenticated() {
      return this.$store.getters.isAuthenticated
    },

    totalNotices() {
      return this.notices.length
    },
    pendingGroceries() {
      return this.allGroceries.filter((g) => !g.isPurchased).length
    },
    todayChores() {
      const today = new Date()
      return this.allChores.filter((chore) => {
        if (!chore.dueDate) return false
        const due = new Date(chore.dueDate)
        return (
          due.getDate() === today.getDate() &&
          due.getMonth() === today.getMonth() &&
          due.getFullYear() === today.getFullYear()
        )
      }).length
    },
  },

  watch: {
    isAuthenticated(newVal) {
      if (!newVal) {
        this.$router.push('/login')
      }
    },
  },

  methods: {
    // ---------- FETCH HELPERS ----------
    async fetchNotices() {
      if (!this.householdCode) return

      const res = await axios.get('http://localhost:5000/api/notices', {
        params: { householdCode: this.householdCode },
      })

      this.notices = (res.data || []).map((n) => ({
        ...n,
        likes: Array.isArray(n.likes) ? n.likes : [],
        comments: Array.isArray(n.comments) ? n.comments : [],
      }))
    },

    async fetchGroceries() {
      if (!this.householdCode) return
      const res = await axios.get('http://localhost:5000/api/groceries', {
        params: { householdCode: this.householdCode },
      })
      this.allGroceries = res.data || []
    },

    async fetchChores() {
      if (!this.householdCode) return
      const res = await axios.get('http://localhost:5000/api/chores', {
        params: { householdCode: this.householdCode },
      })
      this.allChores = res.data || []
    },

    async fetchExpenses() {
      if (!this.householdCode) return
      const res = await axios.get('http://localhost:5000/api/expenses', {
        params: { householdCode: this.householdCode },
      })
      this.allExpenses = res.data || []
    },

    async fetchAll() {
      if (!this.householdCode) return
      this.isLoading = true
      this.errorMessage = ''
      try {
        await Promise.all([
          this.fetchNotices(),
          this.fetchGroceries(),
          this.fetchChores(),
          this.fetchExpenses(),
        ])
      } catch (err) {
        console.error('Error fetching dashboard data', err)
        this.errorMessage = err.response?.data?.message || 'Error loading household data.'
      } finally {
        this.isLoading = false
      }
    },

    // ---------- CREATE NOTICE ----------
    async onSubmit() {
      this.errorMessage = ''

      const trimmedTitle = this.title.trim()
      const trimmedMessage = this.message.trim()

      // Basic UI validation
      if (!trimmedTitle || !trimmedMessage) {
        this.errorMessage = 'Missing required fields'
        return
      }

      if (!this.householdCode || !this.currentUser) {
        this.errorMessage = 'No household set. Please login again.'
        return
      }

      try {
        const author = this.currentUser.name || this.currentUser.email

        // This is the ONLY shape we’ll send
        const body = {
          title: trimmedTitle,
          message: trimmedMessage,
          householdCode: this.householdCode,
          author,
        }

        const res = await axios.post('http://localhost:5000/api/notices', body)

        const saved = res.data || {}

        const newNotice = {
          ...saved,
          likes: Array.isArray(saved.likes) ? saved.likes : [],
          comments: Array.isArray(saved.comments) ? saved.comments : [],
        }

        this.notices.unshift(newNotice)
        this.title = ''
        this.message = ''
      } catch (err) {
        console.error('Error creating notice', err)
        console.log('Backend said:', err.response?.data)

        this.errorMessage =
          err.response?.data?.message || err.response?.data?.error || 'Error creating notice.'
      }
    },

    // ---------- CHILD EVENTS ----------
    handleLike({ id, likes }) {
      this.notices = this.notices.map((n) => (n._id === id ? { ...n, likes } : n))
    },
    async handleToggleLike(id) {
      if (!this.currentUser) return

      const me = this.currentUser.email || this.currentUser.name

      // instant UI update (optimistic)
      this.notices = this.notices.map((n) => {
        if (n._id !== id) return n
        const currentLikes = Array.isArray(n.likes) ? n.likes : []
        const alreadyLiked = currentLikes.includes(me)
        const newLikes = alreadyLiked ? currentLikes.filter((u) => u !== me) : [...currentLikes, me]
        return { ...n, likes: newLikes }
      })

      // persist to backend so it won't disappear on tab switch
      try {
        const res = await axios.patch(`http://localhost:5000/api/notices/${id}/like`, {
          user: me,
        })

        // sync the final likes from server
        this.notices = this.notices.map((n) =>
          n._id === id ? { ...n, likes: res.data.likes || [] } : n,
        )
      } catch (err) {
        console.error('Like save failed', err)
        // fallback: reload correct state
        this.fetchNotices()
      }
    },

    async handleAddComment({ id, text }) {
      if (!this.currentUser) return

      const author = this.currentUser.name || this.currentUser.email

      // instant UI update
      this.notices = this.notices.map((n) => {
        if (n._id !== id) return n
        const existing = Array.isArray(n.comments) ? n.comments : []
        return { ...n, comments: [...existing, { author, text }] }
      })

      // persist to backend so it won't disappear
      try {
        const res = await axios.post(`http://localhost:5000/api/notices/${id}/comments`, {
          author,
          text,
        })

        this.notices = this.notices.map((n) =>
          n._id === id ? { ...n, comments: res.data.comments || [] } : n,
        )
      } catch (err) {
        console.error('Comment save failed', err)
        this.fetchNotices()
      }
    },
    handleComment({ id, comments }) {
      this.notices = this.notices.map((n) => (n._id === id ? { ...n, comments } : n))
    },

    async handleEdit(notice) {
      const newTitle = window.prompt('Edit title', notice.title)
      const newMessage = window.prompt('Edit message', notice.message)

      if (newTitle === null || newMessage === null) return

      try {
        await axios.put(`http://localhost:5000/api/notices/${notice._id}`, {
          title: newTitle,
          message: newMessage,
        })

        this.notices = this.notices.map((n) =>
          n._id === notice._id ? { ...n, title: newTitle, message: newMessage } : n,
        )
      } catch (err) {
        console.error('Error updating notice', err)
        alert('Error updating notice')
      }
    },

    async handleDelete(id) {
      if (!this.currentUser) return

      const me = this.currentUser.name || this.currentUser.email

      // UI remove instantly
      const backup = [...this.notices]
      this.notices = this.notices.filter((n) => n._id !== id)

      try {
        await axios.delete(`http://localhost:5000/api/notices/${id}`, {
          data: { user: me }, // IMPORTANT: backend needs this for "only author can delete"
        })
      } catch (err) {
        console.error('Delete failed', err)
        alert(err.response?.data?.message || 'Delete failed')
        this.notices = backup // restore if delete rejected
      }
    },
  },
  mounted() {
    if (this.isAuthenticated && this.householdCode) {
      this.fetchAll()
    }
  },
}
</script>

<style scoped>
.home {
  max-width: 840px;
  margin: 0 auto;
}

/* HEADER */
.nb-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.nb-header h2 {
  margin: 0;
  color: var(--navy);
}

.subtitle {
  margin: 2px 0 0;
  color: var(--text-light);
  font-size: 0.9rem;
}

.household-line {
  margin: 2px 0 0;
  font-size: 0.85rem;
  color: var(--text-light);
}

.refresh-btn {
  border: none;
  border-radius: 999px;
  padding: 6px 12px;
  background: var(--primary-light);
  color: var(--navy);
  cursor: pointer;
  font-size: 0.85rem;
}

/* STATS */
.stats-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}

.stat-card {
  flex: 1;
  min-width: 150px;
  padding: 10px 12px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--primary-light), var(--pink));
  border: 1px solid var(--card-border);
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: var(--soft-shadow);
}

.stat-icon {
  font-size: 1.4rem;
}

.stat-number {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--navy);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-light);
}

/* CARDS */
.card {
  background: #ffffff;
  border-radius: 18px;
  padding: 14px 14px 16px;
  margin-bottom: 14px;
  box-shadow: var(--soft-shadow);
  border: 1px solid var(--card-border);
}

.add-card h3,
.list-card h3 {
  margin-top: 0;
  margin-bottom: 8px;
  color: var(--navy);
}

/* FORM */
.add-form {
  margin-top: 4px;
}

.form-row {
  margin-bottom: 10px;
}

.form-control label {
  display: block;
  font-size: 0.85rem;
  color: var(--text-light);
}

.form-control input,
.form-control textarea {
  width: 100%;
  margin-top: 4px;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  font-size: 0.9rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-primary {
  border: none;
  border-radius: 999px;
  padding: 8px 16px;
  background: linear-gradient(135deg, var(--primary), var(--peach));
  color: #ffffff;
  cursor: pointer;
  font-weight: 600;
}

/* LIST */
.list-header {
  margin-bottom: 8px;
}

.list-subtitle {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-light);
}

.empty-message {
  margin-top: 6px;
  font-size: 0.9rem;
  color: var(--text-light);
}

.loading {
  font-size: 0.85rem;
  color: var(--text-light);
}

.error-msg {
  margin-top: 4px;
  font-size: 0.8rem;
  color: #b91c1c;
}
</style>
