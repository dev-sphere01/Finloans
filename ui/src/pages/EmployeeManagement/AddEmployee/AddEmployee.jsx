import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BasicInfo from './tabs/BasicInfo';
import BankDetails from './tabs/BankDetails';
import AcademicDetails from './tabs/Academic & Professional/AcademicDetails';
import Posting from './tabs/Posting';
import Documents from './tabs/Documents';
import StepNavigation from './components/StepNavigation';
import useEmployeeStore from '@/store/employeeStore';
import notification from '@/services/NotificationService';
import ProgressBar from './components/ProgressBar';
import { calculateCompletion } from './components/addEmployeeLogics';
import Employees from '@/services/Employees/employees';

//API service
import API from '@/services/API';
import { addOrUpdateProfessionalDetail } from '@/services/Employees/empProfileDetails';


// Step configuration for the 4-step workflow
const stepConfig = {
  1: {
    title: 'Basic Information',
    icon: 'fas fa-user',
  },
  2: {
    title: 'Posting Details',
    icon: 'fas fa-briefcase',
  },
  3: {
    title: 'Bank Details',
    icon: 'fas fa-university',
  },
  4: {
    title: 'Academic & Professional',
    icon: 'fas fa-graduation-cap',
  },
  5:{
    title: 'Documents Upload',
    icon: 'fas fa-file',
  }
};

const AddEmployee = () => {
  const navigate = useNavigate();
  const notify = notification();

  // Zustand store
  const {
    employeeData,
    currentStep,
    empID,
    errors,
    isSubmitting,
    updateEmployeeData,
    setCurrentStep,
    setErrors,
    setSubmitting,
    setEmployeeId,
    clearError,
    loadSession,
    initializeSession
  } = useEmployeeStore();

  // Initialize or load session on component mount
  useEffect(() => {
    const sessionLoaded = loadSession();
    if (!sessionLoaded) {
      initializeSession();
    }
  }, [loadSession, initializeSession]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    let fieldValue;

    if (type === 'checkbox') {
      fieldValue = checked;
    } else if (type === 'file') {
      // For file inputs, store the actual file object
      fieldValue = files && files[0] ? files[0] : null;
      console.log(`File input ${name}:`, fieldValue);
    } else {
      fieldValue = value;
    }

    console.log(`Input change - ${name}:`, fieldValue, `(type: ${typeof fieldValue})`);
    updateEmployeeData({ [name]: fieldValue });

    // Clear error for this field
    if (errors[name]) {
      clearError(name);
    }
  };

  // Calculate completion percentage
  const completionPercentage = calculateCompletion(employeeData);

  // Validate current step
  const validateCurrentStep = () => {
    const newErrors = {};

    switch (currentStep) {
      case 1:
        if (!employeeData.firstName?.trim()) newErrors.firstName = 'First name is required';
        // if (!employeeData.lastName?.trim()) newErrors.lastName = 'Last name is required';
        // if (!employeeData.personalEmail?.trim()) newErrors.personalEmail = 'Personal email is required';
        // if (!employeeData.workEmail?.trim()) newErrors.workEmail = 'Work email is required';
        if (!employeeData.phoneNumber?.trim()) newErrors.phoneNumber = 'Phone number is required';
        if (!employeeData.address?.trim()) newErrors.address = 'Address is required';
        // if (!employeeData.emergencyContact?.trim()) newErrors.emergencyContact = 'Emergency contact is required';
        // if (!employeeData.emergencyContactNumber?.trim()) newErrors.emergencyContactNumber = 'Emergency contact number is required';
        if (!employeeData.dob?.trim()) newErrors.dob = 'Date of birth is required';
        if (!employeeData.gender?.trim()) newErrors.gender = 'Gender is required';
        break;
      case 2:
        if (!employeeData.department?.trim()) newErrors.department = 'Department is required';
        if (!employeeData.position?.trim()) newErrors.position = 'Position is required';
        break;
      case 3:
        if (!employeeData.bankName?.trim()) newErrors.bankName = 'Bank name is required';
        if (!employeeData.accountNumber?.trim()) newErrors.accountNumber = 'Account number is required';
        if (!employeeData.ifscCode?.trim()) newErrors.ifscCode = 'IFSC code is required';
        if (!employeeData.branchName?.trim()) newErrors.branchName = 'Branch name is required';
        // if (!employeeData.cancelledCheque || !(employeeData.cancelledCheque instanceof File)) {
        //   newErrors.cancelledCheque = 'Cancelled cheque file is required';
        // }
        break;
      case 4:
        if (!employeeData.degree?.trim()) newErrors.degree = 'Degree is required';
        if (!employeeData.institution?.trim()) newErrors.institution = 'Institution is required';
        if (!employeeData.yearOfPassing?.trim()) newErrors.yearOfPassing = 'Year of passing is required';
        if (!employeeData.grade?.trim()) newErrors.grade = 'Grade is required';
        break;
      case 5:
        // Documents validation - only required documents
        if (!employeeData.aadharDocNumber?.trim()) newErrors.aadharDocNumber = 'Aadhar number is required';
        if (!employeeData.aadharFile || !(employeeData.aadharFile instanceof File)) {
          newErrors.aadharFile = 'Aadhar document is required';
        }
        // if (!employeeData.highSchoolDocNumber?.trim()) newErrors.highSchoolDocNumber = 'High School certificate number is required';
        // if (!employeeData.highSchoolFile || !(employeeData.highSchoolFile instanceof File)) {
        //   newErrors.highSchoolFile = 'High School certificate is required';
        // }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // API call for Step 2 - Create Employee
  const createEmployee = async () => {
    try {
      setSubmitting(true);
      notify.loading('Creating employee...');

      const requestData = {
        firstName: employeeData.firstName,
        lastName: employeeData.lastName,
        personalEmail: employeeData.personalEmail,
        workEmail: employeeData.workEmail,
        phoneNumber: employeeData.phoneNumber,
        address: employeeData.address,
        emergencyContact: employeeData.emergencyContact,
        emergencyContactNumber: employeeData.emergencyContactNumber,
        dateOfBirth: employeeData.dob,
        gender: employeeData.gender,
        dateOfJoining: employeeData.doj || new Date().toISOString(),
        obStatus: false, // pending
        isActive: true, // false
        profilePicture: employeeData.profilePicture || '',
        deptID: parseInt(employeeData.department) || null,
        positionID: parseInt(employeeData.position) || null,
        EmpTypeID: parseInt(employeeData.type) || null,
        LocationID: parseInt(employeeData.location) || null,
        RoleID:2//default role id added - 1 for admin and 2 for employee
      };

      const data = await Employees.createFromOnboarding(requestData);

      // Check for both EmpID (PascalCase) and empID (camelCase) due to JSON serialization
      const employeeId = data?.empID || data?.EmpID;

      if (data && employeeId) {
        setEmployeeId(employeeId);
        notify.success('Employee created successfully. Proceeding to bank details...');
        return true;
      } else {
        console.error('Employee ID not found in response. Available properties:', Object.keys(response.data || {}));
        throw new Error('Employee ID not received from server');
      }
    } catch (error) {
      console.error('Error creating employee:', error);
      notify.error(error.response?.data?.message || 'Failed to create employee. Please try again.');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  // API call for Step 3 - Save Bank Details only
  const saveBankDetails = async () => {
    try {
      setSubmitting(true);
      notify.loading('Saving bank details...');

      // Create FormData for bank details (multipart)
      const bankFormData = new FormData();
      bankFormData.append('EmpID', empID);
      bankFormData.append('BankName', employeeData.bankName || '');
      bankFormData.append('AccountNumber', employeeData.accountNumber || '');
      bankFormData.append('IFSCCode', employeeData.ifscCode || '');
      bankFormData.append('BranchName', employeeData.branchName || '');
      
      // Append the file if it exists
      if (employeeData.cancelledCheque && employeeData.cancelledCheque instanceof File) {
        bankFormData.append('CancelledCheque', employeeData.cancelledCheque);
      }

      // Send multipart form data
      await API.post('/EmpBankDetails', bankFormData);
      notify.success('Bank details saved successfully');
      return true;
    } catch (error) {
      console.error('Error saving bank details:', error);
      notify.error(error.response?.data?.message || 'Failed to save bank details. Please try again.');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  // API call for Step 4 - Save Academic & Professional Details
  const saveAcademicDetails = async () => {
    try {
      setSubmitting(true);
      notify.loading('Saving academic & professional details...');

      // Academic (JSON)
      const acadPayload = {
        EmpID: empID,
        Degree: employeeData.degree,
        Institution: employeeData.institution,
        YearOfPassing: employeeData.yearOfPassing,
        Grade: employeeData.grade,
      };

      // Professional (multipart) - optional fields and optional certificate
      const hasAnyProfessionalField = [
        employeeData.previousCompany,
        employeeData.previousPosition,
        employeeData.previousExperience,
        employeeData.previousExperienceCertificate,
      ].some(v => !!v && (v instanceof File ? true : String(v).trim() !== ''));

      const requests = [];
      requests.push(API.post('/EmpAcadDetails', acadPayload));

      if (hasAnyProfessionalField) {
        const profPayload = {
          PreviousCompany: employeeData.previousCompany || '',
          PreviousPosition: employeeData.previousPosition || '',
          PreviousExperience: employeeData.previousExperience || '',
        };
        const certFile = employeeData.previousExperienceCertificate || null;
        // Use service to post multipart
        requests.push(addOrUpdateProfessionalDetail(empID, profPayload, certFile));
      }

      await Promise.all(requests);
      notify.success('Academic & professional details saved successfully. Proceeding to documents upload...');
      return true;
    } catch (error) {
      console.error('Error saving academic/professional details:', error);
      notify.error(error.response?.data?.message || 'Failed to save academic/professional details. Please try again.');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  // API call for Step 5 - Upload Documents
  const uploadDocuments = async () => {
    try {
      setSubmitting(true);
      notify.loading('Uploading documents...');

      const documentTypes = [
        { key: 'aadhar', label: 'Aadhar' },
        { key: 'pan', label: 'PAN' },
        { key: 'highSchool', label: 'High School(10th)' },
        { key: 'intermediate', label: 'Intermediate(12th)' },
        { key: 'graduation', label: 'Graduation' },
        { key: 'postGraduation', label: 'Post Graduation' }
      ];

      const uploadPromises = [];

      for (const docType of documentTypes) {
        const fileField = `${docType.key}File`;
        const docNumberField = `${docType.key}DocNumber`;
        
        const file = employeeData[fileField];
        const docNumber = employeeData[docNumberField];

        if (file && file instanceof File && docNumber?.trim()) {
          const formData = new FormData();
          formData.append('EmpId', empID);
          formData.append('DocName', docType.label);
          formData.append('DocIDNumber', docNumber.trim());
          formData.append('DocFile', file);

          uploadPromises.push(
            API.post('/EmpDocs', formData).catch(error => {
              console.error(`Error uploading ${docType.label}:`, error);
              throw new Error(`Failed to upload ${docType.label}: ${error.response?.data?.message || error.message}`);
            })
          );
        }
      }

      if (uploadPromises.length === 0) {
        throw new Error('No documents to upload');
      }

      await Promise.all(uploadPromises);
      notify.success('Employee registration completed successfully!');

      // Clear session and redirect
      const { clearSession } = useEmployeeStore.getState();
      clearSession();
      navigate('/dashboard/all-employees');
      return true;
    } catch (error) {
      console.error('Error uploading documents:', error);
      notify.error(error.message || 'Failed to upload documents. Please try again.');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateCurrentStep()) {
      return;
    }

    switch (currentStep) {
      case 1:
        // Step 1: Save basic info and move to step 2
        notify.success('Basic information saved successfully');
        setCurrentStep(2);
        break;
      case 2:
        // Step 2: Create employee via API
        const employeeCreated = await createEmployee();
        if (employeeCreated) {
          setCurrentStep(3);
        }
        break;
      case 3:
        // Step 3: Save bank details via API
        const bankDetailsSaved = await saveBankDetails();
        if (bankDetailsSaved) {
          setCurrentStep(4);
        }
        break;
      case 4:
        // Step 4: Save academic details
        const academicDetailsSaved = await saveAcademicDetails();
        if (academicDetailsSaved) {
          setCurrentStep(5);
        }
        break;
      case 5:
        // Step 5: Upload documents and complete registration
        await uploadDocuments();
        break;
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className=" rounded-lg bg-gradient-to-br from-slate-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="">
        {/* Progress indicator */}
        <div className="mb-2 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Employee Onboarding</h2>
          {/* <Link to="/dashboard/import-employees" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors">
            <i className="fas fa-arrow-left mr-2"></i>
            Bulk Import Employees
          </Link> */}
        </div>
        <ProgressBar completionPercentage={completionPercentage} />


        <StepNavigation stepConfig={stepConfig} currentStep={currentStep} />

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-5">
            <form onSubmit={handleSubmit}>
              {currentStep === 1 && (
                <BasicInfo
                  formData={employeeData}
                  handleInputChange={handleInputChange}
                  errors={errors}
                />
              )}
              {currentStep === 2 && (
                <Posting
                  formData={employeeData}
                  handleInputChange={handleInputChange}
                  errors={errors}
                />
              )}
              {currentStep === 3 && (
                <BankDetails
                  formData={employeeData}
                  handleInputChange={handleInputChange}
                  errors={errors}
                />
              )}
              {currentStep === 4 && (
                <AcademicDetails
                  formData={employeeData}
                  handleInputChange={handleInputChange}
                  errors={errors}
                />
              )}
              {currentStep === 5 && (
                <Documents
                  formData={employeeData}
                  handleInputChange={handleInputChange}
                  errors={errors}
                  employeeId={empID}
                />
              )}

              <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${currentStep === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-600 text-white hover:bg-gray-700 hover:scale-105'
                    }`}
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  Previous
                </button>

                {currentStep < 5 ? (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${isSubmitting
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-slate-600 text-white hover:bg-slate-700 hover:scale-105'
                      }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        Next
                        <i className="fas fa-arrow-right ml-2"></i>
                      </span>
                    )}
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${isSubmitting
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700 hover:scale-105'
                      }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Uploading Documents...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <i className="fas fa-check mr-2"></i>
                        Complete Registration
                      </span>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEmployee;