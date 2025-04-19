<template>
  <div class="layout">
    <sidebar-component :restaurant-name="restaurantName" :role="userRole" class="sidebar" />
    <div class="main-content">
      <header-component :restaurant-name="restaurantName" :role="userRole" class="header" />
      <div class="page-container">
        <searchbar-component
            v-if="restaurantName"
            :restaurant-name="restaurantName"
            :user-role="userRole"
        />
        <TableConfigComponent
            :is-visible="showModal"
            @save-table="addTable"
            @close-modal="closeModal"
        />
        <div class="tables-container">
          <div class="left-section">
            <template v-if="tables.length === 0">
              <div class="no-accounts">
                <label>You don't have created any table yet.</label>
              </div>
            </template>
            <template v-else-if="tables.length !== 0">
              <TablesComponent
                  v-for="table in tables"
                  :key="table.id"
                  :table="table"
                  @select-table="loadTableProducts"
                  @delete-table="deleteTable"
              />
            </template>
          </div>
          <div class="right-section">
            <button class="button" @click="showModal = true ">Add Table</button>
            <button class="button">Edit Table</button>
            <div class="bullets">
              <div class="bullet green" aria-label="Table status">
                <p class="description-bullet">Free</p>
              </div>
              <div class="bullet red" aria-label="Table status">
                <p class="description-bullet">Occupied</p>
              </div>
              <div class="bullet yellow" aria-label="Table status">
                <p class="description-bullet">To Clean</p>
              </div>
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
import userService from "@/public/services/userService";
import SearchbarComponent from "@/admins/views/saved-accounts-views/components/searchbar-component.vue";
import TablesComponent from "@/admins/views/saved-accounts-views/components/tables-component.vue";
import TableConfigComponent from "@/admins/views/saved-accounts-views/components/table-config-component.vue";
import {tablesService} from "@/public/services/tablesService";

export default {
  components: {
    TablesComponent,
    SearchbarComponent,
    HeaderComponent,
    SidebarComponent,
    TableConfigComponent
  },
  data() {
    return {
      restaurantName: '',
      userRole: '',
      tables: [],
      showModal: false,
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

    this.loadTables();
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
    async loadTables() {
      const userData = JSON.parse(localStorage.getItem('userData'));
      const restaurantId = userData.restaurantId;

      try {
        const tables = await tablesService.getTablesByRestaurant(restaurantId);
        this.tables = tables;
        console.log(tables)
      } catch (error) {
        console.error("Failed to load tables");
      }
    },
    async deleteTable(tableId) {
      if(confirm("Are you sure you want to delete this table?")) {
        try {
          const response = await tablesService.deleteTable(tableId);
          console.log(response)
          await this.loadTables();
        } catch (error){
          console.error('Error during table deletion process:', error);
        }
      } else {
        console.log("Deletion canceled.");
      }
    },
    async addTable(tableData) {
      try {
        const userData = JSON.parse(localStorage.getItem("userData"));
        const restaurantId = userData?.restaurantId;

        const table = {
          tableNumber: tableData.tableNumber,
          tableCapacity: tableData.tableCapacity,
          tableGuests: 0,
          tableStatus: 0,
          restaurantId: restaurantId,
        };
        const response = await tablesService.addTable(table);
        if (response) {
          this.closeModal();
          await this.loadTables();
        } else {
          console.error("Failed to add table");
        }
      }catch (error) {
        console.error("Failed to add table", error);
      }
    },
    closeModal(){
      this.showModal = false;
    },
  }
}
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