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
        console.log('AuthContext: Checking auth status, token exists:', !!token);
        
        if (token) {
            try {
                console.log('AuthContext: Attempting to get current user');
                const userData = await authService.getCurrentUser();
                
                if (userData && userData.id) {
                    console.log('AuthContext: User data retrieved successfully:', userData.email);
                    setUser(userData);
                    setIsAuthenticated(true);
                } else {
                    console.warn('AuthContext: Invalid user data received:', userData);
                    await logout();
                }
            } catch (error) {
                console.error('AuthContext: Error fetching user data:', {
                    message: error.message,
                    status: error.response?.status
                });
                // If token is invalid or expired, log out
                await logout();
            }
        } else {
            console.log('AuthContext: No token found, user not authenticated');
        }
        setLoading(false);
    };

    const login = async (email, password, rememberMe = false, twoFactorCode) => {
        try {
            console.log('AuthContext: Attempting login for:', email);
            const response = await authService.login(email, password, rememberMe, twoFactorCode);
            
            console.log('AuthContext: Login response received:', { 
                success: response.success, 
                hasUser: !!response.user,
                hasAccessToken: !!response.accessToken
            });
            
            if (response.success && response.accessToken) {
                localStorage.setItem('accessToken', response.accessToken);
                if (response.refreshToken) {
                    localStorage.setItem('refreshToken', response.refreshToken);
                }
                setIsAuthenticated(true);
                setUser(response.user);
                console.log('AuthContext: Login successful, user authenticated');
                return { success: true };
            } else {
                console.warn('AuthContext: Login response missing required data:', response);
                return { success: false, message: 'Invalid response from server' };
            }
        } catch (error) {
            console.error('AuthContext: Login error:', error);
            return {
                success: false,
                message: error.message || 'Login failed'
            };
        }
    };

    const register = async (userData) => {
        try {
            console.log('AuthContext: Attempting registration');
            const response = await authService.register(userData);
            
            console.log('AuthContext: Registration response received:', { 
                success: response.success, 
                hasUser: !!response.user,
                hasAccessToken: !!response.accessToken
            });
            
            if (response.success && response.accessToken) {
                localStorage.setItem('accessToken', response.accessToken);
                if (response.refreshToken) {
                    localStorage.setItem('refreshToken', response.refreshToken);
                }
                setIsAuthenticated(true);
                setUser(response.user);
                console.log('AuthContext: Registration successful, user authenticated');
                return { success: true };
            } else {
                console.warn('AuthContext: Registration response missing required data:', response);
                return { success: false, message: 'Invalid response from server' };
            }
        } catch (error) {
            console.error('AuthContext: Registration error:', error);
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
            localStorage.removeItem('refreshToken');
            setIsAuthenticated(false);
            setUser(null);
        }
    };

    const refreshToken = async () => {
        try {
            console.log('AuthContext: Attempting token refresh');
            const response = await authService.refreshToken();
            
            console.log('AuthContext: RefreshToken response received:', { 
                success: response.success, 
                hasAccessToken: !!response.accessToken
            });
            
            if (response.success && response.accessToken) {
                localStorage.setItem('accessToken', response.accessToken);
                if (response.refreshToken) {
                    localStorage.setItem('refreshToken', response.refreshToken);
                }
                console.log('AuthContext: Token refresh successful');
                return true;
            } else {
                console.warn('AuthContext: Token refresh response missing required data:', response);
                await logout();
                return false;
            }
        } catch (error) {
            console.error('AuthContext: Token refresh failed:', error);
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