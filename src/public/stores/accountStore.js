import { reactive } from "vue";
import { accountService } from "@/public/services/accountsService";

export const accountsStore = reactive({
    accounts: [],
    lastRestaurantId: null,
    loading: false,

    async loadAccounts(restaurantId) {
        if (!restaurantId) return;

        // si ya existe cache en memoria y es del mismo restaurant
        if (this.accounts.length && this.lastRestaurantId === restaurantId) {
            return;
        }

        this.loading = true;
        this.lastRestaurantId = restaurantId;

        try {
            // 1. carga instantánea desde localStorage
            const cached = localStorage.getItem("accounts_" + restaurantId);
            if (cached) {
                this.accounts = JSON.parse(cached);
            }

            // 2. pide data nueva a la nube
            const data = await accountService.getAccountsByRestaurant(restaurantId);

            this.accounts = data.map(account => ({
                ...account,
                tableNumber: account.table?.tableNumber || null,
                accountName: account.accountName || null,
            }));

            // 3. actualiza cache
            localStorage.setItem(
                "accounts_" + restaurantId,
                JSON.stringify(this.accounts)
            );

        } catch (e) {
            console.error("Error loading accounts:", e);
        } finally {
            this.loading = false;
        }
    },

    async refresh(restaurantId) {
        const data = await accountService.getAccountsByRestaurant(restaurantId);

        this.accounts = data.map(account => ({
            ...account,
            tableNumber: account.table?.tableNumber || null,
            accountName: account.accountName || null,
        }));

        localStorage.setItem("accounts_" + restaurantId, JSON.stringify(this.accounts));
    }
});