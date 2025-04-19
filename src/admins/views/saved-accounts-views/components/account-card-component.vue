<template>
  <div class="product-card" @click="selectAccount">
    <div class="card-header">
      <p class="account-name">{{ account.accountName }}</p>
      <p class="account-client">{{ account.client === null ? 'Account without client' : account.client.fullName }}</p>
    </div>
    <div class="card-body">
        <img
            :src="require('/public/assets/images/delete.png')"
            class="delete-button"
            @click="$emit('delete-account', account.id)"
            alt="delete"
        />
      <p class="account-price">S/. {{ account.totalAccount }}</p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    account: {
      type: Object,
      required: true,
    }
  },
  methods: {
    selectAccount() {
      this.$emit('load-account-products', this.account.id);
      console.log("Emiting:", this.account);
    },
  }
}
</script>

<style scoped>
.product-card{
  display: flex;
  background-color: #D3D2E5;
  color: #31304A;
  padding: 10px 20px;
  margin: 10px 10px;
  border-radius: 8px;
  justify-content: space-between;
  cursor: pointer;
}
.account-name{
  font-weight: 1000;
  margin: 10px 0;
  font-size: 1.2rem;
}
.account-client{
  margin: 15px 0 10px 0;
  font-size: 0.8rem;
}

.card-body{
  align-content: center;
  align-self: center;
}
.delete-button{
  background: transparent;
  border-radius: 8px;
  padding: 2px;
  cursor: pointer;
  margin: 5px 0 0 15px;
  width: 20px;
}
.delete-button:active{
  background: radial-gradient(circle, #a6a6b1 100%, transparent 50%);
}
.account-price{
  margin: 5px 0 5px 0;
  font-size: 0.8rem;
  padding: 5px;
}
</style>