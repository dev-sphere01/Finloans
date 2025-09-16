import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaUsers, FaSearch, FaUserShield } from 'react-icons/fa';
import API from '@/services/API';
import notification from '@/services/NotificationService';
import useAuthStore from '@/store/authStore';

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [availablePermissions, setAvailablePermissions] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: []
  });

  const { user } = useAuthStore();
  const notify = notification();

  useEffect(() => {
    fetchRoles();
    fetchAvailablePermissions();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await API.get('/roles');
      setRoles(response.data.roles || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
      notify.error('Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailablePermissions = async () => {
    try {
      const response = await API.get('/roles/permissions/available');
      setAvailablePermissions(response.data || {});
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingRole) {
        await API.put(`/roles/${editingRole._id}`, formData);
        notify.success('Role updated successfully');
      } else {
        await API.post('/roles', formData);
        notify.success('Role created successfully');
      }
      
      setShowModal(false);
      setEditingRole(null);
      setFormData({ name: '', description: '', permissions: [] });
      fetchRoles();
    } catch (error) {
      console.error('Error saving role:', error);
      notify.error(error.response?.data?.error || 'Failed to save role');
    }
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      permissions: role.permissions || []
    });
    setShowModal(true);
  };

  const handleDelete = async (role) => {
    if (role.isSystem) {
      notify.error('Cannot delete system roles');
      return;
    }

    if (role.userCount > 0) {
      notify.error(`Cannot delete role. It is assigned to ${role.userCount} user(s)`);
      return;
    }

    if (window.confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      try {
        await API.delete(`/roles/${role._id}`);
        notify.success('Role deleted successfully');
        fetchRoles();
      } catch (error) {
        console.error('Error deleting role:', error);
        notify.error(error.response?.data?.error || 'Failed to delete role');
      }
    }
  };

  const handlePermissionChange = (resource, action, checked) => {
    setFormData(prev => {
      const permissions = [...prev.permissions];
      const existingPermission = permissions.find(p => p.resource === resource);

      if (existingPermission) {
        if (checked) {
          if (!existingPermission.actions.includes(action)) {
            existingPermission.actions.push(action);
          }
        } else {
          existingPermission.actions = existingPermission.actions.filter(a => a !== action);
          if (existingPermission.actions.length === 0) {
            const index = permissions.findIndex(p => p.resource === resource);
            permissions.splice(index, 1);
          }
        }
      } else if (checked) {
        permissions.push({ resource, actions: [action] });
      }

      return { ...prev, permissions };
    });
  };

  const hasPermission = (resource, action) => {
    const permission = formData.permissions.find(p => p.resource === resource);
    return permission ? permission.actions.includes(action) : false;
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
          <p className="text-gray-600">Manage user roles and permissions</p>
        </div>
        <button
          onClick={() => {
            setEditingRole(null);
            setFormData({ name: '', description: '', permissions: [] });
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <FaPlus /> Create Role
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full max-w-md"
          />
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoles.map((role) => (
          <div key={role._id} className="bg-white rounded-lg shadow-md p-6 border">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <FaUserShield className={`text-lg ${role.isSystem ? 'text-red-500' : 'text-blue-500'}`} />
                <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                {role.isSystem && (
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                    System
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(role)}
                  className="text-blue-600 hover:text-blue-800"
                  title="Edit Role"
                >
                  <FaEdit />
                </button>
                {!role.isSystem && (
                  <button
                    onClick={() => handleDelete(role)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete Role"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4">
              {role.description || 'No description provided'}
            </p>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-1">
                <FaUsers />
                <span>{role.userCount} users</span>
              </div>
              <div className="flex items-center gap-1">
                <FaUserShield />
                <span>{role.permissions?.length || 0} permissions</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Permissions:</h4>
              <div className="flex flex-wrap gap-1">
                {role.permissions?.slice(0, 3).map((permission, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                  >
                    {permission.resource}
                  </span>
                ))}
                {role.permissions?.length > 3 && (
                  <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                    +{role.permissions.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRoles.length === 0 && (
        <div className="text-center py-12">
          <FaUserShield className="mx-auto text-4xl text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No roles found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try adjusting your search criteria' : 'Create your first role to get started'}
          </p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingRole ? 'Edit Role' : 'Create New Role'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Module Permissions
                </label>
                
                {/* Group modules by category */}
                {availablePermissions.categories && Object.entries(availablePermissions.categories).map(([categoryKey, category]) => {
                  const categoryModules = Object.entries(availablePermissions.modules || {}).filter(
                    ([moduleKey, module]) => module.category === categoryKey
                  );
                  
                  if (categoryModules.length === 0) return null;
                  
                  return (
                    <div key={categoryKey} className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full bg-${category.color}-500`}></span>
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {categoryModules.map(([moduleKey, module]) => (
                          <div key={moduleKey} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center gap-2 mb-3">
                              <h4 className="font-medium text-gray-900">{module.name}</h4>
                            </div>
                            <p className="text-xs text-gray-600 mb-3">{module.description}</p>
                            
                            <div className="grid grid-cols-2 gap-2">
                              {module.actions.map((action) => {
                                const actionConfig = availablePermissions.actions?.[action];
                                return (
                                  <label key={action} className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      checked={hasPermission(moduleKey, action)}
                                      onChange={(e) => handlePermissionChange(moduleKey, action, e.target.checked)}
                                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                      actionConfig ? `bg-${actionConfig.color}-100 text-${actionConfig.color}-800` : 'bg-gray-100 text-gray-800'
                                    }`}>
                                      {actionConfig?.name || action}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingRole(null);
                    setFormData({ name: '', description: '', permissions: [] });
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingRole ? 'Update Role' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagement;