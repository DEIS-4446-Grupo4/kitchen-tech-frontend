<template>
  <div class="layout">
    <sidebar-component :restaurant-name="restaurantName" :role="userRole" class="sidebar" />
    <div class="main-content">
      <header-component :restaurant-name="restaurantName" :role="userRole" class="header" />
      <div class="page-container">
        <div class="left-section">
          <favorite-product-header
              :is-edit-mode="isEditMode"
              :restaurant-name="restaurantName"
              :selected-slot="selectedSlot"
              :cart="cartStore.cart"
              @refresh-products="refreshProducts"
              @add-to-cart="handleAddToCart"
          />
          <product-grid-component
              :products="productSlots"
              :is-edit-mode="isEditMode"
              @add-to-cart="handleAddToCart"
          />
        </div>

        <div class="right-section">
          <cart-summary-component
              :cart="cartStore.cart"
              :subtotal="cartStore.subtotal()"
              :igv="cartStore.igv()"
              :total="cartStore.total()"
              :restaurant-id="String(restaurantId)"
              @charge="charge"
              @update-cart="handleCartUpdate"
              @save-sale="handleSaveSale"
              @account-updated="onAccountSaved"
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
import FavoriteProductHeader from "@/admins/views/cassing-views/components/favorite-product-header.vue";

import { productsStore } from "@/public/stores/productsStore";
import { cartStore } from "@/public/stores/cartStore";
import { accountsStore } from "@/public/stores/accountStore";
import { accountService } from "@/public/services/accountsService";

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
      restaurantId: null,
      isEditMode: false,
      selectedSlot: null,
      productsStore,
      cartStore
    };
  },
  computed: {
    productSlots() {
      return this.productsStore.products.slice(0, 30);
    }
  },
  async created() {
    this.cartStore.load();
    const userData = JSON.parse(localStorage.getItem("userData")) || {};
    this.restaurantId = userData.restaurantId;
    await this.productsStore.loadProducts(this.restaurantId);
  },
  methods: {
    refreshProducts() {
      productsStore.refresh(this.restaurantId);
    },
    handleAddToCart(product) {
      this.cartStore.addProduct(product, 1);
    },
    handleCartUpdate(newCart) {
      this.cartStore.cart = newCart;
      this.cartStore.persist();
    },
    onAccountSaved() {
      this.cartStore.clear();
      this.$forceUpdate();
    },
    charge() {
      console.log("charge");
    },
    async handleSaveSale({ accountName, tableNumber }) {
      try {
        if (!this.restaurantId) {
          const ud = JSON.parse(localStorage.getItem("userData")) || {};
          this.restaurantId = ud.restaurantId;
        }

        // Validar si ya hay cuenta abierta para la mesa
        await accountsStore.loadAccounts(this.restaurantId);
        const already = accountsStore.accounts.find(
            acc => String(acc.table?.tableNumber) === String(tableNumber) &&
                (acc.state === 0 || String(acc.state).toLowerCase() === "open")
        );
        if (already) {
          alert("La mesa ya tiene una cuenta abierta.");
          return;
        }

        const now = new Date().toISOString();
        const cart = this.cartStore.cart || [];

        // Crear payload completo con productos
        const accountPayload = {
          accountName,
          client: null,
          table: tableNumber ? { id: Number(tableNumber), tableStatus: 1 } : null,
          state: 1,
          restaurantId: this.restaurantId,
          totalAccount: cart.reduce((t, i) => t + i.price * i.quantity, 0),
          dateCreated: now,
          dateLog: now,
          products: cart.map(item => ({
            productId: item.id,
            productName: item.productName,
            price: item.price,
            quantity: item.quantity
          }))
      };

        const createdAccount = await accountService.addAccount(accountPayload);

        if (!createdAccount?.id) throw new Error("No se recibió id de la cuenta creada.");

        // Limpiar carrito y refrescar stores
        this.cartStore.clear();
        localStorage.removeItem("cartData");
        localStorage.setItem("accounts_dirty", "1");
        await accountsStore.loadAccounts(this.restaurantId);

        this.onAccountSaved();

        // Redirigir
        const restaurantData = JSON.parse(localStorage.getItem('userData'));
        if (restaurantData) {
          this.restaurantName = restaurantData.restaurantName;
          this.userRole = restaurantData.role;
        }

        this.$router.push(`/${this.restaurantName}/${this.userRole}/saved-accounts`);


      } catch (err) {
        console.error("Error guardando la cuenta:", err);
        alert("Hubo un error guardando la cuenta. Revisa la consola.");
      }
    }

  }
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