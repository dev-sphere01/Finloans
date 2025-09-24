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
    return { success: false, message: error.response?.data?.error || 'An unexpected error occurred' };
  }
};
