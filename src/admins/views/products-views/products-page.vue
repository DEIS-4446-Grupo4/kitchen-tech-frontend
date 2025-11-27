<template>
  <div class="layout">
    <sidebar-component :restaurant-name="restaurantName" :role="userRole" class="sidebar" />
    <div class="main-content">
      <header-component :restaurant-name="restaurantName" :role="userRole" class="header" />

      <div class="page-container">

        <div v-if="loading" class="loader-overlay">
          <div class="loader"></div>
        </div>

        <div v-else class="products-page">
          <div class="content-wrapper">

            <div class="products-header">
              <input
                  class="search-bar"
                  type="text"
                  v-model="searchQuery"
                  placeholder="Search products..."
                  @input="filterProducts"
              />
              <button class="add-button" @click="addProduct">Add Product</button>
            </div>

            <div class="product-cards">
              <template v-if="filteredProducts.length === 0">
                <div class="no-products">
                  <label>You don't have registered any product yet.</label>
                </div>
              </template>

              <template v-else>
                <ProductCardComponent
                    v-for="product in filteredProducts"
                    :key="product.id"
                    :product="product"
                    @edit-product="editProduct"
                    @delete-product="deleteProduct"
                />
              </template>
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
import ProductCardComponent from "@/admins/views/products-views/components/product-card-component.vue";

import userService from "@/public/services/userService";
import { productsStore } from "@/public/stores/productsStore";
import { productsService } from "@/public/services/productsService";

export default {
  components: {
    HeaderComponent,
    SidebarComponent,
    ProductCardComponent,
  },

  data() {
    return {
      restaurantName: "",
      userRole: "",
      restaurantId: null,
      searchQuery: "",
      filteredProducts: [],
      loading: true,
    };
  },

  async created() {
    await this.initializePage();
  },

  methods: {
    async initializePage() {
      try {
        const userData = JSON.parse(localStorage.getItem("userData"));
        if (!userData) return;

        this.userRole = userData.role;
        this.restaurantId = userData.restaurantId;

        // obtiene el nombre del restaurante
        const restaurant = await userService.getRestaurantById(this.restaurantId);
        this.restaurantName = restaurant.name;

        // ----- ✅ aquí usamos el store -----
        await productsStore.loadProducts(this.restaurantId);

        // asignación reactiva desde el store
        this.filteredProducts = productsStore.products;

      } catch (err) {
        console.error("Error initializing page:", err);
      } finally {
        this.loading = false;
      }
    },

    filterProducts() {
      const q = this.searchQuery.toLowerCase();
      this.filteredProducts = productsStore.products.filter((p) =>
          p.productName.toLowerCase().includes(q)
      );
    },

    addProduct() {
      this.$router.push(`/${this.restaurantName}/${this.userRole}/new-product`);
    },

    editProduct(product) {
      this.$router.push(
          `/${this.restaurantName}/${this.userRole}/product/${product.id}`
      );
    },

    async deleteProduct(productId) {
      if (!confirm("Are you sure you want to remove this product?")) return;

      try {
        const res = await productsService.deleteProduct(productId);
        alert(res.message || "Product deleted successfully");

        // refresca el store
        await productsStore.loadProducts(this.restaurantId);
        this.filteredProducts = productsStore.products;

      } catch (error) {
        console.error("Error deleting product:", error);
      }
    },
  },
};
</script>


<style scoped>
/* Estilos que adaptan la vista a la region especifica de la pantalla */
.layout {
  display: flex;
  height: 100vh;
  background-color: #F6F5FA
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

/* Estilos de la vista actual */
.no-products{
  text-align: center;
  color: #31304A;
}
.products-header {
  display: flex;
  max-width: 1000px;
  justify-content: space-between;
  align-items: center;
  margin: 0 auto;
  padding-bottom: 10px;
  gap: 10px;
}
.search-bar {
  width: 100%;
  padding: 15px;
  border-radius: 5px;
  border: none;
  color: #31304A;
  background-color: #D3D2E5;
  max-width: 1000px;
}
.add-button {
  padding: 13px 20px;
  background: #D3D2E5;
  color: #31304A;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 800;
  flex-shrink: 0;
}
.product-cards{
  width: 100%;
  max-width: 1000px;
  margin: 20px auto;
}

.loader {
  border: 6px solid #ddd;
  border-top: 6px solid #31304A;
  border-radius: 50%;
  width: 55px;
  height: 55px;
  animation: spin 0.9s linear infinite;
}

.loader-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(2px);
  z-index: 20;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>