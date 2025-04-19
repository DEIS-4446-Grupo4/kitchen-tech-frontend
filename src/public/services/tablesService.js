import axiosInstance from "@/public/services/axiosConfig";

const API_URL = '/table';

const getAuthToken = () => {
    return localStorage.getItem('token');
}

export const tablesService = {
    async getTableById(tableId) {
        try {
            const token = getAuthToken();
            const response = await axiosInstance.get(`${API_URL}/${tableId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching table", error.response ? error.response.data : error.message);
            throw error;
        }

    },
    async getTablesByRestaurant(restaurantId) {
        try {
            const token = getAuthToken();
            const response = await axiosInstance.get(`${API_URL}/restaurant/${restaurantId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching accounts:', error.response ? error.response.data : error.message);
            throw error;
        }
    },
    async deleteTable(tableId) {
        try {
            const token = getAuthToken();
            const response = await axiosInstance.delete(`${API_URL}/${tableId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error deleting table:', error.response ? error.response.data : error.message);
            throw error;
        }
    },
    async addTable(table) {
        try {
            const token = getAuthToken();
            const response = await axiosInstance.post(`${API_URL}`, {
                tableNumber: table.tableNumber,
                tableCapacity: table.tableCapacity,
                tableGuests: table.tableGuests,
                tableStatus: table.tableStatus,
                restaurantId: table.restaurantId,
            },{
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.status === 201) {
                return response.data;
            } else {
                throw new Error('Error creating table');
            }
        } catch (error) {
            console.error('Error adding table:', error.response ? error.response.data : error.message);
            throw error;
        }
    },

    async updateTable(table) {
        try {
            const token = getAuthToken();
            const response = await axiosInstance.put(`${API_URL}/${table.id}`, {
                id: table.id,
                tableNumber: table.tableNumber,
                tableCapacity: table.tableCapacity,
                tableGuests: table.tableGuests,
                tableStatus: table.tableStatus,
                restaurantId: table.restaurantId,
            }, {
                headers: {
                    Authorization: `Bearer ${token}` // Incluye el token en el encabezado
                }
            });
            return response.data; // Retorna los datos de la respuesta
        } catch (error) {
            console.error('Error updating table:', error.response ? error.response.data : error.message);
            throw error; // Lanza el error para manejarlo en la llamada
        }
    },
}