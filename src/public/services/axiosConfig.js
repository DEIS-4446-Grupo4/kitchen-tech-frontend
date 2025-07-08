// src/public/services/axiosConfig.js
import axios from "axios";

const API_URL = 'https://kitchen-tech-backend.onrender.com'; // URL base
//const API_URL = 'http://localhost:8081/api/kitchentech/v1'; // URL base

const axiosInstance = axios.create({
    baseURL: API_URL,
});

// Aquí puedes configurar interceptores si es necesario

export default axiosInstance;
