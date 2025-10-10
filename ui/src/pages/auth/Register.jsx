import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    User, 
    Mail, 
    Phone, 
    Lock, 
    Eye, 
    EyeOff, 
    UserPlus,
    AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import userService from '@/services/userService';
import notification from '@/services/NotificationService';
import useAuthStore from '@/store/authStore';

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const navigate = useNavigate();
    const notify = notification();
    const login = useAuthStore((state) => state.login);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear field error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Required fields
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
        
        // Phone validation
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        else if (!/^[6-9][0-9]{9}$/.test(formData.phone)) newErrors.phone = 'Invalid phone number format';

        // Password validation
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

        if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
        else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

        // Terms agreement
        if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms and conditions';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setLoading(true);
        try {
            const registrationData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password
            };

            const response = await userService.register(registrationData);

            // Registration successful - response now has same format as login
            if (response.token && response.user) {
                notify.success('Registration successful! Welcome to FinLoans!');
                
                // Auto-login after successful registration
                login(response);
                navigate('/dashboard');
            } else {
                setErrors({ submit: 'Registration failed. Please try again.' });
            }
        } catch (error) {
            console.error('Registration error:', error);
            
            if (error.response?.status === 400) {
                const serverErrors = error.response.data.errors || [];
                const errorMap = {};
                
                serverErrors.forEach(err => {
                    const fieldName = err.field || err.path;
                    const message = err.message || err.msg;
                    
                    if (fieldName && message) {
                        errorMap[fieldName] = message;
                    }
                });
                
                if (Object.keys(errorMap).length > 0) {
                    setErrors(errorMap);
                } else {
                    setErrors({ submit: error.response.data.message || 'Registration failed' });
                }
            } else if (error.response?.status === 409) {
                setErrors({ submit: 'Email already exists. Please use a different email.' });
            } else {
                setErrors({ submit: 'Registration failed. Please try again.' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
                <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
            </div>

            <div className="max-w-md w-full space-y-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Header */}
                    <div className="text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="mx-auto h-16 w-16 bg-gradient-to-r from-slate-600 to-gray-600 rounded-full flex items-center justify-center mb-4"
                        >
                            <UserPlus className="h-8 w-8 text-white" />
                        </motion.div>
                        <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Join FinLoans for better financial services
                        </p>
                    </div>

                    {/* Registration Form */}
                    <motion.form
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-8 space-y-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20"
                        onSubmit={handleSubmit}
                    >
                        <div className="space-y-4">
                            {/* Name Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                                        First Name *
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            id="firstName"
                                            type="text"
                                            value={formData.firstName}
                                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                                            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors ${
                                                errors.firstName ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                            placeholder="John"
                                        />
                                    </div>
                                    {errors.firstName && (
                                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                            <AlertCircle size={12} />
                                            {errors.firstName}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                                        Last Name *
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            id="lastName"
                                            type="text"
                                            value={formData.lastName}
                                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                                            className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors ${
                                                errors.lastName ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                            placeholder="Doe"
                                        />
                                    </div>
                                    {errors.lastName && (
                                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                            <AlertCircle size={12} />
                                            {errors.lastName}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address *
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors ${
                                            errors.email ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="john@example.com"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                        <AlertCircle size={12} />
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Phone */}
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number *
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        id="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors ${
                                            errors.phone ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="9876543210"
                                        maxLength={10}
                                    />
                                </div>
                                {errors.phone && (
                                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                        <AlertCircle size={12} />
                                        {errors.phone}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Password *
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={(e) => handleInputChange('password', e.target.value)}
                                        className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors ${
                                            errors.password ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                        <AlertCircle size={12} />
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirm Password *
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={formData.confirmPassword}
                                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                        className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors ${
                                            errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                        <AlertCircle size={12} />
                                        {errors.confirmPassword}
                                    </p>
                                )}
                            </div>

                            {/* Terms Agreement */}
                            <div className="flex items-start">
                                <input
                                    id="agreeToTerms"
                                    type="checkbox"
                                    checked={formData.agreeToTerms}
                                    onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                                    className="mt-1 h-4 w-4 text-slate-600 focus:ring-slate-500 border-gray-300 rounded"
                                />
                                <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-700">
                                    I agree to the{' '}
                                    <Link to="/terms" className="text-slate-600 hover:text-slate-700 font-medium">
                                        Terms and Conditions
                                    </Link>{' '}
                                    and{' '}
                                    <Link to="/privacy" className="text-slate-600 hover:text-slate-700 font-medium">
                                        Privacy Policy
                                    </Link>
                                </label>
                            </div>
                            {errors.agreeToTerms && (
                                <p className="text-xs text-red-600 flex items-center gap-1">
                                    <AlertCircle size={12} />
                                    {errors.agreeToTerms}
                                </p>
                            )}
                        </div>

                        {/* Submit Error */}
                        {errors.submit && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                                <p className="text-red-700 text-sm">{errors.submit}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-slate-600 to-gray-600 hover:from-slate-700 hover:to-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Creating Account...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <UserPlus size={18} />
                                        Create Account
                                    </div>
                                )}
                            </button>
                        </div>

                        {/* Login Link */}
                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                Already have an account?{' '}
                                <Link
                                    to="/login"
                                    className="font-medium text-slate-600 hover:text-slate-700 transition-colors"
                                >
                                    Sign in here
                                </Link>
                            </p>
                        </div>
                    </motion.form>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;
