import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    Shield, Heart, Car, Home, AlertCircle, User, Calendar, Phone, FileText,
    CheckCircle, MapPin, DollarSign, CreditCard, Building, Briefcase
} from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';

export default function UnifiedApplicationForm({ service }) {
    const { serviceType, subType } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Get data passed from previous page (like CIBIL score page)
    const passedData = location.state || {};
    const selectedCard = passedData.selectedCard;

    const [formData, setFormData] = useState({
        // Basic Information
        fullName: passedData.fullName || '',
        panNumber: '',
        dateOfBirth: '',
        mobileNumber: '',
        location: '',
        aadhaarNumber: '',
        currentAddress: '',

        // Credit Card specific
        monthlyIncome: '',
        employmentType: '',
        companyName: '',
        workExperience: '',

        // Insurance specific
        coverageAmount: '',
        nomineeDetails: '',
        medicalHistory: '',

        // Vehicle insurance specific
        vehicleNumber: '',
        vehicleModel: '',
        vehicleYear: '',

        // Property insurance specific
        propertyType: '',
        propertyValue: '',

        // Loan specific
        loanAmount: '',
        loanPurpose: '',
        collateral: '',

        // Business loan specific
        businessType: '',
        businessAge: '',
        annualTurnover: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Service configurations
    const serviceConfigs = {
        'credit-card': {
            name: selectedCard ? selectedCard.name : 'Credit Card',
            icon: CreditCard,
            breadcrumb: 'Credit Cards',
            description: selectedCard ? `Apply for ${selectedCard.name} credit card` : 'Apply for a credit card with competitive rates and rewards'
        },
        'insurance': {
            name: getInsuranceName(subType),
            icon: getInsuranceIcon(subType),
            breadcrumb: 'Insurance',
            description: `Protect what matters most with our comprehensive ${getInsuranceName(subType).toLowerCase()} coverage`
        },
        'loan': {
            name: getLoanName(subType),
            icon: getLoanIcon(subType),
            breadcrumb: 'Loans',
            description: `Get the financial support you need with our ${getLoanName(subType).toLowerCase()}`
        }
    };

    function getInsuranceName(type) {
        const names = {
            'life': 'Life Insurance',
            'health': 'Health Insurance',
            'vehicle': 'Vehicle Insurance',
            'property': 'Property Insurance'
        };
        return names[type] || 'Insurance';
    }

    function getInsuranceIcon(type) {
        const icons = {
            'life': Shield,
            'health': Heart,
            'vehicle': Car,
            'property': Home
        };
        return icons[type] || Shield;
    }

    function getLoanName(type) {
        const names = {
            'personal': 'Personal Loan',
            'home': 'Home Loan',
            'business': 'Business Loan',
            'education': 'Education Loan'
        };
        return names[type] || 'Loan';
    }

    function getLoanIcon(type) {
        const icons = {
            'personal': DollarSign,
            'home': Home,
            'business': Briefcase,
            'education': FileText
        };
        return icons[type] || DollarSign;
    }

    const currentService = serviceConfigs[serviceType] || serviceConfigs['credit-card'];
    const ServiceIcon = currentService.icon;

    // Validation functions
    const validatePAN = (pan) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
    const validateAadhaar = (aadhaar) => /^[0-9]{12}$/.test(aadhaar.replace(/\s/g, ''));
    const validateMobile = (mobile) => /^[6-9][0-9]{9}$/.test(mobile);

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

        // Basic validation for all services
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

        // Service-specific validation
        if (serviceType === 'credit-card') {
            if (!formData.monthlyIncome) newErrors.monthlyIncome = 'Monthly income is required';
            if (!formData.employmentType) newErrors.employmentType = 'Employment type is required';
            if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
        }

        if (serviceType === 'insurance') {
            if (!formData.coverageAmount) newErrors.coverageAmount = 'Coverage amount is required';
            if (!formData.nomineeDetails.trim()) newErrors.nomineeDetails = 'Nominee details are required';

            if (subType === 'vehicle') {
                if (!formData.vehicleNumber.trim()) newErrors.vehicleNumber = 'Vehicle number is required';
                if (!formData.vehicleModel.trim()) newErrors.vehicleModel = 'Vehicle model is required';
                if (!formData.vehicleYear) newErrors.vehicleYear = 'Vehicle year is required';
            }

            if (subType === 'property') {
                if (!formData.propertyType.trim()) newErrors.propertyType = 'Property type is required';
                if (!formData.propertyValue) newErrors.propertyValue = 'Property value is required';
            }
        }

        if (serviceType === 'loan') {
            if (!formData.loanAmount) newErrors.loanAmount = 'Loan amount is required';
            if (!formData.loanPurpose.trim()) newErrors.loanPurpose = 'Loan purpose is required';
            if (!formData.monthlyIncome) newErrors.monthlyIncome = 'Monthly income is required';

            if (subType === 'business') {
                if (!formData.businessType.trim()) newErrors.businessType = 'Business type is required';
                if (!formData.businessAge) newErrors.businessAge = 'Business age is required';
                if (!formData.annualTurnover) newErrors.annualTurnover = 'Annual turnover is required';
            }
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
                        ...passedData,
                        serviceType: serviceType,
                        subType: subType,
                        serviceName: currentService.name,
                        message: `Your ${currentService.name} application has been submitted successfully. Our team will contact you within 24-48 hours to complete the process.`
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

    // Render field helper function
    const renderField = (fieldName, label, type = 'text', options = {}, span = 1) => {
        const { placeholder, required = false, icon: Icon, maxLength, min, max, rows } = options;

        const spanClass = span === 2 ? 'col-span-2' : span === 3 ? 'col-span-3' : span === 4 ? 'col-span-4' : 'col-span-1';

        return (
            <div className={spanClass}>
                <label htmlFor={fieldName} className="flex items-center gap-1 text-xs font-semibold text-slate-700 mb-1">
                    {Icon && <Icon size={12} />}
                    {label} {required && '*'}
                </label>
                {type === 'textarea' ? (
                    <textarea
                        id={fieldName}
                        value={formData[fieldName]}
                        onChange={(e) => handleInputChange(fieldName, e.target.value)}
                        placeholder={placeholder}
                        rows={rows || 2}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#1e7a8c] focus:border-[#1e7a8c] outline-none transition-all text-sm bg-white/80 resize-none"
                        required={required}
                    />
                ) : type === 'select' ? (
                    <select
                        id={fieldName}
                        value={formData[fieldName]}
                        onChange={(e) => handleInputChange(fieldName, e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#1e7a8c] focus:border-[#1e7a8c] outline-none transition-all text-sm bg-white/80"
                        required={required}
                    >
                        <option value="">{placeholder}</option>
                        {options.selectOptions?.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                ) : (
                    <input
                        type={type}
                        id={fieldName}
                        value={formData[fieldName]}
                        onChange={(e) => handleInputChange(fieldName, type === 'number' ? e.target.value : e.target.value)}
                        placeholder={placeholder}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#1e7a8c] focus:border-[#1e7a8c] outline-none transition-all text-sm bg-white/80"
                        maxLength={maxLength}
                        min={min}
                        max={max}
                        required={required}
                    />
                )}
                {errors[fieldName] && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle size={10} />
                        {errors[fieldName]}
                    </p>
                )}
            </div>
        );
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
                    { label: currentService.breadcrumb, href: `/services/${serviceType}`, icon: ServiceIcon },
                    { label: currentService.name, icon: ServiceIcon }
                ]}
            />

            <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 relative z-10">
                {/* Compact Header */}
                <div className="text-center mb-4">
                    <div className="inline-flex items-center g from-[#1e7a8c] to-[#0f4c59] rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                        <ServiceIcon size={28} className="text-white" />
                    </div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">
                        Apply for {selectedCard ? selectedCard.name : currentService.name}
                    </h1>
                    <p className="text-sm text-slate-600 max-w-2xl mx-auto">
                        {selectedCard ? `Apply for ${selectedCard.name} from ${selectedCard.bank}` : currentService.description}
                    </p>
                    {passedData.preApproved && (
                        <div className="mt-2 inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                            <CheckCircle size={12} />
                            Pre-approved based on your CIBIL score of {passedData.creditScore}!
                        </div>
                    )}
                    {selectedCard && (
                        <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-2 max-w-md mx-auto">
                            <div className="flex items-center gap-2">
                                {selectedCard.image && (
                                    <img src={selectedCard.image} alt={selectedCard.name} className="w-8 h-6 object-cover rounded" />
                                )}
                                <div>
                                    <h3 className="font-semibold text-slate-800 text-sm">{selectedCard.name}</h3>
                                    <p className="text-xs text-slate-600">{selectedCard.bank}</p>
                                    <p className="text-xs text-slate-500">Credit Limit: {selectedCard.limit}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Application Form */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 border border-white/20">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Basic Information Section */}
                        <div className="border-b border-slate-200 pb-3">
                            <h3 className="text-base font-semibold text-slate-800 mb-2 flex items-center gap-2">
                                <User size={16} />
                                Basic Information
                            </h3>
                        </div>


                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Full Name */}
                            {renderField('fullName', 'Full Name (as per PAN)', 'text', {
                                placeholder: 'Enter your full name',
                                required: true,
                                icon: User
                            })}
                            {/* PAN and Date of Birth */}
                            {renderField('panNumber', 'PAN Number', 'text', {
                                placeholder: 'ABCDE1234F',
                                required: true,
                                icon: FileText,
                                maxLength: 10
                            })}

                            {renderField('dateOfBirth', 'Date of Birth', 'date', {
                                required: true,
                                icon: Calendar
                            })}
                            {/* Mobile  */}
                            {renderField('mobileNumber', 'Mobile Number', 'tel', {
                                placeholder: '9876543210',
                                required: true,
                                icon: Phone,
                                maxLength: 10
                            })}

                        </div>


                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Aadhaar */}
                            {renderField('aadhaarNumber', 'Aadhaar Number', 'text', {
                                placeholder: '1234 5678 9012',
                                required: true,
                                icon: FileText,
                                maxLength: 12
                            })}
                            {/* Location */}
                            {renderField('location', 'Current Location', 'text', {
                                placeholder: 'City, State',
                                required: true,
                                icon: MapPin
                            })}

                            {/* Current Address */}
                            {renderField('currentAddress', 'Current Address', 'textarea', {
                                placeholder: 'Enter your complete current address',
                                required: true,
                                icon: MapPin,
                                rows: 1
                            }, 2)}
                        </div>

                        {/* Service Specific Fields */}
                        {serviceType === 'credit-card' && (
                            <>
                                <div className="border-t border-slate-200 pt-3">
                                    <h3 className="text-base font-semibold text-slate-800 mb-2 flex items-center gap-2">
                                        <CreditCard size={16} />
                                        Employment & Income Details
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {renderField('monthlyIncome', 'Monthly Income (₹)', 'number', {
                                        placeholder: 'Enter your monthly income',
                                        required: true,
                                        icon: DollarSign
                                    })}

                                    {renderField('employmentType', 'Employment Type', 'select', {
                                        placeholder: 'Select employment type',
                                        required: true,
                                        icon: Briefcase,
                                        selectOptions: [
                                            { value: 'salaried', label: 'Salaried' },
                                            { value: 'self-employed', label: 'Self Employed' },
                                            { value: 'business', label: 'Business Owner' },
                                            { value: 'freelancer', label: 'Freelancer' }
                                        ]
                                    })}
                                    {renderField('companyName', 'Company/Organization Name', 'text', {
                                        placeholder: 'Enter company name',
                                        required: true,
                                        icon: Building
                                    })}

                                    {renderField('workExperience', 'Work Experience (Years)', 'number', {
                                        placeholder: 'Years of experience',
                                        icon: Calendar,
                                        min: 0
                                    })}
                                </div>
                            </>
                        )}

                        {serviceType === 'insurance' && (
                            <>
                                <div className="border-t border-slate-200 pt-3">
                                    <h3 className="text-base font-semibold text-slate-800 mb-2 flex items-center gap-2">
                                        <ServiceIcon size={16} />
                                        Insurance Details
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {renderField('coverageAmount', 'Coverage Amount (₹)', 'number', {
                                        placeholder: 'Enter coverage amount',
                                        required: true,
                                        icon: DollarSign
                                    })}

                                    {renderField('nomineeDetails', 'Nominee Details', 'text', {
                                        placeholder: 'Nominee name and relationship',
                                        required: true,
                                        icon: User
                                    })}
                                </div>

                                {subType === 'health' && renderField('medicalHistory', 'Medical History (if any)', 'textarea', {
                                    placeholder: 'Please mention any pre-existing medical conditions',
                                    icon: Heart,
                                    rows: 2
                                })}

                                {subType === 'vehicle' && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {renderField('vehicleNumber', 'Vehicle Number', 'text', {
                                            placeholder: 'MH01AB1234',
                                            required: true,
                                            icon: Car
                                        })}

                                        {renderField('vehicleModel', 'Vehicle Model', 'text', {
                                            placeholder: 'e.g., Maruti Swift',
                                            required: true,
                                            icon: Car
                                        })}

                                        {renderField('vehicleYear', 'Vehicle Year', 'number', {
                                            placeholder: '2020',
                                            required: true,
                                            icon: Calendar,
                                            min: 1990,
                                            max: new Date().getFullYear()
                                        })}
                                    </div>
                                )}

                                {subType === 'property' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {renderField('propertyType', 'Property Type', 'select', {
                                            placeholder: 'Select property type',
                                            required: true,
                                            icon: Home,
                                            selectOptions: [
                                                { value: 'residential', label: 'Residential' },
                                                { value: 'commercial', label: 'Commercial' },
                                                { value: 'industrial', label: 'Industrial' }
                                            ]
                                        })}

                                        {renderField('propertyValue', 'Property Value (₹)', 'number', {
                                            placeholder: 'Enter property value',
                                            required: true,
                                            icon: DollarSign
                                        })}
                                    </div>
                                )}
                            </>
                        )}

                        {serviceType === 'loan' && (
                            <>
                                <div className="border-t border-slate-200 pt-3">
                                    <h3 className="text-base font-semibold text-slate-800 mb-2 flex items-center gap-2">
                                        <ServiceIcon size={16} />
                                        Loan Details
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {renderField('loanAmount', 'Loan Amount (₹)', 'number', {
                                        placeholder: 'Enter loan amount',
                                        required: true,
                                        icon: DollarSign
                                    })}

                                    {renderField('monthlyIncome', 'Monthly Income (₹)', 'number', {
                                        placeholder: 'Enter your monthly income',
                                        required: true,
                                        icon: DollarSign
                                    })}
                                </div>

                                {renderField('loanPurpose', 'Loan Purpose', 'textarea', {
                                    placeholder: 'Describe the purpose of the loan',
                                    required: true,
                                    icon: FileText,
                                    rows: 2
                                })}

                                {subType === 'business' && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {renderField('businessType', 'Business Type', 'text', {
                                            placeholder: 'e.g., Manufacturing, Trading',
                                            required: true,
                                            icon: Briefcase
                                        })}

                                        {renderField('businessAge', 'Business Age (Years)', 'number', {
                                            placeholder: 'Years in business',
                                            required: true,
                                            icon: Calendar,
                                            min: 0
                                        })}

                                        {renderField('annualTurnover', 'Annual Turnover (₹)', 'number', {
                                            placeholder: 'Annual business turnover',
                                            required: true,
                                            icon: DollarSign
                                        })}
                                    </div>
                                )}
                            </>
                        )}

                        {errors.submit && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                                <p className="text-red-700 text-sm">{errors.submit}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-[#1e7a8c] to-[#0f4c59] text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Processing Application...
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    Submit Application
                                    <CheckCircle size={16} />
                                </div>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}