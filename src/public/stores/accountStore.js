import { reactive } from "vue";
import { accountService } from "@/public/services/accountsService";

export const accountsStore = reactive({
    accounts: [],
    lastRestaurantId: null,
    loading: false,

    async loadAccounts(restaurantId) {
        if (!restaurantId) return;

        const dirty = localStorage.getItem("accounts_dirty") === "1";
        const cached = localStorage.getItem("accounts_" + restaurantId);

        if (cached && !dirty && this.lastRestaurantId === restaurantId) {
            this.accounts = JSON.parse(cached);
            return;
        }

        this.loading = true;
        this.lastRestaurantId = restaurantId;

        try {
            const data = await accountService.getAccountsByRestaurant(restaurantId);

            this.accounts = data
                .map(acc => ({
                    ...acc,
                    tableNumber: acc.table?.tableNumber || null,
                    client: acc.client || null,
                    totalAccount: acc.totalAccount || null,
                }))
                .sort((a, b) => (a.id < b.id ? 1 : -1));

            localStorage.setItem(
                "accounts_" + restaurantId,
                JSON.stringify(this.accounts)
            );

            localStorage.removeItem("accounts_dirty");

        } catch (err) {
            console.error("Error loading accounts:", err);
        } finally {
            this.loading = false;
        }
    },

    async refresh(restaurantId) {
        localStorage.setItem("accounts_dirty", "1");
        await this.loadAccounts(restaurantId);
    }
});
