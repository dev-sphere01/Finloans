/**
 * Utility to completely clear all authentication data
 * Use this when login issues occur due to corrupted localStorage data
 */

export const clearAllAuthData = () => {
  console.log('🧹 Clearing all authentication data...');
  
  // Clear all auth-related localStorage items
  localStorage.removeItem('user');
  localStorage.removeItem('authToken');
  localStorage.removeItem('emp-data-storage');
  
  // Clear any other potential auth-related items
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('auth') || key.includes('token') || key.includes('user'))) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`Removed localStorage key: ${key}`);
  });
  
  console.log('✅ All authentication data cleared');
  
  // Force page reload to reset all state
  setTimeout(() => {
    window.location.reload();
  }, 100);
};

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  window.clearAllAuthData = clearAllAuthData;
}

export default clearAllAuthData;