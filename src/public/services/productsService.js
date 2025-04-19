import axiosInstance from "./axiosConfig"; // Asegúrate de que la ruta sea correcta

const API_URL = '/product';

const getAuthToken = () => {
    return localStorage.getItem('token'); // Obtiene el token del localStorage
};

export const productsService = {
    async getProductsByRestaurant(restaurantId) {
        try {
            const token = getAuthToken();
            const response = await axiosInstance.get(`${API_URL}/restaurant/${restaurantId}`, {
                headers: {
                    Authorization: `Bearer ${token}` // Incluye el token como Bearer en el encabezado
                }
            });
            return response.data; // Retorna los datos de los productos
        } catch (error) {
            console.error('Error fetching products:', error.response ? error.response.data : error.message);
            throw error; // Lanza el error para manejarlo en la llamada
        }
    },
    async deleteProduct(productId) {
        try {
            const token = getAuthToken();
            const response = await axiosInstance.delete(`${API_URL}/${productId}`, {
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
    async updateProduct(product) {
        try {
            const token = getAuthToken();
            const response = await axiosInstance.put(`${API_URL}/${product.id}`, {
                id: product.id,
                productName: product.productName,
                productPrice: product.productPrice,
                productImageUrl: product.productImageUrl,
                category: product.category,
                restaurantId: product.restaurantId,
                supplies:product.supplies
            }, {
                headers: {
                    Authorization: `Bearer ${token}` // Incluye el token en el encabezado
                }
            });
            return response.data; // Retorna los datos de la respuesta
        } catch (error) {
            console.error('Error updating product:', error.response ? error.response.data : error.message);
            throw error; // Lanza el error para manejarlo en la llamada
        }
    },
    async addProduct(product) {
        console.log("producto:",product);
        try {
            const token = getAuthToken();
            const response = await axiosInstance.post(`${API_URL}`, {
                productName: product.productName,
                productPrice: product.productPrice,
                productImageUrl: product.productImageUrl,
                category: product.category,
                restaurantId: product.restaurantId,
                supplies:product.supplies
            }, {
                headers: {
                    Authorization: `Bearer ${token}` // Incluye el token en el encabezado
                }
            });
            if (response.status === 201) {
                return response.data; // Retorna los datos del producto creado
            } else {
                throw new Error('Error creating product');
            }
        } catch (error) {
            console.error('Error in addProduct:', error.response ? error.response.data : error.message);
            throw error; // Lanza el error para manejarlo en la llamada
        }
    },
    async getProductById(productId) {
        try {
            const token = getAuthToken();
            const response = await axiosInstance.get(`${API_URL}/${productId}`, {
                headers: {
                    Authorization: `Bearer ${token}` // Incluye el token en el encabezado
                }
            });
            return response.data; // Retorna los datos del producto
        } catch (error) {
            console.error('Error fetching product by ID:', error.response ? error.response.data : error.message);
            throw error; // Lanza el error para manejarlo en la llamada
        }
    }
};
