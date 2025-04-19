<template>
  <div class="layout">
    <sidebar-component :restaurant-name="restaurantName" :role="userRole" class="sidebar" />
    <div class="main-content">
      <header-component :restaurant-name="restaurantName" :role="userRole" class="header" />
      <div class="page-container">
        <main class="products-page">
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
              <template v-if="products.length === 0">
                <div class="no-products">
                  <label>You don't have register any account yet.</label>
                </div>
              </template>
              <template v-else-if="products.length !== 0">
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
        </main>
      </div>
    </div>
  </div>
</template>

<script>
import HeaderComponent from "@/admins/components/header-component.vue";
import SidebarComponent from "@/admins/components/sidebar-component.vue";
import ProductCardComponent from "@/admins/views/products-views/components/product-card-component.vue";
import { productsService } from "@/public/services/productsService";
import userService from "@/public/services/userService";

export default {
  components: {
    HeaderComponent,
    SidebarComponent,
    ProductCardComponent,
  },
  data() {
    return {
      restaurantName: '',
      userRole: '',
      products: [],
      searchQuery: '',
      filteredProducts: [],
    };
  },
  beforeMount() {
    this.fetchUserData();

    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData) {
      this.restaurantName = userData['business-name'];
      this.userRole = userData.role;
      this.restaurantId = localStorage.getItem('restaurantId'); // Obtener el ID del restaurante de localStorage
    }
    this.loadProducts();
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

    async loadProducts() {
      const userData = JSON.parse(localStorage.getItem("userData"));
      const restaurantId = userData.restaurantId;

      try {
        const products = await productsService.getProductsByRestaurant(restaurantId);
        this.products = products;
        this.filteredProducts = this.products;
      } catch (error) {
        console.error("Failed to load products", error);
      }
    },
    filterProducts() {
      try{
        const query = this.searchQuery.toLowerCase(); // Convierte la consulta a minúsculas
        this.filteredProducts = this.products.filter((product) =>
            product.productName.toLowerCase().includes(query) // Asegúrate de usar el nombre correcto
        );
      } catch (error){
        console.log("There are not products to show")
      }

    },
    addProduct() {
      this.$router.push(`/${this.restaurantName}/${this.userRole}/new-product`);
    },
    editProduct(product) {
      this.$router.push(`/${this.restaurantName}/${this.userRole}/product/${product.id}`);
    },
    async deleteProduct(productId) {
      if (confirm("Are you sure you want to remove this product?")) {
        try {
          const response = await productsService.deleteProduct(productId);
          console.log(response)
          alert(response.message || "Product deleted successfully");
          // Vuelve a cargar los productos después de la eliminación
          await this.loadProducts();
        } catch (error) {
          console.error('Error during product deletion process:', error);
        }
      } else {
        alert("Deletion canceled.");
      }
    },
  }
}
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
</style>