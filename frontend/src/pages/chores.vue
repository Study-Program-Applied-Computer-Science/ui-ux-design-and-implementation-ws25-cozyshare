<template>
  <section class="chores">
    <!-- Header -->
    <div class="chores-header">
      <div>
        <h2>Chores Planner</h2>
        <p class="subtitle">See this week's chores at a glance and keep everything fair 🧽</p>
      </div>
    </div>

    <!-- Week Controls -->
    <div class="week-controls">
      <button class="pill-btn" @click="shiftWeek(-1)"><span class="arrow">←</span> Previous</button>
      <div class="week-label">{{ weekLabel }}</div>
      <button class="pill-btn" @click="shiftWeek(1)">Next <span class="arrow">→</span></button>
    </div>

    <!-- Top Cards: My chores + Upcoming -->
    <div class="top-cards">
      <div class="card sidebar-card">
        <div class="sidebar-header">
          <h3>My Chores</h3>
          <span class="count-badge">{{ myChoresThisWeek.length }}</span>
        </div>
        <p class="small-subtitle">Created by you or assigned to you this week</p>

        <div v-if="myChoresThisWeek.length === 0" class="empty-state">
          <span class="empty-emoji">🎉</span>
          <p>You have no chores this week!</p>
        </div>

        <ChoreItem
          v-for="chore in myChoresThisWeek"
          :key="chore._id"
          :chore="chore"
          :currentUser="currentUser"
          variant="my"
          :showDescription="false"
          @mark-done="handleMarkDoneFromCard"
        />
      </div>

      <div class="card sidebar-card">
        <div class="sidebar-header">
          <h3>Upcoming</h3>
          <span class="count-badge">{{ upcomingChores.length }}</span>
        </div>
        <p class="small-subtitle">Next chores coming up</p>

        <div v-if="upcomingChores.length === 0" class="empty-state">
          <span class="empty-emoji">📅</span>
          <p>Nothing scheduled yet</p>
        </div>

        <ChoreItem
          v-for="chore in upcomingChores"
          :key="chore._id"
          :chore="chore"
          :currentUser="currentUser"
          variant="sidebar"
          :showDescription="false"
          @mark-done="handleMarkDoneFromCard"
        />
      </div>
    </div>

    <!-- Weekly calendar strip -->
    <div class="week-grid card">
      <div
        v-for="day in weekDays"
        :key="day.key"
        class="day-column"
        :class="{ today: day.isToday }"
      >
        <div class="day-header">
          <span class="day-name">{{ day.label }}</span>
          <span class="day-date">{{ day.dateNum }}</span>
        </div>

        <div class="day-chores">
          <div v-if="day.chores.length === 0" class="empty-day">
            <span class="empty-icon">✨</span>
            <span>No chores</span>
          </div>

          <div v-for="chore in day.chores" :key="chore._id" class="chore-chip">
            <div class="chore-main">
              <span class="chore-title">{{ chore.title }}</span>
              <span class="chore-meta">
                <span v-if="chore.assignedTo" class="assigned-badge">
                  {{ chore.assignedTo }}
                </span>
                <span v-else class="shared-badge">Shared</span>
                <span v-if="chore.frequency && chore.frequency !== 'once'" class="frequency-tag">
                  {{ chore.frequency }}
                </span>
                <span v-if="chore.completed" class="completed-badge">✅ Done</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Chore Button -->
    <div class="add-chore-section">
      <button class="add-chore-btn" @click="showModal = true">
        <span class="plus-icon">+</span>
        Add New Chore
      </button>
    </div>

    <!-- Modal for Add New Chore -->
    <transition name="modal-fade">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <div class="modal-header">
            <div>
              <h3>Add a New Chore</h3>
              <p class="modal-subtitle">Create and assign a new task</p>
            </div>
            <button class="close-btn" @click="closeModal">✕</button>
          </div>

          <form class="add-form" @submit.prevent="onSubmit">
            <div class="form-row">
              <div class="form-control">
                <label>Chore Title *</label>
                <input
                  v-model="title"
                  type="text"
                  placeholder="e.g. Clean kitchen, Mop living room…"
                  required
                />
              </div>
            </div>

            <div class="form-row two-cols">
              <div class="form-control">
                <label>Assign To</label>
                <input v-model="assignedTo" type="text" placeholder="Email or name (optional)" />
              </div>

              <div class="form-control">
                <label>Due Date *</label>
                <input v-model="dueDate" type="date" required />
              </div>
            </div>

            <div class="form-row">
              <div class="form-control">
                <label>Recurrence</label>
                <select v-model="frequency">
                  <option value="once">One time</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-control">
                <label>Notes (Optional)</label>
                <textarea
                  v-model="description"
                  rows="3"
                  placeholder="Add any extra context or details…"
                ></textarea>
              </div>
            </div>

            <p v-if="errorMessage" class="error-msg">
              <span class="error-icon">⚠</span> {{ errorMessage }}
            </p>

            <div class="form-actions">
              <button type="button" class="btn-secondary" @click="closeModal">Cancel</button>
              <button type="submit" class="btn-primary">
                <span class="btn-icon">+</span>
                Add Chore
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </section>
</template>

<script>
import axios from 'axios'
import ChoreItem from '../components/chores/ChoreItem.vue'

export default {
  name: 'ChoresPage',

  components: {
    ChoreItem,
  },

  data() {
    return {
      allChores: [],
      isLoading: false,
      errorMessage: '',
      showModal: false,

      // form
      title: '',
      description: '',
      assignedTo: '',
      dueDate: '',
      frequency: 'once',

      // week control
      weekOffset: 0,
    }
  },

  computed: {
    currentUser() {
      return this.$store.getters.currentUser?.name || this.$store.getters.currentUser?.email || ''
    },
    householdCode() {
      return this.$store.getters.householdCode
    },

    weekStartDate() {
      const base = new Date()
      base.setDate(base.getDate() + this.weekOffset * 7)

      const day = base.getDay()
      const diff = day === 0 ? -6 : 1 - day
      const start = new Date(base)
      start.setHours(0, 0, 0, 0)
      start.setDate(start.getDate() + diff)
      return start
    },

    weekEndDate() {
      const end = new Date(this.weekStartDate)
      end.setDate(end.getDate() + 7)
      end.setHours(0, 0, 0, 0)
      return end
    },

    weekLabel() {
      const d = this.weekStartDate
      return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    },

    weeklyChores() {
      return this.allChores.filter((c) => {
        if (!c.dueDate) return false
        const d = new Date(c.dueDate)
        d.setHours(0, 0, 0, 0)
        return d >= this.weekStartDate && d < this.weekEndDate
      })
    },

    weekDays() {
      const days = []
      const start = this.weekStartDate
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      for (let i = 0; i < 7; i++) {
        const d = new Date(start)
        d.setDate(start.getDate() + i)

        const label = d.toLocaleDateString(undefined, {
          weekday: 'short',
        })

        const key = d.toISOString().slice(0, 10)
        const isToday = d.getTime() === today.getTime()

        const choresForDay = this.weeklyChores.filter((chore) => {
          const cd = new Date(chore.dueDate)
          cd.setHours(0, 0, 0, 0)
          return cd.getTime() === d.getTime()
        })

        days.push({
          key,
          label,
          dateNum: d.getDate(),
          isToday,
          date: d,
          chores: choresForDay,
        })
      }

      return days
    },

    myChoresThisWeek() {
      if (!this.currentUser) return []

      const meEmail = (this.currentUser.email || '').toLowerCase()
      const meName = (this.currentUser.name || '').toLowerCase()

      return this.weeklyChores.filter((c) => {
        const assigned = (c.assignedTo || '').toLowerCase()
        const created = (c.createdBy || '').toLowerCase()

        return (
          assigned === meEmail || assigned === meName || created === meEmail || created === meName
        )
      })
    },

    upcomingChores() {
      return this.weeklyChores
        .filter((c) => !c.completed)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 5)
    },
  },

  watch: {
    householdCode(newVal, oldVal) {
      if (newVal && newVal !== oldVal) {
        this.fetchChores()
      }
    },
  },

  methods: {
    shiftWeek(delta) {
      this.weekOffset += delta
    },

    closeModal() {
      this.showModal = false
      this.resetForm()
      this.errorMessage = ''
    },

    resetForm() {
      this.title = ''
      this.description = ''
      this.assignedTo = ''
      this.dueDate = ''
      this.frequency = 'once'
    },

    async fetchChores() {
      if (!this.householdCode) return

      this.isLoading = true
      this.errorMessage = ''

      try {
        const res = await axios.get('http://localhost:5000/api/chores', {
          params: {
            householdCode: this.householdCode,
          },
        })

        this.allChores = res.data || []
      } catch (err) {
        console.error('Error fetching chores', err)
        this.errorMessage = 'Could not load chores.'
      } finally {
        this.isLoading = false
      }
    },

    async onSubmit() {
      this.errorMessage = ''

      if (!this.title || !this.dueDate) {
        this.errorMessage = 'Chore title and due date are required.'
        return
      }

      if (!this.householdCode || !this.currentUser) {
        this.errorMessage = 'No household or user. Please login again.'
        return
      }

      try {
        const body = {
          title: this.title,
          description: this.description,
          assignedTo: this.assignedTo ? this.assignedTo.trim() : '',
          dueDate: this.dueDate,
          frequency: this.frequency,
          householdCode: this.householdCode,
          createdBy: this.currentUser.email || this.currentUser.name,
        }

        const res = await axios.post('http://localhost:5000/api/chores', body)

        const created = res.data
        this.allChores.push(created)

        this.closeModal()
      } catch (err) {
        console.error('Create chore error', err)
        this.errorMessage = err.response?.data?.message || 'Error creating chore.'
      }
    },

    canMarkDone(chore) {
      if (!this.currentUser) return false

      const meEmail = (this.currentUser.email || '').toLowerCase()
      const meName = (this.currentUser.name || '').toLowerCase()

      const created = (chore.createdBy || '').toLowerCase()
      const assigned = (chore.assignedTo || '').toLowerCase()

      const isCreator = created === meEmail || created === meName
      const isAssignee = assigned === meEmail || assigned === meName

      return isCreator || isAssignee
    },

    async toggleComplete(chore) {
      if (!this.currentUser) return

      try {
        const me = this.currentUser.email || this.currentUser.name

        const res = await axios.patch(`http://localhost:5000/api/chores/${chore._id}/complete`, {
          currentUser: me,
        })

        const updated = res.data

        this.allChores = this.allChores.map((c) => (c._id === updated._id ? updated : c))
      } catch (err) {
        console.error('Complete chore error', err)
        alert(err.response?.data?.message || 'Could not update this chore.')
      }
    },

    async handleMarkDoneFromCard(id) {
      const chore = this.allChores.find((c) => c._id === id)
      if (chore) {
        await this.toggleComplete(chore)
      }
    },
  },

  mounted() {
    if (this.householdCode) {
      this.fetchChores()
    }
  },
}
</script>

<style scoped>
.chores {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px 40px;
}

/* Header Section */
.chores-header {
  margin-bottom: 16px;
}

.chores-header h2 {
  margin: 0;
  color: var(--navy);
  font-size: 2rem;
  font-weight: 700;
}

.subtitle {
  margin: 6px 0 0;
  font-size: 1rem;
  color: var(--text-light);
}

/* Week Controls */
.week-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: #ffffff;
  padding: 8px 12px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--card-border);
  margin-bottom: 24px;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.pill-btn {
  border-radius: 12px;
  border: none;
  background: var(--primary-light);
  padding: 8px 16px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--navy);
  display: flex;
  align-items: center;
  gap: 6px;
}

.pill-btn:hover {
  background: var(--primary);
  color: white;
  transform: translateY(-1px);
}

.arrow {
  font-size: 1.1rem;
}

.week-label {
  font-size: 0.95rem;
  color: var(--navy);
  font-weight: 700;
  min-width: 140px;
  text-align: center;
}

/* Top Cards Layout */
.top-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

@media (max-width: 1024px) {
  .top-cards {
    grid-template-columns: 1fr;
  }
}

/* Week Grid Calendar */
.week-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 10px;
  padding: 16px;
  margin-bottom: 32px;
}

.day-column {
  border-radius: 16px;
  background: #fafafa;
  border: 2px solid transparent;
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  min-height: 140px;
  transition: all 0.2s;
}

.day-column:hover {
  background: #fff;
  border-color: var(--primary-light);
}

.day-column.today {
  background: linear-gradient(135deg, #fff5f3, #ffffff);
  border-color: var(--primary);
  box-shadow: 0 4px 12px rgba(255, 159, 147, 0.2);
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.day-name {
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--navy);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.day-date {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-light);
}

.day-chores {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.empty-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 16px 8px;
  font-size: 0.8rem;
  color: var(--text-light);
  text-align: center;
}

.empty-icon {
  font-size: 1.5rem;
}

/* Chore Chip */
.chore-chip {
  border-radius: 12px;
  background: white;
  border: 1px solid #e5e7eb;
  padding: 10px;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.chore-chip:hover {
  border-color: var(--primary);
  box-shadow: 0 2px 8px rgba(255, 159, 147, 0.15);
  transform: translateY(-1px);
}

.chore-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.chore-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--navy);
  line-height: 1.3;
}

.chore-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.assigned-badge,
.shared-badge {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 8px;
  font-weight: 600;
}

.assigned-badge {
  background: #dbeafe;
  color: #1e40af;
}

.shared-badge {
  background: #e0e7ff;
  color: #4338ca;
}

.frequency-tag {
  font-size: 0.7rem;
  color: var(--text-light);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.completed-badge {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 8px;
  font-weight: 600;
  background: #d1fae5;
  color: #065f46;
}

.chore-action:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Sidebar Cards */
.sidebar-card {
  padding: 18px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.sidebar-card h3 {
  margin: 0;
  color: var(--navy);
  font-size: 1.1rem;
  font-weight: 700;
}

.count-badge {
  background: linear-gradient(135deg, var(--primary), var(--peach));
  color: white;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 12px;
  min-width: 28px;
  text-align: center;
}

.small-subtitle {
  margin: 0 0 12px;
  font-size: 0.85rem;
  color: var(--text-light);
}

.empty-state {
  text-align: center;
  padding: 32px 16px;
}

.empty-emoji {
  font-size: 3rem;
  display: block;
  margin-bottom: 12px;
}

.empty-state p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-light);
}

/* Card Styling */
.card {
  background: #ffffff;
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--card-border);
}

/* Add Chore Section */
.add-chore-section {
  display: flex;
  justify-content: center;
  margin: 32px 0 24px;
}

.add-chore-btn {
  border: none;
  border-radius: 16px;
  padding: 16px 32px;
  background: linear-gradient(135deg, var(--primary), var(--peach));
  color: #ffffff;
  cursor: pointer;
  font-weight: 700;
  font-size: 1.1rem;
  box-shadow: 0 6px 20px rgba(255, 159, 147, 0.35);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 10px;
}

.add-chore-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(255, 159, 147, 0.45);
}

.add-chore-btn:active {
  transform: translateY(-1px);
}

.plus-icon {
  font-size: 1.4rem;
  font-weight: 700;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: #ffffff;
  border-radius: 24px;
  padding: 32px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 16px;
}

.modal-header h3 {
  margin: 0 0 4px;
  color: var(--navy);
  font-size: 1.5rem;
  font-weight: 700;
}

.modal-subtitle {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-light);
}

.close-btn {
  background: #f3f4f6;
  border: none;
  font-size: 1.4rem;
  cursor: pointer;
  color: var(--navy);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
  flex-shrink: 0;
}

.close-btn:hover {
  background: #e5e7eb;
  transform: rotate(90deg);
}

/* Form Styling */
.add-form {
  margin-top: 8px;
}

.form-row {
  margin-bottom: 20px;
}

.two-cols {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 16px;
}

.form-control label {
  display: block;
  font-size: 0.9rem;
  color: var(--navy);
  font-weight: 600;
  margin-bottom: 8px;
}

.form-control input,
.form-control select,
.form-control textarea {
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  font-size: 0.95rem;
  transition: all 0.2s;
  font-family: inherit;
}

.form-control input:focus,
.form-control select:focus,
.form-control textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(255, 159, 147, 0.1);
}

.form-control textarea {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.btn-primary,
.btn-secondary {
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary), var(--peach));
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(255, 159, 147, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 159, 147, 0.4);
}

.btn-secondary {
  background: #f3f4f6;
  color: var(--navy);
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-icon {
  font-size: 1.2rem;
  font-weight: 700;
}

.error-msg {
  margin-top: 12px;
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  font-size: 0.9rem;
  color: #b91c1c;
  display: flex;
  align-items: center;
  gap: 8px;
}

.error-icon {
  font-size: 1.1rem;
}

/* Modal Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-active .modal-content,
.modal-fade-leave-active .modal-content {
  transition: transform 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .modal-content,
.modal-fade-leave-to .modal-content {
  transform: scale(0.9) translateY(20px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .chores-header {
    flex-direction: column;
    align-items: stretch;
  }

  .week-controls {
    justify-content: center;
  }

  .week-grid {
    grid-template-columns: repeat(7, minmax(80px, 1fr));
    overflow-x: auto;
  }

  .two-cols {
    grid-template-columns: 1fr;
  }

  .modal-content {
    padding: 24px;
  }
}
</style>
