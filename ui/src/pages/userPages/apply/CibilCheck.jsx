import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Shield, AlertCircle, User, Calendar, Phone, FileText, CheckCircle, TrendingUp, Lock, Zap, Award, ArrowRight } from 'lucide-react';

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
  const [focusedField, setFocusedField] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [cibilScore, setCibilScore] = useState(null);

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

  const calculateScore = (panNumber) => {
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
    else if (!validatePAN(formData.panNumber)) newErrors.panNumber = 'Invalid PAN format (e.g., ABCDE1234F)';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    else if (!validateAge(formData.dateOfBirth)) newErrors.dateOfBirth = 'Age must be between 18-70 years';
    if (!formData.mobileNumber) newErrors.mobileNumber = 'Mobile number is required';
    else if (!validateMobile(formData.mobileNumber)) newErrors.mobileNumber = 'Invalid mobile number (must start with 6-9)';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      try {
        const score = calculateScore(formData.panNumber);
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
    }, 2500);
  };

  const benefits = [
    { icon: Zap, text: 'Instant Results', desc: 'Get score in seconds', color: 'from-[#2D9DB2] to-[#1e7a8c]' },
    { icon: Shield, text: '100% Secure', desc: 'Bank-grade encryption', color: 'from-[#2D9DB2] to-[#1e7a8c]' },
    { icon: TrendingUp, text: 'No Impact', desc: 'Won\'t affect score', color: 'from-[#2D9DB2] to-[#1e7a8c]' },
    { icon: Award, text: 'Always Free', desc: 'No hidden charges', color: 'from-[#2D9DB2] to-[#1e7a8c]' }
  ];

  if (showResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-xl w-full bg-white rounded-2xl shadow-2xl p-6 md:p-8 text-center border border-slate-200">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-[#2D9DB2] to-[#1e7a8c] rounded-full flex items-center justify-center mb-4 shadow-lg">
              <CheckCircle size={32} className="text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3">
              Your CIBIL Score
            </h2>
            <div className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-[#2D9DB2] to-[#1e7a8c] bg-clip-text text-transparent mb-3">
              {cibilScore}
            </div>
            <p className="text-slate-600 text-base">
              {cibilScore >= 750 ? 'Excellent! You qualify for premium credit cards.' : 
               cibilScore >= 650 ? 'Good score! Many credit cards available for you.' : 
               'Fair score. Consider improving for better offers.'}
            </p>
          </div>
          
          <button
            onClick={() => {
              setShowResult(false);
              setFormData({ fullName: '', panNumber: '', dateOfBirth: '', mobileNumber: '' });
              setCibilScore(null);
            }}
            className="w-full bg-gradient-to-r from-[#2D9DB2] to-[#1e7a8c] text-white font-semibold py-3 px-6 rounded-xl hover:shadow-xl transition-all"
          >
            Check Another Score
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#2D9DB2] rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-[#1e7a8c] rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
     
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-center">
          {/* Left Column - Info & Benefits */}
          <div className="space-y-6 order-2 lg:order-1">
            {/* Header */}
            <div className="text-center lg:text-left">
              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-slate-800 mb-3 lg:mb-4 leading-tight">
                Check Your
                <span className="block bg-gradient-to-r from-[#2D9DB2] to-[#1e7a8c] bg-clip-text text-transparent">
                  CIBIL Score
                </span>
              </h2>
              <p className="text-base lg:text-lg text-slate-600 leading-relaxed">
                Get instant access to your credit score and unlock personalized credit card recommendations
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-2 gap-3 lg:gap-4">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div 
                    key={index}
                    className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl p-4 hover:shadow-lg transition-all hover:scale-105 hover:-translate-y-1 group cursor-pointer"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${benefit.color} flex items-center justify-center mb-2 group-hover:rotate-12 transition-transform shadow-md`}>
                      <Icon className="text-white w-5 h-5" />
                    </div>
                    <h3 className="text-slate-800 font-bold text-sm lg:text-base mb-0.5">{benefit.text}</h3>
                    <p className="text-slate-600 text-xs">{benefit.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Security Badge */}
            <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl p-4 lg:p-5 hover:shadow-lg transition-all">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#2D9DB2]/10 rounded-lg">
                  <Lock className="w-5 h-5 lg:w-6 lg:h-6 text-[#2D9DB2]" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base lg:text-lg mb-1 flex items-center gap-2">
                    Bank-Level Security
                    <Shield size={16} className="text-[#2D9DB2]" />
                  </h3>
                  <p className="text-slate-600 text-xs lg:text-sm leading-relaxed">
                    Your data is protected with 256-bit encryption. We never share your information without consent.
                  </p>
                </div>
              </div>
            </div>

            {/* Stats - Hidden on mobile */}
            <div className="hidden lg:grid grid-cols-3 gap-4">
              {[
                { value: '5M+', label: 'Happy Users' },
                { value: '4.8★', label: 'Avg Rating' },
                { value: '100%', label: 'Free Service' }
              ].map((stat, idx) => (
                <div key={idx} className="text-center bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-slate-200 hover:bg-white/80 hover:shadow-lg transition-all">
                  <div className="text-2xl xl:text-3xl font-bold bg-gradient-to-r from-[#2D9DB2] to-[#1e7a8c] bg-clip-text text-transparent mb-1">{stat.value}</div>
                  <div className="text-slate-600 text-xs">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="order-1 lg:order-2">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-5 sm:p-6 lg:p-8 border border-white/50">
              <div className="mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-slate-800 mb-1">Get Started</h2>
                <p className="text-slate-600 text-sm">Fill in your details to check your score</p>
              </div>

              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-2">
                    <User size={14} className="text-[#2D9DB2]" />
                    Full Name (as per PAN)
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    onFocus={() => setFocusedField('fullName')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Enter your full name"
                    className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition-all text-sm font-medium bg-white ${
                      errors.fullName ? 'border-red-400 bg-red-50' : focusedField === 'fullName' ? 'border-[#2D9DB2] shadow-lg' : 'border-slate-300'
                    }`}
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1 font-medium">
                      <AlertCircle size={12} />
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* PAN Number */}
                <div>
                  <label htmlFor="panNumber" className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-2">
                    <FileText size={14} className="text-[#2D9DB2]" />
                    PAN Number
                  </label>
                  <input
                    type="text"
                    id="panNumber"
                    value={formData.panNumber}
                    onChange={(e) => handleInputChange('panNumber', e.target.value)}
                    onFocus={() => setFocusedField('panNumber')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="ABCDE1234F"
                    className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition-all text-sm font-mono font-bold bg-white uppercase ${
                      errors.panNumber ? 'border-red-400 bg-red-50' : focusedField === 'panNumber' ? 'border-[#2D9DB2] shadow-lg' : 'border-slate-300'
                    }`}
                    maxLength={10}
                  />
                  {errors.panNumber && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1 font-medium">
                      <AlertCircle size={12} />
                      {errors.panNumber}
                    </p>
                  )}
                </div>

                {/* Date of Birth & Mobile in Grid */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Date of Birth */}
                  <div>
                    <label htmlFor="dateOfBirth" className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-2">
                      <Calendar size={14} className="text-[#2D9DB2]" />
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      id="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      onFocus={() => setFocusedField('dateOfBirth')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full px-3 py-3 border-2 rounded-xl outline-none transition-all text-sm font-medium bg-white ${
                        errors.dateOfBirth ? 'border-red-400 bg-red-50' : focusedField === 'dateOfBirth' ? 'border-[#2D9DB2] shadow-lg' : 'border-slate-300'
                      }`}
                    />
                    {errors.dateOfBirth && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1 font-medium">
                        <AlertCircle size={10} />
                        {errors.dateOfBirth}
                      </p>
                    )}
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label htmlFor="mobileNumber" className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-2">
                      <Phone size={14} className="text-[#2D9DB2]" />
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      id="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={(e) => handleInputChange('mobileNumber', e.target.value.replace(/\D/g, ''))}
                      onFocus={() => setFocusedField('mobileNumber')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="9876543210"
                      className={`w-full px-3 py-3 border-2 rounded-xl outline-none transition-all text-sm font-mono font-bold bg-white ${
                        errors.mobileNumber ? 'border-red-400 bg-red-50' : focusedField === 'mobileNumber' ? 'border-[#2D9DB2] shadow-lg' : 'border-slate-300'
                      }`}
                      maxLength={10}
                    />
                    {errors.mobileNumber && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1 font-medium">
                        <AlertCircle size={10} />
                        {errors.mobileNumber}
                      </p>
                    )}
                  </div>
                </div>

                {errors.submit && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border-2 border-red-200 rounded-xl">
                    <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                    <p className="text-red-700 font-medium text-sm">{errors.submit}</p>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[#2D9DB2] to-[#1e7a8c] text-white font-bold py-3.5 px-6 rounded-xl hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2 relative z-10">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Analyzing Profile...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 relative z-10">
                      <span>Check My CIBIL Score</span>
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </button>
              </div>

              {/* Privacy Notice */}
              <div className="mt-5 pt-5 border-t border-slate-200">
                <div className="flex items-start gap-2 mb-2">
                  <Shield size={14} className="text-[#2D9DB2] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <span className="font-semibold text-slate-700">100% Safe & Secure.</span> Your information is encrypted and never shared.
                  </p>
                </div>
                <p className="text-xs text-slate-500 text-center leading-relaxed">
                  By continuing, you agree to our Terms & Conditions. Your credit check won't affect your score.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}