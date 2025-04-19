<template>
  <div class="layout">
    <sidebar-component :restaurant-name="restaurantName" :role="userRole" class="sidebar" />
    <div class="main-content">
      <header-component :restaurant-name="restaurantName" :role="userRole" class="header" />
      <div class="page-container">
        <main class="supplies-page">
          <div class="content-wrapper">
            <div class="supplies-header">
              <input
                class="search-bar"
                type="text"
                v-model="searchQuery"
                placeholder="Search supplies..."
                @input="filterSupplies"
              />
              <button class="add-button" @click="openSupplyConfig">Add Supply</button>
            </div>
            <div class="supply-table-container">
              <template v-if="filteredSupplies.length === 0">
                <div class="no-supplies">
                  <label>No supplies available.</label>
                </div>
              </template>
              <template v-else>
                <table class="supply-table">
                  <thead>
                    <tr>
                      <th>Supply Name</th>
                      <th>Category</th>
                      <th>Metric Unit</th>
                      <th>Stock</th>
                      <th>Cost per Unit</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="supply in filteredSupplies" :key="supply.id">
                      <td>{{ supply.supplyName }}</td>
                      <td>{{ supply.supplyCategory }}</td>
                      <td>{{ supply.metricUnit }}</td>
                      <td>{{ supply.currentlyOnStock }}</td>
                      <td>${{ supply.costPerUnit.toFixed(2) }}</td>
                      <td>{{ supply.stateOfSupply }}</td>
                      <td>
                        <button class="edit-button" @click="editSupply(supply)">Edit</button>
                        <button class="delete-button" @click="deleteSupply(supply.id)">Delete</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </template>
            </div>
          </div>
        </main>
      </div>
    </div>

    <!-- Supply Config Overlay -->
    <div v-if="isSupplyConfigOpen" class="supply-config-overlay">
      <div class="supply-config-modal">
        <p class="modal-title">{{ supplyToEdit ? 'Edit Supply' : 'Add Supply'}}</p>
        <div class="modal-content">
          <div class="form-group">
            <label for="supply-name">Supply Name</label>
            <input type="text" v-model="newSupplyName" id="supply-name" />
          </div>
          <div class="form-group">
            <label for="supply-category">Category</label>
            <input type="text" v-model="newSupplyCategory" id="supply-category" />
          </div>
          <div class="form-group">
            <label for="metric-unit">Metric Unit</label>
            <select class="selector" v-model="newSupplyMetricUnit" id="metric-unit">
              <option class="option" v-for="(unit, key) in MetricUnit" :key="key" :value="unit">
                {{ unit }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="stock">Stock</label>
            <input type="number" v-model="newSupplyStock" id="stock" />
          </div>
          <div class="form-group">
            <label for="cost">Cost per Unit</label>
            <input type="number" v-model="newSupplyCostPerUnit" id="cost" />
          </div>
          <div class="form-group">
            <label for="state">State</label>
            <select class="selector" v-model="newSupplyState" id="state">
              <option class="option" v-for="(state, key) in SupplyState" :key="key" :value="state">
                {{ state }}
              </option>
            </select>
          </div>
          <div class="modal-actions">
            <button class="button" @click="closeSupplyConfig">Close</button>
            <button class="button" @click="addSupply">{{ supplyToEdit ? 'Update' : 'Save' }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import HeaderComponent from "@/admins/components/header-component.vue";
import SidebarComponent from "@/admins/components/sidebar-component.vue";
import { supplyService } from "@/public/services/supplyService"; // Cambia según tu servicio

export default {
  components: {
    HeaderComponent,
    SidebarComponent,
  },
  data() {
    return {
      restaurantName: '',
      userRole: '',
      supplies: [],
      searchQuery: '',
      filteredSupplies: [],
      isSupplyConfigOpen: false,  // Control for overlay visibility
      newSupplyMetricUnit: '', // Selección del usuario
      newSupplyState: '', // Selección del usuario
      

      // Enums
      MetricUnit: {
        Kg: 'Kg',
        G: 'g',
        L: 'L',
        Ml: 'ml',
        Unit: 'u',
      },
      SupplyState: {
        OnStock: 'OnStock',
        OffStock: 'OffStock',
      },
    };
  },
  beforeMount() {
    this.fetchUserData();

    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData) {
      this.restaurantName = userData['business-name']; // Si no tienes 'business-name' puedes colocar un valor predeterminado.
      this.userRole = userData.role;
      this.restaurantId = userData.restaurantId;  // Asegúrate de que restaurantId está aquí.
      //console.log('Restaurant ID:', this.restaurantId);
    }
    this.loadSupplies();
  },
  methods: {
    async fetchUserData() {
      try {
        const userData = JSON.parse(localStorage.getItem("userData"));
        const restaurantId = userData?.restaurantId;

        if (restaurantId) {
          this.restaurantName = "Mock Restaurant"; // Cambia según tu lógica
          this.userRole = userData.role;
        }
      } catch (error) {
        console.error("Error fetching restaurant data: ", error);
      }
    },

    async loadSupplies() {
      const userData = JSON.parse(localStorage.getItem("userData"));
      const restaurantId = userData.restaurantId;

      try {
        const supplies = await supplyService.getSuppliesByRestaurant(restaurantId);
        this.supplies = Array.isArray(supplies) ? supplies : [];
        this.filteredSupplies = this.supplies;
      } catch (error) {
        console.error("Failed to load supplies", error);
      }
      this.filteredSupplies = this.supplies;
    },

    filterSupplies() {
      const query = this.searchQuery.toLowerCase();
      this.filteredSupplies = this.supplies.filter((supply) =>
        supply.supplyName.toLowerCase().includes(query)
      );
    },

    async addSupply() {
      // Validar las selecciones del usuario
      if (!Object.values(this.SupplyState).includes(this.newSupplyState) || 
          !Object.values(this.MetricUnit).includes(this.newSupplyMetricUnit)) {
        alert("Invalid data selected.");
        return;
      }

      if (this.supplyToEdit) {
        // Si estamos editando, actualiza el suministro existente
        await this.updateSupply();
      } else {

        if (!Array.isArray(this.supplies)) {
          console.error("Supplies no es array");
          this.supplies = []; // Reinicializa como un array vacío si es necesario
        }

        /*const isNameTaken = this.supplies.some(supply => supply.supplyName.toLowerCase() === this.newSupplyName.toLowerCase());
        if (isNameTaken) {
          alert("A supply with this name already exists.");
          return;
        }*/

        if (!this.validateSupplyData()) return;

        // Crear un nuevo suministro
        const newSupply = {
          supplyName: this.newSupplyName,
          supplyCategory: this.newSupplyCategory,
          metricUnit: this.newSupplyMetricUnit,
          currentlyOnStock: this.newSupplyStock,
          costPerUnit: this.newSupplyCostPerUnit,
          stateOfSupply: this.newSupplyState,
          restaurantId: this.restaurantId,
        };
        
        console.log(this.restaurantId);

        try {
          const response = await supplyService.addSupply(newSupply);
          if (response) {
            this.supplies.push(response);
            this.filterSupplies(); // Actualiza la lista filtrada
            this.closeSupplyConfig(); // Cierra el modal
          }
        } catch (error) {
          console.error("Error adding supply:", error);
        }
      }
    },

    openSupplyConfig() {
      this.isSupplyConfigOpen = true; // Show the overlay
      this.newSupplyName = '';
      this.newSupplyCategory = '';
      this.newSupplyMetricUnit = '';
      this.newSupplyStock = 0;
      this.newSupplyCostPerUnit = 0;
      this.newSupplyState = '';
    },

    closeSupplyConfig() {
      this.isSupplyConfigOpen = false;
      this.newSupplyName = '';
      this.newSupplyCategory = '';
      this.newSupplyMetricUnit = '';
      this.newSupplyStock = 0;
      this.newSupplyCostPerUnit = 0;
      this.newSupplyState = '';
      this.supplyToEdit = null; // Limpiar referencia
    },

    editSupply(supply) {
      // Prellenar el formulario con los datos existentes
      this.newSupplyName = supply.supplyName;
      this.newSupplyCategory = supply.supplyCategory;
      this.newSupplyMetricUnit = supply.metricUnit;
      this.newSupplyStock = supply.currentlyOnStock;
      this.newSupplyCostPerUnit = supply.costPerUnit;
      this.newSupplyState = supply.stateOfSupply;

      // Guardar la referencia del suministro que estamos editando
      this.supplyToEdit = supply;
      //console.log("supply: ", supply)
      //console.log("supply edit: ", this.supplyToEdit)

      // Mostrar el formulario de configuración
      this.isSupplyConfigOpen = true;
    },

    async updateSupply() {

      if (!this.validateSupplyData()) return;

      const updatedSupply = {
        id: this.supplyToEdit.id,
        supplyName: this.newSupplyName,
        supplyCategory: this.newSupplyCategory,
        metricUnit: this.newSupplyMetricUnit,
        currentlyOnStock: this.newSupplyStock,
        costPerUnit: this.newSupplyCostPerUnit,
        stateOfSupply: this.newSupplyState,
      };

      try {
        // Llamada al servicio para actualizar el suministro
        await supplyService.updateSupply(updatedSupply.id, updatedSupply);
        
        // Actualizar el suministro en la lista
        const index = this.supplies.findIndex(s => s.id === updatedSupply.id);
        if (index !== -1) {
          this.supplies.splice(index, 1, updatedSupply);
          this.filteredSupplies.splice(index, 1, updatedSupply);
        }
        
        // Cerrar el formulario de configuración
        this.closeSupplyConfig();
      } catch (error) {
        console.error("Error updating supply:", error);
      }
    },

    async deleteSupply(id) {
      const confirmation = window.confirm("Are you sure you want to delete this supply?");
      
      if (confirmation) {
        try {
          // Llamada al servicio para eliminar el suministro
          await supplyService.deleteSupply(id);

          // Eliminarlo del arreglo local
          this.supplies = this.supplies.filter(supply => supply.id !== id);
          this.filteredSupplies = this.filteredSupplies.filter(supply => supply.id !== id);
        } catch (error) {
          console.error("Error deleting supply:", error);
        }
      }
    },

    validateSupplyData() {
      const errors = [];
      
      if (!this.newSupplyName) errors.push("Supply Name is required.");
      if (!this.newSupplyCategory) errors.push("Category is required.");
      if (!this.newSupplyMetricUnit || !Object.values(this.MetricUnit).includes(this.newSupplyMetricUnit)) {
        errors.push("Invalid Metric Unit.");
      }
      if (this.newSupplyStock === null || this.newSupplyStock < 0) {
        errors.push("Stock must be a non-negative number.");
      }
      if (this.newSupplyCostPerUnit === null || this.newSupplyCostPerUnit < 0) {
        errors.push("Cost per Unit must be a non-negative number.");
      }
      if (!this.newSupplyState || !Object.values(this.SupplyState).includes(this.newSupplyState)) {
        errors.push("Invalid Supply State.");
      }
      
      if (errors.length > 0) {
        alert(errors.join("\n")); // Mostrar errores al usuario
        return false;
      }
      
      return true; // Todos los datos son válidos
    }
    
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
.no-supplies {
  text-align: center;
  color: #31304A;
}
.supplies-header {
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

.supply-table-container {
  width: 100%;
  max-width: 1000px;
  margin: 20px auto;
}
.supply-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}
.supply-table th, .supply-table td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #D3D2E5;
}
.supply-table th {
  background-color: #D3D2E5;
  color: #31304A;
}
.supply-table td {
  vertical-align: middle;
}

.edit-button,
.delete-button {
  padding: 8px 12px;
  margin: 0 5px;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-button {
  background-color: #5E5E99;
  color: white;
}

.edit-button:hover {
  background-color: #4B4A78;
}

.delete-button {
  background-color: #FF6347;
  color: white;
}

.delete-button:hover {
  background-color: #E0533C;
}

/* Supply Config Overlay Styles */
.supply-config-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  font-family: 'Red-hat-display', sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.supply-config-modal {
  background-color: #F6F5FA;
  padding: 20px;
  border-radius: 8px;
  width: 50%;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  justify-content: center;
  display: flex;
  flex-direction: column;
  max-width: 1000px;
}
.modal-content{
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 800px;
  align-self: center;
}
.modal-title {
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 20px;
  color: #31304A;
}

.form-group {
  margin-bottom: 15px;
  text-align: left;
  justify-content: center;
  display: flex;
  flex-direction: column;
  min-width: 800px;
  max-width: 800px;
}
.selector{
  border-radius: 5px;
  background-color: #D3D2E5;
  border: none;
  padding: 10px;
  color: #31304A;
  font-size: 1.2rem;
}
.option{
  font-size: 0.8rem;
  padding: 10px;
  margin-top: 10px;
}
.form-group label {
  font-size: 14px;
  font-weight: 700;
  color: #31304A;
  margin-bottom: 5px;
  display: block;
  max-width: 200px;
}
.form-group input {
  max-width: 800px;
  padding: 10px;
  border-radius: 5px;
  border: none;
  background-color: #D3D2E5;
  font-size: 1.2rem;
  color: #31304A;
}

.modal-actions {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
}
.button {
  padding: 10px 20px;
  background-color: #31304A;
  color: #F6F5FA;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 20px;
}
.button:active {
  background-color: #201E35;
}

@media (max-width: 768px) {
  .layout {
    flex-direction: column;
  }
  .sidebar {
    display: none;
  }
  .main-content {
    margin-left: 0;
  }
  .supply-table th, .supply-table td {
    font-size: 12px;
  }
  .add-button {
    font-size: 12px;
    padding: 8px;
  }
}
@media (max-width: 480px) {
  .search-bar {
    width: 100%;
  }
}
</style>