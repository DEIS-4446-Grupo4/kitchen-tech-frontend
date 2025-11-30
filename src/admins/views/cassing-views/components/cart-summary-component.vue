<template>
  <div class="cart-summary">
    <button class="add-customer" @click="$emit('add-customer')">Add Customer</button>

    <div class="cart-item" v-for="(item, index) in cart" :key="item.id">
      <div class="toggle-input">
        <div class="item-header" @click="toggleItemInputs(index)">
          <div class="item-info">
            <span class="item-name">{{ item.productName }}</span>
            <span class="item-unit">{{ item.quantity }} Un - S/{{ item.price }}</span>
          </div>
        </div>
        <img :src="require('/public/assets/images/delete.png')" class="delete-button" @click="removeItem(item.id)" alt="delete" />
      </div>
      <div v-if="item.showInputs" class="item-body">
        <div class="input-group">
          <label>Quantity</label>
          <input type="number" v-model.number="item.quantity" @input="onItemChange(item)" @blur="validateQuantity(item)" />
        </div>
        <div class="input-group">
          <label>Unit Price</label>
          <input type="number" v-model.number="item.price" @input="onItemChange(item)" @blur="validatePrice(item)" />
        </div>
      </div>
    </div>

    <div class="footer">
      <button class="save-sale" @click="openSaveModal">Save Sale</button>
      <save-order-component
          :is-visible="showModal"
          :restaurant-id="String(restaurantId)"
          :account-to-edit="accountToEdit"
          @save-sale="$emit('save-sale', $event)"
          @close-modal="closeModal"
      />

      <div class="summary">
        <span>Subtotal</span><span>S/{{ subtotal.toFixed(2) }}</span>
      </div>
      <div class="summary">
        <span>I.G.V:</span><span>S/{{ igv.toFixed(2) }}</span>
      </div>
    </div>

    <button class="charge-button" @click="charge">
      <span>Charge</span><span>S/{{ total.toFixed(2) }}</span>
    </button>
  </div>
</template>

<script>
import SaveOrderComponent from "@/admins/views/cassing-views/components/save-order-component.vue";
import { cartStore } from "@/public/stores/cartStore";

export default {
  components: { SaveOrderComponent },
  props: {
    subtotal: Number,
    igv: Number,
    total: Number,
    restaurantId: { type: String, required: true },
    accountToEdit: Object
  },
  data() {
    return {
      cartStore,
      showModal: false,
    };
  },
  computed: {
    cart() { return cartStore.cart; },
  },
  methods: {
    toggleItemInputs(index) {
      const item = this.cart[index];
      item.showInputs = !item.showInputs;
      cartStore.persist();
    },
    onItemChange(item) {
      cartStore.updateItem(item.id, { quantity: item.quantity, price: item.price });
    },
    removeItem(id) {
      cartStore.removeProduct(id);
    },
    validateQuantity(item) {
      if (!item.quantity || item.quantity <= 0) item.quantity = 1;
      this.onItemChange(item);
    },
    validatePrice(item) {
      if (!item.price || item.price <= 0) item.price = 1;
      this.onItemChange(item);
    },
    openSaveModal() { this.showModal = true; },
    closeModal() { this.showModal = false; },
    charge() {
      if (confirm("Are you sure you want to charge?")) {
        this.$emit("charge", this.accountToEdit.id);
      }
    }
  }
};
</script>

<style scoped>
.cart-summary {
  flex: 1;
  padding: 20px 0;
  border-radius: 5px;
  display: flex;
  background-color: #D3D2E5;
  color: #31304A;
  flex-direction: column;
  font-family: "Red-hat-display", sans-serif;
}
.cart-summary button {
  padding: 10px;
  background: #31304A;
  color: #F6F5FA;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  justify-content: center;
}
button.add-customer {
  background-color: transparent;
  border: 1px solid #31304A;
  color: #31304A;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 100;
  margin: 0 20px 20px 20px;
}
.cart-item{
  border-top: 1px solid #F6F5FA;
  border-bottom: 1px solid #F6F5FA;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px 20px;
}

.toggle-input{
  display: flex;
  justify-content: space-between;
}
.item-header {
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
  margin-bottom: 10px;
  width: 100%;
}
.item-info{
  display: flex;
  flex-direction: column;
}
.item-name {
  font-weight: bold;
  margin-bottom: 5px;
}
.item-unit {
  font-size: 0.8rem;
}

.item-body {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 5px;
}
.input-group {
  flex-direction: column;
  max-width: 150px;
  border: none;
  border-radius: 5px;
}
input[type="number"]{
  -moz-appearance: textfield;
  appearance: textfield;
  padding: 5px;
}
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input {
  width: 100%;
  max-width: 138px;
  border: none;
  border-radius: 5px;
  font-family: 'Red-hat-display', sans-serif;
}

label{
  font-size: 0.7rem;
}

.delete-button{
  background: transparent;
  border-radius: 8px;
  padding: 2px;
  cursor: pointer;
  margin: 10px 0 0 15px;
  width: 20px;
  height: 20px;
}
.delete-button:hover{
  background: radial-gradient(circle, #b6b6c3 100%, transparent 50%);
}
.delete-button:active{
  background: radial-gradient(circle, #a6a6b1 100%, transparent 50%);
}
.cart-summary .summary {
  display: flex;
  justify-content: space-between;
  margin: 10px 20px;
  font-weight: 100;
  font-size: 16px;
  color: #31304A;
}
button.save-sale {
  width: 100%;
  background-color: #31304A;
  color: white;
  padding: 15px 0;
  font-weight: bold;
  margin: 10px 0;
  font-size: 16px;
  border-radius: 0;
}
button.charge-button{
  width: 90%;
  display: flex;
  justify-content: space-between;
  background-color: #31304A;
  color: #F6F5FA;
  border: none;
  cursor: pointer;
  font-weight: 100;
  font-size: 0.8rem;
  margin-top: 20px;
  margin-left: 5%;
  align-items: center;
}
.cart-summary .footer{
  margin-top: auto;
}
</style>
