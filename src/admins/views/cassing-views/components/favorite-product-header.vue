<template>
  <div class="products-header">
    <input
        class="search-bar"
        type="text"
        v-model="searchQuery"
        placeholder="Buscar productos..."
        @focus="showDropdown = true"
    />
    <button class="reload" @click="reloadProducts" :disabled="productsStore.loading">Reload</button>
    <ul v-if="showDropdown && filteredProducts.length" class="dropdown">
      <li v-for="p in filteredProducts" :key="p.id" class="product-card">
        <div class="card-content">
          <span class="product-name">{{ p.productName }}</span>
          <span class="product-price">S/. {{ p.productPrice }}</span>
        </div>
        <button @click.prevent="emitAddToCart(p)" class="add-button">+</button>
      </li>
    </ul>
  </div>
</template>

<script>
import { productsStore } from "@/public/stores/productsStore";

export default {
  props: {
    isEditMode: Boolean,
    restaurantName: String,
    cart: Array,
    selectedSlot: Number,
    restaurantId: Number
  },
  data() {
    return {
      searchQuery: "",
      showDropdown: false,
      productsStore
    };
  },
  computed: {
    filteredProducts() {
      if (!this.searchQuery) return [];
      return productsStore.findByName(this.searchQuery);
    }
  },
  mounted() {
    document.addEventListener("click", this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
  },
  methods: {
    handleClickOutside(e) {
      if (!this.$el.contains(e.target)) this.showDropdown = false;
    },
    emitAddToCart(p) {
      this.$emit("add-to-cart", p);
    },
    async reloadProducts() {
      if (!this.restaurantId) return;
      await productsStore.reloadProducts(this.restaurantId);
    }
  }
};
</script>


<style scoped>
.products-header {
  display: flex;
  width: 100%;
  position: relative;
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
}
.dropdown{
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: #D3D2E5;
  border: 1px solid #31304A;
  border-radius: 5px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  list-style: none;
  padding: 0;
  margin: 0;
  max-width: 920px;
}
.dropdown li {
  padding: 10px;
  display: flex;
  justify-content: space-between;
}
.dropdown button {
  background-color: #31304A;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.product-card{
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #F6F5FA;
}
.product-card:last-child{
  border-bottom: none;
}
.card-content{
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  font-family: 'Red-hat-display', sans-serif;
}
.product-name {
  font-size: 14px;
  font-weight: 700;
}
.product-price {
  font-size: 12px;
  color: #31304A;
  margin-top: 4px;
}

.add-button {
  background-color: #31304A;
  color: #F6F5FA;
  padding: 6px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.edit-button {
  padding: 13px 20px;
  background: #D3D2E5;
  color: #31304A;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 800;
  flex-shrink: 0;
}
.icon {
  color: #31304A;
}
.reload{
  background-color: #31304A;/* ejemplo de botón principal del sistema */
  color: #D3D2E5;
  font-weight: bold;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s all;
}

.reload:hover{
  background-color: #201e35;
}
</style>