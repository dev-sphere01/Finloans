import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import BasicInfo from '@/pages/EmployeeManagement/AddEmployee/tabs/BasicInfo';
import BankDetails from '@/pages/EmployeeManagement/AddEmployee/tabs/BankDetails';
import AcademicDetails from '@/pages/EmployeeManagement/AddEmployee/tabs/Academic & Professional/AcademicDetails';
import Posting from '@/pages/EmployeeManagement/AddEmployee/tabs/Posting';
import ProgressBar from '@/pages/EmployeeManagement/AddEmployee/components/ProgressBar';
import StepNavigation from '@/pages/EmployeeManagement/AddEmployee/components/StepNavigation';
import {
  stepConfig,
  initialFormData,
  calculateCompletion,
  handleInputChange,
  handleDegreeChange,
  addDegree,
  removeDegree,
  nextStep,
  prevStep,
  handleSubmit,
} from '@/pages/EmployeeManagement/AddEmployee/components/addEmployeeLogics';
import notification from '@/services/NotificationService';

// Safe completion calculator
const safeCalculateCompletion = (formData) => {
  if (!formData || typeof formData !== 'object') {
    return 0;
  }

  const safeFormData = {
    ...initialFormData,
    ...formData,
    degrees: Array.isArray(formData.degrees) ? formData.degrees : [{ degree: '', institution: '', yearOfPassing: '', grade: '' }]
  };

  try {
    return calculateCompletion(safeFormData);
  } catch (error) {
    console.error('Error calculating completion:', error);
    return 0;
  }
};

const UpdateEmployee = () => {
  const { id } = useParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData); // Initialize with initialFormData
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [employeeName, setEmployeeName] = useState('');

  // Mock employee data based on ID
  const mockEmployeeData = {
    1: {
      firstName: 'Rajesh',
      middleName: 'Kumar',
      lastName: 'Singh',
      personalEmail: 'rajesh.personal@gmail.com',
      workEmail: 'rajesh.kumar@company.in',
      phoneNumber: '+91-9876543210',
      address: '123 MG Road, Bangalore, Karnataka 560001',
      emergencyContact: 'Sunita Singh',
      emergencyContactNumber: '+91-9876543211',
      dob: '1990-05-15',
      gender: 'Male',
      doj: '2024-01-15',
      profilePicture: null,
      bankName: 'State Bank of India',
      accountNumber: '12345678901',
      ifscCode: 'SBIN0001234',
      branchName: 'MG Road Branch',
      cancelledCheque: null,
      degrees: [
        { degree: 'Bachelor of Technology', institution: 'IIT Bangalore', yearOfPassing: '2012', grade: 'A' }
      ],
      department: 'Engineering',
      position: 'Senior Developer',
      obsStatus: 'pending',
      isActive: false,
    },
    2: {
      firstName: 'Meera',
      middleName: '',
      lastName: 'Singh',
      personalEmail: 'meera.personal@gmail.com',
      workEmail: 'meera.singh@company.in',
      phoneNumber: '+91-9876543220',
      address: '',
      emergencyContact: '',
      emergencyContactNumber: '',
      dob: '1992-08-22',
      gender: 'Female',
      doj: '2024-01-18',
      profilePicture: null,
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      branchName: '',
      cancelledCheque: null,
      degrees: [
        { degree: '', institution: '', yearOfPassing: '', grade: '' }
      ],
      department: 'Marketing',
      position: 'Digital Marketing Specialist',
      obsStatus: 'pending',
      isActive: false,
    },
    3: {
      firstName: 'Arjun',
      middleName: 'Kumar',
      lastName: 'Patel',
      personalEmail: 'arjun.personal@gmail.com',
      workEmail: 'arjun.patel@company.in',
      phoneNumber: '+91-9876543230',
      address: '456 Park Street, Mumbai, Maharashtra 400001',
      emergencyContact: 'Ravi Patel',
      emergencyContactNumber: '+91-9876543231',
      dob: '1993-12-10',
      gender: 'Male',
      doj: '2024-01-12',
      profilePicture: null,
      bankName: 'HDFC Bank',
      accountNumber: '09876543210',
      ifscCode: 'HDFC0001234',
      branchName: 'Park Street Branch',
      cancelledCheque: null,
      degrees: [
        { degree: 'Bachelor of Commerce', institution: 'Mumbai University', yearOfPassing: '2015', grade: 'B+' },
        { degree: 'MBA Finance', institution: 'NMIMS Mumbai', yearOfPassing: '2017', grade: 'A' }
      ],
      department: 'Finance',
      position: 'Junior Analyst',
      obsStatus: 'pending',
      isActive: false,
    }
  };

  // Load employee data
  useEffect(() => {
    const loadEmployeeData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const employee = mockEmployeeData[id];
        if (employee) {
          // Merge with initialFormData to ensure all required fields exist
          setFormData({
            ...initialFormData,
            ...employee
          });
          setEmployeeName(`${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`);
        } else {
          notification().error('Employee not found');
        }
      } catch (error) {
        notification().error('Failed to load employee data');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadEmployeeData();
    }
  }, [id]);

  // Wrapper functions to maintain the same interface while passing required state setters
  const handleInputChangeWrapper = (e) => {
    handleInputChange(e, setFormData, setErrors, errors);
  };

  const handleDegreeChangeWrapper = (index, field, value) => {
    handleDegreeChange(index, field, value, setFormData);
  };

  const addDegreeWrapper = () => {
    addDegree(setFormData);
  };

  const removeDegreeWrapper = (index) => {
    removeDegree(index, formData, setFormData);
  };

  const nextStepWrapper = () => {
    nextStep(currentStep, formData, setErrors, setCurrentStep);
  };

  const prevStepWrapper = () => {
    prevStep(setCurrentStep);
  };

  const handleSubmitWrapper = async (e) => {
    e.preventDefault();

    // Custom submit logic for updates
    if (currentStep < 4) {
      nextStepWrapper();
      return;
    }

    // Final step submission
    setIsSubmitting(true);
    notification().loading('Updating employee profile...');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Employee profile updated:', formData);
      notification().success('Employee profile updated successfully!');
      
    } catch (error) {
      console.error('Update error:', error);
      notification().error('Failed to update employee profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const completionPercentage = safeCalculateCompletion(formData);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-4 text-lg text-gray-600">Loading employee data...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!formData.firstName) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Employee Not Found</h2>
            <p className="text-gray-600 mb-4">The employee with ID {id} could not be found.</p>
            <Link
              to="/dashboard/onboarding"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Onboarding
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/dashboard/onboarding"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Onboarding
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Update Employee Profile: {employeeName}
          </h1>
          <p className="text-gray-600">Complete the employee onboarding process</p>
        </div>

        <ProgressBar completionPercentage={completionPercentage} />
        <StepNavigation stepConfig={stepConfig} currentStep={currentStep} />
        
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-5">
            <form onSubmit={handleSubmitWrapper}>
              {currentStep === 1 && (
                <BasicInfo formData={formData} handleInputChange={handleInputChangeWrapper} errors={errors} />
              )}
              {currentStep === 2 && (
                <BankDetails formData={formData} handleInputChange={handleInputChangeWrapper} errors={errors} />
              )}
              {currentStep === 3 && (
                <AcademicDetails
                  formData={formData}
                  handleDegreeChange={handleDegreeChangeWrapper}
                  addDegree={addDegreeWrapper}
                  removeDegree={removeDegreeWrapper}
                  errors={errors}
                />
              )}
              {currentStep === 4 && (
                <Posting formData={formData} handleInputChange={handleInputChangeWrapper} errors={errors} />
              )}
              <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-200">
                <button
                  type="button"
                  onClick={prevStepWrapper}
                  disabled={currentStep === 1}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${currentStep === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-600 text-white hover:bg-gray-700 hover:scale-105'
                    }`}
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  Previous
                </button>
                {currentStep < 4 ? (
                  <button
                    type="submit"
                    className="px-6 py-3 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-700 hover:scale-105 transition-all duration-200"
                  >
                    Next
                    <i className="fas fa-arrow-right ml-2"></i>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 ${isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 hover:scale-105'
                      }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Updating...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <i className="fas fa-save mr-2"></i>
                        Update Profile
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

export default UpdateEmployee;