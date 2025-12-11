// src/main.js
import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import store from './store'
import BaseBadge from './components/ui/BaseBadge.vue' // like class project
import './theme.css'

const app = createApp(App)

store.dispatch('initAuth')
app.use(router)
app.use(store)

// global reusable badge (you can use it in Home, Chores, etc.)
app.component('base-badge', BaseBadge)

app.mount('#app')
