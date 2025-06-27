import axios from 'axios';

// Base URL from the API documentation
const BASE_URL = 'https://ppcoreeatci.asacitech.com/api/v1';

// Create axios instance
const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('authToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const apiService = {
    // Authentication endpoints
    login: (email, password, clientName) =>
        apiClient.post('/auth/tokens', { email, password, client_name: clientName }),

    getCurrentUser: () =>
        apiClient.get('/auth/user'),

    logout: () =>
        apiClient.delete('/auth/tokens'),

    // Certificate endpoints
    getCertificates: (params = {}) =>
        apiClient.get('/certificates', { params }),

    getCertificate: (reference) =>
        apiClient.get(`/certificates/${reference}`),

    getCertificateTypes: () =>
        apiClient.get('/certificate-types'),

    getCertificateVariants: () =>
        apiClient.get('/certificate-variants'),

    downloadCertificate: (reference) =>
        apiClient.get(`/certificates/${reference}/download`, { responseType: 'blob' }),

    cancelCertificate: (reference, reason) =>
        apiClient.post(`/certificates/${reference}/cancel`, { reason }),

    suspendCertificate: (reference, reason) =>
        apiClient.post(`/certificates/${reference}/suspend`, { reason }),

    // Statistics endpoints
    getCertificateStats: () =>
        apiClient.get('/certificates/statistics/usage'),

    getAvailableStats: () =>
        apiClient.get('/certificates/statistic/available'),

    getUsedStats: () =>
        apiClient.get('/certificates/statistic/used'),

    // Orders endpoints
    getOrders: (params = {}) =>
        apiClient.get('/orders', { params }),

    getOrder: (reference) =>
        apiClient.get(`/orders/${reference}`),

    createOrder: (orderData) =>
        apiClient.post('/orders', orderData),

    updateOrder: (reference, orderData) =>
        apiClient.put(`/orders/${reference}`, orderData),

    approveOrder: (reference) =>
        apiClient.post(`/orders/${reference}/approve`),

    rejectOrder: (reference, reason) =>
        apiClient.post(`/orders/${reference}/reject`, { reason }),

    cancelOrder: (reference, reason) =>
        apiClient.post(`/orders/${reference}/cancel`, { reason }),

    // Organizations endpoints
    getOrganizations: () =>
        apiClient.get('/organizations'),

    getOrganization: (id) =>
        apiClient.get(`/organizations/${id}`),

    // Productions/Editions endpoints
    getProductions: (params = {}) =>
        apiClient.get('/productions', { params }),

    createProduction: (productionData) =>
        apiClient.post('/productions', productionData),

    downloadProduction: (reference) =>
        apiClient.get(`/productions/${reference}/download`, { responseType: 'blob' }),

    // Dashboard statistics
    getDashboardUsers: () =>
        apiClient.get('/dashboard/users'),

    getDashboardOrders: () =>
        apiClient.get('/dashboard/orders'),

    getDashboardCertificates: () =>
        apiClient.get('/dashboard/certificates'),

    getDashboardOffices: () =>
        apiClient.get('/dashboard/offices'),

    getDashboardOrganizations: () =>
        apiClient.get('/dashboard/organizations'),

    getDashboardTransactions: () =>
        apiClient.get('/dashboard/transactions'),
};