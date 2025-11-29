import { reactive } from "vue";
import { productsService } from "@/public/services/productsService";

export const productsStore = reactive({
    products: [],
    lastRestaurantId: null,
    loading: false,

    async loadProducts(restaurantId) {
        if (!restaurantId) return;

        const isDirty = localStorage.getItem("products_dirty") === "1";
        const cached = localStorage.getItem("products_" + restaurantId);

        if (this.products.length && this.lastRestaurantId === restaurantId && !isDirty) {
            return;
        }

        if (cached && !isDirty) {
            try {
                this.products = JSON.parse(cached)
                this.lastRestaurantId = restaurantId;
                return;
            } catch (error) {
                console.warn("Invalid products cache, will reload from API", error);
            }
        }

        this.loading = true;
        this.lastRestaurantId = restaurantId;

        try {
            const data = await productsService.getProductsByRestaurant(restaurantId);
            this.products = (data || []).slice().sort((a,b) => (a.id < b.id ? 1 : -1));

            localStorage.setItem("products_" + restaurantId, JSON.stringify(this.products));
            localStorage.removeItem("products_dirty");
        } catch (error) {
            console.error("Error loading products:", error);

            if (cached) {
                try {
                    this.products = JSON.parse(cached)
                } catch (error) {
                    console.warn("Invalid products cache, unable to load products", error);
                }
            }
        } finally {
            this.loading = false;
        }
    },

    async refresh(restaurantId){
        localStorage.setItem("products_dirty", "1");
        await this.loadProducts(restaurantId);
    },

    findByName(query) {
        if (!this.products || !query) return [];
        const q = query.toLowerCase();
        return this.products.filter(p => p.productName?.toLowerCase().includes(q));
    },

    getById(id){
        return this.products.find(p => String(p.id) === String(id));
    }
});