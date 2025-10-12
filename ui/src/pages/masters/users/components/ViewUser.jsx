import React from 'react'
import { ActionButton } from '@/components/permissions'

const ViewUser = ({ user, onClose, onEdit }) => {
  if (!user) {
    return (
      <div className="rounded-lg shadow-md p-6 bg-white">
        <p className="text-center text-gray-600">
          No user selected for viewing
        </p>
      </div>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="rounded-lg shadow-md p-6 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            User Details
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            View user information and account details
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {onEdit && (
            <ActionButton
              module="users"
              action="update"
              label="Edit User"
              onClick={() => onEdit(user)}
            />
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-md transition-colors text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* User Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
            Basic Information
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
              {user.username || 'N/A'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
              {user.email || 'N/A'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
              {user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
              {user.firstName || 'N/A'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
              {user.lastName || 'N/A'}
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
            Account Information
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <div className="text-sm bg-gray-50 px-3 py-2 rounded-md">
              {user.roleId?.name ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {user.roleId.name}
                </span>
              ) : (
                <span className="text-gray-500">No Role Assigned</span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <div className="text-sm bg-gray-50 px-3 py-2 rounded-md">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User ID
            </label>
            <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md font-mono">
              {user._id || 'N/A'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Created Date
            </label>
            <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
              {formatDate(user.createdAt)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Updated
            </label>
            <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
              {formatDate(user.updatedAt)}
            </div>
          </div>
        </div>
      </div>

      {/* Role Permissions (if role has permissions) */}
      {user.roleId?.permissions && user.roleId.permissions.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
            Role Permissions
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {user.roleId.permissions.map((permission, index) => (
                <div key={index} className="bg-white rounded-md p-3 border">
                  <h4 className="font-medium text-gray-900 mb-2 capitalize">
                    {permission.resource}
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {permission.actions.map((action, actionIndex) => (
                      <span
                        key={actionIndex}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {action}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Additional Information */}
      {(user.lastLogin || user.loginCount) && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
            Login Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.lastLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Login
                </label>
                <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {formatDate(user.lastLogin)}
                </div>
              </div>
            )}
            {user.loginCount !== undefined && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Login Count
                </label>
                <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {user.loginCount} times
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ViewUser