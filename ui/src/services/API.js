/**
 * @fileOverview This file provides a utility for making HTTP requests to the backend API.
 * It uses axios to handle requests and provides a centralized configuration for the API.
 *
 * @uses axios - For making HTTP requests.
 */
import axios from 'axios';
import getBaseURL from '@/utils/getBaseURL';
import { isTokenExpired } from './authService';

const baseURL = getBaseURL();
// console.log('API Base URL:', baseURL)

const API = axios.create({
  baseURL,
  timeout: 600000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple logout calls
let isLoggingOut = false;

// Function to handle logout
const handleTokenExpiration = () => {
  if (isLoggingOut) return;
  isLoggingOut = true;

  console.warn('Token expired or invalid - logging out user');
  
  // Use the centralized logout utility
  import('@/utils/logoutUtils').then(({ handleTokenExpiration }) => {
    handleTokenExpiration();
    // Reset flag after logout completes
    setTimeout(() => {
      isLoggingOut = false;
    }, 2000);
  }).catch((error) => {
    console.error('Error during token expiration handling:', error);
    // Fallback: direct navigation
    window.location.href = '/login';
    isLoggingOut = false;
  });
};

// Request interceptor to add auth token and check expiration
API.interceptors.request.use(
  (config) => {
    // Skip token checks for login and public endpoints
    const isLoginEndpoint = config.url && (
      config.url === '/Login' || 
      config.url === '/login' ||
      config.url.includes('/Forgotpassword')
    );
    
    if (isLoginEndpoint) {
      // Don't add token or check expiration for login endpoints
      return config;
    }
    
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        
        // Check if token is expired before making request
        if (user.exp && isTokenExpired(user.exp)) {
          console.warn('Token expired before request - logging out');
          handleTokenExpiration();
          return Promise.reject(new Error('Token expired'));
        }
        
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error('Error parsing user data:', error);
        handleTokenExpiration();
        return Promise.reject(new Error('Invalid user data'));
      }
    }
    
    // Handle multipart form data - let browser set Content-Type with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Skip logout for login endpoints - let them handle their own errors
    const isLoginEndpoint = error.config?.url && (
      error.config.url === '/Login' || 
      error.config.url === '/login' ||
      error.config.url.includes('/Forgotpassword')
    );
    
    if (isLoginEndpoint) {
      return Promise.reject(error);
    }
    
    // Handle 401 Unauthorized or 403 Forbidden responses for authenticated endpoints
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn('Received 401/403 response - token may be expired');
      handleTokenExpiration();
    }
    
    return Promise.reject(error);
  }
);

export default API;
