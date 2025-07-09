<template>
  <div class="modal" v-if="isVisible">
    <div class="modal-content">
      <div class="modal-header">
        <p class="title mb-0">Pay Account</p>
        <button class="close" @click="closeModal()">x</button>
      </div>
      <div class="container">
        <div class="row d-flex justify-content-between my-5 text-center align-items-center">
          <div
              class="card px-3 py-5 col-3 payment-card"
              :class="{ selected: selectedPayment === 'CASH' }"
              @click="selectPayment('CASH')"
          >
            <p>Cash</p>
          </div>
          <div
              class="card px-3 py-5 col-3 payment-card"
              :class="{ selected: selectedPayment === 'CREDIT_CARD' }"
              @click="selectPayment('CREDIT_CARD')"
          >
            <p>Card</p>
          </div>
          <div
              class="card px-3 py-5 col-3 payment-card"
              :class="{ selected: selectedPayment === 'BANK_APP' }"
              @click="selectPayment('BANK_APP')"
          >
            <p>Bank App</p>
          </div>
        </div>
        <button class="pay-button" :disabled="!selectedPayment" @click="confirmPayment">
          Pay Account
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    isVisible: {
      type: Boolean,
      default: false,
    },
    restaurantId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      selectedPayment: null
    };
  },
  methods: {
    closeModal() {
      this.$emit("close-payment-modal");
    },
    selectPayment(method) {
      this.selectedPayment = method;
    },
    confirmPayment() {
      if (this.selectedPayment) {
        this.$emit("confirm-payment", this.selectedPayment);
      }
    }
  }
};
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
p{
  color: #31304A;
  font-size: 1.2rem;
  margin: 0;
}

.payment-card {
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;
  border: 2px solid transparent;
}
.payment-card.selected {
  background-color: #b6b6c3;
  color: white;
}

.pay-button {
  width: 100%;
  background-color: #31304A;
  color: white;
  padding: 10px 30px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
}
.pay-button:active{
  background-color: #201E35;
  color: #b6b6c3;
}
.pay-button:disabled {
  background-color: #a6a6b1;
  color: #31304A;
  cursor: not-allowed;
}

</style>