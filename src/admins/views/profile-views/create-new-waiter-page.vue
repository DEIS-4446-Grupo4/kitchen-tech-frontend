<template>
  <div class="layout">
    <sidebar-component :restaurant-name="restaurantName" :role="userRole" class="sidebar" />
    <div class="main-content">
      <header-component :restaurant-name="restaurantName" :role="userRole" class="header" />
      <div class="page-container">
        <h1>Add New Waiter</h1>
        <div class="content-split">
          <!-- Sección izquierda: Formulario -->
          <div class="form-container">
            <form @submit.prevent="addWaiter" class="form">
              <div class="form-row">
                <div class="form-field">
                  <label for="username">Username</label>
                  <input type="text" id="username" v-model="waiter.username" @blur="touched.username = true" placeholder="Ex. adminLaRomana" required />
                  <span v-if="touched.username && !waiter.username" class="error">{{ usernameError }}</span>
                </div>
              </div>
              <div class="form-row">
                <div class="form-field">
                  <label for="name">Name</label>
                  <input type="text" id="name" v-model="waiter.name" @blur="touched.name = true" placeholder="Ex. Nicolás" required />
                  <span v-if="touched.name && !waiter.name" class="error">This field is mandatory</span>
                </div>
                <div class="form-field">
                  <label for="name">Lastname</label>
                  <input type="text" id="lastname" v-model="waiter.lastname" @blur="touched.lastname = true" placeholder="Zagal" required />
                  <span v-if="touched.lastname && !waiter.lastname" class="error">This field is mandatory</span>
                </div>
              </div>
              <div class="form-row">
                <div class="form-field">
                  <label for="email">Email</label>
                  <input type="email" id="email" v-model="waiter.email" @blur="touched.email = true" placeholder="Ex. email@example.com" required />
                  <span v-if="touched.email && emailError" class="error">{{ emailError }}</span>
                </div>
                <div class="form-field">
                  <label for="phone">Phone</label>
                  <input type="tel" id="phone" v-model="waiter.phone" @blur="touched.phone = true" placeholder="Ex. 904688149" required />
                  <span v-if="touched.phone && phoneError" class="error">{{ phoneError }}</span>
                </div>
              </div>
              <div class="form-row">
                <div class="form-field">
                  <label for="password">Password</label>
                  <div class="password-wrapper">
                    <input :type="waiter.passwordVisible ? 'text' : 'password'"
                           id="password"
                           v-model="waiter.password"
                           @blur="touched.password = true"
                           placeholder="Create your password"
                           required />
                    <img
                        :src="waiter.passwordVisible ? require('/public/assets/images/show.png') : require('/public/assets/images/hide.png')"
                        @click="togglePasswordVisibility"
                        class="password-toggle"
                        alt="toggle visibility"
                    />
                  </div>
                  <span v-if="touched.password && passwordError" class="error">{{ passwordError }}</span>
                </div>

                <div class="form-field">
                  <label for="confirmPassword">Confirm Password</label>
                  <div class="password-wrapper">
                    <input :type="waiter.confirmPasswordVisible ? 'text' : 'password'"
                           id="confirmPassword"
                           v-model="waiter.confirmPassword"
                           @blur="touched.confirmPassword = true"
                           placeholder="Confirm your password"
                           required />
                    <img
                        :src="waiter.confirmPasswordVisible ? require('/public/assets/images/show.png') : require('/public/assets/images/hide.png')"
                        @click="toggleConfirmPasswordVisibility"
                        class="password-toggle"
                        alt="toggle visibility"
                    />
                  </div>
                  <span v-if="touched.confirmPassword && confirmPasswordError" class="error">{{ confirmPasswordError }}</span>
                </div>
              </div>
              <button type="submit" class="submit-button">Add Waiter</button>
            </form>
          </div>
          <div class="image-container">
            <img src="../../../../public/assets/images/create-waiter.svg" alt="Waiter Illustration" class="waiter-image" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import HeaderComponent from "@/admins/components/header-component.vue";
import SidebarComponent from "@/admins/components/sidebar-component.vue";
import userService from "@/public/services/userService";

export default {
  components: {
    HeaderComponent,
    SidebarComponent,
  },
  data() {
    return {
      restaurantName: '',
      userRole: '',
      waiter: {
        username: '',
        name: '',
        lastname: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
      },
      touched:{
        username: '',
        name: '',
        lastname: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
      }
    };
  },
  computed: {
    usernameError() {
      if (!this.username) return "This field is mandatory";
      if (/\s/.test(this.username)) return "Username must not have blank spaces";
      if (!/^[a-zA-Z0-9]+$/.test(this.username)) return "The username must not have special characters";
      return null;
    },
    emailError() {
      if (!this.email) return "This field is mandatory";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) return "Email not valid";
      return null;
    },
    phoneError() {
      if (!this.phone) return "This field is mandatory";
      if (!/^\d{9}$/.test(this.phone)) return "Phone number not valid";
      return null;
    },
    passwordError() {
      if (!this.password) return "This field is mandatory";
      if (this.password.length < 6) return "Password must have 6 characters at least";
      if (!/[a-z]/.test(this.password)) return "Must contain 1 lowercase at least";
      if (!/[A-Z]/.test(this.password)) return "Must contain 1 uppercase at least";
      if (!/[!@#$%^&*]/.test(this.password)) return "Must contain 1 special character at least";
      return null;
    },
    confirmPasswordError() {
      if (!this.confirmPassword) return "This field is mandatory";
      if (this.confirmPassword !== this.password) return "Passwords don't match";
      return null;
    }
  },
  beforeMount() {
    this.fetchUserData();
  },
  methods: {
    async fetchUserData() {
      try {
        const userData = JSON.parse(localStorage.getItem("userData"));
        const restaurantId = userData?.restaurantId;

        if (restaurantId) {
          const restaurantData = await userService.getRestaurantById(restaurantId);
          this.restaurantName = restaurantData.name;
          this.userRole = userData.role;
        }
      } catch (error) {
        console.error("Error fetching restaurant data: ", error);
      }
    },

    togglePasswordVisibility() {
      this.passwordVisible = !this.passwordVisible;
    },
    toggleConfirmPasswordVisibility() {
      this.confirmPasswordVisible = !this.confirmPasswordVisible;
    },

  },
}
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
  background: #F6F5FA;
}
.main-content {
  margin-left: 255px;
  width: calc(100% - 280px);
  display: flex;
  flex-direction: column;
}
.page-container {
  font-family: 'Red-hat-display', sans-serif;
  font-weight: 100;
  margin-top: 70px;
  padding: 20px;
  background-color: #F6F5FA;
  height: calc(100vh - 100px);
}
.content-split {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-top: 20px;
}
.form-container {
  flex: 1;
}
.image-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}
.waiter-image {
  max-width: 100%;
  height: auto;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.form-field {
  width: 100%;
  margin-bottom: 20px;
}
.form-field label {
  font-weight: 700;
  color: #31304A;
}
.form-field input {
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  border: none;
  border-radius: 5px;
  color: #31304A;
  margin: 10px 0;
  font-weight: 500;
  box-sizing: border-box;
}
span {
  color: #b14343;
  font-size: 0.8rem;
  margin-left: 5px;
}

.form-row {
  display: flex;
  gap: 20px;
}
.form-row .form-field {
  flex: 1;
}
.password-wrapper {
  display: flex;
  align-items: center;
}
.password-wrapper input {
  flex: 1;
}

.password-wrapper button {
  background: none;
  border: none;
  color: #31304A;
  cursor: pointer;
  margin-left: 5px;
}
.password-toggle{
  width: 25px;
  margin-left: 5px;
}

.submit-button {
  background-color: #31304A;
  color: #F6F5FA;
  padding: 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background-color 0.3s;
  max-width: 600px;
}
.submit-button:active {
  background-color: #201E35;
  width: 100%;
}
</style>
