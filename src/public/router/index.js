import {createRouter, createWebHistory} from 'vue-router'
import LoginPage from "@/public/views/login-page.vue";
import SignupPage from "@/public/views/signup-page.vue";
import CasingPage from "@/admins/views/cassing-views/casing-page.vue";
import SavedAccountsPage from "@/admins/views/saved-accounts-views/saved-accounts-page.vue";
import SalesHistoryPage from "@/admins/views/sale-history-views/sales-history-page.vue";
import CasingMovementsPage from "@/admins/views/casing-movements-page.vue";
import ProductsComponent from "@/admins/views/products-views/products-page.vue";
import SalesReportComponent from "@/admins/views/sales-report-page.vue";
import InventoryComponent from "@/admins/views/inventory-page.vue";
import CreateNewWaiterComponent from "@/admins/views/profile-views/create-new-waiter-page.vue";
import ProfileComponent from "@/admins/views/profile-views/profile-component.vue";
import ProductConfigPage from "@/admins/views/products-views/product-config-page.vue";
import TablesPage from "@/admins/views/saved-accounts-views/tables-page.vue";

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: LoginPage,
    },
    {
        path: '/',
        name: 'DefaultLogin',
        component: LoginPage,
    },
    {
        path: '/signup',
        name: 'Signup',
        component: SignupPage,
    },

    //rutas dinamicas segun restaurante y rol del usuario
    {
        path: '/:restaurantName/:role/casing',
        name: 'Casing',
        component: CasingPage,
        props: true
    },
    {
        path: '/:restaurantName/:role/saved-accounts',
        name: 'SavedAccounts',
        component: SavedAccountsPage,
        props: true
    },
    {
        path: '/:restaurantName/:role/tables',
        name: 'Tables',
        component: TablesPage,
        props: true
    },
    {
        path: '/:restaurantName/:role/sales-history',
        name: 'SalesHistory',
        component: SalesHistoryPage,
        props: true
    },
    {
        path: '/:restaurantName/:role/casing-movements',
        name: 'CasingMovements',
        component: CasingMovementsPage,
        props: true
    },
    {
        path: '/:restaurantName/:role/products',
        name: 'Products',
        component: ProductsComponent,
        props: true
    },
    {
        path: '/:restaurantName/:role/new-product',
        name: 'NewProduct',
        component: ProductConfigPage,
        props: true
    },
    {
        path: '/:restaurantName/:role/product/:productId',
        name: 'EditProduct',
        component: ProductConfigPage,
        props: true
    },
    {
        path: '/:restaurantName/:role/sales-report',
        name: 'SalesReport',
        component: SalesReportComponent,
        props: true
    },
    {
        path: '/:restaurantName/:role/inventory',
        name: 'Inventory',
        component: InventoryComponent,
        props: true
    },
    {
        path: '/:restaurantName/:role/profile',
        name: 'Profile',
        component: ProfileComponent,
        props: true
    },
    {
        path: '/:restaurantName/:role/create-new-waiter',
        name: 'NewWaiter',
        component: CreateNewWaiterComponent,
        props: true
    }
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

// Guard de navegación para verificar el token
router.beforeEach((to, from, next) => {
    const publicPages = ['/login', '/signup'];
    const authRequired = !publicPages.includes(to.path);
    const token = localStorage.getItem('token');
  
    if (authRequired && !token) {
      // Si no tiene token y la ruta requiere autenticación, redirige al login
      return next('/login');
    }
  
    next();
  });

export default router