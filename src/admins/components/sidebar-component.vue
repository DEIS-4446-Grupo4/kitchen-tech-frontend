<template>
  <div class="sidebar-container">
    <div class="sidebar">
      <div class="sidebar-header">
        <p>{{ restaurantName }}</p>
      </div>

      <div class="sidebar-body">
        <button
            v-for="button in sidebarButtons"
            :key="button.route"
            class="sidebar-button"
            :class="{ 'active-button': isActive(button.route) }"
            @click="navigate(button.route)"
        >
          {{ button.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SideBarComponent',
  created() {
    const restaurantData = JSON.parse(localStorage.getItem('userData'));
    if (restaurantData) {
      this.restaurantName = restaurantData.name;
      this.role = restaurantData.role;
    }
  },
  data() {
    return {
      sidebarButtons: [
        { label: 'Casing', route: 'casing' },
        { label: 'Saved Accounts', route: 'saved-accounts' },
        { label: 'Tables', route: 'tables' },
        //{ label: 'Sales History', route: 'sales-history' },
        //{ label: 'Casing Movements', route: 'casing-movements' },
        { label: 'Products', route: 'products' },
        //{ label: 'Sales Report', route: 'sales-report' },
        //{ label: 'Inventory', route: 'inventory' },
      ]
    };
  },
  methods: {
    navigate(route) {
      // Construir la ruta con restaurantName y role
      const fullPath = `/${this.restaurantName}/${this.role}/${route}`;
      this.$router.push(fullPath);
    },
    isActive(route) {
      // Comparar la ruta actual con la ruta dinámica
      const fullPath = `/${this.restaurantName}/${this.role}/${route}`;
      return this.$route.path === fullPath;
    }
  }
};
</script>

<style scoped>
.sidebar-container {
  display: flex;
}
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 220px;
  padding-top: 40px;
  padding-right: 10px;
  background-color: #31304A;
  color: #F6F5FA;
  overflow-y: auto;
}

.sidebar-header {
  padding-top: 80px;
  text-align: center;
  font-weight: 600;
  font-size: 1.3rem;
  font-family: 'Red-hat-display', sans-serif;
}

.sidebar-button {
  width: 88%;
  text-align: left;
  font-size: 1rem;
  font-family: 'Red-hat-display', sans-serif;
  font-weight: 100;
  padding: 15px 0 15px 20px;
  color: #F6F5FA;
  background-color: transparent;
  border: none;
  margin: 10px 15px 0 15px;
  border-radius: 10px;
  transition: 0.3s;
  cursor: pointer;
}

.sidebar-button:hover {
  background-color: #5E5E99;
}

.active-button {
  background-color: #5E5E99;
}
</style>
