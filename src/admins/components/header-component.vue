<template>
  <header>
    <img class="logo" src="../../../public/assets/images/logo.png" alt="brand-logo"/>
    <div class="action-buttons">
      <button class="dropdown" @click="toggleDropdown">
        <img class="profile-button" src="../../../public/assets/images/profile.png" alt="profile-button"/>
      </button>
      <div v-if="isDropdownVisible" class="dropdown-menu">
        <ul>
          <li @click="viewProfile">View Profile</li>
          <li @click="newWaiter">Creat New Waiter</li>
          <li @click="logout">Log Out</li>
        </ul>
      </div>
    </div>
  </header>
</template>


<script>
export default {
  name: 'HeaderComponent',
  created() {
    const restaurantData = JSON.parse(localStorage.getItem('userData'));
    if (restaurantData) {
      this.restaurantName = restaurantData.name;
      this.role = restaurantData.role;
    }
  },
  data() {
    return {
      isDropdownVisible: false,
    };
  },
  methods: {
    toggleDropdown() {
      this.isDropdownVisible = !this.isDropdownVisible;
    },
    viewProfile() {
      const fullPath = `/${this.restaurantName}/${this.role}/profile`;
      this.$router.push(fullPath);
      console.log('View Profile');
    },
    newWaiter() {
      const fullPath = `/${this.restaurantName}/${this.role}/create-new-waiter`;
      this.$router.push(fullPath);
      console.log('New Waiter');
    },
    logout() {
      if(confirm("Are you sure you want to logout?")) {
        localStorage.removeItem('token');    // Eliminar el token y los datos del usuario del localStorage

        localStorage.removeItem('userData');
        
        this.$router.push('/login');
        // Eliminar el token y los datos del usuario del localStorage
    
        console.log('Logout');
      } else {
        console.log('Logout canceled');
      }

    }
  }
}
</script>

<style scoped>
.logo {
  margin: 5px 50px;
  width: 80px;
}
header {
  z-index: 1;
  position: fixed;
  display: flex;
  background-color: #5E5E99;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  max-height: 70px;
}
.profile-button {
  width: 40px;
  background-color: transparent;
  cursor: pointer;
}
.dropdown {
  border: none;
  background-color: transparent;
  cursor: pointer;
  margin: 5px 55px;
}
.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 50px;
  background-color: #F6F5FA;
  border: 1px solid #F6F5FA;
  border-radius: 5px;
  box-shadow: 0 1px 2px #31304A;
  width: 150px;
  font-family: "Roboto", sans-serif;
  font-weight: 100;
  color: #31304A;
  padding: 5px;
}
.dropdown-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.dropdown-menu li {
  padding: 10px;
  cursor: pointer;
  text-align: left;
}
.dropdown-menu li:hover {
  background-color: #f1f1f1;
}
</style>
