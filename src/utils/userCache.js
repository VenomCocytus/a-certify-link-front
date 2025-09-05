import { AUTH_CONFIG } from './constants';

class UserCache {
  constructor() {
    this.cacheKey = 'userCache';
    this.maxAge = 5 * 60 * 1000; // 5 minutes cache validity
  }

  // Store user data with timestamp
  storeUser(userData) {
    if (!userData || !userData.id) {
      console.warn('UserCache: Invalid user data provided');
      return;
    }

    const cacheData = {
      user: userData,
      timestamp: Date.now(),
      version: '1.0'
    };

    try {
      localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
      console.log('UserCache: User data cached successfully:', userData.email);
    } catch (error) {
      console.error('UserCache: Failed to cache user data:', error);
    }
  }

  // Retrieve cached user data if valid
  getCachedUser() {
    try {
      const cachedData = localStorage.getItem(this.cacheKey);
      if (!cachedData) {
        return null;
      }

      const parsed = JSON.parse(cachedData);
      
      // Check if cache is valid
      if (!this.isCacheValid(parsed)) {
        this.clearCache();
        return null;
      }

      console.log('UserCache: Retrieved valid cached user:', parsed.user.email);
      return parsed.user;
    } catch (error) {
      console.error('UserCache: Failed to retrieve cached user:', error);
      this.clearCache();
      return null;
    }
  }

  // Check if cached data is still valid
  isCacheValid(cacheData) {
    if (!cacheData || !cacheData.timestamp || !cacheData.user) {
      return false;
    }

    const age = Date.now() - cacheData.timestamp;
    const isExpired = age > this.maxAge;
    
    if (isExpired) {
      console.log('UserCache: Cache expired, age:', age, 'maxAge:', this.maxAge);
    }

    return !isExpired;
  }

  // Check if we have valid cached user data
  hasValidCache() {
    const cached = this.getCachedUser();
    return !!cached;
  }

  // Clear cached user data
  clearCache() {
    try {
      localStorage.removeItem(this.cacheKey);
      console.log('UserCache: Cache cleared');
    } catch (error) {
      console.error('UserCache: Failed to clear cache:', error);
    }
  }

  // Update specific user fields in cache
  updateCachedUser(updates) {
    const cachedUser = this.getCachedUser();
    if (!cachedUser) {
      console.warn('UserCache: No cached user to update');
      return;
    }

    const updatedUser = { ...cachedUser, ...updates };
    this.storeUser(updatedUser);
    console.log('UserCache: User cache updated with:', Object.keys(updates));
  }

  // Get cache statistics
  getCacheStats() {
    try {
      const cachedData = localStorage.getItem(this.cacheKey);
      if (!cachedData) {
        return { exists: false };
      }

      const parsed = JSON.parse(cachedData);
      const age = Date.now() - (parsed.timestamp || 0);
      
      return {
        exists: true,
        hasUser: !!parsed.user,
        age,
        isValid: this.isCacheValid(parsed),
        expiresIn: this.maxAge - age,
        userEmail: parsed.user?.email,
        cacheSize: new Blob([cachedData]).size
      };
    } catch (error) {
      return { exists: false, error: error.message };
    }
  }

  // Extend cache validity (useful when user is active)
  touchCache() {
    const cachedUser = this.getCachedUser();
    if (cachedUser) {
      this.storeUser(cachedUser); // Re-store with new timestamp
      console.log('UserCache: Cache touched and extended');
    }
  }
}

// Create singleton instance
const userCache = new UserCache();

// Export both the class and the singleton instance
export { UserCache };
export default userCache;