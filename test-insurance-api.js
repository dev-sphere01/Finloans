// Simple test script to check insurance API
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5000/api';

async function testInsuranceAPI() {
  try {
    console.log('Testing Insurance API...\n');

    // Test 1: Get all insurance types
    console.log('1. Testing GET /api/insurances');
    const response = await fetch(`${API_BASE}/insurances`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Success!');
      console.log(`Found ${data.items?.length || 0} insurance types`);
      
      if (data.items && data.items.length > 0) {
        console.log('\nInsurance Types:');
        data.items.forEach((insurance, index) => {
          console.log(`${index + 1}. ${insurance.insuranceType}`);
          console.log(`   - Sub Types: ${insurance.subTypes?.length || 0}`);
          if (insurance.subTypes) {
            insurance.subTypes.forEach(st => {
              console.log(`     • ${st.name} (${st.isActive ? 'Active' : 'Inactive'})`);
            });
          }
          console.log(`   - Status: ${insurance.isActive ? 'Active' : 'Inactive'}`);
          console.log(`   - Links: ${insurance.links?.length || 0}`);
          console.log('');
        });
      }
    } else {
      console.log('❌ Failed!');
      console.log('Response:', data);
    }

    // Test 2: Validate a specific insurance type/subtype
    console.log('\n2. Testing validation endpoint');
    const validateResponse = await fetch(`${API_BASE}/insurances/validate/type-subtype?insuranceType=Life Insurance&subType=term`);
    const validateData = await validateResponse.json();
    
    if (validateResponse.ok) {
      console.log('✅ Validation Success!');
      console.log('Valid combination:', validateData.valid);
    } else {
      console.log('❌ Validation Failed!');
      console.log('Response:', validateData);
    }

  } catch (error) {
    console.error('❌ Error testing API:', error.message);
    console.log('\nMake sure the API server is running on http://localhost:5000');
  }
}

testInsuranceAPI();