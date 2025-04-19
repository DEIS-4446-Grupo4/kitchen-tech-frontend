<template>
  <div class="product-card">
    <div class="product-name">
      <p class="name">{{ product.productName }}</p>
    </div>
    <div class="product-price">
      <p class="price">{{ formatPrice(product.productPrice) }}</p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    product: Object
  },
  methods: {
    selectProduct() {
      this.$emit('product-selected', this.product);
    },
    formatPrice(price) {
      return `S/${price.toFixed(2)}`;
    }
  }
}
</script>

<style scoped>
.product-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
  height: 100%;
  font-family: 'Red Hat Display', sans-serif;
  font-weight: 600;
  background-color: #D3D2E5;
  overflow: hidden;
}

.product-name {
  font-size: 0.7rem;
  border-radius: 5px;
  background-color: #D3D2E5;
  padding: 0 10px;
}

.product-price {
  font-size: 0.7rem;
  background-color: #31304A;
  color: #F6F5FA;
  font-weight: 100;
  max-height: 25px;
  text-align: right;
  margin: 0;
}
.price {
  margin: 5px 5px;
}
</style>