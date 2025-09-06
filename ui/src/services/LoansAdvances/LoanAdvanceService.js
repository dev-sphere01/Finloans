import API from '@/services/API';
import { notification } from '@/services';

const notify = notification();

// Create a new Loan/Advance application
// Expects payload fields aligned with backend: Category, Type, LoanAmount, Period, MonthlyInstallment, Description
const create = async (payload) => {
  try {
    const response = await API.post('/LnAs', payload);
    return response.data;
  } catch (error) {
    console.error('Create Loan/Advance error:', error);
    const message = error.response?.data?.message || error.message || 'Failed to create application';
    notify.error(message);
    return null;
  }
};

// Get loans/advances by employee ID
const getByEmployee = async (empId) => {
  try {
    const response = await API.get(`/LnAs/ByEmployee?empId=${empId}`);
    return response.data;
  } catch (error) {
    console.error('Fetch loans by employee error:', error);
    const message = error.response?.data?.message || error.message || 'Failed to fetch loans';
    notify.error(message);
    return [];
  }
};

const LnAsService = { create, getByEmployee };

export default LnAsService;