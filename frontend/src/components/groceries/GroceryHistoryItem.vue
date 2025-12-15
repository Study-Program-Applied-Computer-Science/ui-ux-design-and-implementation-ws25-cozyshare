<template>
  <article class="history-item">
    <div class="left">
      <div class="title-row">
        <span class="name">{{ item.name }}</span>
        <span class="category-pill">{{ item.category || "Other" }}</span>
      </div>

      <p class="details">
        <span v-if="item.quantity">Qty: {{ item.quantity }}</span>
        <span v-if="item.addedBy">· Added by {{ item.addedBy }}</span>
        <span v-if="item.purchasedBy">· Purchased by {{ item.purchasedBy }}</span>
      </p>
    </div>

    <div class="right">
      <span class="date">
        {{ purchasedLabel }}
      </span>
    </div>
  </article>
</template>

<script>
export default {
  name: "GroceryHistoryItem",
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  computed: {
    purchasedLabel() {
      if (!this.item.purchasedAt) return "";
      return new Date(this.item.purchasedAt).toLocaleString();
    },
  },
};
</script>

<style scoped>
.history-item {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid var(--card-border);
  box-shadow: var(--soft-shadow);
  margin-bottom: 6px;
}

.name {
  font-weight: 700;
  color: var(--navy);
  font-size: 0.9rem;
}

.category-pill {
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--primary-light);
  border: 1px solid rgba(148, 163, 184, 0.5);
  margin-left: 6px;
}

.details {
  margin: 2px 0 0;
  font-size: 0.8rem;
  color: var(--text-light);
}

.date {
  font-size: 0.75rem;
  color: var(--text-light);
}
</style>
