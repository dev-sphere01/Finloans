import React, { useState } from 'react'
import AddUser from './components/AddUser'
import AllUsers from './components/AllUsers'
import EditUser from './components/EditUser'
import ViewUser from './components/ViewUser'

const Users = () => {
  const [activeTab, setActiveTab] = useState('all')
  const [editingUser, setEditingUser] = useState(null)
  const [viewingUser, setViewingUser] = useState(null)

  const tabs = [
    { id: 'all', label: 'All Users', icon: '👥' },
    { id: 'add', label: 'Add User', icon: '➕' },
  ]

  const handleEditUser = (user) => {
    setEditingUser(user)
    setViewingUser(null)
    setActiveTab('edit')
  }

  const handleViewUser = (user) => {
    setViewingUser(user)
    setEditingUser(null)
    setActiveTab('view')
  }

  const handleCloseEdit = () => {
    setEditingUser(null)
    setActiveTab('all')
  }

  const handleCloseView = () => {
    setViewingUser(null)
    setActiveTab('all')
  }

  const handleUserCreated = () => {
    setActiveTab('all')
  }

  const handleUserUpdated = () => {
    setEditingUser(null)
    setActiveTab('all')
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === tab.id
                ? `border-blue-500 text-blue-600`
                : `border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300`
                }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
          {editingUser && (
            <button
              onClick={() => setActiveTab('edit')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'edit'
                ? `border-blue-500 text-blue-600`
                : `border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300`
                }`}
            >
              <span className="mr-2">✏️</span>
              Edit User
            </button>
          )}
          {viewingUser && (
            <button
              onClick={() => setActiveTab('view')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'view'
                ? `border-blue-500 text-blue-600`
                : `border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300`
                }`}
            >
              <span className="mr-2">👁️</span>
              View User
            </button>
          )}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'all' && (
          <AllUsers
            onEditUser={handleEditUser}
            onViewUser={handleViewUser}
          />
        )}
        {activeTab === 'add' && (
          <AddUser onUserCreated={handleUserCreated} />
        )}
        {activeTab === 'edit' && editingUser && (
          <EditUser
            user={editingUser}
            onUserUpdated={handleUserUpdated}
            onClose={handleCloseEdit}
          />
        )}
        {activeTab === 'view' && viewingUser && (
          <ViewUser
            user={viewingUser}
            onClose={handleCloseView}
            onEdit={handleEditUser}
          />
        )}
      </div>
    </div>
  )
}

export default Users
