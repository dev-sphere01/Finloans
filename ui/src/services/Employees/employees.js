import API from '@/services/API';
import { notification } from '@/services';
import BulkImport from './bulkImport';
import EmployeeSearch from './getAllEmployees';

const notify = notification();

// Helper function to transform data for API (basic operations)
const transformEmployeeData = (employee) => {
  return {
    FirstName: employee.FirstName || '',
    LastName: employee.LastName || '',
    PersonalEmail: employee.PersonalEmail || '',
    WorkEmail: employee.WorkEmail || '',
    PhoneNumber: employee.PhoneNumber || '',
    Address: employee.Address || '',
    EmergencyContact: employee.EmergencyContact || '',
    EmergencyContactNumber: employee.EmergencyContactNumber || '',
    DateOfBirth: employee.DateOfBirth ? new Date(employee.DateOfBirth).toISOString() : null,
    Gender: employee.Gender || '',
    DateOfJoining: employee.DateOfJoining ? new Date(employee.DateOfJoining).toISOString() : null,
    // OBStatus: employee.OBStatus === '1' || employee.OBStatus === true,
    OBStatus: false,
    // IsActive: employee.IsActive === '1' || employee.IsActive === true,
    IsActive:true,
    ProfilePicture: employee.ProfilePicture || '',
    DeptID: parseInt(employee.DeptID) || 0,
    PositionID: parseInt(employee.PositionID) || 0,
    EmpTypeID: parseInt(employee.EmpTypeID) || ''
  };
};

// Get single employee by ID
const getEmployeeById = async (id, forceRefresh = false) => {
  try {
    // Add cache-busting parameter if force refresh is requested
    const url = forceRefresh 
      ? `/Employees/${id}?_t=${Date.now()}` 
      : `/Employees/${id}`;
    const response = await API.get(url);
    return response.data;
  } catch (error) {
    notify.error('Failed to fetch employee: ' + error.message);
    return null;
  }
};

// Create a new employee
// const createEmployee = async (employeeData) => {
//   try {
//     const transformedData = transformEmployeeData(employeeData);
//     const response = await API.post('/Employees', transformedData);
//     notify.success('Employee created successfully');
//     return response.data;
//   } catch (error) {
//     notify.error('Failed to create employee: ' + error.message);
//     return null;
//   }
// };

// Onboarding create - accepts AddEmployee form schema (camelCase) and forwards as-is
const createFromOnboarding = async (formData) => {
  try {
    // Do not transform; AddEmployee constructs the payload as backend expects
    const response = await API.post('/Employees', formData);
    return response.data; // return data only; caller handles notifications
  } catch (error) {
    // Surface the error to caller; keep service quiet to avoid double notifications
    throw error;
  }
};

// Update an employee
const updateEmployee = async (id, updatedData) => {
  try {
    const transformedData = transformEmployeeData(updatedData);
    const response = await API.put(`/Employees/${id}`, transformedData);
    notify.success('Employee updated successfully');
    return response.data;
  } catch (error) {
    notify.error('Failed to update employee: ' + error.message);
    return null;
  }
};

// Update employee profile (for profile page - only specific fields)
const updateEmployeeProfile = async (id, profileData, originalEmployee) => {
  try {
    // Prepare the update payload with only editable fields
    const updatePayload = {
      EmpID: originalEmployee.EmpID,
      FirstName: profileData.FirstName || '',
      LastName: profileData.LastName || '',
      PersonalEmail: profileData.PersonalEmail || '',
      WorkEmail: profileData.WorkEmail || '',
      PhoneNumber: profileData.PhoneNumber || '',
      Address: profileData.Address || '',
      EmergencyContact: profileData.EmergencyContact || '',
      EmergencyContactNumber: profileData.EmergencyContactNumber || '',
      DateOfBirth: profileData.DateOfBirth ? new Date(profileData.DateOfBirth).toISOString() : null,
      Gender: profileData.Gender || '',
      // Keep original values for non-editable fields
      DateOfJoining: originalEmployee.DateOfJoining ? new Date(originalEmployee.DateOfJoining).toISOString() : null,
      OBStatus: originalEmployee.OBStatus || false,
      IsActive: originalEmployee.IsActive || false,
      ProfilePicture: originalEmployee.ProfilePicture || '',
      Signature: originalEmployee.Signature || '',
      RoleID: originalEmployee.RoleID || 0,
      DeptID: originalEmployee.DeptID || 0,
      PositionID: originalEmployee.PositionID || 0,
      EmpTypeID: originalEmployee.EmpTypeID || ''
    };

    const response = await API.put(`/Employees/${id}`, updatePayload);
    notify.success('Profile updated successfully');
    return response.data;
  } catch (error) {
    notify.error('Failed to update profile: ' + error.message);
    return null;
  }
};

// Upload profile picture
const uploadProfilePicture = async (empId, file) => {
  try {
    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('EmpID', empId);
    formData.append('ProfilePicture', file); // Changed from 'file' to 'ProfilePicture'

    const response = await API.post('/Employees/UploadProfilePicture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    notify.success('Profile picture uploaded successfully');
    return response.data;
  } catch (error) {
    notify.error('Failed to upload profile picture: ' + error.message);
    return null;
  }
};

// Delete an employee
const deleteEmployee = async (id) => {
  try {
    await API.delete(`/Employees/${id}`);
    notify.success('Employee deleted successfully');
    return true;
  } catch (error) {
    notify.error('Failed to delete employee: ' + error.message);
    return false;
  }
};

const Employees = {
  // Basic CRUD operations
  getEmployeeById,
  // createEmployee,
  createFromOnboarding, // new service method for AddEmployee flow
  updateEmployee,
  updateEmployeeProfile,
  uploadProfilePicture,
  deleteEmployee,
  
  // Search operations (delegated to EmployeeSearch service)
  getAllEmployees: EmployeeSearch.fetchAllEmployees,
  searchEmployees: EmployeeSearch.searchEmployeesWithFilters,
  advancedSearch: EmployeeSearch.advancedEmployeeSearch,
  getAllEmployeesComplete: EmployeeSearch.fetchAllEmployeesComplete,
  searchByDepartment: EmployeeSearch.searchEmployeesByDepartment,
  searchByStatus: EmployeeSearch.searchEmployeesByStatus,
  
  // Bulk import operations (delegated to BulkImport service)
  bulkImportEmployees: BulkImport.bulkImportEmployees,
  validateEmployeeData: BulkImport.validateEmployeeData,
  previewImportData: BulkImport.previewImportData
};

export default Employees;