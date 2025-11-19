<template>
  <div class="card-container">
    <div class="card">
      <div class="card-header">
        <img class="logo" src="../../../public/assets/images/logo.png" alt="brand-logo"/>
        <p class="card-title">Sign In</p>
      </div>

      <!-- Formulario para el username -->
      <form @submit.prevent="onSubmit">
        <!-- Input para el username -->
        <div class="form-field">
          <label for="username">Username</label>
          <input
              type="text"
              id="username"
              v-model="username"
              placeholder="Ex. fcastro"
          />
          <span v-if="!username && usernameTouched">Please enter your username</span>
        </div>

        <!-- Input para la contraseña -->
        <div class="form-field">
          <label for="password">Password</label>
          <div class="password-wrapper">
            <input
                :type="passwordVisible ? 'text' : 'password'"
                id="password"
                v-model="password"
                placeholder="Enter your password"
            />
            <img
                :src="passwordVisible ? require('/public/assets/images/show.png') : require('/public/assets/images/hide.png')"
                @click="togglePasswordVisibility"
                class="password-toggle"
                alt="toggle visibility"
            />
          </div>
          <span v-if="!password && passwordTouched">Please enter a password</span>
          <span v-if="password.length > 0 && password.length < 6">Your password must have at least 6 characters</span>
        </div>

        <button class="login-button" type="submit">Sign In</button>
        <div class="signup-redirect">
          <router-link to="/signup">Don't have an account? Sign up</router-link>
        </div>
        <p v-if="loginError" class="error-message">{{ loginError }}</p>
      </form>
    </div>
  </div>
</template>

<script>
import authService from "@/public/services/authService";
import userService from "@/public/services/userService";

export default {
  data() {
    return {
      username: '',
      usernameTouched: false,
      password: '',
      passwordTouched: false,
      passwordVisible: false,
      loginError: null
    };
  },
  methods: {
    togglePasswordVisibility() {
      this.passwordVisible = !this.passwordVisible;
    },
    async onSubmit() {
      this.usernameTouched = true;
      this.passwordTouched = true;

      if (this.username && this.password.length >= 6) {
        try {
          const response = await authService.login(this.username, this.password);

          if (response.success) {
            localStorage.setItem('token', response.token);

            // Guarda todos los datos necesarios en userData
            const userData = await userService.getRestaurantById(response.restaurantId);

            localStorage.setItem('userData', JSON.stringify({
              restaurantId: response.restaurantId,
              name: userData.name,
              role: response.role
            }));

            // Redirige a la vista adecuada después del login
            const basePath = `/${this.username}/${response.role}`;
            this.$router.push(`${basePath}/casing`);
          } else {
            this.loginError = response.message;
          }
        } catch (error) {
          this.loginError = 'An error occurred. Please try again';
        }
      }
    }
  }
};
</script>

<style scoped>
.card-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #F6F5FA;
  font-family: 'Red-hat-display', sans-serif;
}
.card {
  width: 100%;
  max-width: 600px;
  background-color: #D3D2E5;
  color: #F6F5FA;
  padding: 50px 80px;
  border-radius: 10px;
  box-sizing: border-box;
}

.card-header {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding-bottom: 30px;
}
.logo{
  width: 150px;
}
.card-title {
  margin: 0;
  font-size: 2.4rem;
  font-weight: 800;
  color: #31304A;
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
.form-field span {
  color: #b14343;
  font-size: 0.8rem;
  margin-left: 5px;
}

.login-button {
  width: 100%;
  margin: 0 0 16px 0;
  color: #F6F5FA;
  padding: 16px;
  background: #31304A;
  font-weight: 500;
  font-size: 1rem;
  border-radius: 5px;
  cursor: pointer;
  box-sizing: border-box;
}
.signup-redirect {
  text-align: right;
  margin-right: 5px;
}
.signup-redirect a {
  color: #31304A;
}
.error-message{
  color: #b14343;
  font-size: 0.8rem;
  margin-left: 5px;
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
  margin: 0 5px;
}
</style>
