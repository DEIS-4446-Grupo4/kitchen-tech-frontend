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
              :account-to-edit="currentAccount"
              @charge="charge"
              @update-cart="handleCartUpdate"
              @save-sale="handleSaveSale"
              @account-updated="onAccountSaved"
          />
        </div>
      </div>
    </div>
    <!-- Dentro del layout principal -->
    <div v-if="showChargeConfirmation" class="charge-confirmation-overlay">
      <div class="charge-confirmation-box">
        <h2 class="title">Cuenta cobrada con éxito</h2>
        <p>La cuenta ha sido cobrada y el carrito se ha vaciado.</p>
        <button class="primary-button" @click="showChargeConfirmation = false">
          Volver a caja
        </button>
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
import { tablesService as tableService } from "@/public/services/tablesService";
import { tablesStore } from "@/public/stores/tablesStore";

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
      cartStore,
      currentAccount: null,
      showChargeConfirmation: false,
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
    this.restaurantName = userData.restaurantName || userData["business-name"] || "";
    this.userRole = userData.role || "";
    await this.productsStore.loadProducts(this.restaurantId);

    const accountData = JSON.parse(localStorage.getItem("accountData")) || null;

    if (accountData && accountData.id) {
      this.currentAccount = accountData;

      const cartData = JSON.parse(localStorage.getItem("cartData")) || [];
      if (cartData.length) {
        this.cartStore.cart = cartData;
      }
    }

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
      this.currentAccount = null;
      localStorage.removeItem("accountData");
      this.$forceUpdate();
    },
    async charge(accountId) {
      if (!accountId) {
        console.warn("No hay cuenta para cobrar.");
        this.cartStore.clear();
        this.currentAccount = null;
        localStorage.removeItem("accountData");
        this.showChargeConfirmation = true;
        return;
      }

      try {
        // 1️⃣ Obtener la cuenta antes de eliminarla
        const account = await accountService.getAccountById(accountId).catch(() => null);

        // 2️⃣ Liberar la mesa si aplica
        if (account?.table?.id) {
          const table = await tableService.getTableById(account.table.id);
          if (table) {
            table.tableStatus = "ToClean"; // o "Free" según corresponda
            await tableService.updateTable(table);
          }
        }

        // 3️⃣ Borrar la cuenta
        await accountService.deleteAccount(accountId);

        // 4️⃣ Limpiar carrito y UI
        this.cartStore.clear();
        this.currentAccount = null;
        localStorage.removeItem("accountData");

        // 5️⃣ Forzar recarga de stores
        localStorage.removeItem("tables_" + this.restaurantId);
        await tablesStore.loadTables(this.restaurantId, true); // true para forzar recarga
        localStorage.setItem("accounts_dirty", "1");
        await accountsStore.loadAccounts(this.restaurantId);

        this.showChargeConfirmation = true;

      } catch (e) {
        console.error("Error cobrando cuenta:", e);
        alert("No se pudo cobrar la cuenta. Revisa la consola.");
      }
    },

    /**
     * Maneja tanto CREATE como UPDATE.
     * Si payload.id existe => UPDATE, sino CREATE.
     * payload = { id?, accountName, tableNumber }
     */
    async handleSaveSale(payload) {
      try {
        await this.$nextTick();

        if (!this.restaurantId) {
          const ud = JSON.parse(localStorage.getItem("userData")) || {};
          this.restaurantId = ud.restaurantId;
        }

        const { id: payloadId, accountName, tableNumber } = payload || {};
        const cart = this.cartStore.cart || [];

        if (!accountName || accountName.trim().length === 0) {
          alert("Ingrese un nombre de cuenta.");
          return;
        }

        if (!cart.length) {
          alert("El carrito está vacío.");
          return;
        }

        // Validaciones y preparación del payload...
        await accountsStore.loadAccounts(this.restaurantId);

        if (payloadId) {
          // --- UPDATE flow ---
          const existing = await accountService.getAccountById(payloadId);
          if (!existing) {
            alert("No se encontró la cuenta a actualizar.");
            return;
          }

          const updatePayload = {
            id: payloadId,
            accountName,
            client: existing.client || null,
            table: tableNumber ? { id: Number(tableNumber) } : null,
            restaurantId: this.restaurantId,
            state: existing.state || 0,
            totalAccount: cart.reduce((t, p) => t + p.price * p.quantity, 0),
            dateCreated: existing.dateCreated || new Date().toISOString(),
            dateLog: new Date().toISOString(),
            products: cart.map(item => ({
              productId: item.id,
              productName: item.productName,
              price: item.price,
              quantity: item.quantity
            }))
          };

          const updated = await accountService.updateAccount(updatePayload);

          // Manejar mesas (liberar/ocupar)
          try {
            const prevTableId = existing.table?.id;
            const newTableId = updated.table?.id || (tableNumber ? Number(tableNumber) : null);

            if (prevTableId && prevTableId !== newTableId) {
              const prevTable = await tableService.getTableById(prevTableId);
              if (prevTable) {
                prevTable.tableStatus = "Free";
                await tableService.updateTable(prevTable);
              }
            }

            if (newTableId) {
              const newTable = await tableService.getTableById(newTableId);
              if (newTable) {
                newTable.tableStatus = "Occupied";
                await tableService.updateTable(newTable);
              }
            }

            localStorage.removeItem("tables_" + this.restaurantId);
            await tablesStore.loadTables(this.restaurantId, true);

          } catch (tErr) {
            console.warn("No se pudo actualizar estado de mesas:", tErr);
          }

          localStorage.setItem("accounts_dirty", "1");
          await accountsStore.loadAccounts(this.restaurantId);

          this.onAccountSaved();
          const userData = JSON.parse(localStorage.getItem("userData")) || {};
          this.$router.push(`/${userData.restaurantName}/${userData.role}/saved-accounts`);
          return;
        }

        // --- CREATE flow ---
        const accountPayload = {
          accountName,
          client: null,
          table: tableNumber ? { id: Number(tableNumber) } : null,
          state: 0,
          restaurantId: this.restaurantId,
          totalAccount: cart.reduce((t, p) => t + p.price * p.quantity, 0),
          dateCreated: new Date().toISOString(),
          dateLog: new Date().toISOString(),
          products: cart.map(item => ({
            productId: item.id,
            productName: item.productName,
            price: item.price,
            quantity: item.quantity
          }))
        };

        const createdAccount = await accountService.addAccount(accountPayload);

        if (!createdAccount?.id) throw new Error("No se recibió id de la cuenta creada.");

        // Marcar mesa ocupada si aplica
        if (tableNumber) {
          const newTableId = createdAccount.table?.id || Number(tableNumber);
          const newTable = await tableService.getTableById(newTableId);
          if (newTable) {
            newTable.tableStatus = "Occupied";
            await tableService.updateTable(newTable);
          }
          localStorage.removeItem("tables_" + this.restaurantId);
          await tablesStore.loadTables(this.restaurantId, true);
        }

        localStorage.setItem("accounts_dirty", "1");
        await accountsStore.loadAccounts(this.restaurantId);

        this.onAccountSaved();
        const userData = JSON.parse(localStorage.getItem("userData")) || {};
        this.$router.push(`/${userData.restaurantName}/${userData.role}/saved-accounts`);

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
.charge-confirmation-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0,0,0,0.4);
  z-index: 2000;
}

.charge-confirmation-box {
  background-color: #cbcbd8;
  font-weight: 600;
  font-family: 'Red Hat Display', sans-serif;
  padding: 2rem;
  border-radius: 12px;
  min-width: 400px;
  max-width: 90%;
  text-align: center;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

.charge-confirmation-box .title {
  font-size: 1.8rem;
  margin-bottom: 1rem;
}

.charge-confirmation-box p {
  font-size: 1rem;
  margin-bottom: 2rem;
}

.charge-confirmation-box .primary-button {
  background-color: #201e35; /* ejemplo de botón principal del sistema */
  color: #cbcbd8;
  font-weight: bold;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s all;
}
.charge-confirmation-box .primary-button:hover {
  background-color: #201e35;
}


</style>