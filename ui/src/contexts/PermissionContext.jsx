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
    // If no user is logged in, deny access
    if (!user) return false;
    
    // If user doesn't have role permissions structure, deny access
    if (!user?.role?.permissions) return false;
    
    // Admin users have all permissions by default
    const roleName = user?.role?.name || user?.roleName;
    if (roleName && (
      roleName.toLowerCase().includes('admin') || 
      roleName.toLowerCase() === 'super admin' ||
      roleName.toLowerCase() === 'administrator'
    )) {
      return true;
    }
    
    const modulePermissions = permissions[module];
    if (!modulePermissions) return false;
    
    return modulePermissions.includes(action) || modulePermissions.includes('manage');
  };

  const value = {
    user,
    role: user?.role?.name || user?.roleName,
    permissions,
    hasPermission,
    isAdmin: user?.role?.name && (
      user.role.name.toLowerCase().includes('admin') || 
      user.role.name.toLowerCase() === 'super admin' ||
      user.role.name.toLowerCase() === 'administrator'
    ),
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

export default PermissionContext;