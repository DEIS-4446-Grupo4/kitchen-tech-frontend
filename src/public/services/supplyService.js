import axiosInstance from "./axiosConfig"; // Asegúrate de que la ruta sea correcta

const API_URL = '/supply';

const getAuthToken = () => {
    return localStorage.getItem('token'); // Obtiene el token del localStorage
};

export const supplyService = {
    async getSuppliesByRestaurant(restaurantId) {
        try {
            const token = getAuthToken();
            const response = await axiosInstance.get(`${API_URL}/restaurant/${restaurantId}`, {
                headers: {
                    Authorization: `Bearer ${token}` // Incluye el token como Bearer en el encabezado
                }
            });
            return response.data; // Retorna la lista de insumos
        } catch (error) {
            console.error('Error fetching supplies:', error.response ? error.response.data : error.message);
            throw error; // Lanza el error para manejarlo en la llamada
        }
    },
    async getSupplyById(supplyId) {
        try {
            const token = getAuthToken();
            const response = await axiosInstance.get(`${API_URL}/${supplyId}`, {
                headers: {
                    Authorization: `Bearer ${token}` // Incluye el token como Bearer en el encabezado
                }
            });
            return response.data; // Retorna los datos del insumo
        } catch (error) {
            console.error('Error fetching supply by ID:', error.response ? error.response.data : error.message);
            throw error; // Lanza el error para manejarlo en la llamada
        }
    },
    async addSupply(supply) {
        try {
            const token = getAuthToken();
            const response = await axiosInstance.post(`${API_URL}`, {
                supplyName: supply.supplyName,
                supplyCategory: supply.supplyCategory,
                metricUnit: supply.metricUnit,
                currentlyOnStock: supply.currentlyOnStock,
                costPerUnit: supply.costPerUnit,
                stateOfSupply: supply.stateOfSupply,
                restaurantId: supply.restaurantId
            }, {
                headers: {
                    Authorization: `Bearer ${token}` // Incluye el token en el encabezado
                }
            });
            if (response.status === 201) {
                console.log(response.data);
                return response.data; // Retorna los datos del insumo creado
            } else {
                throw new Error('Error creating supply');
            }
        } catch (error) {
            console.error('Error in addSupply:', error.response ? error.response.data : error.message);
            throw error; // Lanza el error para manejarlo en la llamada
        }
    },
    async updateSupply(supplyId, supply) {
        try {
            const token = getAuthToken();
            const response = await axiosInstance.put(`${API_URL}/${supplyId}`, {
                id: supply.id,
                supplyName: supply.supplyName,
                supplyCategory: supply.supplyCategory,
                metricUnit: supply.metricUnit,
                currentlyOnStock: supply.currentlyOnStock,
                costPerUnit: supply.costPerUnit,
                stateOfSupply: supply.stateOfSupply,
                restaurantId: supply.restaurantId
            }, {
                headers: {
                    Authorization: `Bearer ${token}` // Incluye el token en el encabezado
                }
            });
            return response.data; // Retorna los datos del insumo actualizado
        } catch (error) {
            console.error('Error updating supply:', error.response ? error.response.data : error.message);
            throw error; // Lanza el error para manejarlo en la llamada
        }
    },
    async deleteSupply(supplyId) {
        try {
            const token = getAuthToken();
            const response = await axiosInstance.delete(`${API_URL}/${supplyId}`, {
                headers: {
                    Authorization: `Bearer ${token}` // Incluye el token en el encabezado
                }
            });
            return response.data; // Retorna los datos de la respuesta de eliminación
        } catch (error) {
            console.error('Error deleting supply:', error.response ? error.response.data : error.message);
            throw error; // Lanza el error para manejarlo en la llamada
        }
    }
};
