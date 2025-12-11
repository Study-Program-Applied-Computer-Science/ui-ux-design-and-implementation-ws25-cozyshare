import { createStore } from 'vuex'

export default createStore({
  state() {
    return {
      user: null,
      token: null,
      householdCode: null,
    }
  },

  mutations: {
    SET_AUTH(state, payload) {
      state.user = payload.user
      state.token = payload.token || null
      state.householdCode = payload.householdCode || null
    },
    CLEAR_AUTH(state) {
      state.user = null
      state.token = null
      state.householdCode = null
    },
  },

  actions: {
    // called after successful login
    login({ commit }, { user, token, householdCode }) {
      commit('SET_AUTH', { user, token, householdCode })

      localStorage.setItem('cozyshare_user', JSON.stringify(user))
      localStorage.setItem('cozyshare_token', token || '')
      localStorage.setItem('cozyshare_household', householdCode || '')
    },

    // called from header logout
    logout({ commit }) {
      commit('CLEAR_AUTH')
      localStorage.removeItem('cozyshare_user')
      localStorage.removeItem('cozyshare_token')
      localStorage.removeItem('cozyshare_household')
    },

    // called once when the app starts (in main.js)
    initAuth({ commit }) {
      const userStr = localStorage.getItem('cozyshare_user')
      const token = localStorage.getItem('cozyshare_token') || null
      const householdCode = localStorage.getItem('cozyshare_household') || null

      if (userStr) {
        const user = JSON.parse(userStr)
        commit('SET_AUTH', { user, token, householdCode })
      }
    },
  },

  getters: {
    isAuthenticated: (state) => !!state.user,
    currentUser: (state) => state.user,

    userName: (state) => {
      if (!state.user) return ''
      return state.user.name || state.user.email || ''
    },

    householdCode: (state) => state.householdCode,
  },
})
