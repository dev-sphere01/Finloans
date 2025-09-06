import API from '@/services/API';

const createbank = async (bankData) => {
  try {
    // The backend expects text fields as query parameters and the file in the body.
    const params = new URLSearchParams({
      EmpID: bankData.empId,
      BankName: bankData.bankName,
      AccountNumber: bankData.accountNumber,
      IFSCCode: bankData.ifsc,
      BranchName: bankData.branch,
    });

    const url = `/EmpBankDetails?${params.toString()}`;

    // Create a new FormData object only for the file.
    const formData = new FormData();
    if (bankData.cancelledCheque && bankData.cancelledCheque instanceof File) {
      formData.append('CancelledCheque', bankData.cancelledCheque, bankData.cancelledCheque.name);
    } else {
      // Append an empty value if no file is provided, as per the cURL example.
      formData.append('CancelledCheque', '');
    }

    console.log(`Creating bank with URL: ${url}`);

    // Post the file in the body and other data in the query string.
    // Axios will automatically set the 'Content-Type' to 'multipart/form-data'.
    const bankResponse = await API.post(url, formData);

    if (!bankResponse.data) {
      throw new Error('Failed to create bank - no response data');
    }

    const createdbank = bankResponse.data;

    console.log('bank created successfully:', createdbank);
    return createdbank;

  } catch (error) {
    console.error('Error in createbank service:', error);

    if (error.response) {
      const statusCode = error.response.status;
      const errorMessage = error.response.data?.message || error.response.data || 'Unknown server error';
      throw new Error(`Server error (${statusCode}): ${errorMessage}`);
    } else if (error.request) {
      throw new Error('Network error: Unable to connect to server');
    } else {
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
};

const importBankDetails = async (bankDetailsArray) => {
  try {
    // Transform the data to match API format
    const transformedData = bankDetailsArray.map(item => ({
      EmpID: parseInt(item.empID),
      BankName: item.bankName,
      AccountNumber: item.accountNumber,
      IFSCCode: item.ifscCode,
      BranchName: item.branchName || "",
      CancelledCheque: null // Optional for now
    }));

    console.log('Importing bank details with payload:', transformedData);

    const response = await API.post('/EmpBankDetails/Create', transformedData);

    if (!response.data) {
      throw new Error('Failed to import bank details - no response data');
    }

    console.log('Bank details imported successfully:', response.data);
    return response.data;

  } catch (error) {
    console.error('Error in importBankDetails service:', error);

    if (error.response) {
      const statusCode = error.response.status;
      const errorMessage = error.response.data?.message || error.response.data || 'Unknown server error';
      throw new Error(`Server error (${statusCode}): ${errorMessage}`);
    } else if (error.request) {
      throw new Error('Network error: Unable to connect to server');
    } else {
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
};

const getBankById = async (empId) => {
  try {
    const response = await API.get(`/EmpBankDetails/${empId}`); 
    console.log(response.data);

    if (!response.data) {
      throw new Error('Invalid response format: No bank data received');
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching bank details:', error);

    if (error.response) {
      const statusCode = error.response.status;
      const errorMessage = error.response.data?.message || error.response.data || 'Unknown server error';
      throw new Error(`Server error (${statusCode}): ${errorMessage}`);
    } else if (error.request) {
      throw new Error('Network error: Unable to connect to server');
    } else {
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
};

const BankService = {
  createbank,
  importBankDetails,
  getBankById
};

export default BankService;