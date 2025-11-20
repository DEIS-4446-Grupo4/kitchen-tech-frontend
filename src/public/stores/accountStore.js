import { reactive } from "vue";
import { accountService } from "@/public/services/accountsService";

export const accountsStore = reactive({
    accounts: [],

    async load(restaurantId) {
        if (this.accounts.length > 0) return; // evita recargas

        const accounts = await accountService.getAccountsByRestaurant(restaurantId);

        this.accounts = accounts.map(account => ({
            ...account,
            tableNumber: account.table?.tableNumber || null,
            accountName: account.accountName || null,
        }));
    },

    async refresh(restaurantId) {
        const accounts = await accountService.getAccountsByRestaurant(restaurantId);
        this.accounts = accounts;
    }
});
