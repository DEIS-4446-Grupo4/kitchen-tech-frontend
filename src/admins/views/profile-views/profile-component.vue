<template>
  <div class="layout">
    <sidebar-component :restaurant-name="restaurantName" :role="userRole" class="sidebar" />
    <div class="main-content">
      <header-component :restaurant-name="restaurantName" :role="userRole" class="header" />
      <div class="page-container">
        <p class="title">Edit User Details</p>
        <form @submit.prevent="isEditing ? updateRestaurant() : toggleEdit()" class="form">
          <div class="form-group">
            <label for="username">Username:</label>
            <input type="text" id="username" v-model="userData.username" :disabled="!isEditing" required />
          </div>
          <div class="form-group" v-if="isEditing">
            <label for="password">Password:</label>
            <input type="password" id="password" v-model="password" :disabled="!isEditing" />
          </div>
          <div class="form-group" v-if="isEditing">
            <label for="confirm-password">Confirm Password:</label>
            <input type="password" id="confirm-password" v-model="confirmPassword" :disabled="!isEditing" />
          </div>
          <div class="form-group">
            <label for="restaurant-name">Restaurant Name:</label>
            <input type="text" id="restaurant-name" v-model="userData.restaurantName" :disabled="!isEditing" required />
          </div>
          <div class="form-group">
            <label for="phone">Phone:</label>
            <input type="tel" id="phone" v-model="userData.phone" :disabled="!isEditing" required />
          </div>
          <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" v-model="userData.email" :disabled="!isEditing" required />
          </div>
          <div class="form-group">
            <label for="city">City:</label>
            <input type="text" id="city" v-model="userData.city" :disabled="!isEditing" required />
          </div>
          <div class="form-group">
            <label for="district">District:</label>
            <input type="text" id="district" v-model="userData.district" :disabled="!isEditing" required />
          </div>
          <button type="submit" class="submit-button">{{ isEditing ? "Save" : "Edit" }}</button>
        </form>
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
      isEditing: false,
      password: '',
      confirmPassword: '',
      userData: {
        username: '',
        password: '',
        restaurantName: '',
        phone: '',
        email: '',
        city: '',
        district: '',
      }
    };
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
          this.userData = {
            ...this.userData,
            restaurantId: restaurantData.id,
            username: restaurantData.username,
            restaurantName: restaurantData.name,
            phone: restaurantData.phone,
            email: restaurantData.email,
            city: restaurantData.city,
            district: restaurantData.district,
          };
          this.restaurantName = restaurantData.name;
          this.userRole = userData.role;
        }
      } catch (error) {
        console.error("Error fetching restaurant data: ", error);
      }
    },

    toggleEdit() {
      this.isEditing = !this.isEditing;
    },

    async updateRestaurant() {
      if (this.password !== this.confirmPassword) {
        alert("Passwords do not match.");
        return;
      }

      const updatedDetails = {
        restaurantId: this.userData.restaurantId,
        username: this.userData.username,
        name: this.userData.restaurantName,
        phone: this.userData.phone,
        email: this.userData.email,
        city: this.userData.city,
        district: this.userData.district,
        image: this.userData.image,
      };

      if (this.password) {
        updatedDetails.password = this.password;
      }
      console.log(updatedDetails)
      try {
        await userService.updateRestaurantById(this.userData.restaurantId, updatedDetails);
        alert("User details updated successfully!");
        this.isEditing = false;
      } catch (error) {
        console.error("Error updating user details:", error);
      }
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
  margin-left: 255px; /* Desplaza el contenido a la derecha del sidebar */
  width: calc(100% - 280px); /* Ajusta el ancho para ocupar el resto de la pantalla */
  display: flex;
  flex-direction: column;
}
.page-container {
  margin-top: 70px; /* Desplaza el contenido principal por debajo del header */
  padding: 20px;
  background-color: #F6F5FA; /* Fondo blanco para la zona de contenido */
  height: calc(100vh - 100px); /* Ajusta el alto para evitar desbordamientos */
  font-family: 'Red Hat Display', sans-serif;
}

.title {
  font-weight: 800;
  font-size: 1.5rem;
  max-width: 1000px;
  color: #31304A;
  margin: 0;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  font-size: 0.8rem;
  margin-left: 30%;
}
.form-group {
  display: flex;
  flex-direction: column;
  max-width: 600px;
}
.form-group label {
  font-weight: bold;
  margin-bottom: 5px;
  color: #31304A;
}
.form-group input {
  padding: 15px;
  background-color: #D3D2E5;
  border: 1px solid #F6F5FA;
  border-radius: 5px;
  font-size: 0.7rem;
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
}
</style>
