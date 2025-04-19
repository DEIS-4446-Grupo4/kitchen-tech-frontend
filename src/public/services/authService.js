import axiosInstance from "./axiosConfig";

const API_URL = '/auth';

export default {
    async login(username, password) {
        try {
            const response = await axiosInstance.post(`${API_URL}/login`, { username, password });
            return { success: true, token: response.data.token, id: response.data.id, role: response.data.role, restaurantId: response.data.restaurantId};
        } catch (error) {
            return { success: false, message: 'Invalid username or password' };
        }
    },
    async signupRestaurant(userData) {
        try {
            const response = await axiosInstance.post(`${API_URL}/register-restaurant`, userData);
            return { success: true, message: response.data.message || 'User registered successfully' };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'An error occurred' };
        }
    },
    async signupStaff(userData) {
        try {
            const response = await axiosInstance.post(`${API_URL}/register-staff`, userData);
            return { success: true, message: response.data.message || 'User registered successfully' };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'An error occurred' };
        }
    },
};
