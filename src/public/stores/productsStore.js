import {reactive} from "vue";
import {productsService} from "@/public/services/productsService";

export const productsStore = reactive({
    products: [],
    lastRestaurantId: null,
    loading: false,

    async loadProducts(restaurantId) {
        if (!restaurantId) return;

        // Evita recargar si ya se cargaron los productos para el mismo restaurante
        if (this.products.length && this.lastRestaurantId === restaurantId) {
            return
        }

        this.loading = true;
        this.lastRestaurantId = restaurantId;

        try {
            const data = await productsService.getProductsByRestaurant(restaurantId);
            this.products = data;
            if (localStorage.getItem("products_" + restaurantId)) {
                this.products = JSON.parse(localStorage.getItem("products_" + restaurantId));
            }
            localStorage.setItem("products_" + restaurantId, JSON.stringify(data));
        } catch (error) {
            console.error("Error loading products: ", error);
        } finally {
            this.loading = false;
        }
    }
});