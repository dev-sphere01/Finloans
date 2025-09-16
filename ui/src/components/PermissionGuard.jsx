import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { hasPermission, hasAnyPermission } from '@/services/permissionService';

/**
 * Permission Guard Component
 * Protects routes based on user permissions
 */
const PermissionGuard = ({ 
  children, 
  resource, 
  action, 
  actions, 
  requireAll = false,
  fallback = null,
  redirectTo = '/dashboard'
}) => {
  const { user } = useAuthStore();
  const permissions = user?.rolePermissions || [];

  // Check permissions
  let hasAccess = false;

  if (actions && Array.isArray(actions)) {
    // Multiple actions check
    if (requireAll) {
      hasAccess = actions.every(act => hasPermission(permissions, resource, act));
    } else {
      hasAccess = hasAnyPermission(permissions, resource, actions);
    }
  } else if (action) {
    // Single action check
    hasAccess = hasPermission(permissions, resource, action);
  } else {
    // No specific action required, just check if user has any permission for resource
    hasAccess = permissions.some(p => p.resource === resource);
  }

  if (!hasAccess) {
    if (fallback) {
      return fallback;
    }
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

/**
 * Hook for checking permissions in components
 */
export const usePermissions = () => {
  const { user } = useAuthStore();
  const permissions = user?.rolePermissions || [];

  return {
    permissions,
    hasPermission: (resource, action) => hasPermission(permissions, resource, action),
    hasAnyPermission: (resource, actions) => hasAnyPermission(permissions, resource, actions),
    hasAllPermissions: (resource, actions) => actions.every(act => hasPermission(permissions, resource, act)),
    canCreate: (resource) => hasPermission(permissions, resource, 'create'),
    canRead: (resource) => hasPermission(permissions, resource, 'read'),
    canUpdate: (resource) => hasPermission(permissions, resource, 'update'),
    canDelete: (resource) => hasPermission(permissions, resource, 'delete'),
    canManage: (resource) => hasPermission(permissions, resource, 'manage'),
  };
};

/**
 * Component for conditionally rendering content based on permissions
 */
export const PermissionCheck = ({ 
  resource, 
  action, 
  actions, 
  requireAll = false,
  children, 
  fallback = null 
}) => {
  const { hasPermission: checkPermission, hasAnyPermission, permissions } = usePermissions();

  let hasAccess = false;

  if (actions && Array.isArray(actions)) {
    if (requireAll) {
      hasAccess = actions.every(act => checkPermission(resource, act));
    } else {
      hasAccess = hasAnyPermission(resource, actions);
    }
  } else if (action) {
    hasAccess = checkPermission(resource, action);
  } else {
    hasAccess = permissions.some(p => p.resource === resource);
  }

  if (!hasAccess) {
    return fallback;
  }

  return children;
};

export default PermissionGuard;