<template>
  <div class="modal" v-if="isVisible">
    <div class="modal-content">
      <div class="modal-header">
        <p class="title">{{isEdit ? 'Edit Table' : 'Add New Table'}}</p>
        <button class="close" @click="closeModal()">x</button>
      </div>
      <form @submit.prevent="submitTable">
        <div class="form-inputs">
          <div class="form-group table-number">
            <label for="tableNumber">Table Number</label>
            <input
                type="text"
                id="tableNumber"
                v-model="table.tableNumber"
                required
            />
          </div>
          <div class="form-group table-capacity">
            <label for="tableCapacity">Table Capacity</label>/
            <input
                type="number"
                id="tableCapacity"
                v-model="table.tableCapacity"
                required
            />
          </div>
        </div>
        <button type="submit" class="save-button">{{ isEdit ? 'Save Changes' : 'Add Table' }}</button>
      </form>
    </div>
  </div>
</template>

<script>
import userService from "@/public/services/userService";

export default {
  props:{
    isVisible:Boolean,
  },
  data() {
    return {
      restaurantName: '',
      userRole: '',
      table: {
        tableNumber: null,
        tableCapacity: null,
        tableGuests: null,
        tableStatus: null,
        restaurantId: null, // Agrega el restaurantId aquí
      },
      isEdit: false,
    };
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
    async submitTable() {
      if (this.table.tableNumber && this.table.tableCapacity) {
        this.$emit("save-table", {
          tableNumber: this.table.tableNumber,
          tableCapacity: this.table.tableCapacity,
        });
      } else {
        console.log("Error submitTable: tableNumber or tableCapacity is missing");
      }
    },
    closeModal(){
      this.tableNumber = null;
      this.tableCapacity = null;
      this.$emit("close-modal");
    }
  }
}
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal-content {
  background-color: #F6F5FA;
  color: #31304A;
  padding: 30px;
  border-radius: 5px;
  width: 550px;
  max-width: 100%;
}
.modal-header{
  display: flex;
  justify-content: space-between;
}
.close{
  background-color: transparent;
  border: none;
  color: #31304A;
  font-weight: 800;
  padding: 0;
  margin: 0;
  align-self: flex-start;
}

.title{
  font-size: 20px;
  font-weight: 800;
  margin: 0 0 15px 0;
}
.form-inputs{
  display: flex;
}
.form-group {
  margin-bottom: 15px;
}
.table-number{
  width: 410px;
}
.table-capacity{
  margin-left: 24px;
  max-width: 100px;
}

label{
  font-size: 0.8rem;
  margin-left: 5px;
}
input {
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: 4px;
  background-color: #D3D2E5;
}
.save-button {
  width: 100%;
  padding: 10px;
  background-color: #31304A;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.save-button:active{
  background-color: #201E35;
}
</style>