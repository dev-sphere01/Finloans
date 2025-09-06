import React, { useState } from 'react';
import { changePassword } from '@/services/authService';
import notification from '@/services/NotificationService';
import { FaLock, FaEye, FaEyeSlash, FaCheck, FaTimes } from 'react-icons/fa';

const ChangePasswordForm = ({ 
  onSuccess, 
  onError, 
  showTitle = true, 
  className = "",
  submitButtonText = "Change Password" 
}) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Password validation rules
  const passwordRules = [
    { rule: /.{8,}/, message: 'At least 8 characters long' },
    { rule: /[A-Z]/, message: 'Contains uppercase letter' },
    { rule: /[a-z]/, message: 'Contains lowercase letter' },
    { rule: /\d/, message: 'Contains at least one number' },
    { rule: /[!@#$%^&*(),.?":{}|<>]/, message: 'Contains special character' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validatePassword = (password) => {
    return passwordRules.every(rule => rule.rule.test(password));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    const notify = notification();

    // Validation
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      const errorMsg = 'All fields are required';
      setError(errorMsg);
      notify.error(errorMsg);
      setIsLoading(false);
      if (onError) onError(errorMsg);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      const errorMsg = 'New passwords do not match';
      setError(errorMsg);
      notify.error(errorMsg);
      setIsLoading(false);
      if (onError) onError(errorMsg);
      return;
    }

    if (!validatePassword(formData.newPassword)) {
      const errorMsg = 'New password does not meet security requirements';
      setError(errorMsg);
      notify.error(errorMsg);
      setIsLoading(false);
      if (onError) onError(errorMsg);
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      const errorMsg = 'New password must be different from current password';
      setError(errorMsg);
      notify.error(errorMsg);
      setIsLoading(false);
      if (onError) onError(errorMsg);
      return;
    }

    try {
      const response = await changePassword(formData.currentPassword, formData.newPassword);
      
      if (response.success) {
        const successMsg = 'Password changed successfully!';
        setSuccess(successMsg);
        notify.success(successMsg);
        
        // Reset form
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        if (onSuccess) onSuccess(response);
      }
    } catch (error) {
      console.error('Change password failed:', error);
      const errorMsg = error.message || 'Failed to change password. Please try again.';
      setError(errorMsg);
      notify.error(errorMsg);
      if (onError) onError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {showTitle && (
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Change Your Password</h2>
          <p className="text-gray-600">Create a secure password to protect your account</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
            <FaTimes className="text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center space-x-2">
            <FaCheck className="text-green-500" />
            <span>{success}</span>
          </div>
        )}

        {/* Current Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="text-gray-400" />
            </div>
            <input
              type={showPasswords.current ? "text" : "password"}
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
              placeholder="Enter your current password"
              required
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('current')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPasswords.current ? (
                <FaEyeSlash className="text-gray-400 hover:text-gray-600" />
              ) : (
                <FaEye className="text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="text-gray-400" />
            </div>
            <input
              type={showPasswords.new ? "text" : "password"}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
              placeholder="Enter your new password"
              required
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPasswords.new ? (
                <FaEyeSlash className="text-gray-400 hover:text-gray-600" />
              ) : (
                <FaEye className="text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Password Requirements */}
        {formData.newPassword && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Password Requirements:</h4>
            <div className="space-y-2">
              {passwordRules.map((rule, index) => {
                const isValid = rule.rule.test(formData.newPassword);
                return (
                  <div key={index} className="flex items-center space-x-2">
                    {isValid ? (
                      <FaCheck className="text-green-500 text-sm" />
                    ) : (
                      <FaTimes className="text-red-500 text-sm" />
                    )}
                    <span className={`text-sm ${isValid ? 'text-green-700' : 'text-red-700'}`}>
                      {rule.message}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="text-gray-400" />
            </div>
            <input
              type={showPasswords.confirm ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
              placeholder="Confirm your new password"
              required
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPasswords.confirm ? (
                <FaEyeSlash className="text-gray-400 hover:text-gray-600" />
              ) : (
                <FaEye className="text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
            <p className="text-red-600 text-sm mt-1">Passwords do not match</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !validatePassword(formData.newPassword) || formData.newPassword !== formData.confirmPassword}
          className="w-full bg-gradient-to-r from-slate-500 to-gray-500 hover:from-slate-700 hover:to-gray-700 disabled:from-slate-300 disabled:to-gray-300 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Changing Password...
            </>
          ) : (
            <>
              <FaLock className="mr-2" />
              {submitButtonText}
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ChangePasswordForm;