// store/employeeStore.js
//for onboarding process
import { create } from 'zustand';

const initialEmployeeData = {
  // Step 1: Basic Info
  firstName: '',
  lastName: '',
  personalEmail: '',
  workEmail: '',
  phoneNumber: '',
  address: '',
  emergencyContact: '',
  emergencyContactNumber: '',
  dob: '',
  gender: '',
  doj: '',
  profilePicture: '',
  
  // Step 2: Posting Data
  department: '',
  position: '',
  location: '',//work location
  type: '',//hourly or fixed
  
  // Step 3: Bank Details
  bankName: '',
  accountNumber: '',
  ifscCode: '',
  branchName: '',
  cancelledCheque: '',
  
  // Step 4: Academic & Professional
  degree: '',
  institution: '',
  yearOfPassing: '',
  grade: '',
  // Professional (all optional)
  previousCompany: '',
  previousPosition: '',
  previousExperience: '',
  previousExperienceCertificate: null,
};

const useEmployeeStore = create((set, get) => ({
  // Employee data
  employeeData: { ...initialEmployeeData },
  
  // Current step
  currentStep: 1,
  
  // Employee ID from API
  empID: null,
  
  // Loading states
  isLoading: false,
  isSubmitting: false,
  
  // Error states
  errors: {},
  
  // Update employee data
  updateEmployeeData: (data) => {
    set((state) => ({
      employeeData: {
        ...state.employeeData,
        ...data
      }
    }));
    
    // Save to localStorage if we have employee name
    const { employeeData } = get();
    if (employeeData.firstName && employeeData.lastName) {
      const employeeName = `${employeeData.firstName} ${employeeData.lastName}`;
      localStorage.setItem('ems_employee_session', JSON.stringify({
        employeeName,
        employeeData: { ...employeeData, ...data },
        currentStep: get().currentStep,
        empID: get().empID
      }));
    }
  },
  
  // Set current step
  setCurrentStep: (step) => {
    set({ currentStep: step });
    
    // Update localStorage
    const session = localStorage.getItem('ems_employee_session');
    if (session) {
      const sessionData = JSON.parse(session);
      sessionData.currentStep = step;
      localStorage.setItem('ems_employee_session', JSON.stringify(sessionData));
    }
  },
  
  // Set employee ID
  setEmployeeId: (empID) => {
    set({ empID });
    
    // Update localStorage
    const session = localStorage.getItem('ems_employee_session');
    if (session) {
      const sessionData = JSON.parse(session);
      sessionData.empID = empID;
      localStorage.setItem('ems_employee_session', JSON.stringify(sessionData));
    }
  },
  
  // Set loading state
  setLoading: (isLoading) => {
    set({ isLoading });
  },
  
  // Set submitting state
  setSubmitting: (isSubmitting) => {
    set({ isSubmitting });
  },
  
  // Set errors
  setErrors: (errors) => {
    set({ errors });
  },
  
  // Clear specific error
  clearError: (fieldName) => {
    set((state) => ({
      errors: {
        ...state.errors,
        [fieldName]: undefined
      }
    }));
  },
  
  // Initialize session (when starting registration)
  initializeSession: () => {
    set({
      employeeData: { ...initialEmployeeData },
      currentStep: 1,
      empID: null,
      errors: {}
    });
  },
  
  // Load existing session
  loadSession: () => {
    const session = localStorage.getItem('ems_employee_session');
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        set({
          employeeData: sessionData.employeeData || { ...initialEmployeeData },
          currentStep: sessionData.currentStep || 1,
          empID: sessionData.empID || null,
          errors: {}
        });
        return true;
      } catch (error) {
        console.error('Failed to load session:', error);
        localStorage.removeItem('ems_employee_session');
      }
    }
    return false;
  },
  
  // Clear session
  clearSession: () => {
    localStorage.removeItem('ems_employee_session');
    set({
      employeeData: { ...initialEmployeeData },
      currentStep: 1,
      empID: null,
      errors: {},
      isLoading: false,
      isSubmitting: false
    });
  },
  
  // Check if session exists
  hasActiveSession: () => {
    return localStorage.getItem('ems_employee_session') !== null;
  },
  
  // Get employee name from session
  getEmployeeName: () => {
    const session = localStorage.getItem('ems_employee_session');
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        return sessionData.employeeName;
      } catch (error) {
        console.error('Failed to get employee name:', error);
      }
    }
    return null;
  }
}));

export default useEmployeeStore;
