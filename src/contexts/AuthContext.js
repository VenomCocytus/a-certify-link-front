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
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                const userData = await authService.getCurrentUser();
                setUser(userData);
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Error fetching user data:', error);
                // If token is invalid, log out
                await logout();
            }
        }
        setLoading(false);
    };

    const login = async (email, password, rememberMe = false, twoFactorCode = null) => {
        try {
            const response = await authService.login(email, password, rememberMe, twoFactorCode);
            if (response.success) {
                localStorage.setItem('accessToken', response.accessToken);
                setIsAuthenticated(true);
                setUser(response.user);
                return { success: true };
            }
            return { success: false, message: 'Invalid credentials' };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Login failed'
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await authService.register(userData);
            if (response.success) {
                localStorage.setItem('accessToken', response.accessToken);
                setIsAuthenticated(true);
                setUser(response.user);
                return { success: true };
            }
            return { success: false, message: 'Registration failed' };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Registration failed'
            };
        }
    };

    const updateProfile = async (profileData) => {
        try {
            const updatedUser = await authService.updateProfile(profileData);
            setUser(updatedUser);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Profile update failed'
            };
        }
    };

    const changePassword = async (passwordData) => {
        try {
            const response = await authService.changePassword(passwordData);
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Password change failed'
            };
        }
    };

    const logout = async (logoutAll = false) => {
        try {
            await authService.logout(logoutAll);
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('accessToken');
            setIsAuthenticated(false);
            setUser(null);
        }
    };

    const refreshToken = async () => {
        try {
            const response = await authService.refreshToken();
            if (response.success) {
                localStorage.setItem('accessToken', response.accessToken);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Token refresh failed:', error);
            await logout();
            return false;
        }
    };

    const value = {
        isAuthenticated,
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        refreshToken
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};