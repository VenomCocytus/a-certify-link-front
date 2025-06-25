import { apiService } from './apiService';

export const authService = {
    async login(email, password, clientName = 'eAttestation Frontend') {
        try {
            const response = await apiService.login(email, password, clientName);
            return {
                success: true,
                token: response.data.token || 'mock-token', // Handle case where API doesn't return token structure
                user: response.data.user || { email }
            };
        } catch (error) {
            throw {
                success: false,
                message: error.response?.data?.message || error.message || 'Login failed'
            };
        }
    },

    async getCurrentUser() {
        try {
            const response = await apiService.getCurrentUser();
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async logout() {
        try {
            await apiService.logout();
            return { success: true };
        } catch (error) {
            // Even if logout fails on server, we should clear local storage
            return { success: false, message: error.message };
        }
    }
};