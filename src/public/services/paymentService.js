import axiosInstance from "@/public/services/axiosConfig";

const API_URL = '/sale';

const getAuthToken = () => {
    return localStorage.getItem("token");
}

export const paymentService = {
    async createSale(payment){
        try{
            const token = getAuthToken();
            const response = await axiosInstance.post(`${API_URL}`,
                {
                    restaurantId: payment.restaurantId,
                    documentType: payment.documentType,
                    amount: payment.amount,
                    clientId: payment.clientId,
                    paymentType: payment.paymentType
                }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log(response);
            if (response.status === 201){
                return response.data;
            } else {
                throw new Error('Error creating sale');
            }
        } catch (error) {
            console.error('Error in createSale:', error.response ? error.response.data : error.message);
            throw error;
        }

    },

    async getPaymentsByRestaurantService(restaurantId) {
        try {
            const token = getAuthToken();
            const response = await axiosInstance.get(`${API_URL}/restaurant/${restaurantId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.status === 200) {
                return response.data;
            } else {
                throw new Error('Error fetching payments');
            }
        } catch (error) {
            console.error('Error in getPaymentsByRestaurantService:', error.response ? error.response.data : error.message);
            throw error;
        }
    },

    async cancelSale(saleId){
        try {
            const token = getAuthToken();
            const response = await axiosInstance.put(`${API_URL}/${saleId}/cancel`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.status === 200) {
                return response.data;
            } else {
                throw new Error('Error cancelling sale');
            }
        } catch (error) {
            console.error("Error cancelling sale:", error);
            throw error;
        }
    }
}