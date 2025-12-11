<template>
  <div class="groceries-container">
    <h2>Shared Grocery List</h2>
    <p class="subtitle">Add items for your flat and mark them purchased in one tap</p>

    <!-- Add Item Form -->
    <form class="add-form" @submit="onSubmit">
      <div class="form-row">
        <div class="form-control">
          <label>Item Name</label>
          <input v-model="name" type="text" placeholder="e.g. Milk, Eggs, Soap" />
        </div>
        <div class="form-control">
          <label>Quantity</label>
          <input v-model="quantity" type="text" placeholder="e.g. 2 packs" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-control">
          <label>Category</label>
          <select v-model="category">
            <option disabled value="">Select category</option>
            <option>Produce</option>
            <option>Snacks</option>
            <option>Dairy</option>
            <option>Cleaning</option>
            <option>Drinks</option>
            <option>Other</option>
          </select>
        </div>

        <div class="form-control align-end">
          <button type="submit" class="btn btn-primary">Add Item</button>
        </div>
      </div>
    </form>

    <!-- Filters Row -->
    <div class="filters">
      <button class="chip" :class="{ active: filter === 'all' }" @click="filter = 'all'">
        All
      </button>
      <button class="chip" :class="{ active: filter === 'pending' }" @click="filter = 'pending'">
        Pending
      </button>
      <button
        class="chip"
        :class="{ active: filter === 'purchased' }"
        @click="filter = 'purchased'"
      >
        Purchased
      </button>

      <div class="chip right-chip" @click="fetchGroceries">Refresh</div>
    </div>

    <!-- Grocery Lists -->
    <div class="lists">
      <div class="list-column">
        <h3>Pending</h3>
        <GroceryItem
          v-for="item in filteredPending"
          :key="item._id"
          :grocery="item"
          @toggle="togglePurchased"
          @delete="deleteItem"
        />
        <p v-if="filteredPending.length === 0" class="empty">No pending items</p>
      </div>

      <div class="list-column">
        <h3>Purchased</h3>
        <GroceryItem
          v-for="item in filteredPurchased"
          :key="item._id"
          :grocery="item"
          @toggle="togglePurchased"
          @delete="deleteItem"
        />
        <p v-if="filteredPurchased.length === 0" class="empty">Nothing purchased yet</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import GroceryItem from '../components/groceries/GroceryItem.vue'

export default {
  name: 'Groceries',

  components: {
    GroceryItem,
  },

  props: {
    currentUser: Object, // { name, email, householdCode }
  },

  data() {
    return {
      name: '',
      quantity: '',
      category: '',
      groceries: [],
      filter: 'all', // all | pending | purchased
      refreshIntervalId: null,
    }
  },

  computed: {
    pendingItems() {
      return this.groceries.filter((g) => !g.isPurchased)
    },
    purchasedItems() {
      return this.groceries.filter((g) => g.isPurchased)
    },
    filteredPending() {
      if (this.filter === 'purchased') return []
      return this.pendingItems
    },
    filteredPurchased() {
      if (this.filter === 'pending') return []
      return this.purchasedItems
    },
  },

  methods: {
    async fetchGroceries() {
      try {
        if (!this.currentUser?.householdCode) return

        const res = await axios.get('http://localhost:5000/api/groceries', {
          params: {
            householdCode: this.currentUser.householdCode,
          },
        })

        this.groceries = res.data
      } catch (err) {
        console.error('Error fetching groceries', err)
      }
    },

    async onSubmit(e) {
      e.preventDefault()

      if (!this.name.trim()) {
        alert('Item name is required')
        return
      }

      if (!this.currentUser?.householdCode) {
        alert('No household set. Please re-login or register correctly.')
        return
      }

      try {
        const body = {
          name: this.name.trim(),
          quantity: this.quantity || '1',
          category: this.category || 'Other',
          householdCode: this.currentUser.householdCode,
          addedBy: this.currentUser.name || this.currentUser.email,
        }

        const res = await axios.post('http://localhost:5000/api/groceries', body)

        // Add new item at top
        this.groceries.unshift(res.data)

        this.name = ''
        this.quantity = ''
        this.category = ''
      } catch (err) {
        console.error('Error adding grocery', err)
        alert('Error adding grocery')
      }
    },

    async togglePurchased(id) {
      try {
        const res = await axios.patch(`http://localhost:5000/api/groceries/${id}/toggle`)

        this.groceries = this.groceries.map((g) => (g._id === id ? res.data : g))
      } catch (err) {
        console.error('Error toggling grocery', err)
      }
    },

    async deleteItem(id) {
      if (!confirm('Delete this item?')) return

      try {
        await axios.delete(`http://localhost:5000/api/groceries/${id}`)
        this.groceries = this.groceries.filter((g) => g._id !== id)
      } catch (err) {
        console.error('Error deleting grocery', err)
      }
    },
  },

  mounted() {
    this.fetchGroceries()
    // Simple "real-time" sync: auto-refresh every 5 seconds
    this.refreshIntervalId = setInterval(this.fetchGroceries, 5000)
  },

  beforeUnmount() {
    if (this.refreshIntervalId) {
      clearInterval(this.refreshIntervalId)
    }
  },
}
</script>

<style scoped>
.groceries-container {
  max-width: 900px;
  margin: 1.5rem auto;
}

.subtitle {
  margin-bottom: 1rem;
  color: #6b7280;
}

.add-form {
  border-radius: 16px;
  padding: 12px 14px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  margin-bottom: 16px;
}

.form-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.form-control {
  flex: 1;
  min-width: 180px;
  margin-bottom: 8px;
}

.form-control label {
  display: block;
  font-size: 0.85rem;
  color: #4b5563;
}

.form-control input,
.form-control select {
  width: 100%;
  margin-top: 3px;
  padding: 6px 8px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  font-size: 0.9rem;
}

.align-end {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
}

.btn-primary {
  padding: 8px 12px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  background: linear-gradient(135deg, #4f46e5, #ec4899);
  color: white;
  font-weight: 600;
}

.filters {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 10px 0 14px;
}

.chip {
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid #d1d5db;
  font-size: 0.8rem;
  background: #f9fafb;
  cursor: pointer;
}

.chip.active {
  background: #4f46e5;
  color: white;
  border-color: #4f46e5;
}

.right-chip {
  margin-left: auto;
}

.lists {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.list-column {
  flex: 1;
  min-width: 260px;
}

.list-column h3 {
  margin-bottom: 8px;
}

.empty {
  font-size: 0.85rem;
  color: #6b7280;
}
</style>
