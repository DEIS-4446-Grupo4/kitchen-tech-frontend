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
          <div class="row text-center table-responsive justify-content-center">
            <table class="table table-striped table-hover align-center" style="max-width: 1120px;">
              <thead>
              <tr>
                <th class="p-3">Date & Time</th>
                <th class="p-3">Document Type</th>
                <th class="p-3">Correlative</th>
                <th class="p-3">Customer</th>
                <th class="p-3">Amount</th>
                <th class="p-3">Payment Type</th>
                <th class="p-3">Status</th>
                <th class="p-3">Action</th>
              </tr>
              </thead>
              <tbody>
                <tr v-for="sale in sales" :key="sale.id">
                  <td class="py-4">{{ formatDateTime(sale.dateTime) }}</td>
                  <td class="py-4">{{ sale.documentType }}</td>
                  <td class="py-4">{{ sale.correlative }}</td>
                  <td class="py-4">{{ sale.clientId ? 'Cliente #' + sale.clientId : 'No Client' }}</td>
                  <td class="py-4">S/{{ sale.amount.toFixed(2) }}</td>
                  <td class="py-4">{{ sale.paymentType }}</td>
                  <td class="py-4">
                    <span :class="{
                      'text-success': sale.saleStatus === 'COMPLETED',
                      'text-danger': sale.saleStatus === 'CANCELLED'
                    }">{{ sale.saleStatus }}</span>
                  </td>
                  <td class="py-3">
                    <button class="btn button btn-sm px-3"
                            @click="cancelSale(sale.id)"
                            v-if="sale.saleStatus ? 'CANCELLED' !== sale.saleStatus : true"
                    >Cancel</button>
                  </td>
                </tr>
              </tbody>
            </table>
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
import {paymentService} from "@/public/services/paymentService";

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
      sales: [],
      restaurantId: null,
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
          this.restaurantId = restaurantId;

          await this.loadSalesData(restaurantId);

          const summary = await paymentService.getSaleSummary(this.restaurantId);
          this.totalSales = summary.totalSales;
          this.totalSalesSoles = summary.totalAmount;
        }
      } catch (error) {
        console.error("Error fetching restaurant data: ", error);
      }
    },
    async loadSalesData(restaurantId) {
      try {

        const response = await paymentService.getPaymentsByRestaurantService(restaurantId);
        this.sales = response.data;
        this.sales = response.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
      } catch (error) {
        console.error("Error loading sales data: ", error);
      }
    },
    async cancelSale(saleId) {
      if (confirm("Are you sure you want to cancel this sale?")) {
        try {
          await paymentService.cancelSale(saleId);
          // Recargar la lista de ventas actualizada
          await this.loadSalesData(this.restaurantId);
        } catch (error) {
          alert("Error cancelling sale.");
        }
      }
    },
    formatDateTime(dateTime) {
      const date = new Date(dateTime);
      return date.toLocaleString('es-PE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
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
h2,
tr {
  color: #31304A;
  line-height: 1;
  font-size: 2rem;
  font-weight: 600;
}
p,
td {
  color: #31304A;
  line-height: 1;
  font-size: 1.2rem;
  font-weight: 200;
}
tr {
  font-size: 1.1rem;
}
td {
  font-size: 0.9rem;
}
.button {
  background: #D3D2E5;
  color: #31304A;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 800;
  flex-shrink: 0;
}
</style>