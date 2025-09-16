/**
 * @fileOverview Permission service for handling user permissions and role-based access
 */
import API from './API';

/**
 * Fetch user permissions from the server
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of user permissions
 */
export const fetchUserPermissions = async (userId) => {
  try {
    const response = await API.get(`/users/${userId}`);
    const user = response.data.user;
    
    if (user && user.roleId && user.roleId.permissions) {
      return user.roleId.permissions;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    return [];
  }
};

/**
 * Check if user has specific permission
 * @param {Array} permissions - User permissions array
 * @param {string} resource - Resource name
 * @param {string} action - Action name
 * @returns {boolean} True if user has permission
 */
export const hasPermission = (permissions, resource, action) => {
  if (!permissions || !Array.isArray(permissions)) {
    return false;
  }
  
  const permission = permissions.find(p => p.resource === resource);
  if (!permission) {
    return false;
  }
  
  return permission.actions.includes(action) || permission.actions.includes('manage');
};

/**
 * Check if user has any of the specified permissions
 * @param {Array} permissions - User permissions array
 * @param {string} resource - Resource name
 * @param {Array} actions - Array of action names
 * @returns {boolean} True if user has any of the permissions
 */
export const hasAnyPermission = (permissions, resource, actions) => {
  return actions.some(action => hasPermission(permissions, resource, action));
};

/**
 * Check if user has all of the specified permissions
 * @param {Array} permissions - User permissions array
 * @param {string} resource - Resource name
 * @param {Array} actions - Array of action names
 * @returns {boolean} True if user has all permissions
 */
export const hasAllPermissions = (permissions, resource, actions) => {
  return actions.every(action => hasPermission(permissions, resource, action));
};

/**
 * Get all resources user has access to
 * @param {Array} permissions - User permissions array
 * @returns {Array} Array of resource names
 */
export const getAccessibleResources = (permissions) => {
  if (!permissions || !Array.isArray(permissions)) {
    return [];
  }
  
  return permissions.map(p => p.resource);
};

/**
 * Get user's actions for a specific resource
 * @param {Array} permissions - User permissions array
 * @param {string} resource - Resource name
 * @returns {Array} Array of action names
 */
export const getResourceActions = (permissions, resource) => {
  if (!permissions || !Array.isArray(permissions)) {
    return [];
  }
  
  const permission = permissions.find(p => p.resource === resource);
  return permission ? permission.actions : [];
};

/**
 * Filter menu items based on user permissions
 * @param {Array} menuItems - Menu items array
 * @param {Array} permissions - User permissions array
 * @returns {Array} Filtered menu items
 */
export const filterMenuByPermissions = (menuItems, permissions) => {
  if (!permissions || !Array.isArray(permissions)) {
    return [];
  }
  
  return menuItems.filter(item => {
    if (item.type === 'heading') {
      return true; // Always show headings, they'll be filtered out if no items
    }
    
    if (item.permission && item.permission.resource) {
      return hasPermission(permissions, item.permission.resource, 'read');
    }
    
    return true; // Show items without specific permission requirements
  });
};

export default {
  fetchUserPermissions,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getAccessibleResources,
  getResourceActions,
  filterMenuByPermissions
};