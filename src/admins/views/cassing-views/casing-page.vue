<template>
  <div class="layout">
    <sidebar-component
        :restaurant-name="restaurantName"
        :role="userRole"
        class="sidebar"
    />

    <div class="main-content">
      <header-component
          :restaurant-name="restaurantName"
          :role="userRole"
          class="header"
      />

      <div class="page-container">
        <div class="left-section">
          <!-- HEADER DE FAVORITOS + SEARCHBAR -->
          <favorite-product-header
              :is-edit-mode="isEditMode"
              :restaurant-name="restaurantName"
              :selected-slot="selectedSlot"
              :cart="cart"
              @refresh-products="refreshProducts"
              @add-to-slot="addToSlot"
              @add-to-cart="addProductToCart"
          />
          <!-- GRID DE PRODUCTOS FAVORITOS -->
          <product-grid-component
              :favorite-products="favoriteProducts"
              :is-edit-mode="isEditMode"
              @open-product-list="openProductList"
              @remove-product-from-favorites="removeProductFromFavorites"
              @add-to-cart="addProductToCart"
          />

        </div>

        <!-- CARRITO A LA DERECHA -->
        <div class="right-section">
          <cart-summary-component
              :cart="cart"
              :subtotal="subtotal"
              :igv="igv"
              :total="total"
              :restaurant-id="restaurantId"
              @charge="charge"
              @update-cart="handleUpdateCart"
              @update-summary="handleUpdateSummary"
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
import { productsStore } from "@/public/stores/productsStore";
import FavoriteProductHeader from "@/admins/views/cassing-views/components/favorite-product-header.vue";

export default {
  components: {
    FavoriteProductHeader,
    HeaderComponent,
    SidebarComponent,
    ProductGridComponent,
    CartSummaryComponent,
  },

  data() {
    return {
      restaurantName: "",
      userRole: "",
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

  async created() {
    this.loadCart();
    await this.loadProducts();
  },

  beforeUnmount() {
    localStorage.removeItem("cartData")
    localStorage.removeItem("accountData")
  },

  methods: {
    loadCart() {
      this.cart = JSON.parse(localStorage.getItem("cartData")) || [];
    },

    async loadProducts() {
      const userData = JSON.parse(localStorage.getItem("userData"));
      this.restaurantId = userData?.restaurantId;
      this.restaurantName = userData?.restaurantName;
      this.userRole = userData?.role;

      if (!this.restaurantId) return;

      if (!productsStore.products.length) {
        await productsStore.loadProducts(this.restaurantId);
      }

      this.favoriteProducts = [...productsStore.products];
    },

    toggleEditMode() {
      this.isEditMode = !this.isEditMode;
    },

    refreshProducts() {
      const restaurantId = this.restaurantId;
      localStorage.removeItem("products_" + restaurantId)

      productsStore.loadProducts(restaurantId).then(() => {
        this.favoriteProducts = [...productsStore.products];
        console.log("Productos recargados:", this.favoriteProducts);
        window.location.reload();
      }).catch((error) => {
        console.error("Error al recargar los productos:", error);
      });
    },

    openProductList(index) {
      this.selectedSlot = index;
    },

    addToSlot({ product, slot }) {
      this.favoriteProducts[slot] = product;
    },

    removeProductFromFavorites(index) {
      this.favoriteProducts[index] = null;
    },

    addProductToCart(product) {
      const existing = this.cart.find(item => item.id === product.id);

      if (existing) {
        existing.quantity++;
      } else {
        this.cart.push({
          ...product,
          price: product.productPrice,
          quantity: 1
        });
      }

      this.updateCartSummary();
    },

    updateCartSummary() {
      this.subtotal = this.cart.reduce(
          (acc, item) => acc + item.price * item.quantity,
          0
      );

      this.igv = this.subtotal * 0.18;
      this.total = this.subtotal;
    },

    handleUpdateCart(updatedCart) {
      this.cart = updatedCart;
    },

    handleUpdateSummary({ subtotal, igv, total }) {
      this.subtotal = subtotal;
      this.igv = igv;
      this.total = total;
    },

    charge() {
      console.log("charging...");
    },
  },
};
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