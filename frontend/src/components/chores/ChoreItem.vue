<template>
  <article
    class="chore-item"
    :class="[`chore-item--${variant}`, { 'chore-item--completed': chore.completed }]"
  >
    <div class="chore-main" @click="handleOpen">
      <div class="title-row">
        <h4 class="title">{{ chore.title }}</h4>
      </div>

      <p v-if="showMetaLine" class="meta">
        <span v-if="showAssignee">
          <template v-if="chore.assignedTo">Assigned to {{ chore.assignedTo }}</template>
          <template v-else>Shared chore</template>
        </span>

        <span v-if="showFrequency && chore.frequency && chore.frequency !== 'once'">
          · 🔄 {{ chore.frequency }}
        </span>

        <span v-if="showDate && dueDateLabel">· Due {{ dueDateLabel }}</span>
      </p>

      <p v-if="showDescription && chore.description" class="description">
        {{ chore.description }}
      </p>
    </div>

    <div class="actions" @click.stop>
      <button
        v-if="canMark && !chore.completed"
        class="toggle-btn"
        @click="handleToggleDone"
        title="Mark as done"
      >
        <span>x</span>
      </button>

      <button
        v-else-if="canMark && chore.completed && !canUndo"
        class="toggle-btn completed"
        @click="handleToggleDone"
        title="Mark as incomplete"
      >
        <span>✓</span>
      </button>

      <button
        v-else-if="canMark && chore.completed && canUndo"
        class="toggle-btn undo"
        @click="handleUndo"
        title="Undo completion"
      ></button>
    </div>
  </article>
</template>

<script>
export default {
  name: 'ChoreItem',
  props: {
    chore: {
      type: Object,
      required: true,
    },
    isCurrentWeek: Boolean,
    currentUser: {
      type: [String, Object],
      default: '',
    },
    variant: {
      type: String,
      default: 'my',
    },
    showDate: {
      type: Boolean,
      default: true,
    },
    showFrequency: {
      type: Boolean,
      default: true,
    },
    showAssignee: {
      type: Boolean,
      default: true,
    },
    showDescription: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['mark-done', 'undo', 'open'],
  data() {
    return {
      completedAt: null,
    }
  },
  computed: {
    dueDateLabel() {
      if (!this.chore.dueDate) return ''
      const d = new Date(this.chore.dueDate)
      if (isNaN(d.getTime())) return ''
      return d.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    },
    showMetaLine() {
      return this.showAssignee || this.showFrequency || this.showDate
    },
    canMark() {
      if (!this.currentUser) return false

      const userStr =
        typeof this.currentUser === 'string'
          ? this.currentUser
          : this.currentUser.email || this.currentUser.name || ''

      const userLower = userStr.toLowerCase()
      const created = (this.chore.createdBy || '').toLowerCase()
      const assigned = (this.chore.assignedTo || '').toLowerCase()

      // Can mark if:
      // 1. You created it
      // 2. You're assigned to it
      // 3. It's a shared chore (no specific assignee)
      return created === userLower || assigned === userLower || !this.chore.assignedTo
    },
    canUndo() {
      if (!this.chore.completed || !this.completedAt) return false
      const fiveMinutes = 5 * 60 * 1000
      return Date.now() - this.completedAt < fiveMinutes
    },
  },
  watch: {
    'chore.completed'(newVal, oldVal) {
      if (newVal && !oldVal) {
        // Just marked as complete
        this.completedAt = Date.now()
      } else if (!newVal && oldVal) {
        // Just marked as incomplete
        this.completedAt = null
      }
    },
  },
  methods: {
    handleToggleDone() {
      if (!this.canMark) return
      this.$emit('mark-done', this.chore)
    },
    handleUndo() {
      if (!this.canMark) return
      this.$emit('undo', this.chore._id)
    },
    handleOpen() {
      this.$emit('open', this.chore)
    },
  },
}
</script>

<style scoped>
.chore-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 14px;
  background: var(--primary-light);
  border: 1px solid var(--card-border);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
}

.chore-item:hover {
  border-color: var(--primary);
  box-shadow: 0 2px 8px rgba(255, 159, 147, 0.15);
}

.chore-item--my {
  background: var(--primary-light);
}

.chore-item--sidebar {
  padding: 8px 10px;
  border-radius: 12px;
}

.chore-item--compact {
  padding: 6px 8px;
  border-radius: 10px;
  box-shadow: none;
}

.chore-item--completed {
  opacity: 0.65;
}

.chore-item--completed .title {
  text-decoration: line-through;
  color: var(--text-light);
}

.chore-main {
  flex: 1;
  cursor: pointer;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
}

.title {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--navy);
  transition: all 0.2s;
}

.meta {
  margin: 4px 0 0;
  font-size: 0.75rem;
  color: var(--text-light);
}

.description {
  margin: 4px 0 0;
  font-size: 0.8rem;
  color: var(--text-dark);
}

.actions {
  display: flex;
  align-items: center;
  padding-top: 2px;
}

.toggle-btn {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #d1d5db;
  background: white;
  display: flex;
  /*align-items: center;*/
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
  color: #d1d5db;
}

.toggle-btn:hover {
  border-color: var(--primary);
  background: var(--primary-light);
  transform: scale(1.1);
}

.toggle-btn.completed {
  border-color: #10b981;
  background: #10b981;
  color: white;
}

.toggle-btn.completed:hover {
  border-color: #059669;
  background: #059669;
}

.toggle-btn.undo {
  border-color: #f59e0b;
  background: #fef3c7;
  color: #f59e0b;
}

.toggle-btn.undo:hover {
  border-color: #d97706;
  background: #fde68a;
  color: #d97706;
}
</style>
