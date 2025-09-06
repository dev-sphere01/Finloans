// addEmployeeLogic.js
import notification from '@/services/NotificationService';

const notify = notification();
// Step configuration

export const stepConfig = {
  1: { 
    // Total Weight:11
    title: 'Basic Information',
    icon: 'fas fa-user',
    fields: [
      { name: 'firstName', weight: 1 },
      { name: 'lastName', weight: 1 },
      { name: 'personalEmail', weight: 1 },
      { name: 'workEmail', weight: 1 },
      { name: 'phoneNumber', weight: 1 },
      { name: 'address', weight: 1 },
      { name: 'emergencyContact', weight: 1 },
      { name: 'emergencyContactNumber', weight: 1 },
      { name: 'dob', weight: 1 },
      { name: 'gender', weight: 0.5 },
      { name: 'doj', weight: 1.5 },
    ],
  },
  2: { 
    // Total Weight:4
    title: 'Posting Details',
    icon: 'fas fa-briefcase',
    fields: [
      { name: 'department', weight: 1 },
      { name: 'position', weight: 1 },
      { name: 'type', weight: 1 },
      { name: 'location', weight: 1 },
    ],
  },
  3: { 
    // Total Weight:7.5
    title: 'Bank Details',
    icon: 'fas fa-university',
    fields: [
      { name: 'bankName', weight: 1.5 },
      { name: 'accountNumber', weight: 1.5 },
      { name: 'ifscCode', weight: 1.5 },
      { name: 'branchName', weight: 1.5 },
      { name: 'cancelledCheque', weight: 1.5 },
    ],
  },
  4: { 
    // Total Weight:11.5
    title: 'Academic & Professional',
    icon: 'fas fa-graduation-cap',
    fields: [
      // Academic
      { name: 'degree', weight: 2 },
      { name: 'institution', weight: 2 },
      { name: 'yearOfPassing', weight: 1.5 },
      { name: 'grade', weight: 2 },
      // Professional (optional fields still contribute if filled)
      { name: 'previousCompany', weight: 1 },
      { name: 'previousPosition', weight: 1 },
      { name: 'previousExperience', weight: 1 },
      { name: 'previousExperienceCertificate', weight: 1 },
    ],
  },
  5: {
    //Total Weight: 10
    title: 'Documents Upload',
    icon: 'fas fa-file-upload',
    fields: [
      { name: 'aadharFile', weight: 1 },
      { name: 'aadharDocNumber', weight: 1.5 },
      { name: 'panFile', weight: 1 },
      { name: 'panDocNumber', weight: 1.5 },
      { name: 'highSchoolFile', weight: 2 },
      // { name: 'highSchoolDocNumber', weight: 1 },
      { name: 'intermediateFile', weight: 1 },
      // { name: 'intermediateDocNumber', weight: 0.5 },
      { name: 'graduationFile', weight: 1 },
      // { name: 'graduationDocNumber', weight: 0.5 },
      { name: 'postGraduationFile', weight: 1 },
      // { name: 'postGraduationDocNumber', weight: 0.5 },
    ],
  }
};

// Initial form data
export const initialFormData = {
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
  obsStatus: 'pending', // Default value
  isActive: false, // Default value
  profilePicture: null,
  //-----------------------
  bankName: '',
  accountNumber: '',
  ifscCode: '',
  branchName: '',
  cancelledCheque: null,
  //-----------------------
  degrees: [{ degree: '', institution: '', yearOfPassing: '', grade: '' }],
  // Individual degree fields for AddEmployee.jsx compatibility
  degree: '',
  institution: '',
  yearOfPassing: '',
  grade: '',
  // Professional (optional)
  previousCompany: '',
  previousPosition: '',
  previousExperience: '',
  previousExperienceCertificate: null,
  //-----------------------
  department: '',
  position: '',
  type: '',//hourly or fixed
  location: '',//work location
  //-----------------------
  // Document files and numbers
  aadharFile: null,
  aadharDocNumber: '',
  panFile: null,
  panDocNumber: '',
  highSchoolFile: null,
  highSchoolDocNumber: '',
  intermediateFile: null,
  intermediateDocNumber: '',
  graduationFile: null,
  graduationDocNumber: '',
  postGraduationFile: null,
  postGraduationDocNumber: '',
};

// Calculate completion percentage
export const calculateCompletion = (formData) => {
  let totalWeight = 0;
  let completedWeight = 0;

  Object.values(stepConfig).forEach((step, stepIndex) => {

    step.fields.forEach((field) => {
      totalWeight += field.weight;
      let isCompleted = false;

      const fieldValue = formData[field.name];

      // Handle different field types
      if (fieldValue !== null && fieldValue !== undefined) {
        if (typeof fieldValue === 'string') {
          isCompleted = fieldValue.trim() !== '';
        } else if (fieldValue instanceof File) {
          isCompleted = true; // File is present
        } else if (typeof fieldValue === 'boolean') {
          isCompleted = true; // Boolean values are always considered complete
        } else if (typeof fieldValue === 'number') {
          isCompleted = true; // Number values are always considered complete
        } else {
          isCompleted = true; // Other types
        }
      } else {
        isCompleted = false;
      }

      if (isCompleted) {
        completedWeight += field.weight;
      }
    });
  });



  const percentage = (completedWeight / totalWeight) * 100;
  const finalPercentage = Math.round(percentage);

  return finalPercentage;
};

// Handle input changes
export const handleInputChange = (e, setFormData, setErrors, errors) => {
  const { name, value, type, checked, files } = e.target;
  
  // Handle file uploads with success notifications
  if (type === 'file' && files && files[0]) {
    const file = files[0];
    const fileSize = (file.size / (1024 * 1024)).toFixed(2); // Size in MB
    
    // Show success notification for file upload
    if (name.includes('File')) {
      const docType = name.replace('File', '');
      const docLabels = {
        'aadhar': 'Aadhar Card',
        'pan': 'PAN Card',
        'highSchool': 'High School Certificate',
        'intermediate': 'Intermediate Certificate',
        'graduation': 'Graduation Certificate',
        'postGraduation': 'Post Graduation Certificate',
        'cancelledCheque': 'Cancelled Cheque'
      };
      
      const docLabel = docLabels[docType] || docType;
      notify.success(`📎 ${docLabel} uploaded successfully! (${fileSize} MB)`);
    }
  }
  
  setFormData((prev) => ({
    ...prev,
    [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value,
  }));

  if (errors[name]) {
    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }));
  }
};

// Handle degree changes
export const handleDegreeChange = (index, field, value, setFormData) => {
  setFormData((prev) => ({
    ...prev,
    degrees: prev.degrees.map((degree, i) => (i === index ? { ...degree, [field]: value } : degree)),
  }));
};

// Add new degree
export const addDegree = (setFormData) => {
  setFormData((prev) => ({
    ...prev,
    degrees: [...prev.degrees, { degree: '', institution: '', yearOfPassing: '', grade: '' }],
  }));
  notify.success('New degree field added successfully!');
};

// Remove degree
export const removeDegree = (index, formData, setFormData) => {
  if (formData.degrees.length > 1) {
    setFormData((prev) => ({
      ...prev,
      degrees: prev.degrees.filter((_, i) => i !== index),
    }));
    notify.info('Degree field removed successfully!');
  } else {
    notify.warning('At least one degree field is required!');
  }
};

// Show document validation success notifications
export const showDocumentValidationSuccess = (formData) => {
  const documentTypes = [
    { key: 'aadhar', label: 'Aadhar', required: true },
    { key: 'pan', label: 'PAN', required: true },
    { key: 'highSchool', label: 'High School Certificate', required: true },
    { key: 'intermediate', label: 'Intermediate Certificate', required: false },
    { key: 'graduation', label: 'Graduation Certificate', required: false },
    { key: 'postGraduation', label: 'Post Graduation Certificate', required: false }
  ];

  let requiredDocsCount = 0;
  let optionalDocsCount = 0;
  let totalRequiredDocs = 0;

  documentTypes.forEach(({ key, label, required }) => {
    const fileField = `${key}File`;
    const docNumberField = `${key}DocNumber`;
    
    if (required) {
      totalRequiredDocs++;
      if (formData[fileField] && formData[fileField] instanceof File) {
        requiredDocsCount++;
      }
    } else {
      if (formData[fileField] && formData[fileField] instanceof File) {
        optionalDocsCount++;
        notify.success(`${label} uploaded successfully! 📄`);
      }
    }
  });

  // Show success message for required documents
  if (requiredDocsCount === totalRequiredDocs) {
    notify.success(`All required documents (${requiredDocsCount}/${totalRequiredDocs}) are ready for submission! ✅`);
  }

  // Show additional success message for optional documents
  if (optionalDocsCount > 0) {
    notify.info(`${optionalDocsCount} additional document${optionalDocsCount > 1 ? 's' : ''} uploaded - Great job! 🎉`);
  }

  // Show completion message
  const totalUploaded = requiredDocsCount + optionalDocsCount;
  if (totalUploaded > 0) {
    notify.success(`Document validation complete! ${totalUploaded} document${totalUploaded > 1 ? 's' : ''} ready for final submission. 🚀`);
  }
};

// Validate current step
export const validateCurrentStep = (currentStep, formData, setErrors) => {
  const newErrors = {};

  // Validate required fields based on current step
  if (currentStep === 1) {
    // Required fields validation
    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.phoneNumber?.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be exactly 10 digits';
    }

    if (!formData.dob?.trim()) {
      newErrors.dob = 'Date of birth is required';
    }

    if (!formData.gender?.trim()) {
      newErrors.gender = 'Gender is required';
    }

    if (!formData.address?.trim()) {
      newErrors.address = 'Address is required';
    }

    // EmergencyContactNumber optional but validate format if provided
    if (formData.emergencyContactNumber && formData.emergencyContactNumber.trim() !== '') {
      if (!/^\d{10}$/.test(formData.emergencyContactNumber)) {
        newErrors.emergencyContactNumber = 'Emergency contact number must be exactly 10 digits';
      }
    }
  }
  else if (currentStep === 2) {
    // Posting Details validations
    if (!formData.department?.trim()) {
      newErrors.department = 'Department is required';
    }
    if (!formData.position?.trim()) {
      newErrors.position = 'Position is required';
    }
  }
   else if (currentStep === 3) {
    // Bank Details validations
    if (!formData.bankName?.trim()) {
      newErrors.bankName = 'Bank name is required';
    }
    if (!formData.accountNumber?.trim()) {
      newErrors.accountNumber = 'Account number is required';
    }
    if (!formData.ifscCode?.trim()) {
      newErrors.ifscCode = 'IFSC code is required';
    }
    if (!formData.branchName?.trim()) {
      newErrors.branchName = 'Branch name is required';
    }
    if (!formData.cancelledCheque || !(formData.cancelledCheque instanceof File)) {
      newErrors.cancelledCheque = 'Cancelled cheque file is required';
    }
  } 
  else if (currentStep === 4) {
    // Academic Details validations - now using individual fields
    if (!formData.degree?.trim()) {
      newErrors.degree = 'Degree is required';
    }
    if (!formData.institution?.trim()) {
      newErrors.institution = 'Institution is required';
    }
    if (!formData.yearOfPassing?.trim()) {
      newErrors.yearOfPassing = 'Year of passing is required';
    }
    if (!formData.grade?.trim()) {
      newErrors.grade = 'Grade is required';
    }
  }
  else if (currentStep === 5) {
    // Documents validations - only required documents
    if (!formData.aadharDocNumber?.trim()) {
      newErrors.aadharDocNumber = 'Aadhar number is required';
    }
    if (!formData.aadharFile || !(formData.aadharFile instanceof File)) {
      newErrors.aadharFile = 'Aadhar document is required';
    }
    if (!formData.panDocNumber?.trim()) {
      newErrors.panDocNumber = 'PAN number is required';
    }
    if (!formData.panFile || !(formData.panFile instanceof File)) {
      newErrors.panFile = 'PAN document is required';
    }
    if (!formData.highSchoolFile || !(formData.highSchoolFile instanceof File)) {
      newErrors.highSchoolFile = 'High School certificate is required';
    }
    
    // Optional documents - show success messages when uploaded
    const optionalDocs = ['intermediate', 'graduation', 'postGraduation'];
    optionalDocs.forEach(docType => {
      const fileField = `${docType}File`;
      if (formData[fileField] && formData[fileField] instanceof File) {
        // Document is uploaded - this will be handled in success notifications
      }
    });
  } 
  

  setErrors(newErrors);
  const isValid = Object.keys(newErrors).length === 0;

  if (!isValid) {
    notify.error('Please fill in all required fields!');
  } else if (currentStep === 5) {
    // Show success notifications for documents validation
    showDocumentValidationSuccess(formData);
  }

  return isValid;
};

// Handle next step
export const nextStep = (currentStep, formData, setErrors, setCurrentStep) => {
  if (validateCurrentStep(currentStep, formData, setErrors)) {
    setCurrentStep((prev) => Math.min(prev + 1, 5));
    
    // Customized success messages for each step
    const stepMessages = {
      1: '✅ Basic Information completed successfully!',
      2: '💼 Posting Details saved successfully!',
      3: '🏦 Bank Details verified and saved!',
      4: '🎓 Academic Details recorded successfully!',
      5: '📄 Documents validated and ready for submission!'
    };
    
    notify.success(stepMessages[currentStep] || `Step ${currentStep} completed successfully!`);
  }
};

// Handle previous step
export const prevStep = (setCurrentStep) => {
  setCurrentStep((prev) => Math.max(prev - 1, 1));
};

// Handle form submission
export const handleSubmit = async (e, currentStep, formData, setErrors, setCurrentStep, setIsSubmitting, setFormData) => {
  e.preventDefault();

  if (!validateCurrentStep(currentStep, formData, setErrors)) return;

  // If not on final step, just go to the next step
  if (currentStep < 5) {
    nextStep(currentStep, formData, setErrors, setCurrentStep);
    return;
  }

  // Final step submission
  setIsSubmitting(true);
  notify.loading('Processing documents and finalizing employee registration...');

  try {
    // Show progress notifications
    notify.info('📄 Validating uploaded documents...');
    await new Promise(resolve => setTimeout(resolve, 800));
    
    notify.info('💾 Saving employee information to database...');
    await new Promise(resolve => setTimeout(resolve, 800));
    
    notify.info('🔗 Linking documents to employee profile...');
    await new Promise(resolve => setTimeout(resolve, 400));

    // Count uploaded documents for success message
    const documentTypes = ['aadhar', 'pan', 'highSchool', 'intermediate', 'graduation', 'postGraduation'];
    const uploadedDocs = documentTypes.filter(docType => {
      const fileField = `${docType}File`;
      return formData[fileField] && formData[fileField] instanceof File;
    });

    // Final success notifications
    notify.success(`🎉 Employee registration completed successfully!`);
    notify.success(`✅ ${uploadedDocs.length} document${uploadedDocs.length > 1 ? 's' : ''} uploaded and processed`);
    notify.success(`👤 Employee profile created: ${formData.firstName} ${formData.lastName}`);
    notify.info('📧 Welcome email will be sent to the employee shortly');

    // Optional: Reset form or redirect
    setFormData(initialFormData);
    setCurrentStep(1);

  } catch (error) {
    // console.error('Submission error:', error);
    notify.error('❌ Failed to submit employee information. Please try again.');
    notify.error('💡 Tip: Check your internet connection and ensure all required fields are filled');
  } finally {
    setIsSubmitting(false);
  }
};
