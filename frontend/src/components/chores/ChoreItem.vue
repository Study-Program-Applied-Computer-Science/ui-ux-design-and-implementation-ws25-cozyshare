<template>
  <article
    class="chore-item"
    :class="[`chore-item--${variant}`, { 'chore-item--completed': chore.completed }]"
    @click="handleOpen"
  >
    <div class="chore-main">
      <div class="title-row">
        <h4 class="title">
          {{ chore.title }}
        </h4>

        <span v-if="chore.completed" class="status-pill"> ✅ Done </span>
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
      <!-- Main button for "my" variant -->
      <button v-if="showMarkButton" class="mark-btn" :disabled="!canMark" @click="handleMarkDone">
        <span v-if="chore.completed">✅ Done</span>
        <span v-else>Mark done</span>
      </button>

      <!-- Small icon button for sidebar / compact -->
      <button
        v-else-if="variant !== 'my'"
        class="small-icon-btn"
        :disabled="!canMark"
        @click="handleMarkDone"
        title="Mark as done"
      >
        <span v-if="chore.completed">✅</span>
        <span v-else>✔️</span>
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
    // visual style: "my" | "sidebar" | "compact"
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
    showMarkButton: {
      type: Boolean,
      default: true,
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

    /* canMark() {
      if (!this.currentUser) return false
      const me = this.currentUser.email || this.currentUser.name
 
      const isCreator = this.chore.createdBy === me
      const isAssignee = this.chore.assignedTo && this.chore.assignedTo === me
 
      // only creator or assignee can tap "mark done"
      return isCreator || isAssignee
    }, */

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
    handleMarkDone() {
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
  gap: 8px;
  padding: 10px 12px;
  border-radius: 14px;
  background: var(--primary-light);
  border: 1px solid var(--card-border);
  box-shadow: var(--soft-shadow);
  cursor: pointer;
}

/* variants */

.chore-item--my {
  background: linear-gradient(135deg, var(--primary-light), rgba(253, 230, 230, 0.9));
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
  opacity: 0.75;
}

/* content */

.chore-main {
  flex: 1;
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
}

.status-pill {
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 999px;
  background: white;
  border: 1px solid rgba(148, 163, 184, 0.5);
}

.meta {
  margin: 2px 0 0;
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
}

.mark-btn {
  border-radius: 999px;
  border: none;
  padding: 4px 10px;
  font-size: 0.75rem;
  background: white;
  color: var(--navy);
  cursor: pointer;
}

.mark-btn:disabled,
.small-icon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.small-icon-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 0.85rem;
}
</style>
