import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  DollarSign, Shield, AlertCircle, User, Calendar, Phone, FileText, 
  CheckCircle, MapPin, Building, Mail, Upload, Camera 
} from 'lucide-react';
import notification from '@/services/NotificationService';

const PersonalLoanApplication = () => {
  const { loanType } = useParams();
  const navigate = useNavigate();
  const notify = notification();

  const [formData, setFormData] = useState({
    // Basic Information
    fullName: '',
    panNumber: '',
    dateOfBirth: '',
    location: '',
    motherName: '',
    aadhaarNumber: '',
    currentAddress: '',
    
    // Employment Information
    companyName: '',
    designation: '',
    officialEmail: '',
    personalEmail: '',
    netSalary: '',
    
    // Document uploads
    salarySlips: [],
    bankStatement: null,
    aadhaarPhoto: null,
    panPhoto: null,
    livePhoto: null
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const serviceTypeNames = {
    'personal-loan': 'Personal Loan',
    'car-loan': 'Car Loan'
  };

  // Validation functions
  const validatePAN = (pan) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
  const validateAadhaar = (aadhaar) => /^[0-9]{12}$/.test(aadhaar.replace(/\s/g, ''));
  const validateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 18 && age <= 70;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'panNumber' ? value.toUpperCase() : value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileUpload = (field, files) => {
    if (field === 'salarySlips') {
      const fileArray = Array.from(files).slice(0, 3);
      setFormData(prev => ({ ...prev, [field]: fileArray }));
    } else {
      setFormData(prev => ({ ...prev, [field]: files[0] }));
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateCurrentStep = () => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
      if (!formData.panNumber) newErrors.panNumber = 'PAN number is required';
      else if (!validatePAN(formData.panNumber)) newErrors.panNumber = 'Invalid PAN format';
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
      else if (!validateAge(formData.dateOfBirth)) newErrors.dateOfBirth = 'Age must be between 18-70';
      if (!formData.location.trim()) newErrors.location = 'Location is required';
      if (!formData.motherName.trim()) newErrors.motherName = 'Mother name is required';
      if (!formData.aadhaarNumber) newErrors.aadhaarNumber = 'Aadhaar number is required';
      else if (!validateAadhaar(formData.aadhaarNumber)) newErrors.aadhaarNumber = 'Invalid Aadhaar format';
      if (!formData.currentAddress.trim()) newErrors.currentAddress = 'Current address is required';
    }

    if (currentStep === 2) {
      if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
      if (!formData.designation.trim()) newErrors.designation = 'Designation is required';
      if (!formData.officialEmail.trim()) newErrors.officialEmail = 'Official email is required';
      if (!formData.personalEmail.trim()) newErrors.personalEmail = 'Personal email is required';
      if (!formData.netSalary) newErrors.netSalary = 'Net salary is required';
    }

    if (currentStep === 3) {
      if (formData.salarySlips.length === 0) newErrors.salarySlips = 'Please upload salary slips';
      if (!formData.bankStatement) newErrors.bankStatement = 'Bank statement is required';
      if (!formData.aadhaarPhoto) newErrors.aadhaarPhoto = 'Aadhaar photo is required';
      if (!formData.panPhoto) newErrors.panPhoto = 'PAN photo is required';
      if (!formData.livePhoto) newErrors.livePhoto = 'Live photo is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsLoading(true);

    setTimeout(() => {
      try {
        navigate('/application-success', { 
          state: { 
            ...formData, 
            serviceType: loanType,
            serviceName: serviceTypeNames[loanType] || 'Personal Loan',
            message: `Your ${serviceTypeNames[loanType] || 'loan'} application has been submitted successfully. Our team will contact you within 24-48 hours.`
          } 
        });
      } catch (error) {
        console.error('Error processing application:', error);
        setErrors({ submit: 'Unable to process your request. Please try again.' });
      } finally {
        setIsLoading(false);
      }
    }, 2000);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                  <User size={16} />
                  Full Name (as per PAN) *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e7a8c] focus:border-[#1e7a8c] outline-none transition-all bg-white/80"
                />
                {errors.fullName && <p className="mt-2 text-sm text-red-600">{errors.fullName}</p>}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                  <FileText size={16} />
                  PAN Number *
                </label>
                <input
                  type="text"
                  value={formData.panNumber}
                  onChange={(e) => handleInputChange('panNumber', e.target.value)}
                  placeholder="ABCDE1234F"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e7a8c] focus:border-[#1e7a8c] outline-none transition-all bg-white/80"
                  maxLength={10}
                />
                {errors.panNumber && <p className="mt-2 text-sm text-red-600">{errors.panNumber}</p>}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                  <Calendar size={16} />
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e7a8c] focus:border-[#1e7a8c] outline-none transition-all bg-white/80"
                />
                {errors.dateOfBirth && <p className="mt-2 text-sm text-red-600">{errors.dateOfBirth}</p>}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                  <MapPin size={16} />
                  Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="City, State"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e7a8c] focus:border-[#1e7a8c] outline-none transition-all bg-white/80"
                />
                {errors.location && <p className="mt-2 text-sm text-red-600">{errors.location}</p>}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                  <User size={16} />
                  Mother's Name *
                </label>
                <input
                  type="text"
                  value={formData.motherName}
                  onChange={(e) => handleInputChange('motherName', e.target.value)}
                  placeholder="Mother's full name"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e7a8c] focus:border-[#1e7a8c] outline-none transition-all bg-white/80"
                />
                {errors.motherName && <p className="mt-2 text-sm text-red-600">{errors.motherName}</p>}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                  <Shield size={16} />
                  Aadhaar Number *
                </label>
                <input
                  type="text"
                  value={formData.aadhaarNumber}
                  onChange={(e) => handleInputChange('aadhaarNumber', e.target.value.replace(/\D/g, ''))}
                  placeholder="1234 5678 9012"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e7a8c] focus:border-[#1e7a8c] outline-none transition-all bg-white/80"
                  maxLength={12}
                />
                {errors.aadhaarNumber && <p className="mt-2 text-sm text-red-600">{errors.aadhaarNumber}</p>}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                <MapPin size={16} />
                Current Address *
              </label>
              <textarea
                value={formData.currentAddress}
                onChange={(e) => handleInputChange('currentAddress', e.target.value)}
                placeholder="Enter your complete current address"
                rows={3}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e7a8c] focus:border-[#1e7a8c] outline-none transition-all bg-white/80"
              />
              {errors.currentAddress && <p className="mt-2 text-sm text-red-600">{errors.currentAddress}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Employment Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                  <Building size={16} />
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Your company name"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e7a8c] focus:border-[#1e7a8c] outline-none transition-all bg-white/80"
                />
                {errors.companyName && <p className="mt-2 text-sm text-red-600">{errors.companyName}</p>}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                  <User size={16} />
                  Designation *
                </label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => handleInputChange('designation', e.target.value)}
                  placeholder="Your job title"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e7a8c] focus:border-[#1e7a8c] outline-none transition-all bg-white/80"
                />
                {errors.designation && <p className="mt-2 text-sm text-red-600">{errors.designation}</p>}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                  <Mail size={16} />
                  Official Email ID *
                </label>
                <input
                  type="email"
                  value={formData.officialEmail}
                  onChange={(e) => handleInputChange('officialEmail', e.target.value)}
                  placeholder="your.name@company.com"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e7a8c] focus:border-[#1e7a8c] outline-none transition-all bg-white/80"
                />
                {errors.officialEmail && <p className="mt-2 text-sm text-red-600">{errors.officialEmail}</p>}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                  <Mail size={16} />
                  Personal Email ID *
                </label>
                <input
                  type="email"
                  value={formData.personalEmail}
                  onChange={(e) => handleInputChange('personalEmail', e.target.value)}
                  placeholder="your.personal@email.com"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e7a8c] focus:border-[#1e7a8c] outline-none transition-all bg-white/80"
                />
                {errors.personalEmail && <p className="mt-2 text-sm text-red-600">{errors.personalEmail}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                  <DollarSign size={16} />
                  Net Salary (Monthly) *
                </label>
                <input
                  type="number"
                  value={formData.netSalary}
                  onChange={(e) => handleInputChange('netSalary', e.target.value)}
                  placeholder="Enter your monthly net salary"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e7a8c] focus:border-[#1e7a8c] outline-none transition-all bg-white/80"
                />
                {errors.netSalary && <p className="mt-2 text-sm text-red-600">{errors.netSalary}</p>}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Document Upload</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                  <Upload size={16} />
                  3 Salary Slips (PDF) *
                </label>
                <input
                  type="file"
                  multiple
                  accept=".pdf"
                  onChange={(e) => handleFileUpload('salarySlips', e.target.files)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e7a8c] focus:border-[#1e7a8c] outline-none transition-all bg-white/80"
                />
                {errors.salarySlips && <p className="mt-2 text-sm text-red-600">{errors.salarySlips}</p>}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                  <Upload size={16} />
                  6 Month Bank Statement (PDF) *
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileUpload('bankStatement', e.target.files)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e7a8c] focus:border-[#1e7a8c] outline-none transition-all bg-white/80"
                />
                {errors.bankStatement && <p className="mt-2 text-sm text-red-600">{errors.bankStatement}</p>}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                  <Camera size={16} />
                  Aadhaar Photo *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload('aadhaarPhoto', e.target.files)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e7a8c] focus:border-[#1e7a8c] outline-none transition-all bg-white/80"
                />
                {errors.aadhaarPhoto && <p className="mt-2 text-sm text-red-600">{errors.aadhaarPhoto}</p>}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                  <Camera size={16} />
                  PAN Photo *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload('panPhoto', e.target.files)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e7a8c] focus:border-[#1e7a8c] outline-none transition-all bg-white/80"
                />
                {errors.panPhoto && <p className="mt-2 text-sm text-red-600">{errors.panPhoto}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                  <Camera size={16} />
                  Live Photo *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload('livePhoto', e.target.files)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e7a8c] focus:border-[#1e7a8c] outline-none transition-all bg-white/80"
                />
                {errors.livePhoto && <p className="mt-2 text-sm text-red-600">{errors.livePhoto}</p>}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>

      

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-[#1e7a8c] to-[#0f4c59] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <DollarSign size={40} className="text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Apply for {serviceTypeNames[loanType] || 'Personal Loan'}
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Complete your application. No CIBIL check required.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
            <span className={currentStep >= 1 ? 'text-[#1e7a8c] font-medium' : ''}>Basic Info</span>
            <span className={currentStep >= 2 ? 'text-[#1e7a8c] font-medium' : ''}>Employment</span>
            <span className={currentStep >= 3 ? 'text-[#1e7a8c] font-medium' : ''}>Documents</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-[#1e7a8c] to-[#0f4c59] h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/20">
          {renderStep()}

          {errors.submit && (
            <div className="mt-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
              <p className="text-red-700">{errors.submit}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {currentStep < 3 ? (
              <button
                onClick={nextStep}
                className="px-6 py-3 bg-gradient-to-r from-[#1e7a8c] to-[#0f4c59] text-white rounded-xl hover:shadow-lg transition-all"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-[#1e7a8c] to-[#0f4c59] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing Application...
                  </>
                ) : (
                  <>
                    Submit Application
                    <CheckCircle size={20} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalLoanApplication;