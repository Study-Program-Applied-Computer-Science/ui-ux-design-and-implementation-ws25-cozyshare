<template>
  <div class="notice-item">
    <!-- EDIT MODE -->
    <div v-if="isEditing" class="edit-block">
      <input v-model="editTitle" type="text" class="edit-input" placeholder="Title" />
      <textarea
        v-model="editMessage"
        rows="3"
        class="edit-textarea"
        placeholder="Message"
      ></textarea>
      <div class="edit-actions">
        <button class="btn small" @click="saveEdit">Save</button>
        <button class="btn small secondary" @click="cancelEdit">Cancel</button>
      </div>
    </div>

    <!-- NORMAL VIEW -->
    <div v-else>
      <div class="notice-header">
        <div>
          <h3>{{ notice.title }}</h3>
          <p class="meta">
            Posted by <strong>{{ notice.createdBy }}</strong>
          </p>
        </div>
        <span class="date">{{ formattedDate }}</span>
      </div>

      <p class="message">
        {{ notice.message }}
      </p>
    </div>

    <!-- ACTION BAR (like, comment, edit, delete) -->
    <div class="action-bar">
      <button class="icon-btn" @click="toggleLike">
        <span :class="{ liked: isLikedByCurrentUser }">❤️</span>
        <span class="count">{{ likeCount }}</span>
      </button>

      <button class="icon-btn" @click="toggleComments">
        <span>💬</span>
        <span class="count">{{ commentCount }}</span>
      </button>

      <button v-if="canEdit" class="icon-btn" @click="startEdit">Edit</button>

      <button class="icon-btn danger" @click="$emit('delete-notice', notice._id)">Delete</button>
    </div>

    <!-- COMMENTS SECTION -->
    <div v-if="showComments" class="comments-block">
      <div v-if="notice.comments && notice.comments.length">
        <div v-for="(comment, index) in notice.comments" :key="index" class="comment-item">
          <p class="comment-text">
            <strong>{{ comment.author }}:</strong> {{ comment.text }}
          </p>
          <span class="comment-date">
            {{ formatCommentDate(comment.createdAt) }}
          </span>
        </div>
      </div>
      <p v-else class="no-comments">No comments yet. Be the first!</p>

      <!-- Add comment -->
      <form class="comment-form" @submit.prevent="submitComment">
        <input v-model="newComment" type="text" placeholder="Add a comment..." />
        <button class="btn small" type="submit">Post</button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NoticeItem',
  props: {
    notice: Object,
    currentUser: Object,
  },
  data() {
    return {
      isEditing: false,
      editTitle: '',
      editMessage: '',
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
      return this.notice.likes ? this.notice.likes.length : 0
    },
    commentCount() {
      return this.notice.comments ? this.notice.comments.length : 0
    },
    currentUserKeys() {
      if (!this.currentUser) return []
      const keys = []
      if (this.currentUser.name) keys.push(this.currentUser.name)
      if (this.currentUser.email) keys.push(this.currentUser.email)
      return keys
    },
    isLikedByCurrentUser() {
      if (!this.notice.likes || !this.currentUserKeys.length) return false
      return this.notice.likes.some((l) => this.currentUserKeys.includes(l))
    },
    canEdit() {
      if (!this.currentUserKeys.length) return false
      // allow edit if createdBy matches either name OR email
      return this.currentUserKeys.includes(this.notice.createdBy)
    },
  },

  methods: {
    startEdit() {
      this.editTitle = this.notice.title
      this.editMessage = this.notice.message
      this.isEditing = true
    },
    cancelEdit() {
      this.isEditing = false
    },
    saveEdit() {
      if (!this.editTitle || !this.editMessage) return
      this.$emit('edit-notice', {
        id: this.notice._id,
        title: this.editTitle,
        message: this.editMessage,
      })
      this.isEditing = false
    },
    toggleLike() {
      this.$emit('like-notice', this.notice._id)
    },
    toggleComments() {
      this.showComments = !this.showComments
    },
    submitComment() {
      if (!this.newComment.trim()) return
      this.$emit('add-comment', {
        id: this.notice._id,
        text: this.newComment.trim(),
      })
      this.newComment = ''
    },
    formatCommentDate(date) {
      if (!date) return ''
      return new Date(date).toLocaleString()
    },
  },
}
</script>

<style scoped>
.notice-item {
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 12px 14px;
  margin-bottom: 14px;
  background: #f9fafb;
}

.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.notice-header h3 {
  margin: 0;
}

.meta {
  margin: 3px 0;
  font-size: 0.85rem;
  color: #6b7280;
}

.date {
  font-size: 0.8rem;
  color: #9ca3af;
}

.message {
  margin: 8px 0 4px;
}

.action-bar {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 6px;
}

.icon-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 0.9rem;
}

.icon-btn .count {
  font-size: 0.8rem;
  color: #4b5563;
}

.icon-btn .liked {
  color: #ef4444;
}

.icon-btn.danger {
  color: #b91c1c;
}

.comments-block {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid #e5e7eb;
}

.comment-item {
  margin-bottom: 4px;
}

.comment-text {
  margin: 0;
  font-size: 0.85rem;
}

.comment-date {
  font-size: 0.75rem;
  color: #9ca3af;
}

.no-comments {
  font-size: 0.85rem;
  color: #6b7280;
}

.comment-form {
  display: flex;
  gap: 6px;
  margin-top: 6px;
}

.comment-form input {
  flex: 1;
  padding: 4px 8px;
  font-size: 0.85rem;
}

.btn.small {
  padding: 4px 8px;
  font-size: 0.8rem;
}

.edit-block {
  margin-bottom: 6px;
}

.edit-input,
.edit-textarea {
  width: 100%;
  margin-bottom: 4px;
  padding: 4px 8px;
  font-size: 0.9rem;
}

.edit-actions {
  display: flex;
  gap: 6px;
}

.btn.small.secondary {
  background: #e5e7eb;
}
</style>
