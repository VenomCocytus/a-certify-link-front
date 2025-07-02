import axios from 'axios';

// Base URL - update this to match your backend URL
const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api/v1';

// Create axios instance
const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Important for handling HTTP-only cookies
});

// Request interceptor to add an auth token
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

// Response interceptor to handle errors and token refresh
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh the token
                const response = await apiClient.post('/auth/refresh-token');
                const { accessToken } = response.data;

                localStorage.setItem('accessToken', accessToken);
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                return apiClient(originalRequest);
            } catch (refreshError) {
                // Refresh failed, redirect to the login page
                localStorage.removeItem('accessToken');
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

    register: (userData) =>
        apiClient.post('/auth/register', userData),

    getCurrentUser: () =>
        apiClient.get('/auth/profile'),

    updateProfile: (profileData) =>
        apiClient.put('/auth/profile', profileData),

    changePassword: (passwordData) =>
        apiClient.put('/auth/change-password', passwordData),

    refreshToken: () =>
        apiClient.post('/auth/refresh-token'),

    logout: (logoutData) =>
        apiClient.post('/auth/logout', logoutData),

    forgotPassword: (emailData) =>
        apiClient.post('/auth/forgot-password', emailData),

    resetPassword: (resetData) =>
        apiClient.post('/auth/reset-password', resetData),

    // ORASS/CertifyLink endpoints
    searchOrassPolicies: (searchParams) =>
        apiClient.get('/certify-link/policies/search', { params: searchParams }),

    createEditionRequest: (editionData) =>
        apiClient.post('/certify-link/certificates/production', editionData),

    getCertificateColors: () =>
        apiClient.get('/certify-link/certificate-colors'),

    getCertificates: (params = {}) =>
        apiClient.get('/certify-link/attestations', { params }),

    // **NEW**: Get certificate details by reference
    getCertificateDetails: (reference) =>
        apiClient.get(`/certificates/${reference}`),

    // **NEW**: Get related certificate details
    getRelatedCertificateDetails: (reference) =>
        apiClient.get(`/certificates/related/${reference}`),

    getCertificateTypes: () =>
        apiClient.get('/certificate-types'),

    downloadCertificateLinkFromDb: (reference) =>
        apiClient.post(`/certify-link/certificates/${reference}/download-link`, { responseType: 'blob' }),

    downloadCertificateExternal: (reference) =>
        apiClient.get(`/certify-link/certificates/${reference}/download`, { responseType: 'blob' }),

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
        apiClient.get('/certificates/statistic/used')
};