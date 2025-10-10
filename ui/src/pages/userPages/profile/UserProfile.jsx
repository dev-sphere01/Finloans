import { useState, useEffect } from 'react';
import { 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    Calendar, 
    Edit3, 
    Save, 
    X, 
    Eye, 
    EyeOff,
    Shield,
    CreditCard,
    FileText,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import useAuthStore from '@/store/authStore';
import notification from '@/services/NotificationService';
import userService from '@/services/userService';
import applicationService from '@/services/applicationService';

export default function UserProfile() {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [applications, setApplications] = useState([]);
    const [loadingApplications, setLoadingApplications] = useState(true);
    
    const user = useAuthStore((state) => state.user);
    const updateUser = useAuthStore((state) => state.updateUser);
    const notify = notification();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        dateOfBirth: '',
        panNumber: '',
        aadhaarNumber: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});

    // Load user data
    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
                panNumber: user.panNumber || '',
                aadhaarNumber: user.aadhaarNumber || '',
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        }
    }, [user]);

    // Load user applications
    useEffect(() => {
        console.log('useEffect for loadUserApplications triggered');
        console.log('User exists:', !!user);
        if (user) {
            console.log('User found, loading applications...');
            loadUserApplications();
        } else {
            console.log('No user found, skipping application load');
        }
    }, [user]);

    const loadUserApplications = async () => {
        console.log('loadUserApplications function called');
        
        if (!user) {
            console.log('No user available, cannot load applications');
            setLoadingApplications(false);
            return;
        }

        try {
            setLoadingApplications(true);
            console.log('Loading user applications...');
            console.log('Current user:', user);
            console.log('Auth token:', sessionStorage.getItem('authToken'));
            
            const response = await userService.getUserApplications();
            console.log('Applications response:', response);
            if (response.success) {
                console.log('Applications data:', response.data);
                setApplications(response.data || []);
            } else {
                console.log('Response not successful:', response);
            }
        } catch (error) {
            console.error('Error loading applications:', error);
            console.error('Error details:', error.response?.data);
        } finally {
            setLoadingApplications(false);
        }
    };

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

        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
        
        if (formData.phone && !/^[6-9][0-9]{9}$/.test(formData.phone)) {
            newErrors.phone = 'Invalid phone number format';
        }

        if (formData.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) {
            newErrors.panNumber = 'Invalid PAN format';
        }

        if (formData.aadhaarNumber && !/^[0-9]{12}$/.test(formData.aadhaarNumber.replace(/\s/g, ''))) {
            newErrors.aadhaarNumber = 'Invalid Aadhaar format';
        }

        // Password validation (only if changing password)
        if (formData.newPassword) {
            if (!formData.currentPassword) {
                newErrors.currentPassword = 'Current password is required';
            }
            if (formData.newPassword.length < 6) {
                newErrors.newPassword = 'Password must be at least 6 characters';
            }
            if (formData.newPassword !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const updateData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                dateOfBirth: formData.dateOfBirth,
                panNumber: formData.panNumber,
                aadhaarNumber: formData.aadhaarNumber
            };

            // Add password change if provided
            if (formData.newPassword) {
                updateData.currentPassword = formData.currentPassword;
                updateData.newPassword = formData.newPassword;
            }

            const response = await userService.updateProfile(updateData);
            
            if (response.success) {
                updateUser(response.data);
                notify.success('Profile updated successfully');
                setIsEditing(false);
                // Clear password fields
                setFormData(prev => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                }));
            } else {
                notify.error(response.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            notify.error('Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'pending': { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
            'under-review': { color: 'bg-blue-100 text-blue-800', icon: Eye },
            'approved': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
            'rejected': { color: 'bg-red-100 text-red-800', icon: X },
            'cancelled': { color: 'bg-gray-100 text-gray-800', icon: X }
        };

        const config = statusConfig[status] || statusConfig['pending'];
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                <Icon size={12} />
                {status.replace('-', ' ').toUpperCase()}
            </span>
        );
    };

    const getServiceIcon = (serviceType) => {
        const icons = {
            'credit-card': CreditCard,
            'insurance': Shield,
            'loan': FileText
        };
        const Icon = icons[serviceType] || FileText;
        return <Icon size={16} className="text-blue-600" />;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                    <p className="text-gray-600 mt-2">Manage your account information and view your applications</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Information */}
                    <div className="lg:col-span-2">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                        >
                            {/* Profile Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                                            <User size={32} className="text-white" />
                                        </div>
                                        <div className="text-white">
                                            <h2 className="text-2xl font-bold">
                                                {user?.firstName} {user?.lastName}
                                            </h2>
                                            <p className="text-blue-100">{user?.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsEditing(!isEditing)}
                                        className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        {isEditing ? <X size={16} /> : <Edit3 size={16} />}
                                        {isEditing ? 'Cancel' : 'Edit Profile'}
                                    </button>
                                </div>
                            </div>

                            {/* Profile Form */}
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Personal Information */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                            <User size={20} />
                                            Personal Information
                                        </h3>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                First Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.firstName}
                                                onChange={(e) => handleInputChange('firstName', e.target.value)}
                                                disabled={!isEditing}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                    !isEditing ? 'bg-gray-50' : 'bg-white'
                                                } ${errors.firstName ? 'border-red-300' : 'border-gray-300'}`}
                                            />
                                            {errors.firstName && (
                                                <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Last Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.lastName}
                                                onChange={(e) => handleInputChange('lastName', e.target.value)}
                                                disabled={!isEditing}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                    !isEditing ? 'bg-gray-50' : 'bg-white'
                                                } ${errors.lastName ? 'border-red-300' : 'border-gray-300'}`}
                                            />
                                            {errors.lastName && (
                                                <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Date of Birth
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.dateOfBirth}
                                                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                                disabled={!isEditing}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                    !isEditing ? 'bg-gray-50' : 'bg-white'
                                                } ${errors.dateOfBirth ? 'border-red-300' : 'border-gray-300'}`}
                                            />
                                        </div>
                                    </div>

                                    {/* Contact Information */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                            <Mail size={20} />
                                            Contact Information
                                        </h3>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                                disabled={!isEditing}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                    !isEditing ? 'bg-gray-50' : 'bg-white'
                                                } ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
                                            />
                                            {errors.email && (
                                                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                                disabled={!isEditing}
                                                placeholder="9876543210"
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                    !isEditing ? 'bg-gray-50' : 'bg-white'
                                                } ${errors.phone ? 'border-red-300' : 'border-gray-300'}`}
                                            />
                                            {errors.phone && (
                                                <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Address
                                            </label>
                                            <textarea
                                                value={formData.address}
                                                onChange={(e) => handleInputChange('address', e.target.value)}
                                                disabled={!isEditing}
                                                rows={3}
                                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                                                    !isEditing ? 'bg-gray-50' : 'bg-white'
                                                } ${errors.address ? 'border-red-300' : 'border-gray-300'}`}
                                            />
                                        </div>
                                    </div>

                                    {/* Identity Information */}
                                    <div className="md:col-span-2 space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                            <Shield size={20} />
                                            Identity Information
                                        </h3>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    PAN Number
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.panNumber}
                                                    onChange={(e) => handleInputChange('panNumber', e.target.value.toUpperCase())}
                                                    disabled={!isEditing}
                                                    placeholder="ABCDE1234F"
                                                    maxLength={10}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                        !isEditing ? 'bg-gray-50' : 'bg-white'
                                                    } ${errors.panNumber ? 'border-red-300' : 'border-gray-300'}`}
                                                />
                                                {errors.panNumber && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.panNumber}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Aadhaar Number
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.aadhaarNumber}
                                                    onChange={(e) => handleInputChange('aadhaarNumber', e.target.value)}
                                                    disabled={!isEditing}
                                                    placeholder="1234 5678 9012"
                                                    maxLength={12}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                        !isEditing ? 'bg-gray-50' : 'bg-white'
                                                    } ${errors.aadhaarNumber ? 'border-red-300' : 'border-gray-300'}`}
                                                />
                                                {errors.aadhaarNumber && (
                                                    <p className="mt-1 text-xs text-red-600">{errors.aadhaarNumber}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Password Change Section */}
                                    {isEditing && (
                                        <div className="md:col-span-2 space-y-4 border-t pt-6">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Change Password (Optional)
                                            </h3>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Current Password
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type={showPassword ? 'text' : 'password'}
                                                            value={formData.currentPassword}
                                                            onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10 ${
                                                                errors.currentPassword ? 'border-red-300' : 'border-gray-300'
                                                            }`}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                        >
                                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                        </button>
                                                    </div>
                                                    {errors.currentPassword && (
                                                        <p className="mt-1 text-xs text-red-600">{errors.currentPassword}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        New Password
                                                    </label>
                                                    <input
                                                        type={showPassword ? 'text' : 'password'}
                                                        value={formData.newPassword}
                                                        onChange={(e) => handleInputChange('newPassword', e.target.value)}
                                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                            errors.newPassword ? 'border-red-300' : 'border-gray-300'
                                                        }`}
                                                    />
                                                    {errors.newPassword && (
                                                        <p className="mt-1 text-xs text-red-600">{errors.newPassword}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Confirm New Password
                                                    </label>
                                                    <input
                                                        type={showPassword ? 'text' : 'password'}
                                                        value={formData.confirmPassword}
                                                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                            errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                                                        }`}
                                                    />
                                                    {errors.confirmPassword && (
                                                        <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Save Button */}
                                {isEditing && (
                                    <div className="flex justify-end pt-6 border-t">
                                        <button
                                            onClick={handleSave}
                                            disabled={loading}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {loading ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            ) : (
                                                <Save size={16} />
                                            )}
                                            {loading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Applications Sidebar */}
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                        >
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FileText size={20} />
                                My Applications
                            </h3>
                            
                            {loadingApplications ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="animate-pulse">
                                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : applications.length > 0 ? (
                                <div className="space-y-4">
                                    {applications.slice(0, 5).map((app, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    {getServiceIcon(app.serviceType)}
                                                    <span className="font-medium text-sm">
                                                        {app.serviceType.replace('-', ' ').toUpperCase()}
                                                    </span>
                                                </div>
                                                {getStatusBadge(app.status)}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {app.applicationId}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(app.submittedAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}
                                    {applications.length > 5 && (
                                        <div className="text-center">
                                            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                                View All Applications
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-500 text-sm">No applications yet</p>
                                    <p className="text-gray-400 text-xs mt-1">
                                        Start by applying for a service
                                    </p>
                                </div>
                            )}
                        </motion.div>

                        {/* Quick Actions */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                        >
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <CreditCard size={20} className="text-blue-600" />
                                        <div>
                                            <div className="font-medium text-sm">Apply for Credit Card</div>
                                            <div className="text-xs text-gray-500">Get instant approval</div>
                                        </div>
                                    </div>
                                </button>
                                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Shield size={20} className="text-green-600" />
                                        <div>
                                            <div className="font-medium text-sm">Get Insurance</div>
                                            <div className="text-xs text-gray-500">Protect what matters</div>
                                        </div>
                                    </div>
                                </button>
                                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <FileText size={20} className="text-purple-600" />
                                        <div>
                                            <div className="font-medium text-sm">Apply for Loan</div>
                                            <div className="text-xs text-gray-500">Quick processing</div>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}