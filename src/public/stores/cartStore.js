import { reactive } from "vue";

const CART_KEY = "cartData";

export const cartStore = reactive({
    cart: [],
    load() {
        try {
            this.cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
        } catch (e) {
            this.cart = [];
        }
    },
    persist() {
        localStorage.setItem(CART_KEY, JSON.stringify(this.cart));
    },
    addProduct(product, qty = 1) {
        const existing = this.cart.find(i => String(i.id) === String(product.id));
        if (existing) {
            existing.quantity = Number(existing.quantity) + Number(qty);
        } else {
            this.cart.push({
                id: product.id,
                productName: product.productName,
                price: product.productPrice,
                quantity: Number(qty) || 1,
                showInputs: false
            });
        }
        this.persist();
    },
    removeProduct(productId) {
        this.cart = this.cart.filter(i => String(i.id) !== String(productId));
        this.persist();
    },
    updateItem(productId, patch) {
        const it = this.cart.find(i => String(i.id) === String(productId));
        if (!it) return;
        Object.assign(it, patch);
        this.persist();
    },
    clear() {
        this.cart = [];
        localStorage.removeItem(CART_KEY);
    },
    subtotal() {
        return this.cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    },
    igv() {
        const raw = this.subtotal();
        return raw * 0.18;
    },
    total() {
        return this.subtotal();
    }
});
