<template>
  <article class="grocery-item" :class="{ purchased: grocery.isPurchased }">
    <div class="left">
      <div class="top-line">
        <span class="name">{{ grocery.name }}</span>

        <span class="category-pill">
          {{ grocery.category || 'Other' }}
        </span>
      </div>

      <p class="details">
        <span v-if="grocery.quantity"> Qty: {{ grocery.quantity }} </span>
        <span v-if="grocery.addedBy"> · Added by {{ grocery.addedBy }} </span>
        <span v-if="grocery.isPurchased && grocery.purchasedBy">
          · Purchased by {{ grocery.purchasedBy }}
        </span>
      </p>
    </div>

    <div class="right">
      <button class="toggle-btn" @click.stop="toggle">
        <span v-if="grocery.isPurchased">✅ Purchased</span>
        <span v-else>Mark purchased</span>
      </button>

      <button class="delete-btn" @click.stop="remove" title="Remove item">🗑</button>
    </div>
  </article>
</template>

<script>
export default {
  name: 'GroceryItem',

  props: {
    grocery: {
      type: Object,
      required: true,
    },
  },

  emits: ['toggle', 'delete'],

  methods: {
    toggle() {
      this.$emit('toggle', this.grocery._id)
    },
    remove() {
      this.$emit('delete', this.grocery._id)
    },
  },
}
</script>

<style scoped>
.grocery-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  margin-bottom: 8px;
  border-radius: 16px;
  background: var(--primary-light);
  border: 1px solid var(--card-border);
  box-shadow: var(--soft-shadow);
}

.grocery-item.purchased {
  opacity: 0.7;
}

.left {
  flex: 1;
}

.top-line {
  display: flex;
  align-items: center;
  gap: 8px;
}

.name {
  font-weight: 700;
  color: var(--navy);
  font-size: 0.95rem;
}

.category-pill {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 999px;
  background: #fff;
  border: 1px solid rgba(148, 163, 184, 0.5);
}

.details {
  margin: 3px 0 0;
  font-size: 0.8rem;
  color: var(--text-light);
}

.right {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.toggle-btn {
  border-radius: 999px;
  border: none;
  padding: 4px 10px;
  font-size: 0.75rem;
  background: #fff;
  color: var(--navy);
  cursor: pointer;
}

.delete-btn {
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 0.9rem;
}
</style>
