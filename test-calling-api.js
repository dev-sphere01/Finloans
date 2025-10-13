const axios = require('axios');

// Test the calling API endpoints
const testCallingAPI = async () => {
  try {
    console.log('🧪 Testing Calling API endpoints...');
    
    // Test health endpoint first
    try {
      const healthResponse = await axios.get('http://localhost:5000/api/health');
      console.log('✅ Health check:', healthResponse.data);
    } catch (error) {
      console.log('❌ Health check failed:', error.message);
      return;
    }

    // Test calling leads endpoint (this will fail without auth, but we can see if route exists)
    try {
      const leadsResponse = await axios.get('http://localhost:5000/api/calling/leads');
      console.log('✅ Calling leads endpoint response:', leadsResponse.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Calling leads endpoint exists (401 Unauthorized - expected without token)');
      } else {
        console.log('❌ Calling leads endpoint error:', error.response?.status, error.response?.data || error.message);
      }
    }

    // Test calling services endpoint
    try {
      const servicesResponse = await axios.get('http://localhost:5000/api/calling/services');
      console.log('✅ Calling services endpoint response:', servicesResponse.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Calling services endpoint exists (401 Unauthorized - expected without token)');
      } else {
        console.log('❌ Calling services endpoint error:', error.response?.status, error.response?.data || error.message);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testCallingAPI();