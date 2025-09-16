/**
 * @fileOverview Authentication service for handling login, logout, and password operations
 */
import API from './API';

/**
 * Decode JWT token to extract user information
 * @param {string} token - JWT token
 * @returns {object} Decoded token payload
 */
export const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Login user with username and password
 * @param {string} username - User's username
 * @param {string} password - User's password
 * @returns {Promise<object>} Login response with token and user data
 */
export const loginUser = async (username, password) => {
  try {
    const response = await API.post('/auth/Login', {
      UserName: username,
      Password: password,
    });

    const { token, isAutoGenPass, user } = response.data;
    
    if (token) {
      // Decode token to get user information
      const decodedToken = decodeToken(token);
      
      if (decodedToken) {
        const userData = {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          empId: user.username, // For backward compatibility
          roleId: decodedToken.roleId,
          roleName: decodedToken.roleName,
          isAutoGenPass: isAutoGenPass,
          token: token,
          exp: decodedToken.exp,
          lastLogin: user.lastLogin
        };

        // Store token in localStorage for API interceptor
        localStorage.setItem('authToken', token);
        
        return {
          success: true,
          data: userData,
          isAutoGenPass
        };
      }
    }
    
    throw new Error('Invalid token received');
  } catch (error) {
    console.error('Login error:', error);
    throw {
      success: false,
      message: error.response?.data?.error || error.message || 'Login failed'
    };
  }
};

/**
 * Change user password
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<object>} Change password response
 */
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await API.put('/auth/ChangePassword', {
      CurrentPassword: currentPassword,
      NewPassword: newPassword,
    });

    return {
      success: true,
      message: response.data.message || 'Password changed successfully',
      isAutoGenPass: response.data.isAutoGenPass || false
    };
  } catch (error) {
    console.error('Change password error:', error);
    throw {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to change password'
    };
  }
};

/**
 * Forgot password - send reset email
 * @param {string} username - User's username
 * @returns {Promise<object>} Forgot password response
 */
export const forgotPassword = async (username) => {
  try {
    const response = await API.put('/auth/Forgotpassword', {
      UserName: username,
    });

    return {
      success: true,
      message: response.data.message || 'Password reset email sent successfully',
      data: response.data
    };
  } catch (error) {
    console.error('Forgot password error:', error);
    throw {
      success: false,
      message: error.response?.data?.error || error.message || 'Failed to send reset email'
    };
  }
};

/**
 * Logout user
 */
export const logoutUser = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};

/**
 * Check if token is expired
 * @param {number} exp - Token expiration timestamp
 * @returns {boolean} True if token is expired
 */
export const isTokenExpired = (exp) => {
  if (!exp) return true;
  return Date.now() >= exp * 1000;
};