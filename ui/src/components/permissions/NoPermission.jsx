import React from 'react';
import { Shield, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NoPermission = ({ 
  module, 
  action = 'access',
  showBackButton = true,
  customMessage = null 
}) => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-500 mb-6">
            {customMessage || `You don't have permission to ${action} ${module || 'this resource'}.`}
          </p>
          <p className="text-sm text-gray-400">
            Please contact your administrator if you believe this is an error.
          </p>
        </div>

        {showBackButton && (
          <button
            onClick={handleGoBack}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </button>
        )}
      </div>
    </div>
  );
};

export default NoPermission;