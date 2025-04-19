import axiosInstance from "./axiosConfig";

const API_URL = '/account';

const getAuthToken = () => {
    return localStorage.getItem('token'); // Obtiene el token del localStorage
};

export const accountService = {
    async getAccountById(accountId) {
        try {
            const token = getAuthToken();
            const response = await axiosInstance.get(`${API_URL}/${accountId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            return response.data;
        } catch (error) {
            console.error("Error fetching account", error.response ? error.response.data : error.message);
            throw error;
        }
    },
    async getAccountsByRestaurant(restaurantId) {
        try {
            const token = getAuthToken();
            const response = await axiosInstance.get(`${API_URL}/restaurant/${restaurantId}`, {
                headers: {
                    Authorization: `Bearer ${token}` // Incluye el token como Bearer en el encabezado
                }
            });
            return response.data;
        }catch (error) {
            console.error('Error fetching accounts:', error.response ? error.response.data : error.message);
        }
    },
    async addAccount(account) {
        try {
            const token = getAuthToken();
            // Verifica si clientId existe, de lo contrario asigna null
            const payload = {
                accountName: account.accountName,
                client: account.clientId || null,
                table: account.table || null,
                restaurantId: account.restaurantId,
                state: account.state,
                totalAccount: account.totalAccount,
                dateCreated: new Date().toISOString(),
                dateLog: new Date().toISOString(),
                products: account.products || []  // Lista de productos que puede estar vacía o con valores
            };

            const response = await axiosInstance.post(`${API_URL}`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error adding account:', error.response ? error.response.data : error.message);
        }
    },
    async addAccountProduct(accountProduct) {
        try {
            const token = getAuthToken();
            const response = await axiosInstance.post(`${API_URL}/${accountProduct.accountId}/products`,
                {
                    productId: accountProduct.productId,
                    quantity: accountProduct.quantity
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                });
            return response.data;
        } catch (error) {
            console.error('Error adding products to account:', error.response ? error.response.data : error.message);
            throw error;
        }
    },
    async updateAccount(accountData) {
        try {
            const token = getAuthToken();
            const response = await axiosInstance.put(`${API_URL}/${accountData.id}`, accountData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error updating account:', error.response ? error.response.data : error.message);
            throw error;
        }
    },
    async updateAccountProduct(accountId, productId, quantity) {
        try {
            const token = getAuthToken();
            const response = await axiosInstance.put(`${API_URL}/${accountId}/product/${productId}`,
                { quantity },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error updating account product:', error.response ? error.response.data : error.message);
            throw error;
        }
    },
    async deleteAccount(accountId) {
        try {
            const token = getAuthToken();
            const response = await axiosInstance.delete(`${API_URL}/${accountId}`, {
                headers: {
                    Authorization: `Bearer ${token}` // Incluye el token como Bearer en el encabezado
                }
            });
            return response.data; // Retorna los datos de la respuesta
        } catch (error) {
            console.error('Error deleting product:', error.response ? error.response.data : error.message);
            throw error; // Lanza el error para manejarlo en la llamada
        }
    },
    async deleteAccountProduct(accountId, productId) {
        try {
            const token = getAuthToken();
            const response = await axiosInstance.delete(`${API_URL}/${accountId}/product/${productId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error deleting account product:', error.response ? error.response.data : error.message);
            throw error;
        }
    },
}