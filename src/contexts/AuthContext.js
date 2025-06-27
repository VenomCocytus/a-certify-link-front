import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already authenticated on app load
        const token = authService.getStoredToken();
        const storedUser = authService.getStoredUser();

        if (token && storedUser) {
            setIsAuthenticated(true);
            setUser(storedUser);
            // Verify token is still valid by fetching user data
            fetchUserData();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUserData = async () => {
        try {
            const userData = await authService.getCurrentUser();
            setUser(userData);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Error fetching user data:', error);
            // If token is invalid, log out
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password, rememberMe = false, twoFactorCode = null) => {
        try {
            const response = await authService.login(email, password, rememberMe, twoFactorCode);
            if (response.success) {
                setIsAuthenticated(true);
                setUser(response.user);
                return { success: true, message: response.message };
            }
            return { success: false, message: response.message };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Login failed',
                errors: error.errors || []
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await authService.register(userData);
            if (response.success) {
                setIsAuthenticated(true);
                setUser(response.user);
                return { success: true, message: response.message };
            }
            return { success: false, message: response.message };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Registration failed',
                errors: error.errors || []
            };
        }
    };

    const updateProfile = async (profileData) => {
        try {
            const response = await authService.updateProfile(profileData);
            if (response.success) {
                setUser(response.user);
                return { success: true, message: response.message };
            }
            return { success: false, message: response.message };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Profile update failed',
                errors: error.errors || []
            };
        }
    };

    const changePassword = async (passwordData) => {
        try {
            const response = await authService.changePassword(passwordData);
            return { success: true, message: response.message };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Password change failed',
                errors: error.errors || []
            };
        }
    };

    const forgotPassword = async (email) => {
        try {
            const response = await authService.forgotPassword(email);
            return { success: true, message: response.message };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to send reset instructions',
                errors: error.errors || []
            };
        }
    };

    const resetPassword = async (resetData) => {
        try {
            const response = await authService.resetPassword(resetData);
            return { success: true, message: response.message };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Password reset failed',
                errors: error.errors || []
            };
        }
    };

    const verifyEmail = async (token, userId) => {
        try {
            const response = await authService.verifyEmail(token, userId);
            return { success: true, message: response.message };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Email verification failed',
                errors: error.errors || []
            };
        }
    };

    const resendEmailVerification = async (email) => {
        try {
            const response = await authService.resendEmailVerification(email);
            return { success: true, message: response.message };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to send verification email',
                errors: error.errors || []
            };
        }
    };

    const setupTwoFactor = async () => {
        try {
            const response = await authService.setupTwoFactor();
            return {
                success: true,
                qrCode: response.qrCode,
                secret: response.secret,
                message: response.message
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to setup two-factor authentication',
                errors: error.errors || []
            };
        }
    };

    const enableTwoFactor = async (code) => {
        try {
            const response = await authService.enableTwoFactor(code);
            return { success: true, message: response.message };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to enable two-factor authentication',
                errors: error.errors || []
            };
        }
    };

    const disableTwoFactor = async (password, code) => {
        try {
            const response = await authService.disableTwoFactor(password, code);
            return { success: true, message: response.message };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to disable two-factor authentication',
                errors: error.errors || []
            };
        }
    };

    const refreshToken = async () => {
        try {
            const response = await authService.refreshToken();
            return { success: true };
        } catch (error) {
            if (error.shouldRedirect) {
                logout();
            }
            return { success: false, message: error.message };
        }
    };

    const logout = async (logoutAll = false) => {
        try {
            await authService.logout(logoutAll);
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsAuthenticated(false);
            setUser(null);
            authService.clearAuthData();
        }
    };

    const value = {
        isAuthenticated,
        user,
        loading,
        login,
        register,
        updateProfile,
        changePassword,
        forgotPassword,
        resetPassword,
        verifyEmail,
        resendEmailVerification,
        setupTwoFactor,
        enableTwoFactor,
        disableTwoFactor,
        refreshToken,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}