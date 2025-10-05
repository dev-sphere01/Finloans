import { Navigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';

const RoleBasedRoute = ({ children, allowedRoles = [], redirectTo = '/login' }) => {
  const { user, isInitialized } = useAuthStore();
  const userRole = user?.roleName;

  // Show loading while auth is initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if user is not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect if user role is null, undefined, or not in allowed roles
  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default RoleBasedRoute;