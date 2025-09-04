import axios from 'axios';

// Base URL - update this to match your backend URL
const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002/api/v1';

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
            
            console.log('ApiService: 401 detected, attempting token refresh');

            try {
                // Try to refresh the token
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    console.warn('ApiService: No refresh token available');
                    throw new Error('No refresh token available');
                }
                
                console.log('ApiService: Calling refresh token endpoint');
                const response = await apiClient.post('/auth/refresh-token', {
                    refreshToken
                });
                
                console.log('ApiService: Refresh token response:', response.data);

                // Validate response structure
                if (!response.data || !response.data.tokens) {
                    throw new Error('Invalid refresh response: missing tokens');
                }

                const { accessToken, refreshToken: newRefreshToken } = response.data.tokens;

                if (!accessToken) {
                    throw new Error('Invalid refresh response: missing access token');
                }

                console.log('ApiService: Token refresh successful, updating storage');
                localStorage.setItem('accessToken', accessToken);
                if (newRefreshToken) {
                    localStorage.setItem('refreshToken', newRefreshToken);
                }
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                console.log('ApiService: Retrying original request');
                return apiClient(originalRequest);
            } catch (refreshError) {
                console.error('ApiService: Token refresh failed:', {
                    message: refreshError.message,
                    response: refreshError.response?.data,
                    status: refreshError.response?.status
                });

                // Refresh failed, clear tokens and redirect
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                
                // Only redirect if not already on login page to prevent infinite loops
                if (!window.location.pathname.includes('/login')) {
                    console.log('ApiService: Redirecting to login page');
                    window.location.href = '/login';
                }
                
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
        apiClient.patch('/auth/profile', profileData),

    changePassword: (passwordData) =>
        apiClient.post('/auth/change-password', passwordData),

    refreshToken: () => {
        const refreshToken = localStorage.getItem('refreshToken');
        return apiClient.post('/auth/refresh-token', { refreshToken });
    },

    logout: (logoutData) =>
        apiClient.post('/auth/logout', logoutData),

    forgotPassword: (emailData) =>
        apiClient.post('/auth/forgot-password', emailData),

    resetPassword: (resetData) =>
        apiClient.post('/auth/reset-password', resetData),

    searchOrassPolicies: (searchParams) =>
        apiClient.get('/certify-link/policies/search', { params: searchParams }),

    createEditionRequest: (editionData) =>
        apiClient.post('/certify-link/edition-requests/production', editionData),

    getCertificates: (params = {}) =>
        apiClient.get('/certify-link/edition-requests', { params }),

    getCertificateTypes: () =>
        apiClient.get('/asaci/certificate-types'),

    downloadCertificateLinkFromDb: (reference) =>
        apiClient.get(`/certify-link/edition-requests/${reference}/download-link`),

    downloadCertificateExternal: (reference) =>
        apiClient.post(`/certify-link/edition-requests/${reference}/download`, { responseType: 'blob' }),

    cancelCertificate: (reference, reason) =>
        apiClient.post(`/asaci/edition-requests/${reference}/cancel`, { reason }),

    suspendCertificate: (reference, reason) =>
        apiClient.post(`/asaci/edition-requests/${reference}/suspend`, { reason }),

    // Statistics endpoints
    getCertificateStats: () =>
        apiClient.get('/asaci/statistics/edition-requests/usage'),

    getAvailableStats: () =>
        apiClient.get('/asaci/statistics/edition-requests/available'),

    getUsedStats: () =>
        apiClient.get('/asaci/statistics/edition-requests/used')
};