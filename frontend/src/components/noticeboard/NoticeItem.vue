<template>
  <article class="notice-card">
    <!-- Header -->
    <header class="notice-header">
      <h3 class="title">{{ notice.title }}</h3>

      <div class="right">
        <BaseBadge type="info"> Posted by {{ displayAuthor }} </BaseBadge>

        <!-- Edit only if current user is the author -->
        <button v-if="isAuthor" class="edit-btn" @click="emitEdit" title="Edit this notice">
          ✏️
        </button>
      </div>
    </header>

    <!-- Content -->
    <p class="message">{{ notice.message }}</p>

    <!-- Footer -->
    <footer class="notice-footer">
      <span class="date">{{ formattedDate }}</span>

      <div class="actions">
        <!-- LIKE BUTTON -->
        <button class="icon-btn" @click="toggleLike">
          <span :class="{ liked: isLikedByMe }">❤️</span>
          <span class="count">{{ likeCount }}</span>
        </button>

        <!-- COMMENTS BUTTON -->
        <button class="icon-btn" @click="toggleComments">
          💬 <span class="count">{{ commentsCount }}</span>
        </button>

        <!-- DELETE only if author -->
        <button
          v-if="isAuthor"
          class="icon-btn delete-btn"
          @click="emitDelete"
          title="Delete this notice"
        >
          🗑
        </button>
      </div>
    </footer>

    <!-- COMMENTS SECTION -->
    <div v-if="showComments" class="comments">
      <div v-for="(c, idx) in notice.comments || []" :key="idx" class="comment">
        <strong>{{ c.author }}: </strong>{{ c.text }}
      </div>

      <div class="comment-input">
        <input v-model="newComment" type="text" placeholder="Write a comment..." />
        <button @click="addComment">Send</button>
      </div>
    </div>
  </article>
</template>

<script>
import BaseBadge from '../ui/BaseBadge.vue'

export default {
  name: 'NoticeItem',
  components: { BaseBadge },

  props: {
    notice: {
      type: Object,
      required: true,
    },
    currentUser: {
      type: Object,
      required: true,
    },
  },

  emits: ['toggle-like', 'add-comment', 'edit', 'delete'],

  data() {
    return {
      showComments: false,
      newComment: '',
    }
  },

  computed: {
    formattedDate() {
      if (!this.notice.createdAt) return ''
      return new Date(this.notice.createdAt).toLocaleString()
    },

    likeCount() {
      const l = this.notice.likes
      if (Array.isArray(l)) return l.length
      if (typeof l === 'number') return l
      return 0
    },

    commentsCount() {
      return (this.notice.comments || []).length
    },

    isLikedByMe() {
      const me = this.currentUser?.email || this.currentUser?.name
      const l = this.notice.likes
      return Array.isArray(l) && me && l.includes(me)
    },

    displayAuthor() {
      // main field
      if (this.notice.author) return this.notice.author

      // try some alternative fields if you ever change backend
      if (this.notice.createdByName) return this.notice.createdByName
      if (this.notice.userName) return this.notice.userName
      if (this.notice.email) return this.notice.email
      if (this.notice.authorEmail) return this.notice.authorEmail

      return 'Someone'
    },

    isAuthor() {
      const meEmail = this.currentUser?.email
      const meName = this.currentUser?.name

      return (
        this.notice.author === meName ||
        this.notice.author === meEmail ||
        this.notice.authorEmail === meEmail ||
        this.notice.email === meEmail
      )
    },
  },

  methods: {
    toggleLike() {
      this.$emit('toggle-like', this.notice._id)
    },

    toggleComments() {
      this.showComments = !this.showComments
    },

    addComment() {
      const text = this.newComment.trim()
      if (!text) return

      this.$emit('add-comment', {
        id: this.notice._id,
        text,
      })

      this.newComment = ''
    },

    emitEdit() {
      this.$emit('edit', this.notice)
    },

    emitDelete() {
      this.$emit('delete', this.notice._id)
    },
  },
}
</script>

<style scoped>
.notice-card {
  background: white;
  padding: 18px 16px;
  border-radius: 18px;
  border: 1px solid var(--card-border);
  box-shadow: var(--soft-shadow);
  margin-bottom: 16px;
}

.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notice-header .title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--navy);
}

.right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.edit-btn {
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1rem;
}

.message {
  margin: 8px 0 12px;
  font-size: 0.95rem;
  color: var(--text-dark);
}

.notice-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.date {
  font-size: 0.8rem;
  color: var(--text-light);
}

.actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.icon-btn span.liked {
  color: #ef4444;
}

.count {
  font-size: 0.82rem;
}

.delete-btn {
  color: #b91c1c;
}

/* comments */
.comments {
  margin-top: 12px;
  padding: 12px;
  border-radius: 12px;
  background: var(--primary-light);
}

.comment {
  margin-bottom: 6px;
  font-size: 0.85rem;
}

.comment-input {
  margin-top: 10px;
  display: flex;
  gap: 6px;
}

.comment-input input {
  flex: 1;
  padding: 6px 10px;
  border-radius: 10px;
  border: 1px solid #ccc;
}

.comment-input button {
  padding: 6px 10px;
  border-radius: 10px;
  background: var(--peach);
  border: none;
  cursor: pointer;
}
</style>
