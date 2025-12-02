<template>
  <div
    class="chore-item"
    :class="{
      done: chore.isDone,
      today: isToday
    }"
  >
    <div class="chore-main">
      <h3>{{ chore.title }}</h3>
      <p class="meta">
        Assigned to: <strong>{{ chore.assignedTo }}</strong>
      </p>
      <p v-if="chore.dueDate" class="meta">
        Due: {{ formattedDueDate }}
      </p>
    </div>

    <div class="chore-actions">
      <button class="btn small" @click="$emit('toggle-done', chore._id)">
        {{ chore.isDone ? "Mark Pending" : "Mark Done" }}
      </button>
      <button class="btn small danger" @click="$emit('delete-chore', chore._id)">
        Delete
      </button>
    </div>
  </div>
</template>


<script>
export default {
  name: "ChoreItem",
  props: {
    chore: Object,
  },
  computed: {
    formattedDueDate() {
      if (!this.chore.dueDate) return "";
      return new Date(this.chore.dueDate).toLocaleDateString();
    },
  },
  props: {
  chore: Object,
  isToday: Boolean
},
};
</script>

<style scoped>
.chore-item {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.chore-item.done {
  opacity: 0.7;
  background: #e5ffe5;
}

.chore-main h3 {
  margin: 0;
}

.meta {
  margin: 3px 0;
  font-size: 0.9rem;
  color: #555;
}

.chore-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.btn.small {
  padding: 6px 8px;
  font-size: 0.8rem;
}

.btn.danger {
  background: #dc2626;
  color: #fff;
  border: none;
}

.today {
  border-left: 6px solid #16a34a;
  background: #ecfdf5;
}

</style>
