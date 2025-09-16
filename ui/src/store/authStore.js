// store/authStore.js
import { create } from 'zustand';
import { isTokenExpired } from '@/services/authService';

// Token check interval (check every 30 seconds)
const TOKEN_CHECK_INTERVAL = 30 * 1000;
let tokenCheckInterval = null;

const useAuthStore = create((set, get) => ({
  isAuthenticated: false,
  user: null,
  isLoading: true, // Start with loading true
  isInitialized: false, // Track if auth has been initialized

  // Initialize auth state from localStorage
  initializeAuth: () => {
    set({ isLoading: true });

    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('authToken');

    if (storedUser && token) {
      try {
        const user = JSON.parse(storedUser);

        // Check if token is expired
        if (user.exp && !isTokenExpired(user.exp)) {
          set({ isAuthenticated: true, user, isLoading: false, isInitialized: true });
          // Start token monitoring for existing session
          get().startTokenMonitoring();
        } else {
          // Token expired, clear storage
          localStorage.removeItem('user');
          localStorage.removeItem('authToken');
          localStorage.removeItem('emp-data-storage');
          set({ isAuthenticated: false, user: null, isLoading: false, isInitialized: true });
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        localStorage.removeItem('emp-data-storage');
        set({ isAuthenticated: false, user: null, isLoading: false, isInitialized: true });
      }
    } else {
      // No stored auth data
      set({ isAuthenticated: false, user: null, isLoading: false, isInitialized: true });
    }
  },

  // Start token monitoring
  startTokenMonitoring: () => {
    if (tokenCheckInterval) {
      clearInterval(tokenCheckInterval);
    }

    tokenCheckInterval = setInterval(() => {
      const { user, isAuthenticated } = get();
      
      if (isAuthenticated && user?.exp) {
        // Check if token will expire in the next 5 minutes
        const timeUntilExpiry = (user.exp * 1000) - Date.now();
        const fiveMinutes = 5 * 60 * 1000;
        
        if (timeUntilExpiry <= 0) {
          // Token has expired
          console.warn('Token expired - logging out');
          
          // Use centralized logout utility
          import('../utils/logoutUtils').then(({ handleTokenExpiration }) => {
            handleTokenExpiration();
          });
        } else if (timeUntilExpiry <= fiveMinutes) {
          // Token will expire soon - show warning
          console.warn(`Token will expire in ${Math.round(timeUntilExpiry / 1000 / 60)} minutes`);
          
          // Import notification service dynamically
          import('@/services/NotificationService').then(({ default: notification }) => {
            notification().warning('Your session will expire soon. Please save your work.');
          });
        }
      }
    }, TOKEN_CHECK_INTERVAL);
  },

  // Stop token monitoring
  stopTokenMonitoring: () => {
    if (tokenCheckInterval) {
      clearInterval(tokenCheckInterval);
      tokenCheckInterval = null;
    }
  },

  login: (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    set({ isAuthenticated: true, user: userData });
    
    // Start monitoring token expiration
    get().startTokenMonitoring();
    
    // Fetch user permissions after login
    get().fetchUserPermissions();
  },

  // Fetch user permissions
  fetchUserPermissions: async () => {
    const { user } = get();
    if (!user?.id) return;

    try {
      // Import permission service dynamically to avoid circular imports
      const { fetchUserPermissions } = await import('@/services/permissionService');
      const permissions = await fetchUserPermissions(user.id);
      
      // Update user data with permissions
      const updatedUser = { ...user, rolePermissions: permissions };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
    } catch (error) {
      console.error('Failed to fetch user permissions:', error);
    }
  },

  logout: () => {
    // Stop token monitoring
    get().stopTokenMonitoring();
    
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('emp-data-storage'); // Clear employee data
    set({ isAuthenticated: false, user: null });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  // Update user data (useful after password change)
  updateUser: (updatedData) => {
    const currentUser = get().user;
    if (currentUser) {
      const newUser = { ...currentUser, ...updatedData };
      console.log('Updating user data:', { currentUser, updatedData, newUser });
      localStorage.setItem('user', JSON.stringify(newUser));
      set({ user: newUser });
    }
  },

  // Check if user needs to change password
  needsPasswordChange: () => {
    const user = get().user;
    const needsChange = user?.isAutoGenPass === true;
    // console.log('needsPasswordChange check:', { user, isAutoGenPass: user?.isAutoGenPass, needsChange });
    return needsChange;
  },

  // Get user role for layout determination
  getUserRole: () => {
    const user = get().user;
    return user?.roleId || null;
    // return 1;
  },
}));

export default useAuthStore;
