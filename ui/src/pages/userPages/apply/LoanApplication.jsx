import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Home, Car, Briefcase, AlertCircle, User, Calendar, Phone, FileText, CheckCircle, MapPin, Building, Mail, DollarSign, PiggyBank } from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';

export default function LoanApplication() {
  const { loanType } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: '',
    panNumber: '',
    dateOfBirth: '',
    mobileNumber: '',
    location: '',
    motherName: '',
    aadhaarNumber: '',
    currentAddress: '',
    companyName: '',
    designation: '',
    personalEmail: '',
    netSalary: '',
    // Business loan specific
    firmName: '',
    natureOfBusiness: '',
    annualTurnover: '',
    gstNumber: '',
    // Home loan specific
    propertyLocation: '',
    propertyValue: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const loanTypeNames = {
    'home-loan': 'Home Loan',
    'personal-loan': 'Personal Loan',
    'car-loan': 'Car Loan',
    'business-loan': 'Business Loan'
  };

  const loanTypeIcons = {
    'home-loan': Home,
    'personal-loan': User,
    'car-loan': Car,
    'business-loan': Briefcase
  };

  const Icon = loanTypeIcons[loanType] || User;
  const loanName = loanTypeNames[loanType] || 'Loan';

  // Validation functions
  const validatePAN = (pan) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  };

  const validateAadhaar = (aadhaar) => {
    const aadhaarRegex = /^[0-9]{12}$/;
    return aadhaarRegex.test(aadhaar.replace(/\s/g, ''));
  };

  const validateMobile = (mobile) => {
    const mobileRegex = /^[6-9][0-9]{9}$/;
    return mobileRegex.test(mobile);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age >= 18 && age <= 70;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'panNumber' ? value.toUpperCase() : value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Basic Information validation
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.panNumber) newErrors.panNumber = 'PAN number is required';
    else if (!validatePAN(formData.panNumber)) newErrors.panNumber = 'Invalid PAN format';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    else if (!validateAge(formData.dateOfBirth)) newErrors.dateOfBirth = 'Age must be between 18-70';
    if (!formData.aadhaarNumber) newErrors.aadhaarNumber = 'Aadhaar number is required';
    else if (!validateAadhaar(formData.aadhaarNumber)) newErrors.aadhaarNumber = 'Invalid Aadhaar format';
    if (!formData.mobileNumber) newErrors.mobileNumber = 'Mobile number is required';
    else if (!validateMobile(formData.mobileNumber)) newErrors.mobileNumber = 'Invalid mobile number format';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.motherName.trim()) newErrors.motherName = 'Mother name is required';
    if (!formData.currentAddress.trim()) newErrors.currentAddress = 'Current address is required';

    // Employment/Business Information
    if (loanType === 'business-loan') {
      if (!formData.firmName.trim()) newErrors.firmName = 'Firm/Company name is required';
      if (!formData.natureOfBusiness.trim()) newErrors.natureOfBusiness = 'Nature of business is required';
      if (!formData.annualTurnover) newErrors.annualTurnover = 'Annual turnover is required';
    } else {
      if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
      if (!formData.designation.trim()) newErrors.designation = 'Designation is required';
      if (!formData.netSalary) newErrors.netSalary = 'Net salary is required';
    }
    
    if (!formData.personalEmail.trim()) newErrors.personalEmail = 'Email is required';
    else if (!validateEmail(formData.personalEmail)) newErrors.personalEmail = 'Invalid email format';
    
    // Home loan specific validation
    if (loanType === 'home-loan') {
      if (!formData.propertyLocation.trim()) newErrors.propertyLocation = 'Property location is required';
      if (!formData.propertyValue) newErrors.propertyValue = 'Property value is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      try {
        navigate('/application-success', { 
          state: { 
            ...formData, 
            serviceType: loanType,
            serviceName: loanName,
            message: `Your ${loanName} application has been submitted successfully. Our team will contact you within 24-48 hours.`
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>

      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: 'Services', disabled: true },
          { label: 'Loans', href: '/services/loans', icon: PiggyBank },
          { label: loanName, icon: Icon }
        ]} 
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-[#1e7a8c] to-[#0f4c59] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Icon size={40} className="text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Apply for {loanName}
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Fill in your details to complete your {loanName.toLowerCase()} application. No CIBIL check required.
          </p>
        </div>

        {/* Application Form */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="border-b border-slate-200 pb-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <User size={20} />
                Basic Information
              </h3>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                <User size={16} />
                Full Name (as per PAN) *
              </label>
              <input
                type="text"
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e7a8c] focus:border-[#1e7a8c] outline-none transition-all text-lg bg-white/80"
                required
              />
              {errors.fullName && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* PAN and Date of Birth in grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="panNumber" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                  <FileText size={16} />
                  PAN Number *
                </label>
                <input
                  type="text"
                  id="panNumber"
                  value={formData.panNumber}
                  onChange={(e) => handleInputChange('panNumber', e.target.value)}
                  placeholder="ABCDE1234F"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e7a8c] focus:border-[#1e7a8c] outline-none transition-all text-lg bg-white/80"
                  maxLength={10}
                  required
                />
                {errors.panNumber && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.panNumber}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="dateOfBirth" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                  <Calendar size={16} />
                  Date of Birth *
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e7a8c] focus:border-[#1e7a8c] outline-none transition-all text-lg bg-white/80"
                  required
                />
                {errors.dateOfBirth && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.dateOfBirth}
                  </p>
                )}
              </div>
            </div>

            {/* Mobile and Aadhaar in grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="mobileNumber" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                  <Phone size={16} />
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  id="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={(e) => handleInputChange('mobileNumber', e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e7a8c] focus:border-[#1e7a8c] outline-none transition-all text-lg bg-white/80"
                  maxLength={10}
                  required
                />
                {errors.mobileNumber && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.mobileNumber}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="aadhaarNumber" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                  <FileText size={16} />
                  Aadhaar Number *
                </label>
                <input
                  type="text"
                  id="aadhaarNumber"
                  value={formData.aadhaarNumber}
                  onChange={(e) => handleInputChange('aadhaarNumber', e.target.value.replace(/\D/g, ''))}
                  placeholder="1234 5678 9012"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e7a8c] focus:border-[#1e7a8c] outline-none transition-all text-lg bg-white/80"
                  maxLength={12}
                  required
                />
                {errors.aadhaarNumber && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.aadhaarNumber}
                  </p>
                )}
              </div>
            </div>

            {/* Location and Mother's Name in grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="location" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                  <MapPin size={16} />
                  Current Location *
                </label>
                <input
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="City, State"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e7a8c] focus:border-[#1e7a8c] outline-none transition-all text-lg bg-white/80"
                  required
                />
                {errors.location && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.location}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="motherName" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                  <User size={16} />
                  Mother's Name *
                </label>
                <input
                  type="text"
                  id="motherName"
                  value={formData.motherName}
                  onChange={(e) => handleInputChange('motherName', e.target.value)}
                  placeholder="Enter mother's name"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e7a8c] focus:border-[#1e7a8c] outline-none transition-all text-lg bg-white/80"
                  required
                />
                {errors.motherName && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.motherName}
                  </p>
                )}
              </div>
            </div>

            {/* Current Address */}
            <div>
              <label htmlFor="currentAddress" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                <Building size={16} />
                Current Address *
              </label>
              <textarea
                id="currentAddress"
                value={formData.currentAddress}
                onChange={(e) => handleInputChange('currentAddress', e.target.value)}
                placeholder="Enter your complete current address"
                rows={3}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e7a8c] focus:border-[#1e7a8c] outline-none transition-all text-lg bg-white/80 resize-none"
                required
              />
              {errors.currentAddress && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.currentAddress}
                </p>
              )}
            </div>

            {/* Employment/Business Information Section */}
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Briefcase size={20} />
                {loanType === 'business-loan' ? 'Business Information' : 'Employment Information'}
              </h3>
            </div>

            {loanType === 'business-loan' ? (
              <>
                {/* Business Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firmName" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                      <Building size={16} />
                      Firm/Company Name *
                    </label>
                    <input
                      type="text"
                      id="firmName"
                      value={formData.firmName}
                      onChange={(e) => handleInputChange('firmName', e.target.value)}
                      placeholder="Enter firm/company name"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e7a8c] focus:border-[#1e7a8c] outline-none transition-all text-lg bg-white/80"
                      required
                    />
                    {errors.firmName && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.firmName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="natureOfBusiness" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                      <Briefcase size={16} />
                      Nature of Business *
                    </label>
                    <input
                      type="text"
                      id="natureOfBusiness"
                      value={formData.natureOfBusiness}
                      onChange={(e) => handleInputChange('natureOfBusiness', e.target.value)}
                      placeholder="e.g., Manufacturing, Trading, Services"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e7a8c] focus:border-[#1e7a8c] outline-none transition-all text-lg bg-white/80"
                      required
                    />
                    {errors.natureOfBusiness && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.natureOfBusiness}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="annualTurnover" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                      <DollarSign size={16} />
                      Annual Turnover (₹) *
                    </label>
                    <input
                      type="number"
                      id="annualTurnover"
                      value={formData.annualTurnover}
                      onChange={(e) => handleInputChange('annualTurnover', e.target.value)}
                      placeholder="Enter annual turnover"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e7a8c] focus:border-[#1e7a8c] outline-none transition-all text-lg bg-white/80"
                      required
                    />
                    {errors.annualTurnover && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.annualTurnover}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="gstNumber" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                      <FileText size={16} />
                      GST Number (if applicable)
                    </label>
                    <input
                      type="text"
                      id="gstNumber"
                      value={formData.gstNumber}
                      onChange={(e) => handleInputChange('gstNumber', e.target.value.toUpperCase())}
                      placeholder="Enter GST number"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e7a8c] focus:border-[#1e7a8c] outline-none transition-all text-lg bg-white/80"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Employment Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="companyName" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                      <Building size={16} />
                      Company Name *
                    </label>
                    <input
                      type="text"
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      placeholder="Enter company name"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e7a8c] focus:border-[#1e7a8c] outline-none transition-all text-lg bg-white/80"
                      required
                    />
                    {errors.companyName && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.companyName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="designation" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                      <User size={16} />
                      Designation *
                    </label>
                    <input
                      type="text"
                      id="designation"
                      value={formData.designation}
                      onChange={(e) => handleInputChange('designation', e.target.value)}
                      placeholder="Enter your designation"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e7a8c] focus:border-[#1e7a8c] outline-none transition-all text-lg bg-white/80"
                      required
                    />
                    {errors.designation && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.designation}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="netSalary" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                    <DollarSign size={16} />
                    Monthly Net Salary (₹) *
                  </label>
                  <input
                    type="number"
                    id="netSalary"
                    value={formData.netSalary}
                    onChange={(e) => handleInputChange('netSalary', e.target.value)}
                    placeholder="Enter monthly net salary"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e7a8c] focus:border-[#1e7a8c] outline-none transition-all text-lg bg-white/80"
                    required
                  />
                  {errors.netSalary && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.netSalary}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Home Loan Property Information */}
            {loanType === 'home-loan' && (
              <>
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Home size={20} />
                    Property Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="propertyLocation" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                      <MapPin size={16} />
                      Property Location *
                    </label>
                    <input
                      type="text"
                      id="propertyLocation"
                      value={formData.propertyLocation}
                      onChange={(e) => handleInputChange('propertyLocation', e.target.value)}
                      placeholder="Enter property location"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e7a8c] focus:border-[#1e7a8c] outline-none transition-all text-lg bg-white/80"
                      required
                    />
                    {errors.propertyLocation && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.propertyLocation}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="propertyValue" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                      <DollarSign size={16} />
                      Property Value (₹) *
                    </label>
                    <input
                      type="number"
                      id="propertyValue"
                      value={formData.propertyValue}
                      onChange={(e) => handleInputChange('propertyValue', e.target.value)}
                      placeholder="Enter property value"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e7a8c] focus:border-[#1e7a8c] outline-none transition-all text-lg bg-white/80"
                      required
                    />
                    {errors.propertyValue && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.propertyValue}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label htmlFor="personalEmail" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                <Mail size={16} />
                Email Address *
              </label>
              <input
                type="email"
                id="personalEmail"
                value={formData.personalEmail}
                onChange={(e) => handleInputChange('personalEmail', e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e7a8c] focus:border-[#1e7a8c] outline-none transition-all text-lg bg-white/80"
                required
              />
              {errors.personalEmail && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.personalEmail}
                </p>
              )}
            </div>

            {errors.submit && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
                <p className="text-red-700">{errors.submit}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#1e7a8c] to-[#0f4c59] text-white font-semibold py-4 px-6 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing Application...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  Submit Application
                  <CheckCircle size={20} />
                </div>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}