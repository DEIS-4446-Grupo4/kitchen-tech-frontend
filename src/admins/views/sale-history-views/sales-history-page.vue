<template>
  <div class="layout">
    <sidebar-component :restaurant-name="restaurantName" :role="userRole" class="sidebar" />
    <div class="main-content">
      <header-component :restaurant-name="restaurantName" :role="userRole" class="header" />
      <div class="page-container">
        <h1>Sales History</h1>
        <div class="container">
          <div class="row d-flex justify-content-center my-5">
            <div class="card px-5 py-4 mx-2 col-5">
              <p>Total sales in soles</p>
              <h2>{{ totalSalesSoles }}</h2>
            </div>
            <div class="card px-5 py-4 mx-2 col-5">
              <p>Total sales</p>
              <h2>{{ totalSales }}</h2>
            </div>
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
      totalSalesSoles: 0,
      totalSales: 0,
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
          this.restaurantName = restaurantData.name;
          this.userRole = userData.role;
        }
      } catch (error) {
        console.error("Error fetching restaurant data: ", error);
      }
    },
    async fetchTotalSales(restaurantId) {
      try {
        // Supón que usas salesService o axios directamente
        const response = await fetch(`/api/sales/total?restaurantId=${restaurantId}`);
        const data = await response.json();

        this.totalSales = data.total || 0;
      } catch (error) {
        console.error("Error fetching total sales: ", error);
      }
    }
  }
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
}

h1 {
  color: #31304A;
  font-size: 2.5rem;
}
h2 {
  color: #31304A;
  line-height: 1;
  font-size: 2rem;
  font-weight: 600;
}
p {
  color: #31304A;
  line-height: 1;
  font-size: 1.2rem;
  font-weight: 200;
}
</style>