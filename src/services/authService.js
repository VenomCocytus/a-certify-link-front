import { apiService } from './apiService';

export const authService = {
    async login(email, password, rememberMe = false, twoFactorCode = null) {
        try {
            const response = await apiService.login({
                email,
                password,
                rememberMe,
                twoFactorCode
            });

            return {
                success: true,
                accessToken: response.data.accessToken,
                user: response.data.user,
                expiresIn: response.data.expiresIn,
                tokenType: response.data.tokenType || 'Bearer'
            };
        } catch (error) {
            throw {
                success: false,
                message: error.response?.data?.message || error.message || 'Login failed'
            };
        }
    },

    async register(userData) {
        try {
            const response = await apiService.register(userData);
            return {
                success: true,
                accessToken: response.data.accessToken,
                user: response.data.user,
                expiresIn: response.data.expiresIn,
                tokenType: response.data.tokenType || 'Bearer'
            };
        } catch (error) {
            throw {
                success: false,
                message: error.response?.data?.message || error.message || 'Registration failed'
            };
        }
    },

    async getCurrentUser() {
        try {
            const response = await apiService.getCurrentUser();
            return response.data.user;
        } catch (error) {
            throw error;
        }
    },

    async updateProfile(profileData) {
        try {
            const response = await apiService.updateProfile(profileData);
            return response.data.user;
        } catch (error) {
            throw error;
        }
    },

    async changePassword(passwordData) {
        try {
            const response = await apiService.changePassword(passwordData);
            return { success: true, message: response.data.message };
        } catch (error) {
            throw {
                success: false,
                message: error.response?.data?.message || error.message || 'Password change failed'
            };
        }
    },

    async refreshToken() {
        try {
            const response = await apiService.refreshToken();
            return {
                success: true,
                accessToken: response.data.accessToken,
                expiresIn: response.data.expiresIn,
                tokenType: response.data.tokenType || 'Bearer'
            };
        } catch (error) {
            throw error;
        }
    },

    async logout(logoutAll = false) {
        try {
            await apiService.logout({ logoutAll });
            return { success: true };
        } catch (error) {
            // Even if logout fails on server, we should clear local storage
            return { success: false, message: error.message };
        }
    },

    async forgotPassword(email) {
        try {
            const response = await apiService.forgotPassword({ email });
            return { success: true, message: response.data.message };
        } catch (error) {
            throw {
                success: false,
                message: error.response?.data?.message || error.message || 'Password reset request failed'
            };
        }
    },

    async resetPassword(resetData) {
        try {
            const response = await apiService.resetPassword(resetData);
            return { success: true, message: response.data.message };
        } catch (error) {
            throw {
                success: false,
                message: error.response?.data?.message || error.message || 'Password reset failed'
            };
        }
    }
};