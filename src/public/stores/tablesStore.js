import { reactive } from "vue";
import { tablesService } from "@/public/services/tablesService";

export const tablesStore = reactive({
    tables: [],
    lastRestaurantId: null,
    loading: false,

    async loadTables(restaurantId, forceRefresh = false) {
        if (!restaurantId) return;

        const localKey = "tables_" + restaurantId;

        // Carga instantánea desde cache
        if (!forceRefresh && this.lastRestaurantId === restaurantId) {
            const cached = localStorage.getItem(localKey);
            if (cached) {
                this.tables = JSON.parse(cached);
            }
        }

        this.lastRestaurantId = restaurantId;

        // Si no hay cache, o forceRefresh=true, o no hay tablas cargadas → consultar API
        const mustFetch =
            forceRefresh ||
            this.tables.length === 0 ||
            !localStorage.getItem(localKey);

        if (!mustFetch) return;

        try {
            this.loading = true;
            const freshData = await tablesService.getTablesByRestaurant(restaurantId);

            if (Array.isArray(freshData)) {
                this.tables = freshData;
                localStorage.setItem(localKey, JSON.stringify(freshData));
            }
        } catch (error) {
            console.error("Error loading tables:", error);
        } finally {
            this.loading = false;
        }
    },

    invalidateCache(restaurantId) {
        const localKey = "tables_" + restaurantId;
        localStorage.removeItem(localKey);
        this.tables = [];
    }
});
