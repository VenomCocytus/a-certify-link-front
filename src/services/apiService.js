import axios from 'axios';

// Base URL - update this to match your backend
const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

// Create axios instance
const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Important for HTTP-only cookies
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token refresh and errors
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh the token
                const refreshResponse = await apiClient.post('/auth/refresh-token');
                const { accessToken } = refreshResponse.data;

                localStorage.setItem('accessToken', accessToken);
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                return apiClient(originalRequest);
            } catch (refreshError) {
                // Refresh failed, redirect to login
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export const apiService = {
    // Authentication endpoints
    login: (loginData) =>
        apiClient.post('/auth/login', loginData),

    register: (registerData) =>
        apiClient.post('/auth/register', registerData),

    getProfile: () =>
        apiClient.get('/auth/profile'),

    updateProfile: (profileData) =>
        apiClient.put('/auth/profile', profileData),

    changePassword: (passwordData) =>
        apiClient.post('/auth/change-password', passwordData),

    forgotPassword: (email) =>
        apiClient.post('/auth/forgot-password', { email }),

    resetPassword: (resetData) =>
        apiClient.post('/auth/reset-password', resetData),

    verifyEmail: (token, userId) =>
        apiClient.get(`/auth/verify-email/${userId}/${token}`),

    resendEmailVerification: (email) =>
        apiClient.post('/auth/resend-email-verification', { email }),

    setupTwoFactor: () =>
        apiClient.post('/auth/setup-two-factor'),

    enableTwoFactor: (code) =>
        apiClient.post('/auth/enable-two-factor', { code }),

    disableTwoFactor: (data) =>
        apiClient.post('/auth/disable-two-factor', data),

    refreshToken: () =>
        apiClient.post('/auth/refresh-token'),

    logout: (logoutAll = false) =>
        apiClient.post('/auth/logout', { logoutAll }),

    // Admin endpoints
    createUser: (userData) =>
        apiClient.post('/auth/create-user', userData),

    blockUser: (blockData) =>
        apiClient.post('/auth/block-user', blockData),

    healthCheck: () =>
        apiClient.get('/auth/health'),

    // Certificate endpoints (keeping the original eAttestation API structure)
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