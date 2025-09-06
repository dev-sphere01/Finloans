import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building, Save, Trash2 } from 'lucide-react';
import { confirm } from '@/services/ConfirmationService';
import notification from '@/services/NotificationService';
import { getDepartmentById, updateDepartment, deleteDepartment } from '@/services/Departments';

const EditDepartment = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        deptName: ''
    });
    const [originalData, setOriginalData] = useState({});
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDepartment = async () => {
            setLoading(true);
            try {
                const department = await getDepartmentById(id);
                if (department) {
                    setFormData({ deptName: department.DeptName });
                    setOriginalData({
                        deptName: department.DeptName,
                        createdAt: new Date().toISOString(), // Fallback if no date provided
                        employeeCount: 0 // Optional placeholder until backend provides real data
                    });
                } else {
                    notification().error('Department not found');
                    navigate('/dashboard/departments');
                }
            } catch (error) {
                console.error('Error loading department:', error);
                notification().error('Failed to load department data');
                navigate('/dashboard/departments');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadDepartment();
        }
    }, [id, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.deptName?.trim()) {
            newErrors.deptName = 'Department name is required';
        } else if (formData.deptName.trim().length < 2) {
            newErrors.deptName = 'Department name must be at least 2 characters long';
        } else if (formData.deptName.trim().length > 50) {
            newErrors.deptName = 'Department name must not exceed 50 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const hasChanges = () => {
        return formData.deptName.trim() !== originalData.deptName;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            notification().error('Please fix the errors before submitting');
            return;
        }

        if (!hasChanges()) {
            notification().info('No changes were made');
            return;
        }

        const trimmedName = formData.deptName.trim();
        setIsSubmitting(true);
        notification().loading('Updating department...');

        try {
            await updateDepartment(id, trimmedName);
            notification().success(`Department "${trimmedName}" updated successfully!`);
            setOriginalData(prev => ({ ...prev, deptName: trimmedName }));
            setFormData({ deptName: trimmedName });
        } catch (error) {
            console.error('Error updating department:', error);
            notification().error('Failed to update department. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        const confirmed = await confirm({
            title: "Delete Department",
            message: `Are you sure you want to delete "${originalData.deptName}"? This action cannot be undone.`
        });

        if (confirmed) {
            setIsDeleting(true);
            notification().loading('Deleting department...');

            try {
                await deleteDepartment(id);
                notification().success(`Department "${originalData.deptName}" deleted successfully!`);
                navigate('/dashboard/departments');
            } catch (error) {
                console.error('Error deleting department:', error);
                notification().error('Failed to delete department. Please try again.');
                setIsDeleting(false);
            }
        } else {
            notification().info('Department deletion cancelled');
        }
    };

    return (
        <div className="p-2">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Edit Department</h1>
                    <p className="text-gray-600">Modify department information and manage settings</p>
                </div>
                <Link
                    to="/dashboard/departments"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                    <ArrowLeft size={16} />
                    Back to Departments
                </Link>
            </div>


            {/* Grid Layout */}
            <div className="grid grid-cols-1  lg:grid-cols-2 gap-2">
                {/* Main Form - Takes 2/3 of the width on large screens */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">

                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Building className="text-blue-600" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Department Information</h2>
                                <p className="text-sm text-gray-500">
                                    Created on {new Date(originalData.createdAt).toLocaleDateString('en-IN', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-2">
                            <div>
                                <label htmlFor="deptName" className="block text-sm font-medium text-gray-700 mb-2">
                                    Department Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="deptName"
                                    name="deptName"
                                    value={formData.deptName}
                                    onChange={handleInputChange}
                                    placeholder="Enter department name"
                                    className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.deptName
                                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                        }`}
                                    disabled={isSubmitting}
                                />
                                {errors.deptName && (
                                    <p className="mt-1 text-sm text-red-600">{errors.deptName}</p>
                                )}
                                <p className="mt-1 text-sm text-gray-500">
                                    Enter a unique department name (2-50 characters)
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end pt-2 border-t border-gray-200 gap-3">
                                <Link
                                    to="/dashboard/departments"
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors text-center ${isSubmitting
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
                                        : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                                        }`}
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !formData.deptName.trim() || !hasChanges()}
                                    className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all duration-200 ${isSubmitting || !formData.deptName.trim() || !hasChanges()
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} />
                                            {hasChanges() ? 'Update Department' : 'No Changes'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Sidebar - Takes 2/12 columns on large screens */}
                <div className="lg:col-span-2 space-y-6 lg:space-y-0 lg:flex lg:gap-6">
                    {/* Department Stats */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 w-full lg:w-1/2">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Statistics</h3>
                        <div className="space-y-4">
                            <div className="bg-blue-50 rounded-lg p-4 text-center">
                                <p className="text-3xl font-bold text-blue-600 mb-1">{originalData.employeeCount}</p>
                                <p className="text-sm text-blue-800">
                                    Employee{originalData.employeeCount !== 1 ? 's' : ''}
                                </p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4 text-center">
                                <p className="text-3xl font-bold text-green-600 mb-1">
                                    {Math.floor((Date.now() - new Date(originalData.createdAt)) / (1000 * 60 * 60 * 24))}
                                </p>
                                <p className="text-sm text-green-800">Days Active</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 w-full lg:w-1/2 mt-6 lg:mt-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <button
                                className="w-full flex items-center gap-3 px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                onClick={() => {/* Handle view employees */ }}
                            >
                                <div className="p-2 bg-blue-100 rounded">
                                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">View Employees</p>
                                    <p className="text-xs text-gray-500">See all department members</p>
                                </div>
                            </button>

                            <button
                                className="w-full flex items-center gap-3 px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                onClick={() => {/* Handle department history */ }}
                            >
                                <div className="p-2 bg-green-100 rounded">
                                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">View History</p>
                                    <p className="text-xs text-gray-500">Department change logs</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default EditDepartment;