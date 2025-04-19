<template>
  <div class="card-container">
    <div class="card">
      <div class="card-header">
        <img class="logo" src="../../../public/assets/images/logo.png" alt="brand logo"/>
        <p class="card-title">Sign Up</p>
      </div>

      <form @submit.prevent="onSubmit" class="signup-form">
        <!-- Username Field -->
        <div class="form-row">
          <div class="form-field">
            <label for="username">Username</label>
            <input type="text" id="username" v-model="username" @blur="touched.username = true" placeholder="Ex. adminLaRomana" required />
            <span v-if="touched.username && usernameError" class="error">{{ usernameError }}</span>
          </div>
        </div>

        <!-- Name Field -->
        <div class="form-row">
          <div class="form-field">
            <label for="name">Restaurant Name</label>
            <input type="text" id="name" v-model="name" @blur="touched.name = true" placeholder="Ex. La Romana" required />
            <span v-if="touched.name && !name" class="error">This field is mandatory</span>
          </div>
        </div>

        <!-- Email and Phone Fields -->
        <div class="form-row">
          <div class="form-field">
            <label for="email">Email</label>
            <input type="email" id="email" v-model="email" @blur="touched.email = true" placeholder="Ex. email@example.com" required />
            <span v-if="touched.email && emailError" class="error">{{ emailError }}</span>
          </div>
          <div class="form-field">
            <label for="phone">Phone</label>
            <input type="tel" id="phone" v-model="phone" @blur="touched.phone = true" placeholder="Ex. 904688149" required />
            <span v-if="touched.phone && phoneError" class="error">{{ phoneError }}</span>
          </div>
        </div>

        <!-- Password and Confirm Password Fields -->
        <div class="form-row">
          <div class="form-field">
            <label for="password">Password</label>
            <div class="password-wrapper">
              <input :type="passwordVisible ? 'text' : 'password'"
                     id="password"
                     v-model="password"
                     @blur="touched.password = true"
                     placeholder="Create your password"
                     required />
              <img
                  :src="passwordVisible ? require('/public/assets/images/show.png') : require('/public/assets/images/hide.png')"
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
              <input :type="confirmPasswordVisible ? 'text' : 'password'"
                     id="confirmPassword"
                     v-model="confirmPassword"
                     @blur="touched.confirmPassword = true"
                     placeholder="Confirm your password"
                     required />
              <img
                  :src="confirmPasswordVisible ? require('/public/assets/images/show.png') : require('/public/assets/images/hide.png')"
                  @click="toggleConfirmPasswordVisibility"
                  class="password-toggle"
                  alt="toggle visibility"
              />
            </div>
            <span v-if="touched.confirmPassword && confirmPasswordError" class="error">{{ confirmPasswordError }}</span>
          </div>
        </div>

        <button class="signup-button" type="submit">Sign Up</button>

        <div class="login-redirect">
          <router-link to="/login">Already have an account? Login</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import authService from "@/public/services/authService";

export default {
  data() {
    return {
      username: '',
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      city: '',
      district: '',
      passwordVisible: false,
      confirmPasswordVisible: false,
      touched: {
        username: false,
        name: false,
        email: false,
        phone: false,
        password: false,
        confirmPassword: false,
        city: false,
        district: false,
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
  methods: {
    togglePasswordVisibility() {
      this.passwordVisible = !this.passwordVisible;
    },
    toggleConfirmPasswordVisibility() {
      this.confirmPasswordVisible = !this.confirmPasswordVisible;
    },
    async onSubmit() {
      if (
          this.usernameError ||
          this.emailError ||
          this.phoneError ||
          this.passwordError ||
          this.confirmPasswordError
      ) {
        alert("There are errors in the form. Please check it before continue");
        return;
      }

      const userData = {
        username: this.username,
        name: this.name,
        email: this.email.toLowerCase(),
        password: this.password,
        phone: this.phone,
        city: this.city,
        district: this.district,
        image: "https://cdn-icons-png.flaticon.com/512/3135/3135768.png",
        role: 0,
      };

      try {
        const response = await authService.signupRestaurant(userData);
        if (response.success) {
          this.$router.push('/login');
        } else {
          alert(response.message);
        }
      } catch (error) {
        console.error('Error during signup process:', error);
        alert('An error occurred: ' + error.message);
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
span {
  color: #b14343;
  font-size: 0.8rem;
  margin-left: 5px;
}

.dropdown-form-field select {
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

.form-row {
  display: flex;
  gap: 20px;
}
.form-row .form-field {
  flex: 1;
}

.signup-button {
  width: 100%;
  margin: 0 0 16px 0;
  color: #F6F5FA;
  padding: 24px;
  background: #31304A;
  font-weight: 500;
  font-size: 1rem;
  border-radius: 5px;
  cursor: pointer;
}
.login-redirect {
  text-align: right;
  margin-right: 5px;
}
.login-redirect a {
  color: #31304A;
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
</style>

