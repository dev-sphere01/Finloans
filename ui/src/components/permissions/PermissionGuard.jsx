import React from 'react';
import { usePermissions } from '@/contexts/PermissionContext';
import { Navigate } from 'react-router-dom';
import NoPermission from './NoPermission';

const PermissionGuard = ({ 
  module, 
  action = 'read',
  children, 
  fallback = null,
  redirect = null,
  showMessage = false 
}) => {
  const { hasPermission } = usePermissions();
  
  let isAllowed = false;
  try {
    isAllowed = hasPermission(module, action);
  } catch (error) {
    console.warn('Permission check failed, denying access:', error);
    isAllowed = false; // Fallback to deny access if permission check fails
  }
  
  if (!isAllowed) {
    // If redirect is specified, navigate to that route
    if (redirect) {
      return <Navigate to={redirect} replace />;
    }
    
    // If showMessage is true, show a default access denied message
    if (showMessage) {
      return (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="text-6xl text-gray-300 mb-4">🔒</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Access Denied
            </h3>
            <p className="text-gray-500">
              You don't have permission to {action} {module}.
            </p>
          </div>
        </div>
      );
    }
    
    // Return custom fallback or null
    return fallback;
  }
  
  return <>{children}</>;
};

export default PermissionGuard;