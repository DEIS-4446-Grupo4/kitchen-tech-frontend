import axiosInstance from './axiosConfig'; // Asegúrate de que la ruta sea correcta

const API_URL_RESTAURANT = '/restaurant';
const API_URL_STAFF = '/staff-user'

const getAuthToken = () => {
    return localStorage.getItem('token'); // Obtiene el token del localStorage
};

const getRestaurantById = async (restaurantId) => {
    try {
        const token = getAuthToken();
        const response = await axiosInstance.get(`${API_URL_RESTAURANT}/${restaurantId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching user:", error.response ? error.response.data : error.message);
        throw error;
    }
};

const getStaffUserById = async (staffId) => {
    try {
        const token = getAuthToken();
        const response = await axiosInstance.get(`${API_URL_STAFF}/${staffId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching staff user:", error.response ? error.response.data : error.message);
        throw error;
    }
}

const updateRestaurantById = async (restaurantId, updatedDetails) => {
    try {
        const token = getAuthToken();
        const response = await axiosInstance.put(`${API_URL_RESTAURANT}/${restaurantId}`, updatedDetails, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error updating user:", error.response ? error.response.data : error.message);
        throw error;
    }
};

export default {
    getRestaurantById,
    getStaffUserById,
    updateRestaurantById
};
