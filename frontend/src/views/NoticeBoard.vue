<template>
  <div class="noticeboard-container">
    <h2>Household NoticeBoard</h2>
    <p class="subtitle">Post important updates so everyone in your flat stays in sync.</p>

    <!-- Add Notice Form -->
    <form class="add-form" @submit="onSubmit">
      <div class="form-control">
        <label>Title</label>
        <input v-model="title" type="text" placeholder="e.g. Inspection tomorrow" />
      </div>

      <div class="form-control">
        <label>Message</label>
        <textarea v-model="message" rows="3" placeholder="Add more details here..."></textarea>
      </div>

      <input type="submit" value="Post Notice" class="btn btn-block" />
    </form>

    <!-- Notices List -->
    <h3>Recent Notices</h3>

    <div v-if="notices.length > 0">
      <NoticeItem
        v-for="notice in notices"
        :key="notice._id"
        :notice="notice"
        :currentUser="currentUser"
        @delete-notice="deleteNotice"
        @edit-notice="editNotice"
        @like-notice="likeNotice"
        @add-comment="addComment"
      />
    </div>
    <p v-else>No notices yet. Be the first to post!</p>
  </div>
</template>

<script>
import axios from 'axios'
import NoticeItem from '../components/NoticeItem.vue'

export default {
  name: 'NoticeBoard',

  components: {
    NoticeItem,
  },

  props: {
    currentUser: Object, // { name, email, householdCode }
  },

  data() {
    return {
      title: '',
      message: '',
      notices: [],
    }
  },

  methods: {
    async fetchNotices() {
      try {
        if (!this.currentUser?.householdCode) return

        const res = await axios.get('http://localhost:5000/api/notices', {
          params: {
            householdCode: this.currentUser.householdCode,
          },
        })

        this.notices = res.data
      } catch (err) {
        console.error('Error fetching notices', err)
      }
    },

    async onSubmit(e) {
      e.preventDefault()

      if (!this.title || !this.message) {
        alert('Title and message are required')
        return
      }

      if (!this.currentUser?.householdCode) {
        alert('No household set. Please re-login or register correctly.')
        return
      }

      try {
        const body = {
          title: this.title,
          message: this.message,
          createdBy: this.currentUser.name || this.currentUser.email,
          householdCode: this.currentUser.householdCode,
        }

        const res = await axios.post('http://localhost:5000/api/notices', body)

        this.notices.unshift(res.data)
        this.title = ''
        this.message = ''
      } catch (err) {
        console.error('Error creating notice', err)
        alert('Error creating notice')
      }
    },

    async deleteNotice(noticeId) {
      if (!confirm('Delete this notice?')) return

      try {
        await axios.delete(`http://localhost:5000/api/notices/${noticeId}`)
        this.notices = this.notices.filter((n) => n._id !== noticeId)
      } catch (err) {
        console.error('Error deleting notice', err)
        alert('Error deleting notice')
      }
    },

    async editNotice({ id, title, message }) {
      try {
        const res = await axios.put(`http://localhost:5000/api/notices/${id}`, {
          title,
          message,
        })

        this.notices = this.notices.map((n) => (n._id === id ? res.data : n))
      } catch (err) {
        console.error('Error updating notice', err)
        alert('Error updating notice')
      }
    },

    async likeNotice(id) {
      try {
        const userKey = this.currentUser.email || this.currentUser.name
        const res = await axios.patch(`http://localhost:5000/api/notices/${id}/like`, {
          user: userKey,
        })

        this.notices = this.notices.map((n) => (n._id === id ? res.data : n))
      } catch (err) {
        console.error('Error toggling like', err)
      }
    },

    async addComment({ id, text }) {
      try {
        const author = this.currentUser.name || this.currentUser.email
        const res = await axios.post(`http://localhost:5000/api/notices/${id}/comments`, {
          text,
          author,
        })

        this.notices = this.notices.map((n) => (n._id === id ? res.data : n))
      } catch (err) {
        console.error('Error adding comment', err)
        alert('Error adding comment')
      }
    },
  },

  mounted() {
    this.fetchNotices()
  },
}
</script>

<style scoped>
.noticeboard-container {
  max-width: 700px;
  margin: 1.5rem auto;
}

.subtitle {
  margin-bottom: 1rem;
  color: #555;
}

.add-form {
  margin-bottom: 25px;
}

.form-control {
  margin: 15px 0;
}

.form-control label {
  display: block;
}

.form-control input,
.form-control textarea {
  width: 100%;
  margin: 5px 0;
  padding: 4px 8px;
  font-size: 15px;
}

.btn.btn-block {
  width: 100%;
  padding: 10px;
}
</style>
