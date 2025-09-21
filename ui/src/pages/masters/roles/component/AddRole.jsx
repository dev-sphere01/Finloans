import React, { useState, useEffect } from 'react'
import modulesData from '@/store/modules.json'
import notification from '@/services/NotificationService'
import roleService from '@/services/roleService'

const AddRole = ({ onRoleCreated }) => {
  const notify = notification()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    level: 10,
    isActive: true,
    isSystem: false,
    permissions: []
  })

  const [validationErrors, setValidationErrors] = useState({})
  const [expandedModules, setExpandedModules] = useState({})
  const [selectedPermissions, setSelectedPermissions] = useState(new Set())

  // Initialize expanded modules
  useEffect(() => {
    const initialExpanded = {}
    modulesData.forEach(module => {
      initialExpanded[module.module] = false
    })
    setExpandedModules(initialExpanded)
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

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }))
  }

  const handlePermissionChange = (permission, checked) => {
    const newSelectedPermissions = new Set(selectedPermissions)

    if (checked) {
      newSelectedPermissions.add(permission)
    } else {
      newSelectedPermissions.delete(permission)
    }

    setSelectedPermissions(newSelectedPermissions)
    setFormData(prev => ({
      ...prev,
      permissions: Array.from(newSelectedPermissions)
    }))
  }

  const handleModuleSelectAll = (module, checked) => {
    const newSelectedPermissions = new Set(selectedPermissions)

    module.actions.forEach(action => {
      const permission = `${module.module}.${action}`
      if (checked) {
        newSelectedPermissions.add(permission)
      } else {
        newSelectedPermissions.delete(permission)
      }
    })

    setSelectedPermissions(newSelectedPermissions)
    setFormData(prev => ({
      ...prev,
      permissions: Array.from(newSelectedPermissions)
    }))
  }

  const isModuleFullySelected = (module) => {
    return module.actions.every(action =>
      selectedPermissions.has(`${module.module}.${action}`)
    )
  }

  const isModulePartiallySelected = (module) => {
    return module.actions.some(action =>
      selectedPermissions.has(`${module.module}.${action}`)
    ) && !isModuleFullySelected(module)
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.name.trim()) {
      errors.name = 'Role name is required'
    } else if (formData.name.length < 2) {
      errors.name = 'Role name must be at least 2 characters'
    } else if (formData.name.length > 50) {
      errors.name = 'Role name cannot exceed 50 characters'
    } else if (!/^[a-zA-Z0-9 _-]+$/.test(formData.name)) {
      errors.name = 'Role name can only contain letters, numbers, spaces, underscores, and hyphens'
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required'
    } else if (formData.description.length < 10) {
      errors.description = 'Description must be at least 10 characters'
    }

    if (formData.level < 1 || formData.level > 100) {
      errors.level = 'Level must be between 1 and 100'
    }

    if (formData.permissions.length === 0) {
      errors.permissions = 'At least one permission must be selected'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    console.log('Submit button clicked')
    e.preventDefault()

    if (!validateForm()) {
        console.log('Form validation failed')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const transformedPermissions = formData.permissions.reduce((acc, permission) => {
        const [resource, action] = permission.split('.')
        if (!resource || !action) {
          console.warn(`Invalid permission format: ${permission}`)
          return acc
        }

        let resourceEntry = acc.find(entry => entry.resource === resource)
        if (!resourceEntry) {
          resourceEntry = { resource, actions: [] }
          acc.push(resourceEntry)
        }
        resourceEntry.actions.push(action)
        return acc
      }, [])

      const payload = {
        ...formData,
        permissions: transformedPermissions
      }

      console.log('Submitting form data:', payload)
      const response = await roleService.create(payload)

      if (response.success) {
        setSuccess('Role created successfully!')
        notify('Role created successfully!', 'success')
        setFormData({
          name: '',
          description: '',
          level: 10,
          isActive: true,
          isSystem: false,
          permissions: []
        })
        setSelectedPermissions(new Set())

        // Call parent callback
        if (onRoleCreated) {
          setTimeout(() => {
            onRoleCreated()
          }, 1500)
        }
      }
    } catch (err) {
      console.error('Error creating role:', err)
      console.error('Error details:', err.response?.data || err.message)
      const msg = err.response?.data?.message || 'Failed to create role'
      setError(msg)
      notify(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg shadow-md p-6 bg-white">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Create New Role
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Define a new role with specific permissions and access levels
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
          <div className="flex items-center">
            <span className="mr-2">✅</span>
            {success}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          <div className="flex items-center">
            <span className="mr-2">❌</span>
            {error}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Role Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2 text-gray-700">
              Role Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                validationErrors.name
                  ? 'border-red-300 bg-white text-gray-900'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Enter role name"
            />
            {validationErrors.name && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
            )}
          </div>

          {/* Level */}
          <div>
            <label htmlFor="level" className="block text-sm font-medium mb-2 text-gray-700">
              Role Level <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="level"
              name="level"
              min="1"
              max="100"
              value={formData.level}
              onChange={handleInputChange}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                validationErrors.level
                  ? 'border-red-300 bg-white text-gray-900'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Enter role level (1-100)"
            />
            {validationErrors.level && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.level}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Higher numbers indicate higher privilege levels
            </p>
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2 text-gray-700">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleInputChange}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              validationErrors.description
                ? 'border-red-300 bg-white text-gray-900'
                : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
            }`}
            placeholder="Enter role description"
          />
          {validationErrors.description && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
          )}
        </div>

        {/* Status Checkboxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              Active Role
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isSystem"
              name="isSystem"
              checked={formData.isSystem}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isSystem" className="ml-2 block text-sm text-gray-700">
              System Role
            </label>
          </div>
        </div>

        {/* Permissions Section */}
        <div>
          <label className="block text-sm font-medium mb-4 text-gray-700">
            Permissions <span className="text-red-500">*</span>
          </label>

          {validationErrors.permissions && (
            <p className="mb-3 text-sm text-red-600">{validationErrors.permissions}</p>
          )}

          <div className="border rounded-lg p-4 max-h-96 overflow-y-auto border-gray-300 bg-gray-50">
            {modulesData.map((module) => (
              <div key={module.module} className="mb-4 last:mb-0">
                {/* Module Header */}
                <div className="flex items-center justify-between mb-2">
                  <button
                    type="button"
                    onClick={() => toggleModule(module.module)}
                    className="flex items-center space-x-2 text-left font-medium text-gray-700 hover:text-gray-900"
                  >
                    <span className="text-lg">
                      {expandedModules[module.module] ? '📂' : '📁'}
                    </span>
                    <span>{module.ModuleDisplayName}</span>
                    <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-600">
                      {module.actions.length} actions
                    </span>
                  </button>

                  {/* Select All for Module */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`select-all-${module.module}`}
                      checked={isModuleFullySelected(module)}
                      ref={(el) => {
                        if (el) el.indeterminate = isModulePartiallySelected(module)
                      }}
                      onChange={(e) => handleModuleSelectAll(module, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor={`select-all-${module.module}`}
                      className="text-xs text-gray-500"
                    >
                      Select All
                    </label>
                  </div>
                </div>

                {/* Module Actions */}
                {expandedModules[module.module] && (
                  <div className="ml-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {module.actions.map((action) => {
                      const permission = `${module.module}.${action}`
                      const isChecked = selectedPermissions.has(permission)

                      return (
                        <div key={action} className="flex items-center">
                          <input
                            type="checkbox"
                            id={permission}
                            checked={isChecked}
                            onChange={(e) => handlePermissionChange(permission, e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label
                            htmlFor={permission}
                            className="ml-2 text-sm text-gray-600"
                          >
                            {action}
                          </label>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Selected Permissions Summary */}
          {selectedPermissions.size > 0 && (
            <div className="mt-4 p-3 rounded-md bg-blue-50 border border-blue-200">
              <p className="text-sm font-medium text-blue-700">
                Selected Permissions ({selectedPermissions.size}):
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {Array.from(selectedPermissions).map((permission) => (
                  <span
                    key={permission}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {permission}
                    <button
                      type="button"
                      onClick={() => handlePermissionChange(permission, false)}
                      className="ml-1 hover:text-red-500 text-blue-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => {
              setFormData({
                name: '',
                description: '',
                level: 10,
                isActive: true,
                isSystem: false,
                permissions: []
              })
              setSelectedPermissions(new Set())
              setValidationErrors({})
              setError('')
              setSuccess('')
            }}
            className="px-4 py-2 border rounded-md font-medium transition-colors border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Reset
          </button>

          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </div>
            ) : (
              'Create Role'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddRole
