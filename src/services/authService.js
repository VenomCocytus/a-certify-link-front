import { apiService } from './apiService';
import { isValidTwoFactorCode } from '../utils/validation';

export const authService = {
    async login(email, password, rememberMe = false, twoFactorCode) {
        try {
            const loginPayload = {
                email,
                password,
                rememberMe
            };

            // Only include twoFactorCode if it's provided, valid, and properly formatted
            if (twoFactorCode && typeof twoFactorCode === 'string') {
                const trimmedCode = twoFactorCode.trim();
                if (trimmedCode && isValidTwoFactorCode(trimmedCode)) {
                    loginPayload.twoFactorCode = trimmedCode;
                } else if (trimmedCode) {
                    // If 2FA code is provided but invalid, throw validation error
                    throw new Error('Two-factor code must be 6 digits');
                }
            }

            const response = await apiService.login(loginPayload);

            // Add comprehensive response logging for debugging
            console.log('Login full response:', {
                status: response?.status,
                statusText: response?.statusText,
                data: response?.data,
                headers: response?.headers
            });

            // Validate response exists and is an object
            if (!response || typeof response !== 'object') {
                console.error('Login response is null/undefined or not an object:', response);
                throw new Error('Invalid response: response is not an object');
            }

            // Validate response.data exists and is an object
            if (!response.data || typeof response.data !== 'object') {
                console.error('Login response.data is invalid:', response.data);
                throw new Error('Invalid response: missing or invalid data object');
            }

            // Validate the nested data structure (backend wraps response in data object)
            if (!response.data.data || typeof response.data.data !== 'object') {
                console.error('Login response.data.data is invalid:', {
                    hasNestedData: !!response.data.data,
                    nestedDataType: typeof response.data.data,
                    nestedDataValue: response.data.data,
                    fullResponseData: response.data
                });
                throw new Error('Invalid response: missing or invalid nested data object');
            }

            // Validate tokens exist and is an object (tokens are in nested data)
            if (!response.data.data.tokens || typeof response.data.data.tokens !== 'object') {
                console.error('Login response.data.data.tokens is invalid:', {
                    hasTokens: !!response.data.data.tokens,
                    tokensType: typeof response.data.data.tokens,
                    tokensValue: response.data.data.tokens,
                    fullNestedData: response.data.data
                });
                throw new Error('Invalid response: missing or invalid tokens object');
            }

            const { tokens, user } = response.data.data;

            // Validate accessToken specifically
            if (!tokens.accessToken || typeof tokens.accessToken !== 'string') {
                console.error('Login accessToken is invalid:', {
                    hasAccessToken: !!tokens.accessToken,
                    accessTokenType: typeof tokens.accessToken,
                    accessTokenValue: tokens.accessToken,
                    allTokens: tokens
                });
                throw new Error('Invalid response: missing or invalid access token');
            }

            return {
                success: true,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                user: user,
                expiresIn: tokens.expiresIn,
                tokenType: tokens.tokenType || 'Bearer'
            };
        } catch (error) {
            // Enhanced error logging for debugging
            console.error('Login error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });

            throw {
                success: false,
                message: error.response?.data?.message || error.message || 'Login failed'
            };
        }
    },

    async register(userData) {
        try {
            const response = await apiService.register(userData);
            
            // Add comprehensive response logging for debugging
            console.log('Register full response:', {
                status: response?.status,
                statusText: response?.statusText,
                data: response?.data,
                headers: response?.headers
            });

            // Validate response exists and is an object
            if (!response || typeof response !== 'object') {
                console.error('Register response is null/undefined or not an object:', response);
                throw new Error('Invalid response: response is not an object');
            }

            // Validate response.data exists and is an object
            if (!response.data || typeof response.data !== 'object') {
                console.error('Register response.data is invalid:', response.data);
                throw new Error('Invalid response: missing or invalid data object');
            }

            // Validate the nested data structure (backend wraps response in data object)
            if (!response.data.data || typeof response.data.data !== 'object') {
                console.error('Register response.data.data is invalid:', {
                    hasNestedData: !!response.data.data,
                    nestedDataType: typeof response.data.data,
                    nestedDataValue: response.data.data,
                    fullResponseData: response.data
                });
                throw new Error('Invalid response: missing or invalid nested data object');
            }

            // Validate tokens exist and is an object (tokens are in nested data)
            if (!response.data.data.tokens || typeof response.data.data.tokens !== 'object') {
                console.error('Register response.data.data.tokens is invalid:', {
                    hasTokens: !!response.data.data.tokens,
                    tokensType: typeof response.data.data.tokens,
                    tokensValue: response.data.data.tokens,
                    fullNestedData: response.data.data
                });
                throw new Error('Invalid response: missing or invalid tokens object');
            }

            const { tokens, user } = response.data.data;

            // Validate accessToken specifically
            if (!tokens.accessToken || typeof tokens.accessToken !== 'string') {
                console.error('Register accessToken is invalid:', {
                    hasAccessToken: !!tokens.accessToken,
                    accessTokenType: typeof tokens.accessToken,
                    accessTokenValue: tokens.accessToken,
                    allTokens: tokens
                });
                throw new Error('Invalid response: missing or invalid access token');
            }

            return {
                success: true,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                user: user,
                expiresIn: tokens.expiresIn,
                tokenType: tokens.tokenType || 'Bearer'
            };
        } catch (error) {
            // Enhanced error logging for debugging
            console.error('Register error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });

            throw {
                success: false,
                message: error.response?.data?.message || error.message || 'Registration failed'
            };
        }
    },

    async getCurrentUser() {
        try {
            const response = await apiService.getCurrentUser();
            
            // Add response structure logging for debugging
            console.log('getCurrentUser response structure:', response.data);

            // Validate response structure before accessing nested properties
            if (!response.data) {
                throw new Error('Invalid response: missing data');
            }

            if (!response.data.user) {
                throw new Error('Invalid response: missing user data');
            }

            return response.data.user;
        } catch (error) {
            // Enhanced error logging for debugging
            console.error('getCurrentUser error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });

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
            
            // Add comprehensive response logging for debugging
            console.log('RefreshToken full response:', {
                status: response?.status,
                statusText: response?.statusText,
                data: response?.data,
                headers: response?.headers
            });

            // Validate response exists and is an object
            if (!response || typeof response !== 'object') {
                console.error('RefreshToken response is null/undefined or not an object:', response);
                throw new Error('Invalid response: response is not an object');
            }

            // Validate response.data exists and is an object
            if (!response.data || typeof response.data !== 'object') {
                console.error('RefreshToken response.data is invalid:', response.data);
                throw new Error('Invalid response: missing or invalid data object');
            }

            // Validate tokens exist and is an object
            if (!response.data.tokens || typeof response.data.tokens !== 'object') {
                console.error('RefreshToken response.data.tokens is invalid:', {
                    hasTokens: !!response.data.tokens,
                    tokensType: typeof response.data.tokens,
                    tokensValue: response.data.tokens,
                    fullData: response.data
                });
                throw new Error('Invalid response: missing or invalid tokens object');
            }

            const { tokens } = response.data;

            // Validate accessToken specifically
            if (!tokens.accessToken || typeof tokens.accessToken !== 'string') {
                console.error('RefreshToken accessToken is invalid:', {
                    hasAccessToken: !!tokens.accessToken,
                    accessTokenType: typeof tokens.accessToken,
                    accessTokenValue: tokens.accessToken,
                    allTokens: tokens
                });
                throw new Error('Invalid response: missing or invalid access token');
            }

            return {
                success: true,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                expiresIn: tokens.expiresIn,
                tokenType: tokens.tokenType || 'Bearer'
            };
        } catch (error) {
            // Enhanced error logging for debugging
            console.error('RefreshToken error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });

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

    async resetPassword(token, newPassword, confirmPassword) {
        try {
            const response = await apiService.resetPassword({
                token,
                newPassword,
                confirmPassword
            });
            return { success: true, message: response.data.message };
        } catch (error) {
            throw {
                success: false,
                message: error.response?.data?.message || error.message || 'Password reset failed'
            };
        }
    }
};