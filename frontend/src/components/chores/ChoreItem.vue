<template>
  <article
    class="chore-item"
    :class="[`chore-item--${variant}`, { 'chore-item--completed': chore.completed }]"
  >
    <div class="chore-main" @click="handleOpen">
      <div class="title-row">
        <h4 class="title">
          {{ chore.title }}
        </h4>
      </div>

      <p v-if="showMetaLine" class="meta">
        <span v-if="showAssignee">
          <template v-if="chore.assignedTo"> Assigned to {{ chore.assignedTo }} </template>
          <template v-else> Shared chore </template>
        </span>

        <span v-if="showFrequency && chore.frequency && chore.frequency !== 'once'">
          · {{ chore.frequency }}
        </span>

        <span v-if="showDate && dueDateLabel"> · Due {{ dueDateLabel }} </span>
      </p>

      <p v-if="showDescription && chore.description" class="description">
        {{ chore.description }}
      </p>
    </div>

    <div class="actions" @click.stop>
      <button
        v-if="canMark"
        class="toggle-btn"
        :class="{ completed: chore.completed }"
        @click="handleToggleDone"
      >
        <span v-if="chore.completed">✓</span>
        <span v-else>○</span>
      </button>
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
    currentUser: {
      type: Object,
      default: null,
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

  emits: ['mark-done', 'open'],

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

      const meEmail = (this.currentUser.email || '').toLowerCase()
      const meName = (this.currentUser.name || '').toLowerCase()

      const created = (this.chore.createdBy || '').toLowerCase()
      const assigned = (this.chore.assignedTo || '').toLowerCase()

      const isCreator = created === meEmail || created === meName
      const isAssignee = assigned === meEmail || assigned === meName

      return isCreator || isAssignee
    },
  },

  methods: {
    handleToggleDone() {
      if (!this.canMark) return
      this.$emit('mark-done', this.chore._id)
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
  box-shadow: var(--soft-shadow);
  transition: all 0.2s;
}

.chore-item:hover {
  border-color: var(--primary);
  box-shadow: 0 2px 8px rgba(255, 159, 147, 0.15);
}

/* variants */
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

.chore-item--completed .chore-title {
  text-decoration: line-through;
  color: var(--text-light);
}

/* content */
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

/* actions */
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
  align-items: center;
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
</style>
