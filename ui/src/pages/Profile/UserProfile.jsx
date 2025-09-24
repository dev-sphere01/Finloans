import React, { useState, useEffect } from 'react'
import useAuthStore from '@/store/authStore'
import userService from '@/services/userService'
import roleService from '@/services/roleService'
import notification from '@/services/NotificationService'
import { FiUser, FiEdit3, FiSave, FiX, FiMail, FiCalendar, FiShield } from 'react-icons/fi'

const UserProfile = () => {
    const { user: authUser } = useAuthStore()
    const { success: notifySuccess, error: notifyError } = notification()

    const [user, setUser] = useState(null)
    const [roles, setRoles] = useState([])
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        roleId: '',
        isActive: true
    })

    const [validationErrors, setValidationErrors] = useState({})

    // Fetch user data and roles
    useEffect(() => {
        const fetchData = async () => {
            if (!authUser?.id) return

            try {
                setLoading(true)
                setError('')

                // Fetch current user data
                const userResponse = await userService.getUserById(authUser.id)
                const userData = userResponse.user || userResponse

                setUser(userData)
                setFormData({
                    username: userData.username || '',
                    email: userData.email || '',
                    firstName: userData.firstName || '',
                    lastName: userData.lastName || '',
                    roleId: userData.roleId?._id || userData.roleId || '',
                    isActive: userData.isActive !== undefined ? userData.isActive : true
                })

                // Fetch roles for display
                const rolesResponse = await roleService.getAll()
                setRoles(rolesResponse.roles || [])

            } catch (err) {
                console.error('Error fetching profile data:', err)
                setError('Failed to load profile data')
                // Don't call notifyError here to avoid dependency issues
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [authUser?.id])

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
        }

        if (!formData.email.trim()) {
            errors.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Please enter a valid email address'
        }

        if (!formData.firstName.trim()) {
            errors.firstName = 'First name is required'
        }

        if (!formData.lastName.trim()) {
            errors.lastName = 'Last name is required'
        }

        setValidationErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleEdit = () => {
        setIsEditing(true)
    }

    const handleCancel = () => {
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
        setIsEditing(false)
        setValidationErrors({})
    }

    const handleSave = async () => {
        if (!validateForm()) {
            return
        }

        setSaving(true)
        setError('')

        try {
            const response = await userService.updateUser(authUser.id, formData)

            if (response.success || response) {
                // Update local user state
                const updatedUser = { ...user, ...formData }
                setUser(updatedUser)
                setIsEditing(false)
                notifySuccess('Profile updated successfully!')
            }
        } catch (err) {
            console.error('Error updating profile:', err)
            const msg = err.response?.data?.message || err.error || 'Failed to update profile'
            setError(msg)
            notifyError(msg)
        } finally {
            setSaving(false)
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const getUserRole = () => {
        if (!user?.roleId) return 'No Role'
        if (typeof user.roleId === 'object') {
            return user.roleId.name || 'Unknown Role'
        }
        const role = roles.find(r => r._id === user.roleId)
        return role?.name || 'Unknown Role'
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading profile...</p>
                </div>
            </div>
        )
    }

    if (error && !user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        <strong>Error:</strong> {error}
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-gray-600">No profile data available</p>
                </div>
            </div>
        )
    }

    return (
        <div className="mx-auto p-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Profile Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            {/* Avatar */}
                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                <FiUser className="w-10 h-10" />
                            </div>

                            {/* User Info */}
                            <div>
                                <h1 className="text-2xl font-bold text-white">
                                    {user.firstName} {user.lastName}
                                </h1>
                                <p className="text-blue-100">@{user.username}</p>
                                <div className="flex items-center space-x-4 mt-2">
                                    <span className="text-blue-100 text-sm">ID: {user._id}</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.isActive
                                        ? 'bg-green-500 text-white'
                                        : 'bg-red-500 text-white'
                                        }`}>
                                        {user.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Edit Button */}
                        <div className="flex space-x-2">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 disabled:opacity-50"
                                    >
                                        {saving ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        ) : (
                                            <FiSave className="w-4 h-4" />
                                        )}
                                        <span>{saving ? 'Saving...' : 'Save'}</span>
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        disabled={saving}
                                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 disabled:opacity-50"
                                    >
                                        <FiX className="w-4 h-4" />
                                        <span>Cancel</span>
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={handleEdit}
                                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-md flex items-center space-x-2"
                                >
                                    <FiEdit3 className="w-4 h-4" />
                                    <span>Edit Profile</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mx-6 mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                        <div className="flex items-center">
                            <span className="mr-2">❌</span>
                            {error}
                        </div>
                    </div>
                )}

                {/* Profile Content */}
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal Information */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                                Personal Information
                            </h3>

                            {/* Username */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <FiUser className="inline w-4 h-4 mr-1" />
                                    Username
                                </label>
                                {isEditing ? (
                                    <div>
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleInputChange}
                                            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.username
                                                ? 'border-red-300'
                                                : 'border-gray-300'
                                                }`}
                                        />
                                        {validationErrors.username && (
                                            <p className="mt-1 text-sm text-red-600">{validationErrors.username}</p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{user.username}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <FiMail className="inline w-4 h-4 mr-1" />
                                    Email Address
                                </label>
                                {isEditing ? (
                                    <div>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.email
                                                ? 'border-red-300'
                                                : 'border-gray-300'
                                                }`}
                                        />
                                        {validationErrors.email && (
                                            <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{user.email}</p>
                                )}
                            </div>

                            {/* First Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    First Name
                                </label>
                                {isEditing ? (
                                    <div>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.firstName
                                                ? 'border-red-300'
                                                : 'border-gray-300'
                                                }`}
                                        />
                                        {validationErrors.firstName && (
                                            <p className="mt-1 text-sm text-red-600">{validationErrors.firstName}</p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{user.firstName}</p>
                                )}
                            </div>

                            {/* Last Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Last Name
                                </label>
                                {isEditing ? (
                                    <div>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.lastName
                                                ? 'border-red-300'
                                                : 'border-gray-300'
                                                }`}
                                        />
                                        {validationErrors.lastName && (
                                            <p className="mt-1 text-sm text-red-600">{validationErrors.lastName}</p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{user.lastName}</p>
                                )}
                            </div>
                        </div>

                        {/* Account Information */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                                Account Information
                            </h3>

                            {/* Role */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <FiShield className="inline w-4 h-4 mr-1" />
                                    Role
                                </label>
                                <div className="bg-gray-50 px-3 py-2 rounded-md">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {getUserRole()}
                                    </span>
                                </div>
                            </div>

                            {/* Account Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Account Status
                                </label>
                                <div className="bg-gray-50 px-3 py-2 rounded-md">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isActive
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                        }`}>
                                        {user.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>

                            {/* Created Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <FiCalendar className="inline w-4 h-4 mr-1" />
                                    Account Created
                                </label>
                                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                                    {formatDate(user.createdAt)}
                                </p>
                            </div>

                            {/* Last Updated */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <FiCalendar className="inline w-4 h-4 mr-1" />
                                    Last Updated
                                </label>
                                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                                    {formatDate(user.updatedAt)}
                                </p>
                            </div>

                            {/* User ID */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    User ID
                                </label>
                                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md font-mono text-sm">
                                    {user._id}
                                </p>
                            </div>
                        </div>
                    </div>

                   
                </div>
            </div>
        </div>
    )
}

export default UserProfile