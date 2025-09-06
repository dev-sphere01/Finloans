import API from '@/services/API';
import { notification } from '@/services';

const notify = notification();

// Search employees with pagination and filters
const getAllEmployees = async (query = null, pageNumber = 1, pageSize = 5, obStatus = null, isActive = null, columnFilters = [], sorting = []) => {
  try {
    // Initialize payload with base parameters only
    const payload = {
      PageNumber: pageNumber,
      PageSize: pageSize
    };

    // Add optional parameters only if they have values
    if (obStatus !== null) payload.OBStatus = obStatus;
    if (isActive !== null) payload.isActive = isActive;

    // Handle global search - ALWAYS goes to Query field only
    if (query && query.trim() !== '') {
      payload.Query = query.trim();
    }

    // Process column filters - each filter maps ONLY to its specific field
    if (columnFilters && columnFilters.length > 0) {
      columnFilters.forEach(filter => {
        const { id, value } = filter;
        if (value && value.trim() !== '') {
          const trimmedValue = value.trim();
          
          switch (id) {
            case 'empID':
              // Employee ID filter overwrites Query field
              payload.Query = trimmedValue;
              break;
            case 'firstName':
              payload.FirstName = trimmedValue;
              break;
            case 'lastName':
              payload.LastName = trimmedValue;
              break;
            case 'email':
              // For email column filter, search in both email fields
              payload.WorkEmail = trimmedValue;
              payload.PersonalEmail = trimmedValue;
              break;
            case 'phoneNumber':
              payload.PhoneNumber = trimmedValue;
              break;
            case 'address':
              payload.Address = trimmedValue;
              break;
            case 'emergencyContact':
              payload.EmergencyContact = trimmedValue;
              break;
            case 'emergencyContactNumber':
              payload.EmergencyContactNumber = trimmedValue;
              break;
            case 'gender':
              payload.Gender = trimmedValue;
              break;
            case 'status':
              // Handle status filter by converting to boolean for isActive
              if (trimmedValue.toLowerCase() === 'active') {
                payload.isActive = true;
              } else if (trimmedValue.toLowerCase() === 'inactive') {
                payload.isActive = false;
              }
              break;
            case 'joinDate':
              // For date filters, add to Query as fallback (overwrites global search)
              payload.Query = trimmedValue;
              break;
            default:
              // For any unhandled column filters, add to Query (overwrites global search)
              payload.Query = trimmedValue;
              break;
          }
        }
      });
    }

    // Handle server-side sorting
    if (sorting && sorting.length > 0) {
      const sortField = sorting[0];
      
      // Map column IDs to API sort field names
      const sortFieldMapping = {
        empID: 'EmpID',
        firstName: 'FirstName',
        lastName: 'LastName',
        email: 'WorkEmail', // Default to WorkEmail for email sorting
        phoneNumber: 'PhoneNumber',
        address: 'Address',
        emergencyContact: 'EmergencyContact',
        emergencyContactNumber: 'EmergencyContactNumber',
        gender: 'Gender',
        status: 'IsActive',
        joinDate: 'DateOfJoining'
      };

      const apiSortField = sortFieldMapping[sortField.id] || sortField.id;
      payload.SortField = apiSortField;
      payload.SortOrder = sortField.desc ? 'desc' : 'asc';
    }

    console.log('=== SEARCH DEBUG ===');
    console.log('Global search query:', query);
    console.log('Column filters:', columnFilters);
    console.log('Sorting:', sorting);
    console.log('Final API payload:', payload);
    console.log('==================');

    const response = await API.post('/Employees/Search', payload);
    return response.data;
  } catch (error) {
    console.error('Employee search error:', error);
    notify.error('Failed to search employees: ' + (error.response?.data?.message || error.message));
    return null;
  }
};

const EmployeeSearch = {
  getAllEmployees,
};

export default EmployeeSearch;