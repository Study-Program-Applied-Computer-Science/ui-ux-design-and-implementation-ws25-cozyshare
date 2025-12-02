<template>
  <div class="container">

    <!-- LOGIN & REGISTER BUTTONS -->
    <div class="login_registration">
      <Button
        v-if="!isUserLoggedIn"
        color="green"
        text="Login"
        eventName="login_clicked"
        @login_clicked="showLogin"
      />

      <Button
        v-if="!isUserLoggedIn"
        color="grey"
        text="Register"
        eventName="register_clicked"
        @register_clicked="showRegister"
      />
    </div>

    <p v-if="isRegistrationSuccessfull" class="success-msg">
      Registration Successful — Please Login
    </p>

    <!-- FORM -->
    <form class="add-form" v-if="isLoginActive || isRegisterActive" @submit="onSubmit">
      <div class="form-control">
        <label>Email</label>
        <input type="email" v-model="email" placeholder="Email" />
      </div>

      <div class="form-control">
        <label>Password</label>
        <input type="password" v-model="password" placeholder="Password" />
      </div>

      <!-- Name only for Register -->
      <div class="form-control" v-if="isRegisterActive">
        <label>Name</label>
        <input type="text" v-model="name" placeholder="Your Name" />
      </div>

      <!-- Household section for Register -->
      <div v-if="isRegisterActive" class="form-control">
        <label>Household Mode</label>
        <div class="toggle-row">
          <label>
            <input type="radio" value="create" v-model="householdMode" />
            Create New Household
          </label>
          <label>
            <input type="radio" value="join" v-model="householdMode" />
            Join via Code
          </label>
        </div>
      </div>

      <div v-if="isRegisterActive && householdMode === 'create'" class="form-control">
        <label>Household Name</label>
        <input type="text" v-model="householdName" placeholder="e.g. Cozy Flat 12B" />
      </div>

      <div v-if="isRegisterActive && householdMode === 'join'" class="form-control">
        <label>Invite Code</label>
        <input type="text" v-model="inviteCode" placeholder="Enter invite code" />
      </div>

      <input
        type="submit"
        class="btn btn-block"
        :value="isLoginActive ? 'Login' : 'Register'"
      />
    </form>

  </div>
</template>

<script>
import Button from "../components/Button.vue";
import axios from "axios";

export default {
  name: "Login",

  data() {
    return {
      email: "",
      password: "",
      name: "",
      isLoginActive: false,
      isRegisterActive: false,
      isRegistrationSuccessfull: false,
      isUserLoggedIn: false,

      householdMode: "create", // 'create' or 'join'
      householdName: "",
      inviteCode: "",
    };
  },

  components: {
    Button,
  },

  emits: ["authenticated"],

  methods: {
    showLogin() {
      this.isLoginActive = true;
      this.isRegisterActive = false;
      this.isRegistrationSuccessfull = false;
    },

    showRegister() {
      this.isRegisterActive = true;
      this.isLoginActive = false;
      this.isRegistrationSuccessfull = false;
    },

    async onSubmit(e) {
      e.preventDefault();

      if (!this.email.includes("@") || this.password.length < 6) {
        alert("Enter valid email and password (min 6 chars)");
        return;
      }

      try {
        if (this.isRegisterActive) {
          // REGISTER PAYLOAD
          const payload = {
            name: this.name,
            email: this.email,
            password: this.password,
            mode: this.householdMode,
            householdName: this.householdMode === "create" ? this.householdName : null,
            inviteCode: this.householdMode === "join" ? this.inviteCode : null,
          };

          const res = await axios.post("http://localhost:5000/api/auth/register", payload);

          if (res.status === 201) {
            this.isRegistrationSuccessfull = true;
            this.isRegisterActive = false;

            if (res.data.householdCode && this.householdMode === "create") {
              alert(`Your household invite code is: ${res.data.householdCode}`);
            }

            this.email = "";
            this.password = "";
            this.name = "";
            this.householdName = "";
            this.inviteCode = "";
          }
        }

        if (this.isLoginActive) {
          const res = await axios.post("http://localhost:5000/api/auth/login", {
            email: this.email,
            password: this.password,
          });

          if (res.data) {
            localStorage.setItem("cozyshare_user", JSON.stringify(res.data.user));
            this.$emit("authenticated", res.data.user);
          }
        }
      } catch (err) {
        alert(err.response?.data?.message || "Something went wrong");
      }
    },
  },
};
</script>


<style scoped>
.container {
  max-width: 500px;
  margin: 2rem auto;
}

.login_registration {
  text-align: center;
  margin-bottom: 20px;
}

.add-form {
  margin-top: 20px;
  margin-bottom: 40px;
}

.form-control {
  margin: 20px 0;
}

.form-control label {
  display: block;
}

.form-control input {
  width: 100%;
  height: 40px;
  margin: 5px;
  padding: 3px 7px;
  font-size: 17px;
}

.success-msg {
  color: green;
  margin-bottom: 15px;
  text-align: center;
}

.btn {
  width: 100%;
  padding: 10px;
  margin-top: 15px;
}

.toggle-row {
  display: flex;
  gap: 10px;
  margin-top: 5px;
}

.toggle-row label {
  font-size: 0.9rem;
}

</style>
