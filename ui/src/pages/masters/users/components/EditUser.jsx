import React, { useState, useEffect } from 'react'
import userService from '@/services/userService'
import roleService from '@/services/roleService'
import notification from '@/services/NotificationService'

const EditUser = ({ user, onUserUpdated, onClose }) => {
  const notify = notification()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [roles, setRoles] = useState([])

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    roleId: '',
    isActive: true
  })

  const [validationErrors, setValidationErrors] = useState({})

  // Initialize form data when user prop changes
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        roleId: user.roleId?._id || user.roleId || '',
        isActive: user.isActive !== undefined ? user.isActive : true
      })
    }
  }, [user])

  // Fetch roles on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await roleService.getRoles()
        setRoles(response.roles || [])
      } catch (err) {
        console.error('Error fetching roles:', err)
        setError('Failed to load roles')
      }
    }
    fetchRoles()
  }, [])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.username.trim()) {
      errors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters'
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores'
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required'
    } else if (formData.firstName.length < 2) {
      errors.firstName = 'First name must be at least 2 characters'
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required'
    } else if (formData.lastName.length < 2) {
      errors.lastName = 'Last name must be at least 2 characters'
    }

    if (!formData.roleId) {
      errors.roleId = 'Please select a role'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await userService.updateUser(user._id, formData)

      if (response.success) {
        setSuccess('User updated successfully!')
        notify('User updated successfully!', 'success')
        
        // Call parent callback after showing success message
        if (onUserUpdated) {
          setTimeout(() => {
            onUserUpdated()
          }, 2000)
        }
      }
    } catch (err) {
      console.error('Error updating user:', err)
      const msg = err.response?.data?.message || err.error || 'Failed to update user'
      setError(msg)
      notify(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="rounded-lg shadow-md p-6 bg-white">
        <p className="text-center text-gray-600">
          No user selected for editing
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg shadow-md p-3 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Edit User: {user.username}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Modify user information and settings
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-md transition-colors text-gray-500 hover:text-gray-700 hover:bg-gray-100"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
          <div className="flex items-center">
            <span className="mr-2">✅</span>
            {success}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          <div className="flex items-center">
            <span className="mr-2">❌</span>
            {error}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-2 text-gray-700">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className={`block w-full px-2 py-1 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                validationErrors.username
                  ? 'border-red-300 bg-white text-gray-900'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Enter username"
            />
            {validationErrors.username && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.username}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`block w-full px-2 py-1 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                validationErrors.email
                  ? 'border-red-300 bg-white text-gray-900'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Enter email address"
            />
            {validationErrors.email && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
            )}
          </div>
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Name */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium mb-2 text-gray-700">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className={`block w-full px-2 py-1 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                validationErrors.firstName
                  ? 'border-red-300 bg-white text-gray-900'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Enter first name"
            />
            {validationErrors.firstName && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium mb-2 text-gray-700">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className={`block w-full px-2 py-1 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                validationErrors.lastName
                  ? 'border-red-300 bg-white text-gray-900'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Enter last name"
            />
            {validationErrors.lastName && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.lastName}</p>
            )}
          </div>
        </div>

        {/* Role Selection */}
        <div>
          <label htmlFor="roleId" className="block text-sm font-medium mb-2 text-gray-700">
            Role <span className="text-red-500">*</span>
          </label>
          <select
            id="roleId"
            name="roleId"
            value={formData.roleId}
            onChange={handleInputChange}
            className={`block w-full px-2 py-1 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              validationErrors.roleId
                ? 'border-red-300 bg-white text-gray-900'
                : 'border-gray-300 bg-white text-gray-900'
            }`}
          >
            <option value="">Select a role</option>
            {roles.map((role) => (
              <option key={role._id} value={role._id}>
                {role.name}
              </option>
            ))}
          </select>
          {validationErrors.roleId && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.roleId}</p>
          )}
        </div>

        {/* Status Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
            Active User
          </label>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 border rounded-md font-medium transition-colors border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-1 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating...
              </div>
            ) : (
              'Update User'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditUser