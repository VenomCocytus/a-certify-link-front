import { AUTH_CONFIG } from './constants';

class TokenManager {
  constructor() {
    this.refreshPromise = null;
    this.eventListeners = new Map();
    this.refreshToken = this.refreshToken.bind(this);
    this.retryCount = 0;
    this.maxRetries = 3;
    this.retryDelay = 1000; // Start with 1 second
    this.isOnline = navigator.onLine;
    this.pendingRequests = [];
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      console.log('TokenManager: Network connection restored');
      this.isOnline = true;
      this.processPendingRequests();
    });
    
    window.addEventListener('offline', () => {
      console.log('TokenManager: Network connection lost');
      this.isOnline = false;
    });
  }

  // Event system for token updates
  addEventListener(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event).add(callback);
  }

  removeEventListener(event, callback) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => callback(data));
    }
  }

  // Network detection and request queuing
  isNetworkAvailable() {
    return this.isOnline && navigator.onLine;
  }

  queueRequest(requestFn) {
    if (this.isNetworkAvailable()) {
      return requestFn();
    }
    
    return new Promise((resolve, reject) => {
      this.pendingRequests.push({ requestFn, resolve, reject });
      console.log('TokenManager: Request queued due to network unavailability');
    });
  }

  async processPendingRequests() {
    if (!this.isNetworkAvailable() || this.pendingRequests.length === 0) {
      return;
    }

    console.log(`TokenManager: Processing ${this.pendingRequests.length} pending requests`);
    const requests = [...this.pendingRequests];
    this.pendingRequests = [];

    for (const { requestFn, resolve, reject } of requests) {
      try {
        const result = await requestFn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }
  }

  // Enhanced error classification
  classifyError(error) {
    if (!this.isNetworkAvailable()) {
      return 'NETWORK_OFFLINE';
    }
    
    if (error.code === 'NETWORK_ERROR' || !error.response) {
      return 'NETWORK_ERROR';
    }
    
    if (error.response?.status >= 500) {
      return 'SERVER_ERROR';
    }
    
    if (error.response?.status === 401) {
      return 'AUTH_ERROR';
    }
    
    if (error.response?.status === 403) {
      return 'FORBIDDEN_ERROR';
    }
    
    return 'UNKNOWN_ERROR';
  }

  // Sleep utility for retry delays
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // JWT token parsing utility
  parseJWT(token) {
    try {
      if (!token) return null;
      
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch (error) {
      console.warn('TokenManager: Failed to parse JWT:', error);
      return null;
    }
  }

  // Check if token is valid (exists and not expired)
  isTokenValid(token) {
    if (!token) return false;
    
    const payload = this.parseJWT(token);
    if (!payload || !payload.exp) return false;
    
    const currentTime = Date.now() / 1000;
    const expirationTime = payload.exp;
    
    // Add 30 second buffer to prevent edge cases
    return expirationTime > (currentTime + 30);
  }

  // Check if token will expire soon (within 5 minutes)
  isTokenExpiringSoon(token) {
    if (!token) return true;
    
    const payload = this.parseJWT(token);
    if (!payload || !payload.exp) return true;
    
    const currentTime = Date.now() / 1000;
    const expirationTime = payload.exp;
    
    // Consider token expiring if less than 5 minutes remaining
    return expirationTime < (currentTime + 300);
  }

  // Get stored tokens from localStorage
  getStoredTokens() {
    return {
      accessToken: localStorage.getItem(AUTH_CONFIG.TOKEN_KEY),
      refreshToken: localStorage.getItem(AUTH_CONFIG.REFRESH_TOKEN_KEY)
    };
  }

  // Store tokens in localStorage
  storeTokens(tokens) {
    if (tokens.accessToken) {
      localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, tokens.accessToken);
    }
    if (tokens.refreshToken) {
      localStorage.setItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, tokens.refreshToken);
    }
    
    // Emit token update event
    this.emit('tokensUpdated', tokens);
  }

  // Clear all tokens
  clearTokens() {
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
    
    // Clear any pending refresh
    if (this.refreshPromise) {
      this.refreshPromise = null;
    }
    
    // Emit tokens cleared event
    this.emit('tokensCleared');
  }

  // Check if current access token is valid, refresh if needed
  async ensureValidToken(retryAttempt = 0) {
    const { accessToken, refreshToken } = this.getStoredTokens();
    
    // No tokens at all
    if (!accessToken || !refreshToken) {
      console.log('TokenManager: No tokens available');
      return null;
    }
    
    // Token is still valid
    if (this.isTokenValid(accessToken)) {
      console.log('TokenManager: Access token is valid');
      this.retryCount = 0; // Reset retry count on success
      return accessToken;
    }
    
    // Token is expired or expiring, refresh it
    console.log('TokenManager: Access token expired/expiring, refreshing...');
    try {
      const newTokens = await this.refreshTokenWithRetry();
      this.retryCount = 0; // Reset retry count on success
      return newTokens.accessToken;
    } catch (error) {
      const errorType = this.classifyError(error);
      console.error('TokenManager: Failed to refresh token:', { error, errorType, retryAttempt });
      
      // If it's a network error and we haven't exceeded max retries
      if ((errorType === 'NETWORK_ERROR' || errorType === 'SERVER_ERROR') && retryAttempt < this.maxRetries) {
        const delay = this.retryDelay * Math.pow(2, retryAttempt); // Exponential backoff
        console.log(`TokenManager: Retrying token refresh in ${delay}ms (attempt ${retryAttempt + 1}/${this.maxRetries})`);
        
        await this.sleep(delay);
        return this.ensureValidToken(retryAttempt + 1);
      }
      
      // Auth errors or max retries exceeded
      if (errorType === 'AUTH_ERROR' || errorType === 'FORBIDDEN_ERROR') {
        console.log('TokenManager: Authentication failed, clearing tokens');
        this.clearTokens();
      }
      
      return null;
    }
  }

  // Refresh tokens with queuing to prevent multiple simultaneous requests
  async refreshToken() {
    // If refresh is already in progress, wait for it
    if (this.refreshPromise) {
      console.log('TokenManager: Refresh already in progress, waiting...');
      return this.refreshPromise;
    }

    const { refreshToken } = this.getStoredTokens();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    // Create the refresh promise
    this.refreshPromise = this.performTokenRefresh(refreshToken);
    
    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      // Clear the promise when done
      this.refreshPromise = null;
    }
  }

  // Enhanced refresh token with retry logic
  async refreshTokenWithRetry(retryAttempt = 0) {
    if (!this.isNetworkAvailable()) {
      console.log('TokenManager: Network unavailable, queuing token refresh');
      return this.queueRequest(() => this.refreshTokenWithRetry(retryAttempt));
    }

    const { refreshToken } = this.getStoredTokens();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      // If refresh is already in progress, wait for it
      if (this.refreshPromise) {
        console.log('TokenManager: Refresh already in progress, waiting...');
        return this.refreshPromise;
      }

      // Create the refresh promise
      this.refreshPromise = this.performTokenRefresh(refreshToken);
      const result = await this.refreshPromise;
      return result;
    } catch (error) {
      const errorType = this.classifyError(error);
      console.error('TokenManager: Token refresh failed:', { error, errorType, retryAttempt });

      // Retry on network/server errors
      if ((errorType === 'NETWORK_ERROR' || errorType === 'SERVER_ERROR') && retryAttempt < this.maxRetries) {
        const delay = this.retryDelay * Math.pow(2, retryAttempt); // Exponential backoff
        console.log(`TokenManager: Retrying token refresh in ${delay}ms (attempt ${retryAttempt + 1}/${this.maxRetries})`);
        
        await this.sleep(delay);
        return this.refreshTokenWithRetry(retryAttempt + 1);
      }

      // Clear tokens on auth errors or max retries exceeded
      if (errorType === 'AUTH_ERROR' || errorType === 'FORBIDDEN_ERROR' || retryAttempt >= this.maxRetries) {
        this.clearTokens();
        this.emit('refreshFailed', error);
      }

      throw error;
    } finally {
      // Clear the promise when done
      this.refreshPromise = null;
    }
  }

  // Actual token refresh API call
  async performTokenRefresh(refreshToken) {
    const startTime = Date.now();
    console.log('TokenManager: Performing token refresh...', { 
      hasRefreshToken: !!refreshToken,
      isOnline: this.isOnline,
      retryCount: this.retryCount 
    });
    
    try {
      // Import axios here to avoid circular dependency
      const axios = (await import('axios')).default;
      
      const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002/api/v1';
      
      // Add timeout and enhanced error handling
      const response = await axios.post(`${BASE_URL}/auth/refresh-token`, {
        refreshToken
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true,
        timeout: 10000, // 10 second timeout
        retry: false // Disable axios retry to handle it ourselves
      });

      // Validate response structure
      if (!response) {
        throw new Error('No response received from server');
      }

      if (!response.data) {
        throw new Error('Invalid refresh response: missing response data');
      }

      if (!response.data.tokens) {
        throw new Error('Invalid refresh response: missing tokens object');
      }

      const { tokens } = response.data;

      if (!tokens.accessToken || typeof tokens.accessToken !== 'string') {
        throw new Error('Invalid refresh response: missing or invalid access token');
      }

      const duration = Date.now() - startTime;
      console.log(`TokenManager: Token refresh successful (${duration}ms)`, {
        hasNewAccessToken: !!tokens.accessToken,
        hasNewRefreshToken: !!tokens.refreshToken,
        tokenType: tokens.tokenType
      });
      
      // Store new tokens
      this.storeTokens(tokens);
      
      return tokens;
    } catch (error) {
      const duration = Date.now() - startTime;
      const enhancedError = {
        message: error.message,
        duration,
        response: error.response?.data,
        status: error.response?.status,
        code: error.code,
        isNetworkError: !error.response,
        isServerError: error.response?.status >= 500,
        isAuthError: error.response?.status === 401 || error.response?.status === 403
      };

      console.error('TokenManager: Token refresh failed:', enhancedError);

      // Don't clear tokens here - let the retry logic handle it
      // Only emit if this is the final attempt
      if (this.retryCount >= this.maxRetries) {
        this.emit('refreshFailed', error);
      }
      
      throw error;
    }
  }

  // Get valid access token with automatic refresh
  async getValidAccessToken() {
    try {
      if (!this.isNetworkAvailable()) {
        console.warn('TokenManager: Network unavailable, returning cached token if valid');
        const { accessToken } = this.getStoredTokens();
        if (this.isTokenValid(accessToken)) {
          return accessToken;
        }
        throw new Error('Network unavailable and no valid cached token');
      }

      const validToken = await this.ensureValidToken();
      if (!validToken) {
        throw new Error('Unable to obtain valid access token');
      }
      return validToken;
    } catch (error) {
      console.error('TokenManager: Failed to get valid access token:', error);
      throw error;
    }
  }

  // Health check for API connectivity
  async checkApiHealth() {
    if (!this.isNetworkAvailable()) {
      return { healthy: false, reason: 'Network unavailable' };
    }

    try {
      const axios = (await import('axios')).default;
      const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002/api/v1';
      
      const startTime = Date.now();
      const response = await axios.get(`${BASE_URL}/health`, {
        timeout: 5000,
        headers: { 'Content-Type': 'application/json' }
      });
      
      const duration = Date.now() - startTime;
      const healthy = response.status === 200;
      
      return {
        healthy,
        duration,
        status: response.status,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        healthy: false,
        reason: error.message,
        status: error.response?.status,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Check if user has any authentication tokens
  hasTokens() {
    const { accessToken, refreshToken } = this.getStoredTokens();
    return !!(accessToken || refreshToken);
  }

  // Get token expiration info
  getTokenExpirationInfo(token) {
    const payload = this.parseJWT(token);
    if (!payload || !payload.exp) return null;
    
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const timeUntilExpiration = expirationTime - currentTime;
    
    return {
      expirationTime: new Date(expirationTime),
      timeUntilExpiration,
      isExpired: timeUntilExpiration <= 0,
      isExpiringSoon: timeUntilExpiration < 300000 // 5 minutes
    };
  }

  // Debug method to log current token status
  async logTokenStatus() {
    const { accessToken, refreshToken } = this.getStoredTokens();
    const healthCheck = await this.checkApiHealth();
    
    const status = {
      // Token status
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      accessTokenValid: this.isTokenValid(accessToken),
      accessTokenExpiringSoon: this.isTokenExpiringSoon(accessToken),
      accessTokenInfo: accessToken ? this.getTokenExpirationInfo(accessToken) : null,
      
      // Network & API status
      isOnline: this.isOnline,
      networkAvailable: this.isNetworkAvailable(),
      apiHealthy: healthCheck.healthy,
      apiResponseTime: healthCheck.duration,
      
      // Manager status
      refreshInProgress: !!this.refreshPromise,
      pendingRequests: this.pendingRequests.length,
      currentRetryCount: this.retryCount,
      maxRetries: this.maxRetries,
      
      // Timestamps
      timestamp: new Date().toISOString(),
      lastHealthCheck: healthCheck.timestamp
    };
    
    console.log('TokenManager Status:', status);
    return status;
  }

  // Get comprehensive authentication status
  async getAuthStatus() {
    const { accessToken, refreshToken } = this.getStoredTokens();
    const healthCheck = await this.checkApiHealth();
    
    return {
      authenticated: !!accessToken && !!refreshToken,
      tokenValid: this.isTokenValid(accessToken),
      tokenExpiringSoon: this.isTokenExpiringSoon(accessToken),
      networkAvailable: this.isNetworkAvailable(),
      apiHealthy: healthCheck.healthy,
      canRefresh: !!refreshToken && healthCheck.healthy,
      expirationInfo: accessToken ? this.getTokenExpirationInfo(accessToken) : null
    };
  }
}

// Create singleton instance
const tokenManager = new TokenManager();

// Export both the class and the singleton instance
export { TokenManager };
export default tokenManager;