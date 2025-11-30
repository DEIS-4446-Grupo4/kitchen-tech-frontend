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
      currentAccount: null // <-- account en edición/cargada
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

    // Si venimos desde SavedAccounts, se guarda accountData en localStorage:
    const accountData = JSON.parse(localStorage.getItem("accountData"));
    console.log("Encontre el id en casing-page: " + accountData.id);

    if (accountData && accountData.id) {
      // setear currentAccount para que el modal muestre datos
      this.currentAccount = accountData;
      // también cargar el cart (ya lo hace saved-accounts, pero asegurar)
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
    charge() {
      console.log("charge");
    },

    /**
     * Maneja tanto CREATE como UPDATE.
     * Si payload.id existe => UPDATE, sino CREATE.
     * payload = { id?, accountName, tableNumber }
     */
    async handleSaveSale(payload) {
      try {
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

        // carga accounts para validar mesa ocupada (solo si hay mesa)
        await accountsStore.loadAccounts(this.restaurantId);
        if (tableNumber) {
          const already = accountsStore.accounts.find(
              acc => String(acc.table?.tableNumber) === String(tableNumber) &&
                  (acc.state === 0 || String(acc.state).toLowerCase() === "open")
          );
          // si existe y NO es la misma que estamos actualizando -> error
          if (already && (!payloadId || String(already.id) !== String(payloadId))) {
            alert("La mesa ya tiene una cuenta abierta.");
            return;
          }
        }

        const now = new Date().toISOString();
        const productsPayload = cart.map(item => ({
          productId: item.id,
          productName: item.productName,
          price: item.price,
          quantity: item.quantity
        }));

        // --- UPDATE flow ---
        if (payloadId) {
          // obtener la cuenta actual para comparar mesa anterior
          const existing = await accountService.getAccountById(payloadId);
          if (!existing) {
            alert("No se encontró la cuenta a actualizar.");
            return;
          }

          // construir payload para update. La ruta backend espera PUT /account/{accountId}
          const updatePayload = {
            id: payloadId,
            accountName,
            client: existing.client || null,
            table: tableNumber ? { id: Number(tableNumber) } : null,
            restaurantId: this.restaurantId,
            state: existing.state || 0,
            totalAccount: productsPayload.reduce((t, p) => t + p.price * p.quantity, 0),
            dateCreated: existing.dateCreated || now,
            dateLog: now,
            products: productsPayload
          };

          // ejecutar update
          const updated = await accountService.updateAccount(updatePayload);

          // manejar cambio de mesa: liberar antigua y ocupar nueva
          try {
            const prevTableId = existing.table?.id;
            const newTableId = updated.table?.id || (tableNumber ? Number(tableNumber) : null);

            if (prevTableId && String(prevTableId) !== String(newTableId)) {
              // liberar anterior
              const prevTable = await tableService.getTableById(prevTableId);
              if (prevTable) {
                prevTable.tableStatus = "Available";
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

            // invalidar cache y recargar
            localStorage.removeItem("tables_" + this.restaurantId);
            await tablesStore.loadTables(this.restaurantId, true);
          } catch (tErr) {
            console.warn("No se pudo actualizar estado de mesas:", tErr);
          }

          // refrescar accounts y limpiar
          localStorage.setItem("accounts_dirty", "1");
          await accountsStore.loadAccounts(this.restaurantId);

          this.onAccountSaved();
          // navegar
          const userData = JSON.parse(localStorage.getItem("userData")) || {};
          const rn = this.restaurantName || userData.restaurantName || "";
          const ur = this.userRole || userData.role || "";
          console.log(rn);
          this.$router.push(`/${rn}/${ur}/saved-accounts`);

          return;
        }

        // --- CREATE flow ---
        const accountPayload = {
          accountName,
          client: null,
          table: tableNumber ? { id: Number(tableNumber) } : null,
          state: 0, // abierto
          restaurantId: this.restaurantId,
          totalAccount: productsPayload.reduce((t, p) => t + p.price * p.quantity, 0),
          dateCreated: now,
          dateLog: now,
          products: productsPayload
        };

        const createdAccount = await accountService.addAccount(accountPayload);

        if (!createdAccount?.id) {
          throw new Error("No se recibió id de la cuenta creada.");
        }

        // marcar mesa ocupada si aplica
        if (tableNumber) {
          try {
            const newTableId = createdAccount.table?.id || Number(tableNumber);
            const newTable = await tableService.getTableById(newTableId);
            if (newTable) {
              newTable.tableStatus = "Occupied";
              await tableService.updateTable(newTable);
            }
            localStorage.removeItem("tables_" + this.restaurantId);
            await tablesStore.loadTables(this.restaurantId, true);
          } catch (tErr) {
            console.warn("No se pudo actualizar la mesa tras crear cuenta:", tErr);
          }
        }

        // refrescar accounts
        localStorage.setItem("accounts_dirty", "1");
        await accountsStore.loadAccounts(this.restaurantId);

        // limpiar y redirigir
        this.onAccountSaved();
        const userData = JSON.parse(localStorage.getItem("userData")) || {};
        const rn = this.restaurantName || userData.restaurantName || "";
        const ur = this.userRole || userData.role || "";
        this.$router.push(`/${rn}/${ur}/saved-accounts`);

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