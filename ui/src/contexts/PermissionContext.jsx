import { createContext, useContext, useMemo } from 'react';
import useAuthStore from '@/store/authStore';

const PermissionContext = createContext({
  user: null,
  role: null,
  permissions: {},
  hasPermission: () => false,
});

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};

export const PermissionProvider = ({ children }) => {
  const { user } = useAuthStore();
  
  // Transform user role permissions into a more accessible format
  const permissions = useMemo(() => {
    if (!user?.role?.permissions) return {};
    
    const permissionMap = {};
    user.role.permissions.forEach(permission => {
      permissionMap[permission.resource] = permission.actions;
    });
    
    return permissionMap;
  }, [user?.role?.permissions]);

  // Helper function to check if user has specific permission
  const hasPermission = (module, action) => {
    // For development/testing - if no user or permissions, allow all actions
    if (!user) return true;
    
    // If user doesn't have role permissions structure, allow all (fallback)
    if (!user?.role?.permissions) return true;
    
    const modulePermissions = permissions[module];
    if (!modulePermissions) return false;
    
    return modulePermissions.includes(action) || modulePermissions.includes('manage');
  };

  const value = {
    user,
    role: user?.role?.name || user?.roleName,
    permissions,
    hasPermission,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

export default PermissionContext;