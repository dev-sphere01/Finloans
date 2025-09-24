import useAuthStore from '@/store/authStore';

export const handleTokenExpiration = () => {
  // Use the logout function from the auth store
  useAuthStore.getState().logout();

  // Redirect to login page
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};
