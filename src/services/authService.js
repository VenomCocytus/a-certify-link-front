import { apiService } from './apiService';

export const authService = {
    /**
     * Login user with email and password
     */
    async login(email, password, rememberMe = false, twoFactorCode = null) {
        try {
            const loginData = {
                email,
                password,
                rememberMe,
                ...(twoFactorCode && { twoFactorCode })
            };

            const response = await apiService.login(loginData);

            // Store access token in localStorage
            if (response.data.accessToken) {
                localStorage.setItem('accessToken', response.data.accessToken);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }

            return {
                success: true,
                user: response.data.user,
                accessToken: response.data.accessToken,
                expiresIn: response.data.expiresIn,
                tokenType: response.data.tokenType,
                message: response.data.message
            };
        } catch (error) {
            throw {
                success: false,
                message: error.response?.data?.detail || error.response?.data?.message || 'Login failed',
                errors: error.response?.data?.errors || []
            };
        }
    },

    /**
     * Register new user
     */
    async register(userData) {
        try {
            const response = await apiService.register(userData);

            // Store access token in localStorage
            if (response.data.accessToken) {
                localStorage.setItem('accessToken', response.data.accessToken);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }

            return {
                success: true,
                user: response.data.user,
                accessToken: response.data.accessToken,
                expiresIn: response.data.expiresIn,
                tokenType: response.data.tokenType,
                message: response.data.message
            };
        } catch (error) {
            throw {
                success: false,
                message: error.response?.data?.detail || error.response?.data?.message || 'Registration failed',
                errors: error.response?.data?.errors || []
            };
        }
    },

    /**
     * Get current user profile
     */
    async getCurrentUser() {
        try {
            const response = await apiService.getProfile();
            return response.data.user;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Update user profile
     */
    async updateProfile(profileData) {
        try {
            const response = await apiService.updateProfile(profileData);

            // Update stored user data
            if (response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }

            return {
                success: true,
                user: response.data.user,
                message: response.data.message
            };
        } catch (error) {
            throw {
                success: false,
                message: error.response?.data?.detail || error.response?.data?.message || 'Profile update failed',
                errors: error.response?.data?.errors || []
            };
        }
    },

    /**
     * Change password
     */
    async changePassword(passwordData) {
        try {
            const response = await apiService.changePassword(passwordData);
            return {
                success: true,
                message: response.data.message
            };
        } catch (error) {
            throw {
                success: false,
                message: error.response?.data?.detail || error.response?.data?.message || 'Password change failed',
                errors: error.response?.data?.errors || []
            };
        }
    },

    /**
     * Forgot password
     */
    async forgotPassword(email) {
        try {
            const response = await apiService.forgotPassword(email);
            return {
                success: true,
                message: response.data.message || 'Password reset instructions sent to your email'
            };
        } catch (error) {
            throw {
                success: false,
                message: error.response?.data?.detail || error.response?.data?.message || 'Failed to send reset instructions',
                errors: error.response?.data?.errors || []
            };
        }
    },

    /**
     * Reset password
     */
    async resetPassword(resetData) {
        try {
            const response = await apiService.resetPassword(resetData);
            return {
                success: true,
                message: response.data.message || 'Password reset successfully'
            };
        } catch (error) {
            throw {
                success: false,
                message: error.response?.data?.detail || error.response?.data?.message || 'Password reset failed',
                errors: error.response?.data?.errors || []
            };
        }
    },

    /**
     * Verify email
     */
    async verifyEmail(token, userId) {
        try {
            const response = await apiService.verifyEmail(token, userId);
            return {
                success: true,
                message: response.data.message || 'Email verified successfully'
            };
        } catch (error) {
            throw {
                success: false,
                message: error.response?.data?.detail || error.response?.data?.message || 'Email verification failed',
                errors: error.response?.data?.errors || []
            };
        }
    },

    /**
     * Resend email verification
     */
    async resendEmailVerification(email) {
        try {
            const response = await apiService.resendEmailVerification(email);
            return {
                success: true,
                message: response.data.message || 'Verification email sent'
            };
        } catch (error) {
            throw {
                success: false,
                message: error.response?.data?.detail || error.response?.data?.message || 'Failed to send verification email',
                errors: error.response?.data?.errors || []
            };
        }
    },

    /**
     * Setup two-factor authentication
     */
    async setupTwoFactor() {
        try {
            const response = await apiService.setupTwoFactor();
            return {
                success: true,
                qrCode: response.data.qrCode,
                secret: response.data.secret,
                message: response.data.message
            };
        } catch (error) {
            throw {
                success: false,
                message: error.response?.data?.detail || error.response?.data?.message || 'Failed to setup two-factor authentication',
                errors: error.response?.data?.errors || []
            };
        }
    },

    /**
     * Enable two-factor authentication
     */
    async enableTwoFactor(code) {
        try {
            const response = await apiService.enableTwoFactor(code);
            return {
                success: true,
                message: response.data.message || 'Two-factor authentication enabled'
            };
        } catch (error) {
            throw {
                success: false,
                message: error.response?.data?.detail || error.response?.data?.message || 'Failed to enable two-factor authentication',
                errors: error.response?.data?.errors || []
            };
        }
    },

    /**
     * Disable two-factor authentication
     */
    async disableTwoFactor(password, code) {
        try {
            const response = await apiService.disableTwoFactor({ password, code });
            return {
                success: true,
                message: response.data.message || 'Two-factor authentication disabled'
            };
        } catch (error) {
            throw {
                success: false,
                message: error.response?.data?.detail || error.response?.data?.message || 'Failed to disable two-factor authentication',
                errors: error.response?.data?.errors || []
            };
        }
    },

    /**
     * Refresh access token
     */
    async refreshToken() {
        try {
            const response = await apiService.refreshToken();

            // Update stored access token
            if (response.data.accessToken) {
                localStorage.setItem('accessToken', response.data.accessToken);
            }

            return {
                success: true,
                accessToken: response.data.accessToken,
                expiresIn: response.data.expiresIn,
                tokenType: response.data.tokenType
            };
        } catch (error) {
            // If refresh fails, clear local storage and redirect to login
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            throw {
                success: false,
                message: 'Session expired. Please login again.',
                shouldRedirect: true
            };
        }
    },

    /**
     * Logout user
     */
    async logout(logoutAll = false) {
        try {
            await apiService.logout(logoutAll);

            // Clear local storage
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');

            return {
                success: true,
                message: 'Logged out successfully'
            };
        } catch (error) {
            // Even if logout fails on server, we should clear local storage
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');

            return {
                success: false,
                message: error.response?.data?.message || 'Logout completed with errors'
            };
        }
    },

    /**
     * Create user (admin only)
     */
    async createUser(userData) {
        try {
            const response = await apiService.createUser(userData);
            return {
                success: true,
                user: response.data.user,
                message: response.data.message
            };
        } catch (error) {
            throw {
                success: false,
                message: error.response?.data?.detail || error.response?.data?.message || 'Failed to create user',
                errors: error.response?.data?.errors || []
            };
        }
    },

    /**
     * Block user (admin only)
     */
    async blockUser(blockData) {
        try {
            const response = await apiService.blockUser(blockData);
            return {
                success: true,
                message: response.data.message
            };
        } catch (error) {
            throw {
                success: false,
                message: error.response?.data?.detail || error.response?.data?.message || 'Failed to block user',
                errors: error.response?.data?.errors || []
            };
        }
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        const token = localStorage.getItem('accessToken');
        const user = localStorage.getItem('user');
        return !!(token && user);
    },

    /**
     * Get stored user data
     */
    getStoredUser() {
        try {
            const user = localStorage.getItem('user');
            return user ? JSON.parse(user) : null;
        } catch (error) {
            return null;
        }
    },

    /**
     * Get stored access token
     */
    getStoredToken() {
        return localStorage.getItem('accessToken');
    },

    /**
     * Clear all stored auth data
     */
    clearAuthData() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
    }
};