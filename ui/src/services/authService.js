import API from './API';

export const loginUser = async (username, password) => {
  try {
    const response = await API.post('/auth/Login', {
      UserName: username,
      Password: password,
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Login API call failed:', error);
    
    // Extract error message from API response
    let errorMessage = 'An unexpected error occurred';
    
    if (error.response?.data) {
      // Check for different possible error message fields
      errorMessage = error.response.data.message || 
                    error.response.data.error || 
                    error.response.data.Error || 
                    error.response.data.Message ||
                    errorMessage;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    // Handle specific HTTP status codes
    if (error.response?.status === 401) {
      errorMessage = 'Invalid username or password. Please check your credentials.';
    } else if (error.response?.status === 403) {
      errorMessage = 'Access denied. Your account may be disabled.';
    } else if (error.response?.status === 429) {
      errorMessage = 'Too many login attempts. Please try again later.';
    } else if (error.response?.status >= 500) {
      errorMessage = 'Server error. Please try again later.';
    } else if (!error.response) {
      errorMessage = 'Network error. Please check your internet connection.';
    }
    
    return { success: false, message: errorMessage };
  }
};
