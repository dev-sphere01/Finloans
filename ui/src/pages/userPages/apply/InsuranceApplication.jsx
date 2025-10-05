import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, Heart, Car, Home, AlertCircle, User, Calendar, Phone, FileText, CheckCircle, MapPin, DollarSign } from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';

export default function InsuranceApplication() {
  const { insuranceType } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: '',
    panNumber: '',
    dateOfBirth: '',
    mobileNumber: '',
    location: '',
    aadhaarNumber: '',
    currentAddress: '',
    coverageAmount: '',
    nomineeDetails: '',
    // Health insurance specific
    medicalHistory: '',
    // Vehicle insurance specific
    vehicleNumber: '',
    vehicleModel: '',
    vehicleYear: '',
    // Property insurance specific
    propertyType: '',
    propertyValue: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const insuranceTypeNames = {
    'life-insurance': 'Life Insurance',
    'health-insurance': 'Health Insurance',
    'vehicle-insurance': 'Vehicle Insurance',
    'property-insurance': 'Property Insurance'
  };

  const insuranceTypeIcons = {
    'life-insurance': Shield,
    'health-insurance': Heart,
    'vehicle-insurance': Car,
    'property-insurance': Home
  };

  const Icon = insuranceTypeIcons[insuranceType] || Shield;
  const insuranceName = insuranceTypeNames[insuranceType] || 'Insurance';

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
    if (!formData.currentAddress.trim()) newErrors.currentAddress = 'Current address is required';
    if (!formData.coverageAmount) newErrors.coverageAmount = 'Coverage amount is required';
    if (!formData.nomineeDetails.trim()) newErrors.nomineeDetails = 'Nominee details are required';

    // Insurance type specific validation
    if (insuranceType === 'vehicle-insurance') {
      if (!formData.vehicleNumber.trim()) newErrors.vehicleNumber = 'Vehicle number is required';
      if (!formData.vehicleModel.trim()) newErrors.vehicleModel = 'Vehicle model is required';
      if (!formData.vehicleYear) newErrors.vehicleYear = 'Vehicle year is required';
    }
    
    if (insuranceType === 'property-insurance') {
      if (!formData.propertyType.trim()) newErrors.propertyType = 'Property type is required';
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
            serviceType: insuranceType,
            serviceName: insuranceName,
            message: `Your ${insuranceName} application has been submitted successfully. Our team will contact you within 24-48 hours to complete the process.`
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
          { label: 'Insurance', href: '/services/insurance', icon: Shield },
          { label: insuranceName, icon: Icon }
        ]} 
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-[#1e7a8c] to-[#0f4c59] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Icon size={40} className="text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Apply for {insuranceName}
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Protect what matters most with our comprehensive {insuranceName.toLowerCase()} coverage
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

            {/* Location */}
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

            {/* Current Address */}
            <div>
              <label htmlFor="currentAddress" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                <MapPin size={16} />
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

            {/* Insurance Specific Information */}
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Icon size={20} />
                Insurance Details
              </h3>
            </div>

            {/* Coverage Amount and Nominee */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="coverageAmount" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                  <DollarSign size={16} />
                  Coverage Amount (₹) *
                </label>
                <input
                  type="number"
                  id="coverageAmount"
                  value={formData.coverageAmount}
                  onChange={(e) => handleInputChange('coverageAmount', e.target.value)}
                  placeholder="Enter coverage amount"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e7a8c] focus:border-[#1e7a8c] outline-none transition-all text-lg bg-white/80"
                  required
                />
                {errors.coverageAmount && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.coverageAmount}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="nomineeDetails" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                  <User size={16} />
                  Nominee Details *
                </label>
                <input
                  type="text"
                  id="nomineeDetails"
                  value={formData.nomineeDetails}
                  onChange={(e) => handleInputChange('nomineeDetails', e.target.value)}
                  placeholder="Nominee name and relationship"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e7a8c] focus:border-[#1e7a8c] outline-none transition-all text-lg bg-white/80"
                  required
                />
                {errors.nomineeDetails && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.nomineeDetails}
                  </p>
                )}
              </div>
            </div>

            {/* Health Insurance Specific */}
            {insuranceType === 'health-insurance' && (
              <div>
                <label htmlFor="medicalHistory" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                  <Heart size={16} />
                  Medical History (if any)
                </label>
                <textarea
                  id="medicalHistory"
                  value={formData.medicalHistory}
                  onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
                  placeholder="Please mention any pre-existing medical conditions"
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e7a8c] focus:border-[#1e7a8c] outline-none transition-all text-lg bg-white/80 resize-none"
                />
              </div>
            )}

            {/* Vehicle Insurance Specific */}
            {insuranceType === 'vehicle-insurance' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="vehicleNumber" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                    <Car size={16} />
                    Vehicle Number *
                  </label>
                  <input
                    type="text"
                    id="vehicleNumber"
                    value={formData.vehicleNumber}
                    onChange={(e) => handleInputChange('vehicleNumber', e.target.value.toUpperCase())}
                    placeholder="MH01AB1234"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e7a8c] focus:border-[#1e7a8c] outline-none transition-all text-lg bg-white/80"
                    required
                  />
                  {errors.vehicleNumber && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.vehicleNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="vehicleModel" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                    <Car size={16} />
                    Vehicle Model *
                  </label>
                  <input
                    type="text"
                    id="vehicleModel"
                    value={formData.vehicleModel}
                    onChange={(e) => handleInputChange('vehicleModel', e.target.value)}
                    placeholder="e.g., Maruti Swift"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e7a8c] focus:border-[#1e7a8c] outline-none transition-all text-lg bg-white/80"
                    required
                  />
                  {errors.vehicleModel && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.vehicleModel}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="vehicleYear" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                    <Calendar size={16} />
                    Vehicle Year *
                  </label>
                  <input
                    type="number"
                    id="vehicleYear"
                    value={formData.vehicleYear}
                    onChange={(e) => handleInputChange('vehicleYear', e.target.value)}
                    placeholder="2020"
                    min="1990"
                    max={new Date().getFullYear()}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e7a8c] focus:border-[#1e7a8c] outline-none transition-all text-lg bg-white/80"
                    required
                  />
                  {errors.vehicleYear && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.vehicleYear}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Property Insurance Specific */}
            {insuranceType === 'property-insurance' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="propertyType" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                    <Home size={16} />
                    Property Type *
                  </label>
                  <select
                    id="propertyType"
                    value={formData.propertyType}
                    onChange={(e) => handleInputChange('propertyType', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1e7a8c] focus:border-[#1e7a8c] outline-none transition-all text-lg bg-white/80"
                    required
                  >
                    <option value="">Select property type</option>
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="industrial">Industrial</option>
                  </select>
                  {errors.propertyType && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.propertyType}
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
            )}

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