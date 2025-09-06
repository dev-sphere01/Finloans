import React from 'react';
import ChangePasswordForm from '@/components/ChangePasswordForm';

const ChangePassword = () => {
  const handlePasswordChangeSuccess = (response) => {
    console.log('Password changed successfully in profile:', response);
    // You can add any additional logic here, like refreshing user data
  };

  const handlePasswordChangeError = (error) => {
    console.error('Password change error in profile:', error);
    // You can add any additional error handling here
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Change Password</h2>
      <ChangePasswordForm
        onSuccess={handlePasswordChangeSuccess}
        onError={handlePasswordChangeError}
        showTitle={false}
        className=""
        submitButtonText="Update Password"
      />
    </div>
  );
};

export default ChangePassword;