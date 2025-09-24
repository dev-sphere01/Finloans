import React, { useState } from 'react'
import AddRole from './component/AddRole'
import AllRoles from './component/AllRoles'
import EditRole from './component/EditRole'

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
    <div className="space-y-6">
      {/* Header */}
      {/* <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
            Role Management
            </span>
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage system roles and permissions
          </p>
        </div>
      </div> */}

      {/* Tabs */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === tab.id
                  ? `border-blue-500 text-blue-600`
                  : `border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300`
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
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
  )
}

export default Role
