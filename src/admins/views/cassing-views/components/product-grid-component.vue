<template>
  <div class="products-grid">
    <div
        v-for="(item, index) in normalizedProducts"
        :key="index"
        class="product-slot"
        :class="{ 'border-dashed': !item }"
    >
      <FavoriteProductCardComponent
          v-if="item"
          :product="item"
          @click="addProductToCart(item)"
      />

      <div v-else class="empty-slot"></div>
    </div>
  </div>
</template>

<script>
import FavoriteProductCardComponent from "./favorite-product-card-component.vue";

export default {
  props: {
    products: Array,
    isEditMode: Boolean,
  },
  components: {
    FavoriteProductCardComponent,
  },

  computed: {
    normalizedProducts() {
      const arr = [...this.products];
      while (arr.length < 30) arr.push(null);
      return arr;
    }
  },

  methods: {
    addProductToCart(product) {
      this.$emit("add-to-cart", product);
    }
  },
};
</script>

<style scoped>
.products-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(80px, 110px));
  gap: 10px;
  max-width: 1000px;
  width: 100%;
  margin: 30px auto;
  align-items: center;
  justify-content: center;
}
.product-slot {
  border-radius: 5px;
  height: 90px;
  max-width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border 0.3s ease;
}
.empty-slot button {
  background-color: transparent;
  color: #31304A;
  border: none;
  font-size: 1rem;
  align-items: center;
  align-self: center;
  font-weight: bold;
  cursor: pointer;
}

.border-dashed {
  border: 1px dashed #31304A;
}

@media (max-width: 1366px) {
  .products-grid {
    gap: 8px;
  }
  .product-slot {
    height: 70px;
  }
}
</style>
