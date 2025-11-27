import { reactive } from "vue";
import { productsService } from "@/public/services/productsService";

export const productsStore = reactive({
    products: [],
    lastRestaurantId: null,
    loading: false,

    async loadProducts(restaurantId) {
        if (!restaurantId) return;

        // evita recargar si ya existe cache y mismo ID
        if (this.products.length && this.lastRestaurantId === restaurantId) {
            return;
        }

        this.loading = true;
        this.lastRestaurantId = restaurantId;

        try {
            // 1. carga instantánea si existe cache local
            const cached = localStorage.getItem("products_" + restaurantId);
            if (cached) {
                this.products = JSON.parse(cached);
            }

            // 2. llamada a la nube
            const data = await productsService.getProductsByRestaurant(restaurantId);

            // 3. actualiza store y cache
            this.products = data;
            localStorage.setItem("products_" + restaurantId, JSON.stringify(data));

        } catch (error) {
            console.error("Error loading products:", error);
        } finally {
            this.loading = false;
        }
    }
});