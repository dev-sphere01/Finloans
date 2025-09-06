import API from '@/services/API';
import { notification } from '@/services';
const notify = notification();

// Helper function to parse date strings (supports multiple formats)
const parseDate = (dateStr) => {
  if (!dateStr) return null;
  
  // Handle different date formats
  const formats = [
    /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/, // DD/MM/YYYY or MM/DD/YYYY or D/M/YY
    /(\d{4})-(\d{1,2})-(\d{1,2})/, // YYYY-MM-DD
    /(\d{1,2})-(\d{1,2})-(\d{2,4})/ // DD-MM-YYYY or MM-DD-YYYY
  ];
  
  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      let [, part1, part2, part3] = match;
      
      // Assume DD/MM/YYYY format for the first regex
      if (format === formats[0]) {
        // Convert 2-digit year to 4-digit
        if (part3.length === 2) {
          part3 = parseInt(part3) > 50 ? `19${part3}` : `20${part3}`;
        }
        return new Date(part3, part2 - 1, part1).toISOString();
      }
      
      // For YYYY-MM-DD format
      if (format === formats[1]) {
        return new Date(part1, part2 - 1, part3).toISOString();
      }
      
      // For DD-MM-YYYY format
      if (format === formats[2]) {
        if (part3.length === 2) {
          part3 = parseInt(part3) > 50 ? `19${part3}` : `20${part3}`;
        }
        return new Date(part3, part2 - 1, part1).toISOString();
      }
    }
  }
  
  // Fallback: try direct Date parsing
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

// Enhanced transform function with better date handling
const transformEmployeeDataForImport = (employee) => {
  return {
    FirstName: employee.FirstName || '',
    LastName: employee.LastName || '',
    PersonalEmail: employee.PersonalEmail || '',
    WorkEmail: employee.WorkEmail || '',
    PhoneNumber: employee.PhoneNumber || '',
    Address: employee.Address || '',
    EmergencyContact: employee.EmergencyContact || '',
    EmergencyContactNumber: employee.EmergencyContactNumber || '',
    DateOfBirth: parseDate(employee.DateOfBirth),
    Gender: employee.Gender || '',
    DateOfJoining: parseDate(employee.DateOfJoining),
    OBStatus: employee.OBStatus === '1' || employee.OBStatus === true,
    IsActive: employee.IsActive === '1' || employee.IsActive === true,
    ProfilePicture: employee.ProfilePicture || '',
    DeptID: parseInt(employee.DeptID) || 0,
    PositionID: parseInt(employee.PositionID) || 0,
    EmpTypeID: parseInt(employee.EmpTypeID) || 0,
    LocationID:parseInt(employee.LocationID) || 0,
    AtdEmpCode:parseInt(employee.AtdEmpCode) || 0,
    // RoleID:1 //default role set to 2 for Employee
  };
};

// Helper validation functions
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhoneNumber = (phone) => {
  // Basic phone validation - adjust according to your requirements
  const phoneRegex = /^[\d\s\-\+\(\)]{8,15}$/;
  return phoneRegex.test(phone.toString());
};

// Bulk import employees
const bulkImportEmployees = async (employeesData) => {
  try {
    // Transform the data to match API expectations
    const transformedData = employeesData.map(employee => {
      // Remove the 'id' field as it's not needed for import
      const { id, ...employeeWithoutId } = employee;
      
      return transformEmployeeDataForImport(employeeWithoutId);
    });

    console.log('Transformed data for API:', transformedData);

    const response = await API.post('/Employees/Import', transformedData);
    
    notify.success(`Successfully imported ${transformedData.length} employees`);
    return {
      success: true,
      data: response.data,
      count: transformedData.length
    };
  } catch (error) {
    console.error('Bulk import error:', error);
    
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const errorMessage = error.response.data?.message || error.response.data?.error || 'Server error occurred';
      notify.error(`Import failed: ${errorMessage}`);
    } else if (error.request) {
      // Request was made but no response received
      notify.error('Import failed: No response from server. Please check your connection.');
    } else {
      // Something else happened
      notify.error(`Import failed: ${error.message}`);
    }
    
    return {
      success: false,
      error: error.message,
      details: error.response?.data
    };
  }
};

// Validate employee data before import
const validateEmployeeData = (employeesData, requiredFields) => {
  const errors = [];
  const validatedData = [];

  employeesData.forEach((employee, index) => {
    const rowErrors = [];
    
    // Check required fields
    requiredFields.forEach(field => {
      if (!employee[field.key] || employee[field.key].toString().trim() === '') {
        rowErrors.push(`${field.label} is required`);
      }
    });

    // Additional validations
    // if (employee.PersonalEmail && !isValidEmail(employee.PersonalEmail)) {
    //   rowErrors.push('Invalid personal email format');
    // }
    
    // if (employee.WorkEmail && !isValidEmail(employee.WorkEmail)) {
    //   rowErrors.push('Invalid work email format');
    // }

    // if (employee.PhoneNumber && !isValidPhoneNumber(employee.PhoneNumber)) {
    //   rowErrors.push('Invalid phone number format');
    // }

    if (rowErrors.length > 0) {
      errors.push({
        row: index + 1,
        employee: employee.FirstName + ' ' + employee.LastName,
        errors: rowErrors
      });
    } else {
      validatedData.push(employee);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    validatedData
  };
};

// Preview import data (useful for showing user what will be imported)
const previewImportData = (employeesData, maxPreviewRows = 5) => {
  try {
    const transformedData = employeesData.slice(0, maxPreviewRows).map(employee => {
      const { id, ...employeeWithoutId } = employee;
      return transformEmployeeDataForImport(employeeWithoutId);
    });

    return {
      success: true,
      preview: transformedData,
      totalRows: employeesData.length,
      previewRows: transformedData.length
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

const BulkImport = {
  bulkImportEmployees,
  validateEmployeeData,
  previewImportData,
  transformEmployeeDataForImport
};

export default BulkImport;