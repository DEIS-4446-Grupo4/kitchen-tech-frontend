import { reactive } from "vue";

export const favoritesStore = reactive({
    slots: Array(30).fill(null),

    loadFromLocal(restaurantId) {
        try {
            const key = "favorites_" + restaurantId;
            const raw = localStorage.getItem(key);
            if (raw) this.slots = JSON.parse(raw);
        } catch (e) {
            this.slots = Array(30).fill(null);
        }
    },
    persist(restaurantId) {
        localStorage.setItem("favorites_" + restaurantId, JSON.stringify(this.slots));
    },
    setSlot(index, product, restaurantId) {
        this.slots[index] = product;
        if (restaurantId) this.persist(restaurantId);
    },
    removeSlot(index, restaurantId) {
        this.slots[index] = null;
        if (restaurantId) this.persist(restaurantId);
    }
});
