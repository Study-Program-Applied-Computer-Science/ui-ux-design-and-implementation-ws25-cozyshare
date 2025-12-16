<template>
  <section class="groceries">
    <!-- Header + stats -->
    <div class="header-row">
      <div>
        <h2>Groceries</h2>
        <p class="subtitle">A shared shopping list for your whole household 🛒</p>
      </div>

      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-number">{{ pendingCount }}</div>
          <div class="stat-label">Items to buy</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ purchasedTodayCount }}</div>
          <div class="stat-label">Bought today</div>
        </div>
      </div>
    </div>

    <!-- Add form -->
    <div class="card add-card">
      <h3>Add grocery item</h3>
      <form class="add-form" @submit.prevent="onSubmit">
        <div class="form-row two-cols">
          <div class="form-control">
            <label>Item</label>
            <input v-model="name" type="text" placeholder="Milk, eggs, dish soap…" />
          </div>

          <div class="form-control">
            <label>Quantity</label>
            <input v-model="quantity" type="text" placeholder="1 pack, 2 kg…" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-control">
            <label>Category</label>
            <select v-model="category">
              <option value="Produce">Produce</option>
              <option value="Snacks">Snacks</option>
              <option value="Dairy">Dairy</option>
              <option value="Meat">Meat</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Toiletries">Toiletries</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>

        <div class="form-actions">
          <button type="submit" class="btn-primary">Add to list</button>
        </div>
      </form>
    </div>

    <!-- Tabs: active list vs history -->
    <div class="tabs">
      <button class="tab-btn" :class="{ active: activeTab === 'list' }" @click="activeTab = 'list'">
        Current list
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'history' }"
        @click="activeTab = 'history'"
      >
        Purchase history
      </button>

      <button class="refresh-btn" @click="fetchAll">Refresh</button>
    </div>

    <!-- CURRENT LIST -->
    <div v-if="activeTab === 'list'" class="card list-card">
      <h3>Shared grocery list</h3>
      <p class="list-subtitle">Only pending items appear here. Purchased items go to history.</p>

      <!-- FILTER BAR (NO Purchased option anymore) -->
      <div class="filter-bar">
        <input
          v-model="searchText"
          type="text"
          class="filter-input"
          placeholder="Search groceries…"
        />

        <select v-model="filterCategory" class="filter-select">
          <option value="All">All categories</option>
          <option value="Produce">Produce</option>
          <option value="Snacks">Snacks</option>
          <option value="Dairy">Dairy</option>
          <option value="Meat">Meat</option>
          <option value="Cleaning">Cleaning</option>
          <option value="Toiletries">Toiletries</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div v-if="isLoading" class="loading">Loading groceries…</div>

      <div v-else>
        <div v-if="filteredGroceries.length === 0" class="empty-msg">
          No pending groceries match your filter.
        </div>

        <GroceryItem
          v-for="item in filteredGroceries"
          :key="item._id"
          :grocery="item"
          @toggle="handleToggle"
          @delete="handleDelete"
        />
      </div>
    </div>

    <!-- HISTORY -->
    <div v-else class="card list-card">
      <h3>Grocery history</h3>
      <p class="list-subtitle">Recently purchased items appear here.</p>

      <div v-if="isLoadingHistory" class="loading">Loading history…</div>

      <div v-else>
        <div v-if="history.length === 0" class="empty-msg">No purchase history yet.</div>

        <GroceryHistoryItem v-for="item in history" :key="item._id" :item="item" />
      </div>
    </div>

    <!-- Undo toast -->
    <BaseToast
      :show="toast.show"
      :message="toast.message"
      actionText="Undo"
      @action="undoLastPurchase"
      @close="hideToast"
    />
  </section>
</template>

<script>
import axios from 'axios'
import GroceryItem from '../components/groceries/GroceryItem.vue'
import GroceryHistoryItem from '../components/groceries/GroceryHistoryItem.vue'
import BaseToast from '../components/ui/BaseToast.vue'

export default {
  name: 'GroceriesPage',

  components: {
    GroceryItem,
    GroceryHistoryItem,
    BaseToast,
  },

  data() {
    return {
      groceries: [],
      history: [],
      isLoading: false,
      isLoadingHistory: false,
      errorMessage: '',
      activeTab: 'list',

      // form
      name: '',
      quantity: '1',
      category: 'Produce',

      // filters
      filterCategory: 'All',
      searchText: '',

      // toast + undo
      toast: {
        show: false,
        message: '',
        timer: null,
        lastUndoId: null, // grocery id to toggle back
      },
    }
  },

  computed: {
    currentUser() {
      return this.$store.getters.currentUser
    },
    householdCode() {
      return this.$store.getters.householdCode
    },

    pendingCount() {
      return this.groceries.filter((g) => !g.isPurchased).length
    },

    purchasedTodayCount() {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      return this.history.filter((h) => {
        if (!h.purchasedAt) return false
        const d = new Date(h.purchasedAt)
        d.setHours(0, 0, 0, 0)
        return d.getTime() === today.getTime()
      }).length
    },

    //  IMPORTANT: current list shows ONLY pending items
    filteredGroceries() {
      const q = this.searchText.trim().toLowerCase()

      return this.groceries
        .filter((g) => !g.isPurchased) // <--- purchased items never show in current list
        .filter((g) => {
          const cat = g.category || 'Other'
          const categoryOk = this.filterCategory === 'All' || cat === this.filterCategory
          const searchOk = !q || (g.name || '').toLowerCase().includes(q)
          return categoryOk && searchOk
        })
    },
  },

  watch: {
    householdCode(newVal, oldVal) {
      if (newVal && newVal !== oldVal) {
        this.fetchAll()
      }
    },
  },

  methods: {
    async fetchGroceries() {
      if (!this.householdCode) return
      this.isLoading = true
      try {
        const res = await axios.get('http://localhost:5000/api/groceries', {
          params: { householdCode: this.householdCode },
        })
        this.groceries = res.data || []
      } catch (err) {
        console.error('Fetch groceries error', err)
      } finally {
        this.isLoading = false
      }
    },

    async fetchHistory() {
      if (!this.householdCode) return
      this.isLoadingHistory = true
      try {
        const res = await axios.get('http://localhost:5000/api/groceries/history', {
          params: { householdCode: this.householdCode, limit: 50 },
        })
        this.history = res.data || []
      } catch (err) {
        console.error('Fetch grocery history error', err)
      } finally {
        this.isLoadingHistory = false
      }
    },

    async fetchAll() {
      await Promise.all([this.fetchGroceries(), this.fetchHistory()])
    },

    async onSubmit() {
      this.errorMessage = ''

      if (!this.name) {
        this.errorMessage = 'Item name is required.'
        return
      }

      if (!this.currentUser || !this.householdCode) {
        this.errorMessage = 'No user/household. Please login again.'
        return
      }

      try {
        const body = {
          name: this.name,
          quantity: this.quantity,
          category: this.category,
          householdCode: this.householdCode,
          addedBy: this.currentUser.name || this.currentUser.email,
        }

        const res = await axios.post('http://localhost:5000/api/groceries', body)
        this.groceries.push(res.data)

        this.name = ''
        this.quantity = '1'
        this.category = 'Produce'
      } catch (err) {
        console.error('Create grocery error', err)
        this.errorMessage = err.response?.data?.message || 'Error adding grocery item.'
      }
    },

    showToast(message, undoId) {
      // clear existing timer
      if (this.toast.timer) clearTimeout(this.toast.timer)

      this.toast.show = true
      this.toast.message = message
      this.toast.lastUndoId = undoId

      // auto hide after 5 seconds
      this.toast.timer = setTimeout(() => {
        this.hideToast()
      }, 5000)
    },

    hideToast() {
      if (this.toast.timer) clearTimeout(this.toast.timer)
      this.toast.show = false
      this.toast.message = ''
      this.toast.timer = null
      this.toast.lastUndoId = null
    },

    async undoLastPurchase() {
      const id = this.toast.lastUndoId
      if (!id) return
      this.hideToast()
      // Toggle back to pending by calling the same endpoint again
      await this.handleToggle(id, { silentToast: true })
    },

    //  toggling purchase shows undo toast only when marking as purchased
    async handleToggle(id, opts = {}) {
      if (!this.currentUser) return

      const before = this.groceries.find((g) => g._id === id)
      const wasPurchased = !!before?.isPurchased

      try {
        const res = await axios.patch(`http://localhost:5000/api/groceries/${id}/toggle`, {
          currentUser: this.currentUser.name || this.currentUser.email,
        })

        const updated = res.data

        this.groceries = this.groceries.map((g) => (g._id === updated._id ? updated : g))
        await this.fetchHistory()

        // If it became purchased now (pending -> purchased), show undo toast
        if (!wasPurchased && updated.isPurchased && !opts.silentToast) {
          const itemName = updated.name || 'Item'
          this.showToast(`✅ “${itemName}” marked as purchased`, updated._id)
        }
      } catch (err) {
        console.error('Toggle grocery error', err)
        alert(err.response?.data?.message || 'Could not update grocery item.')
      }
    },

    async handleDelete(id) {
      try {
        await axios.delete(`http://localhost:5000/api/groceries/${id}`)
        this.groceries = this.groceries.filter((g) => g._id !== id)
      } catch (err) {
        console.error('Delete grocery error', err)
        alert('Could not delete item.')
      }
    },
  },

  mounted() {
    if (this.householdCode) {
      this.fetchAll()
    }
  },
}
</script>

<style scoped>
.groceries {
  max-width: 900px;
  margin: 0 auto;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.header-row h2 {
  margin: 0;
  color: var(--navy);
}

.subtitle {
  margin: 4px 0 0;
  color: var(--text-light);
  font-size: 0.9rem;
}

.stats-row {
  display: flex;
  gap: 8px;
}

.stat-card {
  padding: 6px 10px;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--primary-light), var(--pink));
  border: 1px solid var(--card-border);
  box-shadow: var(--soft-shadow);
  min-width: 90px;
}

.stat-number {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--navy);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-light);
}

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
  margin-bottom: 6px;
  color: var(--navy);
}

.list-subtitle {
  margin: 0 0 8px;
  font-size: 0.85rem;
  color: var(--text-light);
}

.add-form {
  margin-top: 4px;
}

.form-row {
  margin-bottom: 10px;
}

.two-cols {
  display: grid;
  grid-template-columns: 1.4fr 0.8fr;
  gap: 10px;
}

.form-control label {
  display: block;
  font-size: 0.85rem;
  color: var(--text-light);
}

.form-control input,
.form-control select {
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

.error-msg {
  margin-top: 4px;
  font-size: 0.8rem;
  color: #b91c1c;
}

/* tabs */
.tabs {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.tab-btn {
  border-radius: 999px;
  border: 1px solid var(--card-border);
  padding: 4px 12px;
  font-size: 0.85rem;
  background: var(--primary-light);
  cursor: pointer;
}

.tab-btn.active {
  background: var(--primary);
  color: #fff;
}

.refresh-btn {
  margin-left: auto;
  border-radius: 999px;
  border: none;
  padding: 4px 10px;
  font-size: 0.8rem;
  background: var(--primary-light);
  cursor: pointer;
}

/* filter bar */
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 10px 0 12px;
}

.filter-input {
  flex: 1;
  min-width: 180px;
  padding: 8px 10px;
  border-radius: 12px;
  border: 1px solid #d1d5db;
  font-size: 0.9rem;
}

.filter-select {
  padding: 8px 10px;
  border-radius: 12px;
  border: 1px solid #d1d5db;
  font-size: 0.9rem;
  background: #fff;
}

.loading {
  font-size: 0.85rem;
  color: var(--text-light);
}

.empty-msg {
  font-size: 0.85rem;
  color: var(--text-light);
}
</style>
