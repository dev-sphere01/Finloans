// store/authStore.js
import { create } from 'zustand';

const useAuthStore = create((set, get) => ({
  // Auth state
  isAuthenticated: false,
  user: null,
  isLoading: true,
  isInitialized: false, // Add this state

  // Initialize auth from sessionStorage
  initializeAuth: () => {
    set({ isLoading: true });

    const token = sessionStorage.getItem('authToken');
    const storedUser = sessionStorage.getItem('user');

    if (token && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        set({ 
          isAuthenticated: true, 
          user, 
          isLoading: false,
          isInitialized: true // Set initialized to true
        });
      } catch (error) {
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('user');
        set({ 
          isAuthenticated: false, 
          user: null, 
          isLoading: false,
          isInitialized: true // Set initialized to true even on error
        });
      }
    } else {
      set({ 
        isAuthenticated: false, // <--- change here for dev environment to access protected routes 
        user: null, 
        isLoading: false,
        isInitialized: true // Set initialized to true
      });
    }
  },

  // Login action
  login: (loginResponseData) => {
    sessionStorage.setItem('authToken', loginResponseData.token);
    sessionStorage.setItem('user', JSON.stringify(loginResponseData.user));
    set({ isAuthenticated: true, user: loginResponseData.user });
  },

  // Update user data (for profile updates)
  updateUser: (userData) => {
    const currentUser = get().user;
    const updatedUser = { ...currentUser, ...userData };
    sessionStorage.setItem('user', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },

  // Logout action
  logout: () => {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
    set({ isAuthenticated: false, user: null });
  },

  // Set loading state
  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  // Manual authentication setter for dev environment
  setAuthenticated: (value, mockUser = null) => {
    if (import.meta.env.VITE_APP_STAGE === 'development') { 
      const devUser = mockUser || {
        id: 1,
        name: 'Dev User',
        email: 'dev@FinLoans.com',
        role: 'admin'
      };
      
      set({ 
        isAuthenticated: value,
        user: value ? devUser : null 
      });
      
      console.log(`[DEV] Authentication manually set to: ${value}`);
    } else {
      console.warn('setAuthenticated is only available in development environment');
    }
  },

  // Check if user needs password change (placeholder for future use)
  needsPasswordChange: () => {
    const user = get().user;
    return user?.needsPasswordChange || false;
  },
}));

export default useAuthStore;
