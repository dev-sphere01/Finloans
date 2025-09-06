/**
 * @fileOverview Logout utilities for handling session expiration and manual logout
 */

/**
 * Perform complete logout with cleanup and navigation
 * @param {string} reason - Reason for logout (optional)
 * @param {boolean} showNotification - Whether to show notification (default: true)
 */
export const performLogout = async (reason = 'Session ended', showNotification = true) => {
  console.log(`Performing logout: ${reason}`);

  try {
    // Clear all localStorage data
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('emp-data-storage');
    
    // Clear any other app-specific storage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('ems-') || key.startsWith('app-'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));

    // Clear auth store
    const { default: useAuthStore } = await import('../store/authStore');
    useAuthStore.getState().logout();

    // Clear employee data store
    const { default: useEmpDataStore } = await import('../store/empDataStore');
    useEmpDataStore.getState().clearEmployeeData();

    // Show notification if requested
    if (showNotification) {
      const { default: notification } = await import('../services/NotificationService');
      
      if (reason.includes('expired') || reason.includes('invalid')) {
        notification().warning('Session expired. Please log in again.');
      } else {
        notification().success('Logged out successfully.');
      }
    }

    // Navigate to login page
    setTimeout(() => {
      window.location.href = '/login';
    }, showNotification ? 1000 : 100);

  } catch (error) {
    console.error('Error during logout:', error);
    // Force navigation even if there's an error
    window.location.href = '/login';
  }
};

/**
 * Handle token expiration with automatic logout
 */
export const handleTokenExpiration = () => {
  performLogout('Token expired', true);
};

/**
 * Handle manual logout (user initiated)
 */
export const handleManualLogout = () => {
  performLogout('User logout', true);
};

/**
 * Handle forced logout (security reasons)
 */
export const handleForcedLogout = (reason = 'Security logout') => {
  performLogout(reason, true);
};

export default {
  performLogout,
  handleTokenExpiration,
  handleManualLogout,
  handleForcedLogout
};