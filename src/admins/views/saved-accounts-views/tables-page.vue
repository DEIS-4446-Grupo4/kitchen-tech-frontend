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
        <searchbar-component
            v-if="restaurantName"
            :restaurant-name="restaurantName"
            :user-role="userRole"
        />

        <!-- Modal -->
        <TableConfigComponent
            :is-visible="showModal"
            :editing-table="tableBeingEdited"
            @save-table="saveTable"
            @close-modal="closeModal"
        />

        <div class="tables-container">
          <div class="left-section">
            <template v-if="tablesStore.tables.length === 0 && !tablesStore.loading">
              <div class="no-accounts">
                <label>No tables created yet.</label>
              </div>
            </template>

            <template v-else>
              <TablesComponent
                  v-for="table in tablesStore.tables"
                  :key="table.id"
                  :table="table"
                  @select-table="selectTable"
                  @delete-table="deleteTable"
              />
            </template>

            <div v-if="tablesStore.loading" class="loading-msg">
              Loading tables...
            </div>
          </div>

          <div class="right-section">
            <button class="button" @click="openAddTable">Add Table</button>
            <button
                class="button"
                :disabled="!selectedTable"
                @click="openEditTable"
            >
              Edit Table
            </button>

            <div class="bullets">
              <div class="bullet green"><p class="description-bullet">Free</p></div>
              <div class="bullet red"><p class="description-bullet">Occupied</p></div>
              <div class="bullet yellow"><p class="description-bullet">To Clean</p></div>
            </div>

            <button class="button reload" @click="reloadTables">
              Reload
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import HeaderComponent from "@/admins/components/header-component.vue";
import SidebarComponent from "@/admins/components/sidebar-component.vue";
import SearchbarComponent from "@/admins/views/saved-accounts-views/components/searchbar-component.vue";
import TablesComponent from "@/admins/views/saved-accounts-views/components/tables-component.vue";
import TableConfigComponent from "@/admins/views/saved-accounts-views/components/table-config-component.vue";
import { tablesStore } from "@/public/stores/tablesStore";
import userService from "@/public/services/userService";
import { tablesService } from "@/public/services/tablesService";

export default {
  components: {
    HeaderComponent,
    SidebarComponent,
    SearchbarComponent,
    TablesComponent,
    TableConfigComponent,
  },

  data() {
    return {
      restaurantName: "",
      userRole: "",
      restaurantId: null,

      showModal: false,
      selectedTable: null,
      tableBeingEdited: null,
    };
  },

  async mounted() {
    await this.fetchUserData();
    await tablesStore.loadTables(this.restaurantId);
  },

  methods: {
    async fetchUserData() {
      const userData = JSON.parse(localStorage.getItem("userData"));
      if (!userData) return;

      const restaurantData = await userService.getRestaurantById(userData.restaurantId);

      this.restaurantName = restaurantData.name;
      this.userRole = userData.role;
      this.restaurantId = userData.restaurantId;
    },

    async reloadTables() {
      tablesStore.invalidateCache(this.restaurantId);
      await tablesStore.loadTables(this.restaurantId, true);
    },

    async deleteTable(id) {
      if (!confirm("Are you sure you want to delete this table?")) return;

      await tablesService.deleteTable(id);

      tablesStore.invalidateCache(this.restaurantId);
      await tablesStore.loadTables(this.restaurantId, true);

      this.selectedTable = null;
    },

    openAddTable() {
      this.tableBeingEdited = null;
      this.showModal = true;
    },

    openEditTable() {
      if (!this.selectedTable) return;

      this.tableBeingEdited = { ...this.selectedTable };
      this.showModal = true;
    },

    async saveTable(tableData) {
      if (tableData.id) {
        await tablesService.updateTable(tableData.id, tableData);
      } else {
        await tablesService.addTable({
          ...tableData,
          restaurantId: this.restaurantId,
          tableGuests: 0,
          tableStatus: "Free",
        });
      }

      tablesStore.invalidateCache(this.restaurantId);
      await tablesStore.loadTables(this.restaurantId, true);

      this.closeModal();
    },

    selectTable(tableId) {
      this.selectedTable = tablesStore.tables.find(t => t.id === tableId);
    },

    closeModal() {
      this.showModal = false;
      this.tableBeingEdited = null;
    },
  },

  computed: {
    tablesStore() {
      return tablesStore;
    },
  },
};
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
  background-color: #F6F5FA;
}
.main-content {
  margin-left: 255px;
  width: calc(100% - 280px);
  display: flex;
  flex-direction: column;
}
.page-container {
  margin-top: 70px;
  padding: 20px;
  background-color: #F6F5FA;
  height: calc(100vh - 100px);
  font-family: 'Red Hat Display', sans-serif;
}

.tables-container{
  display: flex;
  flex-direction: row;
  margin: auto;
  justify-content: center;
}
.left-section {
  width: 100%;
  max-width: 800px;
  max-height: 100px;
  margin: 20px 10px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
}

.right-section {
  display: flex;
  flex-direction: column;
  margin: 25px 10px;
  min-width: 120px;
  min-height: 690px;
}
.button {
  background-color: #D3D2E5;
  color: #31304A;
  border: none;
  margin: 5px;
  padding: 10px;
  max-width: 120px;
  font-weight: 800;
  border-radius: 5px;
}
.button:hover {
  background-color: #31304A;
  color: #F6F5FA;
  transition: 0.3s;
  cursor: pointer;
}
.button:active{
  background-color: #201E35;
  color: #F6F5FA;
}

.bullets{
  display: flex;
  flex-direction: column;
  margin-left: 10px;
}
.description-bullet{
  margin-left: 15px;
  margin-top: 0;
  text-overflow: clip;
  white-space: nowrap;
}

.bullet{
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  font-size: 0.6rem;
  margin-top: 15px;
}
.red {
  background-color: #d34f4d;
}
.green {
  background-color: #59aa64;
}
.yellow{
  background-color: #cfa553;
}
</style>