import tokenManager from './tokenManager';
import userCache from './userCache';

class AuthDebugger {
  constructor() {
    this.logs = [];
    this.maxLogs = 100;
    this.isDebugMode = process.env.REACT_APP_DEBUG_MODE === 'true';
    this.lastHealthCheck = null;
    
    // Auto-enable debug mode if in development
    if (process.env.NODE_ENV === 'development') {
      this.isDebugMode = true;
    }
    
    this.log('AuthDebugger initialized', { debugMode: this.isDebugMode });
  }

  // Enhanced logging with categorization
  log(message, data = {}, category = 'INFO') {
    const logEntry = {
      timestamp: new Date().toISOString(),
      category,
      message,
      data,
      id: Math.random().toString(36).substr(2, 9)
    };

    this.logs.unshift(logEntry);
    
    // Limit log size
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Console output in debug mode
    if (this.isDebugMode) {
      const style = this.getCategoryStyle(category);
      console.log(
        `%c[${category}] ${message}`,
        style,
        data
      );
    }

    // Store in sessionStorage for debugging
    try {
      sessionStorage.setItem('authDebugLogs', JSON.stringify(this.logs.slice(0, 50)));
    } catch (error) {
      // Ignore storage errors
    }
  }

  getCategoryStyle(category) {
    const styles = {
      INFO: 'color: #2196F3; font-weight: normal;',
      SUCCESS: 'color: #4CAF50; font-weight: bold;',
      WARNING: 'color: #FF9800; font-weight: bold;',
      ERROR: 'color: #F44336; font-weight: bold;',
      DEBUG: 'color: #9C27B0; font-weight: normal;',
      NETWORK: 'color: #607D8B; font-weight: normal;'
    };
    return styles[category] || styles.INFO;
  }

  // Comprehensive authentication status report
  async generateAuthReport() {
    this.log('Generating comprehensive auth report', {}, 'DEBUG');

    try {
      // Get token status
      const tokenStatus = await tokenManager.logTokenStatus();
      
      // Get cache status
      const cacheStats = userCache.getCacheStats();
      
      // Get API health
      const apiHealth = await tokenManager.checkApiHealth();
      this.lastHealthCheck = apiHealth;
      
      // Get auth context status (if available)
      const authContextStatus = this.getAuthContextStatus();
      
      // Browser/Network info
      const browserInfo = this.getBrowserInfo();
      
      const report = {
        timestamp: new Date().toISOString(),
        tokenManager: tokenStatus,
        userCache: cacheStats,
        apiHealth: apiHealth,
        authContext: authContextStatus,
        browser: browserInfo,
        recentLogs: this.logs.slice(0, 10),
        diagnostics: this.runDiagnostics()
      };

      this.log('Auth report generated', report, 'SUCCESS');
      return report;
    } catch (error) {
      this.log('Failed to generate auth report', { error: error.message }, 'ERROR');
      return { error: error.message, timestamp: new Date().toISOString() };
    }
  }

  // Get browser and network information
  getBrowserInfo() {
    return {
      userAgent: navigator.userAgent,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      language: navigator.language,
      platform: navigator.platform,
      localStorage: {
        available: typeof Storage !== 'undefined',
        usage: this.getStorageUsage()
      },
      url: window.location.href,
      timestamp: Date.now()
    };
  }

  // Get localStorage usage stats
  getStorageUsage() {
    try {
      let totalSize = 0;
      let authRelatedSize = 0;
      const authKeys = ['accessToken', 'refreshToken', 'userCache'];
      
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          const itemSize = new Blob([localStorage.getItem(key)]).size;
          totalSize += itemSize;
          
          if (authKeys.some(authKey => key.includes(authKey))) {
            authRelatedSize += itemSize;
          }
        }
      }
      
      return {
        totalSize,
        authRelatedSize,
        itemCount: Object.keys(localStorage).length,
        authItemCount: Object.keys(localStorage).filter(key => 
          authKeys.some(authKey => key.includes(authKey))
        ).length
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Get current auth context status (if accessible)
  getAuthContextStatus() {
    try {
      // Try to access auth context data from DOM or global state
      const authData = {
        hasAuthProvider: !!document.querySelector('[data-auth-provider]'),
        currentPath: window.location.pathname,
        isLoginPage: window.location.pathname.includes('/login'),
        isDashboardPage: window.location.pathname.includes('/dashboard')
      };

      return authData;
    } catch (error) {
      return { error: error.message };
    }
  }

  // Run diagnostic checks
  runDiagnostics() {
    const diagnostics = [];

    // Check token validity
    const tokens = tokenManager.getStoredTokens();
    if (!tokens.accessToken) {
      diagnostics.push({
        type: 'WARNING',
        message: 'No access token found',
        suggestion: 'User needs to login'
      });
    } else if (!tokenManager.isTokenValid(tokens.accessToken)) {
      diagnostics.push({
        type: 'WARNING',
        message: 'Access token is expired or invalid',
        suggestion: 'Token refresh required'
      });
    } else if (tokenManager.isTokenExpiringSoon(tokens.accessToken)) {
      diagnostics.push({
        type: 'INFO',
        message: 'Access token expiring soon',
        suggestion: 'Proactive refresh recommended'
      });
    }

    // Check cache status
    const cacheValid = userCache.hasValidCache();
    if (!cacheValid && tokens.accessToken) {
      diagnostics.push({
        type: 'INFO',
        message: 'No valid user cache found',
        suggestion: 'User data fetch required on next auth check'
      });
    }

    // Check network connectivity
    if (!navigator.onLine) {
      diagnostics.push({
        type: 'ERROR',
        message: 'Network connectivity lost',
        suggestion: 'Check internet connection'
      });
    }

    // Check localStorage availability
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
    } catch (error) {
      diagnostics.push({
        type: 'ERROR',
        message: 'LocalStorage unavailable',
        suggestion: 'Token persistence disabled - user will be logged out on refresh'
      });
    }

    // Check for recent errors
    const recentErrors = this.logs
      .filter(log => log.category === 'ERROR' && 
        Date.now() - new Date(log.timestamp).getTime() < 60000) // Last minute
      .slice(0, 3);
      
    if (recentErrors.length > 0) {
      diagnostics.push({
        type: 'WARNING',
        message: `${recentErrors.length} recent authentication errors detected`,
        suggestion: 'Check error logs for authentication issues',
        errors: recentErrors.map(log => log.message)
      });
    }

    return diagnostics;
  }

  // Export logs for analysis
  exportLogs(format = 'json') {
    const exportData = {
      exportTime: new Date().toISOString(),
      debugMode: this.isDebugMode,
      logs: this.logs,
      summary: {
        totalLogs: this.logs.length,
        errorCount: this.logs.filter(log => log.category === 'ERROR').length,
        warningCount: this.logs.filter(log => log.category === 'WARNING').length,
        timeRange: {
          oldest: this.logs[this.logs.length - 1]?.timestamp,
          newest: this.logs[0]?.timestamp
        }
      }
    };

    if (format === 'csv') {
      return this.convertLogsToCSV(this.logs);
    }

    return JSON.stringify(exportData, null, 2);
  }

  // Convert logs to CSV format
  convertLogsToCSV(logs) {
    const headers = ['Timestamp', 'Category', 'Message', 'Data'];
    const rows = logs.map(log => [
      log.timestamp,
      log.category,
      log.message,
      JSON.stringify(log.data)
    ]);

    return [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
  }

  // Clear debug logs
  clearLogs() {
    this.logs = [];
    try {
      sessionStorage.removeItem('authDebugLogs');
    } catch (error) {
      // Ignore storage errors
    }
    this.log('Debug logs cleared', {}, 'INFO');
  }

  // Enable/disable debug mode
  setDebugMode(enabled) {
    this.isDebugMode = enabled;
    this.log(`Debug mode ${enabled ? 'enabled' : 'disabled'}`, {}, 'INFO');
  }

  // Get authentication flow timeline
  getAuthTimeline() {
    const authLogs = this.logs.filter(log => 
      log.message.includes('auth') || 
      log.message.includes('token') || 
      log.message.includes('login') ||
      log.category === 'ERROR'
    );

    return authLogs.map(log => ({
      time: log.timestamp,
      event: log.message,
      category: log.category,
      details: log.data
    }));
  }

  // Performance metrics for auth operations
  trackPerformance(operation, startTime, endTime, success = true) {
    const duration = endTime - startTime;
    
    this.log(`Performance: ${operation}`, {
      duration: `${duration}ms`,
      success,
      timestamp: new Date(startTime).toISOString()
    }, success ? 'SUCCESS' : 'WARNING');

    // Store performance data
    const perfKey = `perf_${operation}`;
    const existingPerf = JSON.parse(sessionStorage.getItem(perfKey) || '[]');
    existingPerf.unshift({ duration, success, timestamp: startTime });
    
    // Keep only last 20 entries
    const limitedPerf = existingPerf.slice(0, 20);
    sessionStorage.setItem(perfKey, JSON.stringify(limitedPerf));
  }

  // Get performance statistics
  getPerformanceStats() {
    const operations = ['login', 'tokenRefresh', 'userDataFetch', 'authCheck'];
    const stats = {};

    operations.forEach(op => {
      const perfData = JSON.parse(sessionStorage.getItem(`perf_${op}`) || '[]');
      if (perfData.length > 0) {
        const durations = perfData.map(p => p.duration);
        stats[op] = {
          count: perfData.length,
          average: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
          min: Math.min(...durations),
          max: Math.max(...durations),
          successRate: (perfData.filter(p => p.success).length / perfData.length * 100).toFixed(1) + '%'
        };
      }
    });

    return stats;
  }
}

// Create singleton instance
const authDebugger = new AuthDebugger();

// Make it globally available for debugging
if (typeof window !== 'undefined') {
  window.authDebugger = authDebugger;
}

// Export both the class and the singleton instance
export { AuthDebugger };
export default authDebugger;