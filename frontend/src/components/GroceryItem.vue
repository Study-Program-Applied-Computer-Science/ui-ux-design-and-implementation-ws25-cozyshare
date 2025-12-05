<template>
  <div class="grocery-card" :class="{ purchased: grocery.isPurchased }">
    <div class="card-main">
      <div class="left">
        <div class="name-row">
          <span class="name">{{ grocery.name }}</span>
          <span class="badge">{{ grocery.category || 'Other' }}</span>
        </div>
        <p class="meta">
          Qty: <strong>{{ grocery.quantity || '1' }}</strong>
        </p>
        <p class="meta">
          Added by <strong>{{ grocery.addedBy }}</strong>
        </p>
      </div>

      <div class="right">
        <button class="btn tiny" @click="$emit('toggle', grocery._id)">
          {{ grocery.isPurchased ? 'Undo' : 'Purchased' }}
        </button>
        <button class="icon-btn danger" @click="$emit('delete', grocery._id)">🗑</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GroceryItem',
  props: {
    grocery: Object,
  },
}
</script>

<style scoped>
.grocery-card {
  border-radius: 14px;
  padding: 10px 12px;
  margin-bottom: 10px;
  background: linear-gradient(135deg, #eef2ff, #fdf2ff);
  border: 1px solid #e5e7eb;
}

.grocery-card.purchased {
  opacity: 0.7;
  background: #ecfdf3;
}

.card-main {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.left {
  flex: 1;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.name {
  font-weight: 600;
  font-size: 1rem;
}

.badge {
  padding: 2px 8px;
  border-radius: 999px;
  background: #f97316;
  color: white;
  font-size: 0.75rem;
}

.meta {
  margin: 3px 0;
  font-size: 0.85rem;
  color: #4b5563;
}

.right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.btn.tiny {
  padding: 4px 8px;
  font-size: 0.8rem;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  background: #22c55e;
  color: white;
}

.icon-btn {
  border: none;
  background: transparent;
  cursor: pointer;
}

.icon-btn.danger {
  color: #b91c1c;
}
</style>
