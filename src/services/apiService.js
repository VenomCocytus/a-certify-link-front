import axios from 'axios';
import tokenManager from '../utils/tokenManager';

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

// Request interceptor to add valid auth token
apiClient.interceptors.request.use(
    async (config) => {
        try {
            // Skip token attachment for auth endpoints that don't need it
            const isAuthEndpoint = config.url?.includes('/auth/login') || 
                                 config.url?.includes('/auth/register') || 
                                 config.url?.includes('/auth/refresh-token') ||
                                 config.url?.includes('/auth/forgot-password') ||
                                 config.url?.includes('/auth/reset-password');
            
            if (!isAuthEndpoint) {
                // Get valid token (will refresh if needed)
                const validToken = await tokenManager.getValidAccessToken();
                if (validToken) {
                    config.headers.Authorization = `Bearer ${validToken}`;
                }
            }
        } catch (error) {
            console.warn('ApiService: Failed to get valid token for request:', error);
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
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 errors with token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            console.log('ApiService: 401 detected, attempting token refresh');

            try {
                // Use token manager to refresh tokens
                const newTokens = await tokenManager.refreshToken();
                
                console.log('ApiService: Token refresh successful, retrying request');
                
                // Update authorization header for retry
                originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
                
                // Retry the original request
                return apiClient(originalRequest);
            } catch (refreshError) {
                console.error('ApiService: Token refresh failed:', {
                    message: refreshError.message,
                    response: refreshError.response?.data,
                    status: refreshError.response?.status
                });

                // Tokens are already cleared by tokenManager
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