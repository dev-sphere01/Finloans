import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Shield, AlertCircle, User, Calendar, Phone, FileText, CheckCircle } from 'lucide-react';

function calculateSimulatedScore(panNumber) {
  // Simulate score calculation based on PAN number patterns
  const firstLetter = panNumber.charAt(0);
  const lastDigit = parseInt(panNumber.charAt(9));
  const fourthChar = panNumber.charAt(3);
  
  let baseScore = 650;
  
  if (['A', 'B', 'C'].includes(firstLetter)) {
    baseScore += 100;
  } else if (['D', 'E', 'F'].includes(firstLetter)) {
    baseScore += 50;
  } else if (['G', 'H', 'I'].includes(firstLetter)) {
    baseScore += 25;
  }
  
  if (lastDigit % 2 === 0) {
    baseScore += 25;
  }
  
  if (['P', 'L', 'F', 'G'].includes(fourthChar)) {
    baseScore += 50;
  }
  
  const panSum = panNumber.split('').reduce((sum, char) => {
    return sum + (isNaN(char) ? char.charCodeAt(0) : parseInt(char));
  }, 0);
  
  const randomAdjustment = (panSum % 100) - 50;
  baseScore += randomAdjustment;
  
  baseScore = Math.max(300, Math.min(900, baseScore));
  
  return Math.round(baseScore);
}

export default function CibilCheck() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: '',
    panNumber: '',
    dateOfBirth: '',
    mobileNumber: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Validation functions
  const validatePAN = (pan) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
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

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.panNumber) newErrors.panNumber = 'PAN number is required';
    else if (!validatePAN(formData.panNumber)) newErrors.panNumber = 'Invalid PAN format';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    else if (!validateAge(formData.dateOfBirth)) newErrors.dateOfBirth = 'Age must be between 18-70';
    if (!formData.mobileNumber) newErrors.mobileNumber = 'Mobile number is required';
    else if (!validateMobile(formData.mobileNumber)) newErrors.mobileNumber = 'Invalid mobile number format';

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
        const score = calculateSimulatedScore(formData.panNumber);
        navigate('/cibil-score', { 
          state: { 
            ...formData, 
            score,
            isCreditCard: true
          } 
        });
      } catch (error) {
        console.error('Error processing CIBIL check:', error);
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

     
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-[#1e7a8c] to-[#0f4c59] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CreditCard size={40} className="text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Check Your CIBIL Score
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Get your free CIBIL score and discover credit cards you're eligible for
          </p>
        </div>

        {/* CIBIL Check Form */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
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

            {/* PAN Number */}
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

            {/* Date of Birth */}
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

            {/* Mobile Number */}
            <div>
              <label htmlFor="mobileNumber" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                <Phone size={16} />
                Registered Mobile Number *
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
                  Checking CIBIL Score...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  Check CIBIL Score
                  <CheckCircle size={20} />
                </div>
              )}
            </button>
          </form>
        </div>

        {/* Security Notice */}
        <div className="mt-8 bg-white/60 backdrop-blur-sm border border-white/30 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <Shield size={24} className="text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">Your Information is Secure</h3>
              <p className="text-slate-600 text-sm">
                We use bank-level encryption to protect your personal information. Your CIBIL score check is completely free and won't impact your credit score.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}