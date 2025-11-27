<template>
  <div class="products-header">
    <!-- Searchbar -->
    <input
        class="search-bar"
        type="text"
        v-model="searchQuery"
        placeholder="Search accounts..."
        @input="filterAccounts"
        @focus="onSearchFocus"
    />

    <!-- Dropdown con resultados -->
    <ul v-if="searchQuery && filteredAccounts?.length" class="dropdown">
      <li
          v-for="account in filteredAccounts"
          :key="account.id"
          class="account-card"
          @click="$emit('view-account', account)"
      >
        <div class="card-content">
          <span class="account-name">{{ account.accountName }}</span>
          <span class="account-client">{{ account.client }}</span>
        </div>
        <span class="total-account">S/.{{ account.totalAccount }}</span>
      </li>
    </ul>

    <!-- No matches -->
    <ul v-else-if="filteredAccounts === -1 && searchQuery" class="dropdown">
      <li class="account-card">
        <div class="card-content">
          <span>No account matches the query.</span>
        </div>
      </li>
    </ul>

    <!-- Buttons -->
    <button
        :class="{ 'active-button': isTablesView }"
        @click="goToTables"
    >
      Tables
    </button>

    <button
        :class="{ 'active-button': isAccountsView }"
        @click="goToAccounts"
    >
      Accounts
    </button>
  </div>
</template>

<script>
export default {
  props: {
    restaurantName: { type: String, required: true },
    userRole: { type: String, required: true },
    accounts: { type: Array, default: () => [] }
  },

  data() {
    return {
      searchQuery: '',
      filteredAccounts: null,
    };
  },

  computed: {
    // Detecta la ruta ACTUAL y activa el botón correcto
    isTablesView() {
      return this.$route.path.includes("/tables");
    },
    isAccountsView() {
      return this.$route.path.includes("/saved-accounts");
    }
  },

  watch: {
    // Cuando las cuentas se cargan asíncronamente → refresca filtro
    accounts: {
      deep: true,
      handler() {
        if (this.searchQuery) {
          this.filterAccounts();
        }
      }
    }
  },

  mounted() {
    document.addEventListener("click", this.handleClickOutside);
  },

  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
  },

  methods: {
    filterAccounts() {
      if (!Array.isArray(this.accounts) || !this.accounts.length) {
        this.filteredAccounts = [];
        return;
      }

      const q = this.searchQuery.toLowerCase();

      const results = this.accounts.filter(a =>
          a.accountName?.toLowerCase().includes(q)
      );

      this.filteredAccounts = results.length ? results : -1;
    },

    onSearchFocus() {
      if (this.searchQuery) {
        this.filterAccounts();
      }
    },

    handleClickOutside(e) {
      if (!this.$el.contains(e.target)) {
        this.filteredAccounts = null;
      }
    },

    async goToTables() {
      if (!this.isTablesView) {
        await this.$router.push(`/${this.restaurantName}/${this.userRole}/tables`);
      }
    },

    async goToAccounts() {
      if (!this.isAccountsView) {
        await this.$router.push(`/${this.restaurantName}/${this.userRole}/saved-accounts`);
      }
    }
  }
};
</script>

<style scoped>
.products-header {
  display: flex;
  width: 100%;
  position: relative;
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
}
.dropdown{
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: #D3D2E5;
  border: 1px solid #31304A;
  border-radius: 5px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  list-style: none;
  padding: 0;
  margin: 0;
  max-width: 705px;
}
.dropdown li {
  padding: 10px;
  display: flex;
  justify-content: space-between;
}
.dropdown button {
  background-color: #31304A;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.total-account{
  font-size: 0.7rem;
}
.account-card{
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #F6F5FA;
}
.account-card:last-child{
  border-bottom: none;
}
.card-content{
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  font-family: 'Red-hat-display', sans-serif;
}
.account-name {
  font-size: 14px;
  font-weight: 700;
}
button{
  padding: 13px 20px;
  background: #D3D2E5;
  color: #31304A;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 800;
  flex-shrink: 0;
  width: 120px;
}
button:hover {
  background-color: #31304A;
  color: #F6F5FA;
  transition: 0.3s;
  cursor: pointer;
}
button:active{
  background-color: #201E35;
  color: #F6F5FA;
}
.active-button {
  color: #F6F5FA;
  background: #31304A;
}
</style>