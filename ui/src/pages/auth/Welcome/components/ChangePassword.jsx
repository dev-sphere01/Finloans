import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import ChangePasswordForm from '@/components/ChangePasswordForm';

const ChangePassword = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuthStore();

  const handlePasswordChangeSuccess = () => {
    updateUser({ isAutoGenPass: false });
    setTimeout(() => navigate('/dashboard'), 1500);
  };

  const handlePasswordChangeError = (error) => {
    console.error('Password change error:', error);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <ChangePasswordForm
        onSuccess={handlePasswordChangeSuccess}
        onError={handlePasswordChangeError}
        submitButtonText="Save & Continue"
      />
    </div>
  );
};

export default ChangePassword;
