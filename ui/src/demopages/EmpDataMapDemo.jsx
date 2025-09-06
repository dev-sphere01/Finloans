import React, { useEffect } from 'react';
import useEmpDataStore from '@/store/empDataStore';
import useAuthStore from '@/store/authStore';

const EmpDataMapDemo = () => {
  // Get auth user data
  const { user } = useAuthStore();
  
  // Get employee data store
  const { 
    currentEmployee, 
    fetchEmployeeById, 
    getEmployeeDisplayName,
    loading, 
    error 
  } = useEmpDataStore();

  // Fetch employee data when component mounts
  useEffect(() => {
    if (user?.empId && !currentEmployee) {
      fetchEmployeeById(user.empId);
    }
  }, [user?.empId, currentEmployee, fetchEmployeeById]);

  // Map all employee data fields
  const mappedData = currentEmployee ? {
    // Basic Info
    empId: currentEmployee.EmpID,
    fullName: `${currentEmployee.FirstName} ${currentEmployee.LastName}`,
    firstName: currentEmployee.FirstName,
    lastName: currentEmployee.LastName,
    
    // Contact Info
    workEmail: currentEmployee.WorkEmail,
    personalEmail: currentEmployee.PersonalEmail,
    phoneNumber: currentEmployee.PhoneNumber,
    address: currentEmployee.Address,
    
    // Emergency Contact
    emergencyContact: currentEmployee.EmergencyContact,
    emergencyPhone: currentEmployee.EmergencyContactNumber,
    
    // Personal Details
    dateOfBirth: currentEmployee.DateOfBirth ? new Date(currentEmployee.DateOfBirth).toLocaleDateString() : 'N/A',
    gender: currentEmployee.Gender,
    
    // Employment Details
    dateOfJoining: currentEmployee.DateOfJoining ? new Date(currentEmployee.DateOfJoining).toLocaleDateString() : 'N/A',
    isActive: currentEmployee.IsActive,
    onboardingStatus: currentEmployee.OBStatus,
    roleId: currentEmployee.RoleID,
    
    // Media
    profilePicture: currentEmployee.ProfilePicture,
    signature: currentEmployee.Signature
  } : null;

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Employee Data Demo</h1>
        <div className="flex items-center justify-center h-32">
          <div className="text-lg">Loading employee data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Employee Data Demo</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Employee Data Demo</h1>
      
      {mappedData ? (
        <div className="space-y-6">
          {/* Quick Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-blue-800 mb-2">Quick Info</h2>
            <p className="text-lg"><strong>Name:</strong> {getEmployeeDisplayName()}</p>
            <p><strong>Employee ID:</strong> {mappedData.empId}</p>
            <p><strong>Status:</strong> 
              <span className={`ml-2 px-2 py-1 rounded text-sm ${mappedData.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {mappedData.isActive ? 'Active' : 'Inactive'}
              </span>
            </p>
          </div>

          {/* All Data Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Personal Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Personal Information</h3>
              <div className="space-y-2 text-sm">
                <div><strong>First Name:</strong> {mappedData.firstName}</div>
                <div><strong>Last Name:</strong> {mappedData.lastName}</div>
                <div><strong>Gender:</strong> {mappedData.gender}</div>
                <div><strong>Date of Birth:</strong> {mappedData.dateOfBirth}</div>
                <div><strong>Address:</strong> {mappedData.address}</div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Contact Information</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Work Email:</strong> {mappedData.workEmail}</div>
                <div><strong>Personal Email:</strong> {mappedData.personalEmail}</div>
                <div><strong>Phone Number:</strong> {mappedData.phoneNumber}</div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Emergency Contact</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Contact Name:</strong> {mappedData.emergencyContact}</div>
                <div><strong>Contact Phone:</strong> {mappedData.emergencyPhone}</div>
              </div>
            </div>

            {/* Employment Details */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Employment Details</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Date of Joining:</strong> {mappedData.dateOfJoining}</div>
                <div><strong>Role ID:</strong> {mappedData.roleId}</div>
                <div><strong>Onboarding Status:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${mappedData.onboardingStatus ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {mappedData.onboardingStatus ? 'Completed' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Raw Data (for debugging) */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Raw Employee Data (JSON)</h3>
            <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
              {JSON.stringify(currentEmployee, null, 2)}
            </pre>
          </div>

          {/* Mapped Data (for debugging) */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Mapped Data (JSON)</h3>
            <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
              {JSON.stringify(mappedData, null, 2)}
            </pre>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No employee data available. Please log in first.</p>
        </div>
      )}
    </div>
  );
};

export default EmpDataMapDemo;