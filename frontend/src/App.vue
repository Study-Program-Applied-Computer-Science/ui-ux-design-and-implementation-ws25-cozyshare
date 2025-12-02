<template>
  <div>
    <!-- If NOT logged in → show login page -->
    <Login v-if="!user" @authenticated="setUser" />

    <!-- If logged in → show CozyShare dashboard + chores -->
    <div v-else class="cozyshare">
      <h1>Welcome to CozyShare, {{ user.name }}!</h1>
      <p>This is your household dashboard.</p>

      <!-- Chores section -->
      <Chores :currentUser="user" />

      <button class="btn" @click="logout">Logout</button>
    </div>
  </div>
</template>

<script>
import Login from "./views/Login.vue";
import Chores from "./views/Chores.vue";

export default {
  name: "App",

  components: {
    Login,
    Chores,
  },

  data() {
    return {
      user: null,
    };
  },

  methods: {
    setUser(userData) {
      this.user = userData;
    },

    logout() {
      this.user = null;
      localStorage.removeItem("cozyshare_user");
    },
  },

  mounted() {
    const storedUser = localStorage.getItem("cozyshare_user");
    if (storedUser) {
      this.user = JSON.parse(storedUser);
    }
  },
};
</script>

<style scoped>
.cozyshare {
  max-width: 700px;
  margin: 2rem auto;
}
.btn {
  padding: 10px;
  margin-top: 20px;
  width: 100%;
}
</style>
