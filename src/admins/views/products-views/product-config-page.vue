<template>
  <div class="layout">
    <sidebar-component :restaurant-name="restaurantName" :role="userRole" class="sidebar" />
    <div class="main-content">
      <header-component :restaurant-name="restaurantName" :role="userRole" class="header" />
      <div class="page-container">
        <div class="page-header">
          <p class="title">{{ isEdit ? 'Edit Product' : 'Add New Product' }}</p>
        </div>
        <div class="card">
          <form @submit.prevent="submitProduct">
            <div class="form-field">
              <label for="name">Product Name</label>
              <input type="text" v-model="product.productName" required />
            </div>

            <div class="form-row">
              <div class="form-field">
                <label for="category">Product Category</label>
                <input type="text" v-model="product.category" required />
              </div>

              <div class="form-field">
                <label for="price">Product Price</label>
                <input type="number" v-model="product.productPrice" required />
              </div>
            </div>

            <div class="form-field">
              <label for="imageUrl">Product Image URL</label>
              <input type="text" v-model="product.productImageUrl" />
            </div>
            <!--
            <div class="supplies-header">
              <div class="supply">
                <p class="title">Supplies:</p>
              </div>

              <button type="button" @click="addSupply">Add Supply</button>
            </div>

            <div v-if="showSupplySelector" class="modal-overlay">
              <div class="supply-selector-modal">
                <h3>Select a Supply</h3>
                <ul class="supply-list">
                  <li 
                    v-for="supply in allSupplies" 
                    :key="supply.id" 
                    @click="selectSupply(supply)"
                    class="supply-item"
                  >
                    {{ supply.supplyName }} - {{ supply.supplyCategory }}
                  </li>
                </ul>
                <button @click="showSupplySelector = false">Close</button>
              </div>
            </div>
           -->
            <!--
            <div class="form-field">

              <div class="supply-table-container">
                <template v-if="product.supplies.length === 0">
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
                      <tr v-for="supply in product.supplies" :key="supply.id">
                        <td>{{ supply.supplyName }}</td>
                        <td>{{ supply.supplyCategory }}</td>
                        <td>{{ supply.metricUnit }}</td>
                        <td>{{ supply.currentlyOnStock }}</td>
                        <td>${{ supply.costPerUnit.toFixed(2) }}</td>
                        <td>{{ supply.stateOfSupply }}</td>
                        <td>
                          <button class="delete-button" @click="deleteSupply(supply.id)">Delete</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </template>
              </div>
            </div>
           -->

            <button type="submit">{{ isEdit ? 'Save Changes' : 'Add Product' }}</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import HeaderComponent from "@/admins/components/header-component.vue";
import SidebarComponent from "@/admins/components/sidebar-component.vue";
import { productsService } from "@/public/services/productsService";
import userService from "@/public/services/userService";
import { supplyService } from "@/public/services/supplyService";
export default {
  components: {
    HeaderComponent,
    SidebarComponent,
  },
  data() {
    return {
      restaurantName: '',
      userRole: '',
      supply:{
        id:null,
        supplyName:'',
        supplyCategory:'',
        metricUnit:'',
        currentlyOnStock:null,
        costPerUnit:null,
        stateOfSupply:'',
        restaurantId:null
      },
      product: {
        id: null,
        productName: '',
        category: '',
        productPrice: null,
        productImageUrl: null,
        restaurantId: null,
        supplies: [] // Lista de supplies asociados al producto
      },
      newSupply: {
        id: null,
        supplyName: '',
        supplyCategory: '',
        metricUnit: '',
        currentlyOnStock: null,
        costPerUnit: null,
        stateOfSupply: '',
        restaurantId: null
      },
      allSupplies: [],
      showSupplySelector: false,
      isEdit: false,
    };
  },
  beforeMount() {
    this.fetchUserData();

    const userData = JSON.parse(localStorage.getItem('userData'));
    const restaurantId = userData.restaurantId;
    console.log("id del restaurante:", restaurantId)
    if (userData) {
      this.restaurantName = userData['business-name'];
      this.userRole = userData.role;
    }
    if (restaurantId) {
      this.product.restaurantId = restaurantId;
    }

    if (this.$route.params.productId) {
      this.isEdit = true;
      this.loadProduct();
    }
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

    async loadProduct() {
      try {
        const productId = this.$route.params.productId;
        const product = await productsService.getProductById(productId);
        console.log(product);
        if (product) {
          this.product = {
            id: product.id,
            productName: product.productName,
            productPrice: product.productPrice,
            productImageUrl: product.productImageUrl,
            category: product.category,
            restaurantId: product.restaurantId,
            supplies:product.supplies || []
          };
        }
      } catch (error) {
        console.error("Failed to load product", error);
      }
    },

    async loadSupplies(){
      try{
        const allSupplies = await supplyService.getSuppliesByRestaurant(this.product.restaurantId);
        this.allSupplies = allSupplies;
        console.log(this.allSupplies);
      }catch(error){
        console.error('Error loading supplies:',error)
        return false;
      }
    },

    addSupply() {
      // Mostrar el modal o desplegable para elegir un supply
      this.loadSupplies();  
      this.showSupplySelector = true;
      
    },
    deleteSupply(supplyId) {
      // Filtra la lista y excluye el supply con el ID proporcionado
      this.product.supplies = this.product.supplies.filter(supply => supply.id !== supplyId);
      console.log(`Supply with ID ${supplyId} deleted successfully.`);
    },

    selectSupply(supply) {
      // Verifica si el supply ya está agregado
      const exists = this.product.supplies.some((s) => s.id === supply.id);
      if (!exists) {
        this.product.supplies.push(supply);
      } else {
        alert("This supply is already added.");
      }
      this.showSupplySelector = false; // Cerrar el modal/desplegable
    },

    async checkProductNameExists(productName, restaurantId) {
      try {
        // Llama a getProductsByRestaurant para obtener los productos del restaurante
        const products = await productsService.getProductsByRestaurant(restaurantId);

        // Verifica si algún producto tiene el mismo nombre (ignora mayúsculas)
        return products.some(product => product.productName.toLowerCase() === productName.toLowerCase());
      } catch (error) {
        console.error('Error checking product name:', error);
        return false;
      }
    },

    async submitProduct() {
      const restaurantId = this.product.restaurantId;
      this.product.productPrice = parseFloat(this.product.productPrice);
      this.product.restaurantId = Number(this.product.restaurantId);

      // Verificar si el producto ya existe en el mismo restaurante
      const productNameExists = await this.checkProductNameExists(this.product.productName, this.product.restaurantId);
      if (productNameExists && !this.isEdit) {
        alert('A product with this name already exists in this restaurant. Please choose a different name.');
        return;
      }

      try {
        const response = this.isEdit
            ? await productsService.updateProduct(this.product)
            : await productsService.addProduct(this.product);

        if (response) {
          alert(`Product ${this.isEdit ? 'updated' : 'created'} successfully.`);
        } else {
          console.error(`${this.isEdit ? 'Update' : 'Creation'} response error:`, response);
        }

        localStorage.removeItem("products_" + restaurantId)

        this.$router.push(`/${this.restaurantName}/${this.userRole}/products`);

      } catch (error) {
        console.error('Error during product creation/update process:', error);
        alert('An error occurred: ' + (error.response ? error.response.data.message : error.message));
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

.title {
  font-weight: 800;
  font-size: 1.5rem;
  max-width: 1000px;
  margin: 20px auto;
  padding-bottom: 10px;
  color: #31304A;
}
.card {
  background: #D3D2E5;
  padding: 30px 50px;
  border-radius: 5px;
  max-width: 1000px;
  justify-content: space-between;
  align-items: center;
  margin: 0 auto;
  gap: 10px;
}

.form-row {
  display: flex;
  gap: 20px;
  flex: 1;
  margin: 20px 0;
}
.form-field {
  flex: 1;
}
.form-field label {
  font-weight: 700;
  color: #31304A;
}
.form-field input {
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  border: none;
  border-radius: 5px;
  color: #31304A;
  margin: 10px 0;
  font-weight: 500;
  box-sizing: border-box;
  background: #F6F5FA;
}

button{
  width: 100%;
  margin: 0 0 16px 0;
  color: #F6F5FA;
  padding: 24px;
  background: #31304A;
  font-weight: 500;
  font-size: 1rem;
  border-radius: 5px;
  cursor: pointer;
  border: none;
}
button:active{
  background-color: #201E35;
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

.supply{
    width: 100%;
    padding: 15px;
    border-radius: 5px;
    border: none;
    color: #31304A;
    background-color: #D3D2E5;
    max-width: 1000px;
  }
/*Tabla de Supply*/
.supply-table-container {
    width: 100%;
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
    .delete-button {
    padding: 8px 12px;
    margin: 0 5px;
    border: none;
    border-radius: 5px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  .delete-button {
    background-color: #FF6347;
    color: white;
  }

  .delete-button:hover {
    background-color: #E0533C;
  }
/*MODAL*/
/* Superposición del fondo */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5); /* Fondo semitransparente */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999; /* Asegura que esté por encima de otros elementos */
}
.supply-selector-modal {
  width: 50%; /* Cambia el ancho al 80% del contenedor principal */
  max-width: 1200px; /* Define un ancho máximo */
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.supply-list {
  list-style: none;
  padding: 0;
  margin: 10px 0;
}

.supply-item {
  padding: 10px;
  margin: 5px 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  background-color: #f9f9f9;
}

.supply-item:hover {
  background-color: #e2e2e2;
}
</style>