import React, { useState } from 'react'
import AddRole from './component/AddRole'
import AllRoles from './component/AllRoles'
import EditRole from './component/EditRole'
import { ActionButton, PermissionGuard } from '@/components/permissions'

const Role = () => {
  const [activeTab, setActiveTab] = useState('all')
  const [editingRole, setEditingRole] = useState(null)

  const tabs = [
    { id: 'all', label: 'All Roles', icon: '👥' },
    { id: 'add', label: 'Add Role', icon: '➕' },
  ]

  const handleEditRole = (role) => {
    setEditingRole(role)
    setActiveTab('edit')
  }

  const handleCloseEdit = () => {
    setEditingRole(null)
    setActiveTab('all')
  }

  const handleRoleCreated = () => {
    setActiveTab('all')
  }

  const handleRoleUpdated = () => {
    setEditingRole(null)
    setActiveTab('all')
  }

  return (
    <PermissionGuard module="roles" showMessage>
      <div className="space-y-6">
        {/* Tabs */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between p-4">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('all')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'all'
                    ? `border-blue-500 text-blue-600`
                    : `border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300`
                }`}
              >
                <span className="mr-2">👥</span>
                All Roles
              </button>
              {editingRole && (
                <button
                  onClick={() => setActiveTab('edit')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === 'edit'
                      ? `border-blue-500 text-blue-600`
                      : `border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300`
                  }`}
                >
                  <span className="mr-2">✏️</span>
                  Edit Role
                </button>
              )}
            </nav>
            
            <div className="flex items-center gap-2">
              <ActionButton
                module="roles"
                action="create"
                label="Add Role"
                onClick={() => setActiveTab('add')}
                className={activeTab === 'add' ? 'bg-green-600' : ''}
              />
            </div>
          </div>
        </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'all' && (
          <AllRoles
            onEditRole={handleEditRole}
            onViewRole={handleEditRole} // Use edit handler for view for now
          />
        )}
        {activeTab === 'add' && (
          <AddRole onRoleCreated={handleRoleCreated} />
        )}
        {activeTab === 'edit' && editingRole && (
          <EditRole
            role={editingRole}
            onRoleUpdated={handleRoleUpdated}
            onClose={handleCloseEdit}
          />
        )}
      </div>
      </div>
    </PermissionGuard>
  )
}

export default Role
