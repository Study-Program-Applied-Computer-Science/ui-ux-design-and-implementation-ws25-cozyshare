<template>
  <div class="chores-container">
    <h2>Chores</h2>
    <p class="subtitle">Manage shared household chores for your flatmates.</p>

    <!-- Add new chore -->
    <form class="add-form" @submit="onSubmit">
      <div class="form-control">
        <label>Chore Title</label>
        <input v-model="title" type="text" placeholder="e.g. Clean kitchen" />
      </div>

      <div class="form-control">
        <label>Assigned To</label>
        <input v-model="assignedTo" type="text" placeholder="e.g. Navya" />
      </div>

      <div class="form-control">
        <label>Due Date (optional)</label>
        <input v-model="dueDate" type="date" />
      </div>

      <input type="submit" value="Add Chore" class="btn btn-block" />
    </form>

    <!-- Weekly View -->
    <h3>This Week’s Chores</h3>

    <div v-for="(chores, day) in weeklyChores" :key="day" class="week-day">
      <h4>{{ day }}</h4>

      <div v-if="chores.length === 0" class="empty-day">No chores</div>

      <ChoreItem
        v-for="chore in chores"
        :key="chore._id"
        :chore="chore"
        @toggle-done="toggleDone"
        @delete-chore="deleteChore"
        :isToday="isToday(chore)"
      />
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import ChoreItem from '../components/chores/ChoreItem.vue'

export default {
  name: 'Chores',

  components: {
    ChoreItem,
  },

  props: {
    currentUser: Object,
  },

  data() {
    return {
      title: '',
      assignedTo: '',
      dueDate: '',
      chores: [],
      weeklyChores: {},
    }
  },

  methods: {
    async fetchChores() {
      try {
        if (!this.currentUser?.householdCode) return

        const res = await axios.get('http://localhost:5000/api/chores', {
          params: {
            householdCode: this.currentUser.householdCode,
          },
        })

        this.chores = res.data
        this.organizeWeeklyChores()
      } catch (err) {
        console.error('Error fetching chores', err)
      }
    },

    // Group chores by week
    organizeWeeklyChores() {
      const week = {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: [],
      }

      this.chores.forEach((chore) => {
        if (!chore.dueDate) return

        const date = new Date(chore.dueDate)
        const dayIndex = date.getDay() // 0 = Sun, 1 = Mon...
        const dayNames = [
          'Sunday',
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ]

        const dayName = dayNames[dayIndex]
        week[dayName].push(chore)
      })

      this.weeklyChores = week
    },

    // Highlight if due today
    isToday(chore) {
      if (!chore.dueDate) return false

      const today = new Date()
      const due = new Date(chore.dueDate)

      return (
        today.getDate() === due.getDate() &&
        today.getMonth() === due.getMonth() &&
        today.getFullYear() === due.getFullYear()
      )
    },

    async onSubmit(e) {
      e.preventDefault()

      if (!this.title || !this.assignedTo) {
        alert('Title and Assigned To are required')
        return
      }

      try {
        const body = {
          title: this.title,
          assignedTo: this.assignedTo,
          dueDate: this.dueDate || null,
          createdBy: this.currentUser.email,
          householdCode: this.currentUser.householdCode,
        }

        const res = await axios.post('http://localhost:5000/api/chores', body)
        this.chores.unshift(res.data)
        this.organizeWeeklyChores()

        this.title = ''
        this.assignedTo = ''
        this.dueDate = ''
      } catch (err) {
        console.error('Error adding chore', err)
      }
    },

    async toggleDone(choreId) {
      try {
        const res = await axios.patch(`http://localhost:5000/api/chores/${choreId}/toggle`)

        this.chores = this.chores.map((c) => (c._id === choreId ? res.data : c))

        this.organizeWeeklyChores()
      } catch (err) {
        console.error('Error toggling chore', err)
      }
    },

    async deleteChore(choreId) {
      if (!confirm('Delete this chore?')) return

      try {
        await axios.delete(`http://localhost:5000/api/chores/${choreId}`)
        this.chores = this.chores.filter((c) => c._id !== choreId)

        this.organizeWeeklyChores()
      } catch (err) {
        console.error('Error deleting chore', err)
      }
    },
  },

  mounted() {
    this.fetchChores()
  },
}
</script>

<style scoped>
.chores-container {
  max-width: 600px;
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

.form-control input {
  width: 100%;
  height: 38px;
  margin: 5px 0;
  padding: 4px 8px;
  font-size: 15px;
}

.btn.btn-block {
  width: 100%;
  padding: 10px;
}
</style>
