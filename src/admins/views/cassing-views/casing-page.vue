<template>
  <div class="layout">
    <sidebar-component :restaurant-name="restaurantName" :role="userRole" class="sidebar" />
    <div class="main-content">
      <header-component :restaurant-name="restaurantName" :role="userRole" class="header" />
      <div class="page-container">
        <div class="left-section">
          <favorite-product-header-component
              v-if="restaurantName"
              :is-edit-mode="isEditMode"
              :restaurant-name="restaurantName"
              :selected-slot="selectedSlot"
              :cart="cart"
              @toggle-edit-mode="toggleEditMode"
              @add-to-slot="addToSlot"
              @add-to-cart="addProductToCart"
          />
          <product-grid-component
              :favorite-products="favoriteProducts"
              :is-edit-mode="isEditMode"
              @open-product-list="openProductList"
              @remove-product-from-favorites="removeProductFromFavorites"
              @add-to-cart="addProductToCart"

          />
        </div>
        <div class="right-section">
          <cart-summary-component
              :cart="cart"
              :subtotal="subtotal"
              :igv="igv"
              :total="total"
              :restaurant-id="restaurantId"
              @add-customer="addCustomer"
              @charge="charge"
              @update-cart="handleUpdateCart"
              @update-summary="handleUpdateSummary"
              @account-updated="handleAccountUpdated"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import HeaderComponent from "@/admins/components/header-component.vue";
import SidebarComponent from "@/admins/components/sidebar-component.vue";
import ProductGridComponent from "@/admins/views/cassing-views/components/product-grid-component.vue";
import CartSummaryComponent from "@/admins/views/cassing-views/components/cart-summary-component.vue";
import FavoriteProductHeaderComponent from "@/admins/views/cassing-views/components/favorite-product-header.vue";
import userService from "@/public/services/userService";
import { productsService }  from "@/public/services/productsService"

export default {
  components: {
    FavoriteProductHeaderComponent,
    HeaderComponent,
    SidebarComponent,
    ProductGridComponent,
    CartSummaryComponent
  },
  props: {
    cartData: {
      type: Array,
      default: () => []
    },
  },
  data() {
    return {
      restaurantName: '',
      userRole: '',
      cart: [],
      subtotal: 0,
      igv: 0,
      total: 0,
      isEditMode: false,
      selectedSlot: null,
      favoriteProducts: Array(30).fill(null),
      restaurantId: null,
    };
  },
  created() {
    this.fetchUserData();
    this.loadProducts();
    this.loadCart();
  },
  beforeUnmount() {
    localStorage.removeItem("cartData")
    localStorage.removeItem("accountData")
  },
  methods: {
    loadCart() {
      this.cart = JSON.parse(localStorage.getItem('cartData')) || [];
    },
    async fetchUserData() {
      try {
        const userData = JSON.parse(localStorage.getItem("userData"));
        const restaurantId = userData?.restaurantId;

        if (restaurantId) {
          const restaurantData = await userService.getRestaurantById(restaurantId);
          this.restaurantName = restaurantData.name;
          this.userRole = userData.role;
          this.restaurantId = restaurantId;
        }
      } catch (error) {
        console.error("Error fetching restaurant data: ", error);
      }
    },
    async loadProducts() {
      const userData = JSON.parse(localStorage.getItem("userData"));
      console.log(userData)
      const restaurantId = userData?.restaurantId;
      
      if (!restaurantId) {
        console.error("No restaurant ID found in userData");
        return; // Exit if there's no restaurantId
      }

      try {
        const products = await productsService.getProductsByRestaurant(restaurantId);
        this.favoriteProducts = products;
        console.log(this.favoriteProducts);

      } catch (error) {
        console.error("Failed to load products", error);
      }
    },

    toggleEditMode(){
      this.isEditMode = !this.isEditMode;
    },
    openProductList(index) {
      this.selectedSlot = index;
    },
    addToSlot({product, slot}){
      this.favoriteProducts[slot] = product;
    },
    removeProductFromFavorites(index) {
      this.favoriteProducts[index] = null;
    },

    addCustomer() {
      // Lógica para agregar un cliente
    },

    addProductToCart(product) {
      const existingItem = this.cart.find(item => item.id === product.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        this.cart.push({ ...product, price: product.productPrice, quantity: 1 });
      }
      this.updateCartSummary();
    },
    updateCartSummary() {
      console.log(this.cart)
      this.subtotal = this.cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
      this.igv = this.subtotal * 0.18; // Calcular IGV (18%)
      this.total = this.subtotal;
    },
    handleUpdateCart(updatedCart) {
      this.cart = updatedCart;
      console.log("Updated cart recibirdo:", updatedCart)
    },
    handleUpdateSummary({ subtotal, igv, total }) {
      this.subtotal = subtotal;
      this.igv = igv;
      this.total = total;
    },
    handleAccountUpdated(){

    },
    charge() {
      this.showPaymentModal = true;
    },
    handleConfirmPayment(method) {
      this.selectedPaymentType = method;
      this.showPaymentModal = false;

      // Aquí puedes hacer la lógica para guardar la venta
      this.saveOrder(method);
    },
  }
}
</script>

<style scoped>
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
  display: flex;
  gap: 20px;
}

favorite-product-header-component {
  display: flex;
  justify-content: space-between; /* Alinea la barra de búsqueda y el botón de edición */
  margin-bottom: 20px; /* Separación entre el header y la cuadrícula de productos */
}

.left-section {
  flex: 3; /* Hacer que la cuadrícula ocupe más espacio */

}
.right-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* Para evitar la compresión vertical */
  min-width: 350px;
  min-height: 690px;
}
</style>