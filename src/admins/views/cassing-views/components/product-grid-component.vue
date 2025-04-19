<template>
  <div class="products-grid">
    <div
        v-for="(slot, index) in 30"
        :key="index"
        class="product-slot"
        :class="{ 'border-dashed': !favoriteProducts[index] }"
    @click="isEditMode ? selectFavoriteSlot(index) : addFavoriteToCart(index)"
    >
    <FavoriteProductCardComponent
        v-if="favoriteProducts[index]"
        :product="favoriteProducts[index]"
        @product-clicked="addProductToCart"
        @product-selected="removeProductFromFavorites(index)"
    />
    <div v-else class="empty-slot">
      <button v-if="isEditMode" @click="openProductList(index)">
        <i>+</i>
      </button>
    </div>
  </div>
  </div>
</template>

<script>
import FavoriteProductCardComponent from "@/admins/views/cassing-views/components/favorite-product-card-component.vue";

export default {
  props: {
    isEditMode: Boolean,
    favoriteProducts: Array
  },
  components: {
    FavoriteProductCardComponent
  },
  methods: {
    openProductList(index) {
      this.$emit('open-product-list', index);
    },
    removeProductFromFavorites(index) {
      this.$emit('remove-product-from-favorites', index);
    },
    selectFavoriteSlot(index) {
      if (!this.favoriteProducts[index]) {
        this.openProductList(index);
      }
    },
    addProductToCart(product) {
      this.$emit('add-to-cart', product);
    },
    addFavoriteToCart(index) {
      if (!this.isEditMode && this.favoriteProducts[index]) {
        this.$emit('add-to-cart', this.favoriteProducts[index]);
      }
    }
  }
}
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
