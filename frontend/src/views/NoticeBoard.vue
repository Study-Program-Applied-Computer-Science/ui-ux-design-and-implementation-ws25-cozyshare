<template>
  <div class="noticeboard-container">
    <!-- HEADER -->
    <div class="nb-header">
      <div>
        <h2>Home / NoticeBoard</h2>
        <p class="subtitle">
          Share updates with your flat so nothing gets lost in chats
        </p>
      </div>
      <button class="refresh-btn" @click="fetchAll">
        Refresh
      </button>
    </div>

    <!-- STATS STRIP -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon">🛒</div>
        <div>
          <div class="stat-number">{{ stats.pendingGroceries }}</div>
          <div class="stat-label">Groceries pending</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🧹</div>
        <div>
          <div class="stat-number">{{ stats.todayChores }}</div>
          <div class="stat-label">Chores due today</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📌</div>
        <div>
          <div class="stat-number">{{ stats.totalNotices }}</div>
          <div class="stat-label">Notices posted</div>
        </div>
      </div>
    </div>

    <!-- ADD NOTICE FORM -->
    <div class="card add-card">
      <h3>Create a new post</h3>
      <form class="add-form" @submit="onSubmit">
        <div class="form-row">
          <div class="form-control">
            <label>Title</label>
            <input
              v-model="title"
              type="text"
              placeholder="e.g. Inspection tomorrow, Party tonight…"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-control">
            <label>Message</label>
            <textarea
              v-model="message"
              rows="3"
              placeholder="Add the details you want your flatmates to know."
            ></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-primary">
            Post to NoticeBoard
          </button>
        </div>
      </form>
    </div>

    <!-- NOTICES LIST -->
    <div class="card list-card">
      <div class="list-header">
        <h3>Recent Notices</h3>
        <p class="list-subtitle">
          Latest updates from everyone in your household.
        </p>
      </div>

      <div v-if="notices.length > 0" class="notices-list">
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
      <p v-else class="empty-message">
        No notices yet. Be the first to post something nice! 🌸
      </p>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import NoticeItem from "../components/NoticeItem.vue";

export default {
  name: "NoticeBoard",

  components: {
    NoticeItem,
  },

  props: {
    currentUser: Object, // { name, email, householdCode }
  },

  data() {
    return {
      title: "",
      message: "",
      notices: [],
      stats: {
        pendingGroceries: 0,
        todayChores: 0,
        totalNotices: 0,
      },
    };
  },

  methods: {
    async fetchNotices() {
      try {
        if (!this.currentUser?.householdCode) return;

        const res = await axios.get("http://localhost:5000/api/notices", {
          params: {
            householdCode: this.currentUser.householdCode,
          },
        });

        this.notices = res.data;
        this.stats.totalNotices = res.data.length;
      } catch (err) {
        console.error("Error fetching notices", err);
      }
    },

    async fetchGroceriesStats() {
      try {
        if (!this.currentUser?.householdCode) return;

        const res = await axios.get("http://localhost:5000/api/groceries", {
          params: {
            householdCode: this.currentUser.householdCode,
          },
        });

        const allGroceries = res.data || [];
        this.stats.pendingGroceries = allGroceries.filter(
          (g) => !g.isPurchased
        ).length;
      } catch (err) {
        console.error("Error fetching grocery stats", err);
      }
    },

    async fetchChoresStats() {
      try {
        if (!this.currentUser?.householdCode) return;

        const res = await axios.get("http://localhost:5000/api/chores", {
          params: {
            householdCode: this.currentUser.householdCode,
          },
        });

        const allChores = res.data || [];
        const today = new Date();

        this.stats.todayChores = allChores.filter((chore) => {
          if (!chore.dueDate) return false;
          const due = new Date(chore.dueDate);
          return (
            due.getDate() === today.getDate() &&
            due.getMonth() === today.getMonth() &&
            due.getFullYear() === today.getFullYear()
          );
        }).length;
      } catch (err) {
        console.error("Error fetching chore stats", err);
      }
    },

    async fetchAll() {
      await Promise.all([
        this.fetchNotices(),
        this.fetchGroceriesStats(),
        this.fetchChoresStats(),
      ]);
    },

    async onSubmit(e) {
      e.preventDefault();

      if (!this.title || !this.message) {
        alert("Title and message are required");
        return;
      }

      if (!this.currentUser?.householdCode) {
        alert("No household set. Please re-login or register correctly.");
        return;
      }

      try {
        const body = {
          title: this.title,
          message: this.message,
          createdBy: this.currentUser.name || this.currentUser.email,
          householdCode: this.currentUser.householdCode,
        };

        const res = await axios.post("http://localhost:5000/api/notices", body);

        this.notices.unshift(res.data);
        this.stats.totalNotices = this.stats.totalNotices + 1;

        this.title = "";
        this.message = "";
      } catch (err) {
        console.error("Error creating notice", err);
        alert("Error creating notice");
      }
    },

    async deleteNotice(noticeId) {
      if (!confirm("Delete this notice?")) return;

      try {
        await axios.delete(`http://localhost:5000/api/notices/${noticeId}`);
        this.notices = this.notices.filter((n) => n._id !== noticeId);
        this.stats.totalNotices = this.notices.length;
      } catch (err) {
        console.error("Error deleting notice", err);
        alert("Error deleting notice");
      }
    },

    async editNotice({ id, title, message }) {
      try {
        const res = await axios.put(`http://localhost:5000/api/notices/${id}`, {
          title,
          message,
        });

        this.notices = this.notices.map((n) =>
          n._id === id ? res.data : n
        );
      } catch (err) {
        console.error("Error updating notice", err);
        alert("Error updating notice");
      }
    },

    async likeNotice(id) {
      try {
        const userKey = this.currentUser.email || this.currentUser.name;
        const res = await axios.patch(
          `http://localhost:5000/api/notices/${id}/like`,
          { user: userKey }
        );

        this.notices = this.notices.map((n) =>
          n._id === id ? res.data : n
        );
      } catch (err) {
        console.error("Error toggling like", err);
      }
    },

    async addComment({ id, text }) {
      try {
        const author = this.currentUser.name || this.currentUser.email;
        const res = await axios.post(
          `http://localhost:5000/api/notices/${id}/comments`,
          { text, author }
        );

        this.notices = this.notices.map((n) =>
          n._id === id ? res.data : n
        );
      } catch (err) {
        console.error("Error adding comment", err);
        alert("Error adding comment");
      }
    },
  },

  mounted() {
    this.fetchAll();
  },
};
</script>

<style scoped>
.noticeboard-container {
  max-width: 840px;
  margin: 0 auto;
}

/* HEADER */
.nb-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.nb-header h2 {
  margin: 0;
  color: var(--navy);
}

.subtitle {
  margin: 2px 0 0;
  color: var(--text-light);
  font-size: 0.9rem;
}

.refresh-btn {
  border: none;
  border-radius: 999px;
  padding: 6px 12px;
  background: var(--primary-light);
  color: var(--navy);
  cursor: pointer;
  font-size: 0.85rem;
}

/* STATS */
.stats-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}

.stat-card {
  flex: 1;
  min-width: 150px;
  padding: 10px 12px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--primary-light), var(--pink));
  border: 1px solid var(--card-border);
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: var(--soft-shadow);
}

.stat-icon {
  font-size: 1.4rem;
}

.stat-number {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--navy);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-light);
}

/* CARDS */
.card {
  background: #ffffff;
  border-radius: 18px;
  padding: 14px 14px 16px;
  margin-bottom: 14px;
  box-shadow: var(--soft-shadow);
  border: 1px solid var(--card-border);
}

.add-card h3,
.list-card h3 {
  margin-top: 0;
  margin-bottom: 8px;
  color: var(--navy);
}

/* FORM */
.add-form {
  margin-top: 4px;
}

.form-row {
  margin-bottom: 10px;
}

.form-control label {
  display: block;
  font-size: 0.85rem;
  color: var(--text-light);
}

.form-control input,
.form-control textarea {
  width: 100%;
  margin-top: 4px;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  font-size: 0.9rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-primary {
  border: none;
  border-radius: 999px;
  padding: 8px 16px;
  background: linear-gradient(135deg, var(--primary), var(--peach));
  color: #ffffff;
  cursor: pointer;
  font-weight: 600;
}

/* LIST */
.list-header {
  margin-bottom: 8px;
}

.list-subtitle {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-light);
}

.notices-list {
  margin-top: 6px;
}

.empty-message {
  margin-top: 6px;
  font-size: 0.9rem;
  color: var(--text-light);
}
</style>
