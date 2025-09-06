// safeCompletionCalculator.js
import { calculateCompletion, initialFormData } from '@/pages/EmployeeManagement/AddEmployee/components/addEmployeeLogics';

export const safeCalculateCompletion = (formData) => {
  // Ensure formData has all required properties
  if (!formData || typeof formData !== 'object') {
    return 0;
  }

  // Merge with initialFormData to ensure all required fields exist
  const safeFormData = {
    ...initialFormData,
    ...formData,
    // Ensure degrees array exists
    degrees: Array.isArray(formData.degrees) ? formData.degrees : [{ degree: '', institution: '', yearOfPassing: '', grade: '' }]
  };

  try {
    return calculateCompletion(safeFormData);
  } catch (error) {
    console.error('Error calculating completion:', error);
    return 0;
  }
};