<template>
  <section class="chores">
    <!-- Header -->
    <div class="chores-header">
      <div>
        <h2>Chores Planner</h2>
        <p class="subtitle">See this week’s chores at a glance and keep everything fair 🧽</p>
      </div>

      <div class="week-controls">
        <button class="pill-btn" @click="shiftWeek(-1)">⟵ Previous</button>
        <div class="week-label">Week of {{ weekLabel }}</div>
        <button class="pill-btn" @click="shiftWeek(1)">Next ⟶</button>
      </div>
    </div>

    <!-- MAIN GRID: calendar + sidebar -->
    <div class="main-grid">
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
            <div v-if="day.chores.length === 0" class="empty-day">No chores</div>

            <div v-for="chore in day.chores" :key="chore._id" class="chore-chip">
              <div class="chore-main">
                <span class="chore-title">
                  {{ chore.title }}
                </span>

                <span class="chore-meta">
                  <template v-if="chore.assignedTo"> Assigned to {{ chore.assignedTo }} </template>
                  <template v-else> Shared chore </template>
                  <span v-if="chore.frequency && chore.frequency !== 'once'">
                    · {{ chore.frequency }}
                  </span>
                </span>
              </div>

              <button
                class="chore-action"
                :disabled="!canMarkDone(chore)"
                @click="toggleComplete(chore)"
              >
                <span v-if="isCompleted(chore)">✅ Done</span>
                <span v-else>Mark done</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar: My chores + Upcoming -->
      <aside class="sidebar">
        <div class="card sidebar-card">
          <h3>My chores this week</h3>
          <p class="small-subtitle">Chores created by you or assigned to you.</p>

          <div v-if="myChoresThisWeek.length === 0" class="empty-msg">
            You have no chores this week 🎉
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
          <h3>Upcoming chores</h3>
          <p class="small-subtitle">Next few chores in this week.</p>

          <div v-if="upcomingChores.length === 0" class="empty-msg">Nothing coming up yet.</div>

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
      </aside>
    </div>

    <!-- Add new chore -->
    <div class="card add-card">
      <h3>Add a new chore</h3>
      <form class="add-form" @submit.prevent="onSubmit">
        <div class="form-row">
          <div class="form-control">
            <label>Chore title</label>
            <input v-model="title" type="text" placeholder="e.g. Clean kitchen, Mop living room…" />
          </div>
        </div>

        <div class="form-row two-cols">
          <div class="form-control">
            <label>Assign to (email or name)</label>
            <input v-model="assignedTo" type="text" placeholder="Leave empty for shared chore" />
          </div>

          <div class="form-control">
            <label>Due date</label>
            <input v-model="dueDate" type="date" />
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
            <label>Notes (optional)</label>
            <textarea
              v-model="description"
              rows="2"
              placeholder="Add any extra context or details…"
            ></textarea>
          </div>
        </div>

        <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>

        <div class="form-actions">
          <button type="submit" class="btn-primary">➕ Add chore</button>
        </div>
      </form>
    </div>
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
      allChores: [], // 🔹 ALL chores from backend
      isLoading: false,
      errorMessage: '',

      // form
      title: '',
      description: '',
      assignedTo: '',
      dueDate: '',
      frequency: 'once',

      // week control (0 = this week, +1 next week, -1 previous)
      weekOffset: 0,
    }
  },

  computed: {
    currentUser() {
      return this.$store.getters.currentUser
    },
    householdCode() {
      return this.$store.getters.householdCode
    },

    // Monday of the current week (based on weekOffset)
    weekStartDate() {
      const base = new Date()
      base.setDate(base.getDate() + this.weekOffset * 7)

      const day = base.getDay() // 0=Sun,1=Mon,...
      const diff = day === 0 ? -6 : 1 - day // Monday as first day
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

    // chores inside the *current* week only
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

        // match if:
        //  - assignedTo equals my email or my name (case-insensitive)
        //  - OR createdBy equals my email or my name
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
    // when auth becomes ready after refresh
    householdCode(newVal, oldVal) {
      if (newVal && newVal !== oldVal) {
        this.fetchChores()
      }
    },
  },

  methods: {
    shiftWeek(delta) {
      this.weekOffset += delta
      // no need to refetch; we already have all chores
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
          dueDate: this.dueDate, // "YYYY-MM-DD"
          frequency: this.frequency,
          householdCode: this.householdCode,
          createdBy: this.currentUser.email || this.currentUser.name,
        }

        const res = await axios.post('http://localhost:5000/api/chores', body)

        const created = res.data
        this.allChores.push(created) // 🔹 always push; filters handle week

        // reset form
        this.title = ''
        this.description = ''
        this.assignedTo = ''
        this.dueDate = ''
        this.frequency = 'once'
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

    isCompleted(chore) {
      return !!chore.completed
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
  max-width: 900px;
  margin: 0 auto;
}

.chores-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.chores-header h2 {
  margin: 0;
  color: var(--navy);
}

.subtitle {
  margin: 4px 0 0;
  font-size: 0.9rem;
  color: var(--text-light);
}

.week-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pill-btn {
  border-radius: 999px;
  border: 1px solid var(--card-border);
  background: var(--primary-light);
  padding: 4px 10px;
  font-size: 0.8rem;
  cursor: pointer;
}

.week-label {
  font-size: 0.85rem;
  color: var(--navy);
  font-weight: 600;
}

/* main grid: calendar + sidebar */

.main-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

/* WEEK GRID */

.week-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 6px;
  padding: 10px;
}

.day-column {
  border-radius: 14px;
  background: #fff;
  border: 1px solid var(--card-border);
  padding: 8px 6px;
  display: flex;
  flex-direction: column;
  min-height: 120px;
}

.day-column.today {
  border-color: var(--primary);
  box-shadow: 0 0 0 1px rgba(255, 159, 147, 0.4);
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 6px;
}

.day-name {
  font-weight: 700;
  font-size: 0.8rem;
  color: var(--navy);
}

.day-date {
  font-size: 0.8rem;
  color: var(--text-light);
}

.day-chores {
  flex: 1;
}

.empty-day {
  font-size: 0.75rem;
  color: var(--text-light);
}

/* CHORE CHIP IN GRID */

.chore-chip {
  border-radius: 12px;
  background: var(--primary-light);
  padding: 6px 6px;
  margin-bottom: 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.chore-main {
  display: flex;
  flex-direction: column;
}

.chore-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--navy);
}

.chore-meta {
  font-size: 0.75rem;
  color: var(--text-light);
}

.chore-action {
  align-self: flex-start;
  border-radius: 999px;
  border: none;
  padding: 3px 8px;
  font-size: 0.75rem;
  cursor: pointer;
  background: #fff;
  color: var(--navy);
}

.chore-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* SIDEBAR */

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sidebar-card h3 {
  margin: 0 0 4px;
  color: var(--navy);
}

.small-subtitle {
  margin: 0 0 8px;
  font-size: 0.8rem;
  color: var(--text-light);
}

.empty-msg {
  font-size: 0.8rem;
  color: var(--text-light);
}

/* CARD & FORM */

.card {
  background: #ffffff;
  border-radius: 18px;
  padding: 14px 14px 16px;
  box-shadow: var(--soft-shadow);
  border: 1px solid var(--card-border);
}

.add-card h3 {
  margin-top: 0;
  margin-bottom: 8px;
  color: var(--navy);
}

.add-form {
  margin-top: 4px;
}

.form-row {
  margin-bottom: 10px;
}

.two-cols {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 10px;
}

.form-control label {
  display: block;
  font-size: 0.85rem;
  color: var(--text-light);
}

.form-control input,
.form-control select,
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

.error-msg {
  margin-top: 4px;
  font-size: 0.8rem;
  color: #b91c1c;
}
</style>
