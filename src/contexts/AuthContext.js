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
        const token = localStorage.getItem('authToken');
        if (token) {
            setIsAuthenticated(true);
            // You could also fetch user data here if needed
            fetchUserData();
        }
        setLoading(false);
    }, []);

    const fetchUserData = async () => {
        try {
            const userData = await authService.getCurrentUser();
            setUser(userData);
        } catch (error) {
            console.error('Error fetching user data:', error);
            // If token is invalid, log out
            logout();
        }
    };

    const login = async (email, password) => {
        try {
            const response = await authService.login(email, password);
            if (response.token) {
                localStorage.setItem('authToken', response.token);
                setIsAuthenticated(true);
                setUser(response.user || { email });
                return { success: true };
            }
            return { success: false, message: 'Invalid credentials' };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
        setUser(null);
    };

    const value = {
        isAuthenticated,
        user,
        loading,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};