import ExcelImportService from '@/services/ExcelMappingService';
import React, { useState, useCallback, useMemo } from 'react';
import { Download, Upload, Users, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import EmpTemplate from '@/templates/EmpImportTemplate.xlsx'; // excel template file
import { Employees } from '@/services'; // Import the updated service

const ImportEmployees = () => {
  const [myData, setMyData] = useState([]); // data to send in payload
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState(null); // 'success', 'error', 'validationError', null
  const [importResult, setImportResult] = useState(null); // Store import results
  const [validationErrors, setValidationErrors] = useState([]); // Store validation errors

  // Move predefinedFields outside component or use useMemo to prevent recreation
  const predefinedFields = useMemo(() => [
    {
      key: 'FirstName',
      label: 'First Name',
      required: true,
      variations: ['first name', 'firstname', 'first_name', 'fname', 'given name', 'givenname', 'name', 'employee first name', 'emp first name']
    },
    {
      key: 'LastName',
      label: 'Last Name',
      required: false,
      variations: ['last name', 'lastname', 'last_name', 'lname', 'surname', 'family name', 'familyname', 'employee last name', 'emp last name']
    },
    {
      key: 'PersonalEmail',
      label: 'Personal Email',
      required: false,
      variations: ['personalemail', 'personal email', 'personal_email', 'private email', 'privateemail', 'home email', 'homeemail', 'personal e-mail', 'personal mail']
    },
    {
      key: 'WorkEmail',
      label: 'Work Email',
      required: false,
      variations: ['workemail','WorkEmail', 'work email', 'work_email', 'office email', 'officeemail', 'company email', 'companyemail', 'business email', 'businessemail', 'email', 'e-mail', 'mail', 'corporate email', 'official email']
    },
    {
      key: 'PhoneNumber',
      label: 'Phone Number',
      required: false,
      variations: ['phonenumber', 'phone number', 'phone_number', 'phone', 'mobile', 'contact', 'mobile number', 'mobilenumber', 'contact number', 'contactnumber', 'cell', 'cell phone', 'cellphone', 'telephone', 'tel']
    },
    {
      key: 'Address',
      label: 'Address',
      required: false,
      variations: ['address', 'home address', 'homeaddress', 'residential address', 'residentialaddress', 'location', 'street address', 'streetaddress', 'mailing address', 'mailingaddress', 'full address']
    },
    {
      key: 'EmergencyContact',
      label: 'Emergency Contact',
      required: false,
      variations: ['emergencycontact', 'emergency contact', 'emergency_contact', 'emergency contact name', 'emergencycontactname', 'emergency person', 'emergencyperson', 'emergency name', 'emergencyname', 'ice contact', 'icecontact']
    },
    {
      key: 'EmergencyContactNumber',
      label: 'Emergency Contact Number',
      required: false,
      variations: ['emergencycontactnumber', 'emergency contact number', 'emergency_contact_number', 'emergency phone', 'emergencyphone', 'emergency number', 'emergencynumber', 'emergency mobile', 'emergencymobile', 'ice number', 'icenumber', 'emergency tel']
    },
    {
      key: 'DateOfBirth',
      label: 'Date of Birth',
      required: false,
      variations: ['dateofbirth', 'date of birth', 'date_of_birth', 'dob', 'birth date', 'birthdate', 'birth_date', 'born', 'birthday', 'birth day']
    },
    {
      key: 'Gender',
      label: 'Gender',
      required: false,
      variations: ['gender', 'sex']
    },
    {
      key: 'DateOfJoining',
      label: 'Date of Joining',
      required: false,
      variations: ['dateofjoining', 'date of joining', 'date_of_joining', 'doj', 'joining date', 'joiningdate', 'joining_date', 'start date', 'startdate', 'start_date', 'hire date', 'hiredate', 'hire_date', 'employment date', 'employmentdate']
    },
    {
      key: 'OBStatus',
      label: 'Onboarding Status',
      required: false,
      variations: ['obstatus', 'ob status', 'ob_status', 'onboarding status', 'onboardingstatus', 'onboarding_status', 'onboard status', 'onboardstatus', 'onboard_status', 'onboarded']
    },
    {
      key: 'IsActive',
      label: 'Active Status',
      required: false,
      variations: ['isactive', 'is active', 'is_active', 'active', 'status', 'employee status', 'employeestatus', 'employee_status', 'emp status', 'empstatus', 'emp_status', 'active status', 'activestatus', 'active_status']
    },
    {
      key: 'DeptID',
      label: 'Department ID',
      required: false,
      variations: ['deptid', 'dept id', 'dept_id', 'department id', 'departmentid', 'department_id', 'dept', 'department', 'department code', 'departmentcode', 'dept code', 'deptcode', 'division id', 'divisionid']
    },
    {
      key: 'PositionID',
      label: 'Position ID',
      required: false,
      variations: ['positionid', 'position id', 'position_id', 'role id', 'roleid', 'role_id', 'job id', 'jobid', 'job_id', 'position', 'role', 'job', 'title', 'job title', 'jobtitle', 'job_title', 'designation', 'position code', 'positioncode']
    },
    {
      key: 'EmpTypeID',
      label: 'Employee Type',
      required: true,
      variations: ['emptype', 'emp type', 'emp_type', 'employee type', 'employeetype', 'employee_type', 'employment type', 'employmenttype', 'employment_type', 'worker type', 'workertype', 'worker_type', 'type', 'category', 'emp category', 'empcategory']
    },
    {
      key: 'LocationID',
      label: 'Location',
      required: true,
      variations: ['locationId', 'LocationID', 'Location ID', 'Location']
    },
    {
      key: 'AtdEmpCode',
      label: 'Att. Emp Code',
      required: true,
      variations: ['AtdEmpCode','AttendanceEmpCode']
    }
  ], []);

  // Use useCallback to prevent function recreation on every render
  const handleDataChange = useCallback((newData) => {
    setMyData(newData);
    setImportStatus(null); // Reset status when new data is loaded
    setImportResult(null);
    setValidationErrors([]);
    console.log('Received Data:', newData);
  }, []);

  // Use useCallback for file reset handler
  const handleFileReset = useCallback(() => {
    setMyData([]);
    setImportStatus(null);
    setImportResult(null);
    setValidationErrors([]);
    setIsImporting(false);
    console.log('File removed - states cleared');
  }, []);

  // Download template function
  const downloadTemplate = () => {
    //date and time for file name
    const now = new Date();
    const date = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    const time = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS format
    const filename = `Import_Employee_${date}_${time}.xlsx`;

    const link = document.createElement('a');
    link.href = EmpTemplate;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle import function with validation
  const handleImport = async () => {
    if (myData.length === 0) {
      setImportStatus('error');
      setImportResult({ message: 'No data to import. Please upload a file first.' });
      return;
    }

    setIsImporting(true);
    setImportStatus(null);
    setImportResult(null);
    setValidationErrors([]);

    try {
      // Get required fields for validation
      const requiredFields = predefinedFields.filter(field => field.required);
      
      // Validate data before sending to API
      const validation = Employees.validateEmployeeData(myData, requiredFields);
      
      if (!validation.isValid) {
        setImportStatus('validationError');
        setValidationErrors(validation.errors);
        setImportResult({ 
          message: `Validation failed for ${validation.errors.length} records. Please fix the errors and try again.` 
        });
        return;
      }

      console.log('Starting bulk import with data:', myData);
      
      // Call the bulk import API
      const result = await Employees.bulkImportEmployees(myData);
      
      if (result.success) {
        setImportStatus('success');
        setImportResult({
          message: `Successfully imported ${result.count} employees!`,
          count: result.count
        });
        
        // Optionally clear the data after successful import
        // setMyData([]);
      } else {
        setImportStatus('error');
        setImportResult({
          message: result.error || 'Import failed. Please try again.',
          details: result.details
        });
      }
    } catch (error) {
      console.error('Import failed:', error);
      setImportStatus('error');
      setImportResult({
        message: 'An unexpected error occurred during import.',
        details: error.message
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Get required fields for display - use useMemo to prevent recalculation
  const requiredFields = useMemo(() => 
    predefinedFields.filter(field => field.required), 
    [predefinedFields]
  );

  return (
    <div className=" bg-gray-50 p-3">
      <div className="">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Import Employees</h1>
              <p className="text-gray-600">Upload and map your employee data from Excel files</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Excel Import Service - Main Panel */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-2 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-gray-600" />
                  Excel Import Service
                </h2>
              </div>
              <div className="p-1">
                <ExcelImportService
                  predefinedFields={predefinedFields}
                  onDataChange={handleDataChange}
                  onFileReset={handleFileReset}
                  debugMode={false}
                  exportJsonEnabled={false}
                />
              </div>
            </div>

            {/* Validation Errors Display */}
            {importStatus === 'validationError' && validationErrors.length > 0 && (
              <div className="mt-6 bg-white rounded-lg shadow-sm border border-red-200 overflow-hidden">
                <div className="bg-red-50 px-6 py-3 border-b border-red-200">
                  <h3 className="text-lg font-semibold text-red-800 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Validation Errors ({validationErrors.length} records)
                  </h3>
                </div>
                <div className="p-4 max-h-64 overflow-y-auto">
                  {validationErrors.map((error, index) => (
                    <div key={index} className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="font-medium text-red-800 mb-2">
                        Row {error.row}: {error.employee}
                      </div>
                      <ul className="list-disc list-inside text-sm text-red-700">
                        {error.errors.map((err, errIndex) => (
                          <li key={errIndex}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Download Template Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-gray-600" />
                Template
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Download the Excel template with the correct column headers and format.
              </p>
              <button
                onClick={downloadTemplate}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium p-2 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download Template
              </button>
            </div>

            {/* Import Status Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Status</h3>

              {/* Data Count */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Records loaded:</span>
                  <span className="font-semibold text-gray-900">{myData.length}</span>
                </div>
              </div>

              {/* Import Status Messages */}
              {importStatus === 'success' && importResult && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm text-green-700 font-medium">Import Successful!</span>
                  </div>
                  <p className="text-xs text-green-600">{importResult.message}</p>
                </div>
              )}

              {importStatus === 'error' && importResult && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                    <span className="text-sm text-red-700 font-medium">Import Failed</span>
                  </div>
                  <p className="text-xs text-red-600">{importResult.message}</p>
                  {importResult.details && (
                    <details className="mt-2">
                      <summary className="text-xs text-red-500 cursor-pointer">View Details</summary>
                      <pre className="text-xs text-red-500 mt-1 bg-red-100 p-2 rounded overflow-auto">
                        {JSON.stringify(importResult.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {importStatus === 'validationError' && importResult && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <AlertCircle className="w-4 h-4 text-yellow-500 mr-2" />
                    <span className="text-sm text-yellow-700 font-medium">Validation Error</span>
                  </div>
                  <p className="text-xs text-yellow-600">{importResult.message}</p>
                </div>
              )}

              {/* Import Button */}
              <button
                onClick={handleImport}
                disabled={myData.length === 0 || isImporting}
                className={`w-full  font-medium p-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm ${myData.length === 0 || isImporting
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md cursor-pointer'
                  }`}
              >
                {isImporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                    Importing...
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4" />
                    Import Employees ({myData.length})
                  </>
                )}
              </button>

              {myData.length === 0 && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Please upload a file first
                </p>
              )}
            </div>

            {/* Required Fields Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Fields</h3>
              <div className="space-y-2">
                {requiredFields.map((field) => (
                  <div key={field.key} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                    <span className="text-gray-700 font-medium">{field.label}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                All required fields must be present in your Excel file
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportEmployees;