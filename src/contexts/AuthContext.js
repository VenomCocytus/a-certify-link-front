import React, {createContext, useContext, useEffect, useState} from 'react';
import {authService} from '../services/authService';
import tokenManager from '../utils/tokenManager';
import userCache from '../utils/userCache';
import authDebugger from '../utils/authDebugger';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    // Initialize with cached data if available
    const cachedUser = userCache.getCachedUser();
    const hasTokens = tokenManager.hasTokens();
    
    const [isAuthenticated, setIsAuthenticated] = useState(hasTokens && !!cachedUser);
    const [user, setUser] = useState(cachedUser);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null);

    console.log('AuthProvider: Initializing with cached data:', {
        hasTokens,
        hasCachedUser: !!cachedUser,
        initialAuth: hasTokens && !!cachedUser
    });

    authDebugger.log('AuthProvider initialized', {
        hasTokens,
        hasCachedUser: !!cachedUser,
        initialAuth: hasTokens && !!cachedUser
    }, 'INFO');

    useEffect(() => {
        // Check if user is already authenticated on app load
        checkAuthStatus();

        // Set up token manager event listeners
        const handleTokensUpdated = (tokens) => {
            console.log('AuthContext: Tokens updated by token manager');
            // Tokens were refreshed automatically, no need to update state
            // as the user should remain authenticated
        };

        const handleTokensCleared = () => {
            console.log('AuthContext: Tokens cleared by token manager');
            setIsAuthenticated(false);
            setUser(null);
        };

        const handleRefreshFailed = () => {
            console.log('AuthContext: Token refresh failed, logging out');
            setIsAuthenticated(false);
            setUser(null);
        };

        // Add event listeners
        tokenManager.addEventListener('tokensUpdated', handleTokensUpdated);
        tokenManager.addEventListener('tokensCleared', handleTokensCleared);
        tokenManager.addEventListener('refreshFailed', handleRefreshFailed);

        // Cleanup event listeners
        return () => {
            tokenManager.removeEventListener('tokensUpdated', handleTokensUpdated);
            tokenManager.removeEventListener('tokensCleared', handleTokensCleared);
            tokenManager.removeEventListener('refreshFailed', handleRefreshFailed);
        };
    }, []);

    // Helper function to classify authentication errors
    const classifyAuthError = (error) => {
        if (!navigator.onLine) {
            return 'NETWORK_OFFLINE';
        }
        
        if (!error.response) {
            return 'NETWORK_ERROR';
        }
        
        if (error.response.status >= 500) {
            return 'SERVER_ERROR';
        }
        
        if (error.response.status === 401) {
            return 'AUTH_ERROR';
        }
        
        if (error.response.status === 403) {
            return 'FORBIDDEN_ERROR';
        }
        
        return 'UNKNOWN_ERROR';
    };

    // Enhanced getCurrentUser with retry logic
    const getCurrentUserWithRetry = async (retryAttempt = 0) => {
        try {
            const userData = await authService.getCurrentUser();
            return userData;
        } catch (error) {
            const errorType = classifyAuthError(error);
            console.error('AuthContext: getCurrentUser error:', { error, errorType, retryAttempt });
            
            // Retry on network/server errors
            if ((errorType === 'NETWORK_ERROR' || errorType === 'SERVER_ERROR') && retryAttempt < 2) {
                const delay = 1000 * (retryAttempt + 1);
                console.log(`AuthContext: Retrying getCurrentUser in ${delay}ms (attempt ${retryAttempt + 1}/2)`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return getCurrentUserWithRetry(retryAttempt + 1);
            }
            
            throw error;
        }
    };

    const checkAuthStatus = async (retryAttempt = 0, backgroundSync = false) => {
        console.log('AuthContext: Checking authentication status...', { retryAttempt, backgroundSync });
        authDebugger.log('checkAuthStatus started', { retryAttempt, backgroundSync }, 'INFO');
        
        const startTime = Date.now();
        
        try {
            // Check if we have any tokens stored
            if (!tokenManager.hasTokens()) {
                console.log('AuthContext: No tokens found, user not authenticated');
                authDebugger.log('No tokens found', {}, 'WARNING');
                userCache.clearCache(); // Clear any stale cache
                setIsAuthenticated(false);
                setUser(null);
                setAuthError(null);
                setLoading(false);
                authDebugger.trackPerformance('authCheck', startTime, Date.now(), false);
                return;
            }

            // If we have cached user data and tokens, set auth state immediately
            const cachedUser = userCache.getCachedUser();
            if (cachedUser && !backgroundSync) {
                console.log('AuthContext: Using cached user data for immediate auth:', cachedUser.email);
                setUser(cachedUser);
                setIsAuthenticated(true);
                setAuthError(null);
                setLoading(false);
                
                // Start background sync to refresh user data
                console.log('AuthContext: Starting background sync for user data refresh');
                setTimeout(() => checkAuthStatus(0, true), 100);
                return;
            }

            // Check API health first
            const healthCheck = await tokenManager.checkApiHealth();
            console.log('AuthContext: API health check:', healthCheck);

            // Use token manager to ensure we have a valid token
            console.log('AuthContext: Ensuring valid token...');
            const validToken = await tokenManager.ensureValidToken();
            
            if (!validToken) {
                console.log('AuthContext: Unable to obtain valid token, checking if we should retry...');
                
                // If we're in background sync and have cached data, don't disrupt the user
                if (backgroundSync && cachedUser) {
                    console.log('AuthContext: Background sync failed but keeping cached user active');
                    setAuthError('Background sync failed - using cached data');
                    return;
                }
                
                // If API is healthy but token refresh failed, it's likely an auth issue
                if (healthCheck.healthy) {
                    console.log('AuthContext: API is healthy but token refresh failed - likely auth error');
                    await handleAuthFailure('Token refresh failed - please login again');
                    return;
                }
                
                // If API is unhealthy and we haven't exceeded retries, try again
                if (!healthCheck.healthy && retryAttempt < 3) {
                    const delay = 2000 * (retryAttempt + 1); // Progressive delay
                    console.log(`AuthContext: API unhealthy, retrying in ${delay}ms (attempt ${retryAttempt + 1}/3)`);
                    
                    if (!backgroundSync) {
                        setAuthError(`API unavailable - retrying (${retryAttempt + 1}/3)...`);
                    }
                    
                    setTimeout(() => checkAuthStatus(retryAttempt + 1, backgroundSync), delay);
                    return;
                }
                
                console.log('AuthContext: Max retries exceeded or permanent failure');
                await handleAuthFailure('Unable to connect to server - please try again later');
                return;
            }

            // Now that we have a valid token, get user data with retry logic
            console.log('AuthContext: Valid token obtained, fetching user data...');
            const userData = await getCurrentUserWithRetry();
            
            if (userData && userData.id) {
                console.log('AuthContext: User data retrieved successfully:', userData.email);
                authDebugger.log('User data retrieved successfully', { email: userData.email, backgroundSync }, 'SUCCESS');
                
                // Cache the fresh user data
                userCache.storeUser(userData);
                
                setUser(userData);
                setIsAuthenticated(true);
                setAuthError(null);
                
                if (backgroundSync) {
                    console.log('AuthContext: Background sync completed successfully');
                } else {
                    authDebugger.trackPerformance('authCheck', startTime, Date.now(), true);
                }
            } else {
                console.warn('AuthContext: Invalid user data received:', userData);
                
                // If in background sync, keep existing cached data
                if (backgroundSync && cachedUser) {
                    console.log('AuthContext: Background sync failed, keeping cached user');
                    setAuthError('Failed to refresh user data - using cached data');
                    return;
                }
                
                // Don't immediately logout on invalid user data - could be temporary
                if (retryAttempt < 2) {
                    console.log('AuthContext: Retrying user data fetch...');
                    setTimeout(() => checkAuthStatus(retryAttempt + 1, backgroundSync), 1000);
                    return;
                }
                
                await handleAuthFailure('Invalid user data received');
            }
        } catch (error) {
            const errorType = classifyAuthError(error);
            console.error('AuthContext: Error during auth status check:', {
                message: error.message,
                status: error.response?.status,
                errorType,
                retryAttempt,
                backgroundSync
            });
            
            // If in background sync, don't disrupt user experience
            if (backgroundSync && cachedUser) {
                console.log('AuthContext: Background sync error, keeping cached user active');
                setAuthError(`Background sync failed: ${error.message}`);
                return;
            }
            
            // Handle different error types appropriately
            if (errorType === 'NETWORK_ERROR' && retryAttempt < 3) {
                const delay = 2000 * (retryAttempt + 1); // Progressive delay
                console.log(`AuthContext: Network error, retrying in ${delay}ms (attempt ${retryAttempt + 1}/3)`);
                setAuthError(`Network error - retrying (${retryAttempt + 1}/3)...`);
                setTimeout(() => checkAuthStatus(retryAttempt + 1, backgroundSync), delay);
                return;
            }
            
            if (errorType === 'SERVER_ERROR' && retryAttempt < 2) {
                console.log(`AuthContext: Server error, retrying in 3000ms (attempt ${retryAttempt + 1}/2)`);
                setAuthError(`Server error - retrying (${retryAttempt + 1}/2)...`);
                setTimeout(() => checkAuthStatus(retryAttempt + 1, backgroundSync), 3000);
                return;
            }
            
            // Auth errors or max retries exceeded
            if (errorType === 'AUTH_ERROR' || retryAttempt >= 3) {
                console.log('AuthContext: Auth error or max retries exceeded');
                await handleAuthFailure(errorType === 'AUTH_ERROR' ? 'Authentication failed - please login again' : 'Connection failed - please try again');
            } else {
                // For other errors, set loading false but don't logout immediately
                console.log('AuthContext: Non-auth error, setting loading false without logout');
                setAuthError('Authentication check failed - some features may be limited');
                setLoading(false);
            }
        } finally {
            // Only set loading false if we're not retrying and not in background sync
            if (retryAttempt === 0 && !backgroundSync) {
                setLoading(false);
            }
        }
    };

    // Helper to handle authentication failures gracefully
    const handleAuthFailure = async (errorMessage) => {
        setAuthError(errorMessage);
        await logout();
        setLoading(false);
    };

    const login = async (email, password, rememberMe = false, twoFactorCode) => {
        const startTime = Date.now();
        try {
            console.log('AuthContext: Attempting login for:', email);
            authDebugger.log('Login attempt started', { email, rememberMe, hasTwoFactor: !!twoFactorCode }, 'INFO');
            const response = await authService.login(email, password, rememberMe, twoFactorCode);
            
            console.log('AuthContext: Login response received:', { 
                success: response.success, 
                hasUser: !!response.user,
                hasAccessToken: !!response.accessToken
            });
            
            if (response.success && response.accessToken) {
                // Use token manager to store tokens
                tokenManager.storeTokens({
                    accessToken: response.accessToken,
                    refreshToken: response.refreshToken
                });
                
                // Cache user data for immediate access on refresh
                userCache.storeUser(response.user);
                
                setIsAuthenticated(true);
                setUser(response.user);
                setAuthError(null); // Clear any previous errors
                console.log('AuthContext: Login successful, user authenticated');
                authDebugger.log('Login successful', { email: response.user.email }, 'SUCCESS');
                authDebugger.trackPerformance('login', startTime, Date.now(), true);
                return { success: true };
            } else {
                console.warn('AuthContext: Login response missing required data:', response);
                return { success: false, message: 'Invalid response from server' };
            }
        } catch (error) {
            console.error('AuthContext: Login error:', error);
            authDebugger.log('Login failed', { error: error.message }, 'ERROR');
            authDebugger.trackPerformance('login', startTime, Date.now(), false);
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
                // Use token manager to store tokens
                tokenManager.storeTokens({
                    accessToken: response.accessToken,
                    refreshToken: response.refreshToken
                });
                
                // Cache user data for immediate access on refresh
                userCache.storeUser(response.user);
                
                setIsAuthenticated(true);
                setUser(response.user);
                setAuthError(null); // Clear any previous errors
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
            
            // Update cached user data
            userCache.storeUser(updatedUser);
            
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
            return await authService.changePassword(passwordData);
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
            // Use token manager to clear tokens (this will also emit events)
            tokenManager.clearTokens();
            
            // Clear cached user data
            userCache.clearCache();
            
            setIsAuthenticated(false);
            setUser(null);
            setAuthError(null);
        }
    };

    const refreshToken = async () => {
        try {
            console.log('AuthContext: Attempting token refresh via token manager');
            const tokens = await tokenManager.refreshToken();
            
            console.log('AuthContext: Token refresh successful');
            // Tokens are automatically stored by token manager
            return true;
        } catch (error) {
            console.error('AuthContext: Token refresh failed:', error);
            // Token manager already cleared tokens and emitted events
            return false;
        }
    };

    const value = {
        isAuthenticated,
        user,
        loading,
        authError,
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