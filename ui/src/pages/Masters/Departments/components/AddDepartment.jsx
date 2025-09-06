import React, { useState } from 'react';
import { ArrowLeft, Building, Save } from 'lucide-react';
import {CreateDepartmentService} from '@/services/Departments';
import notification from '@/services/NotificationService';

const AddDepartment = () => {
    const [deptName, setDeptName] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e) => {
        setDeptName(e.target.value);
        if (error) setError('');
    };

    const validateForm = () => {
        const validation = CreateDepartmentService.validateDepartmentData({ deptName });
        if (!validation.isValid) {
            const deptError = validation.errors.find(e => e.includes('Department name'));
            setError(deptError || 'Invalid input');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            notification().error('Please fix the error before submitting');
            return;
        }

        setIsSubmitting(true);
        notification().loading('Adding department...');

        try {
            await CreateDepartmentService.createDepartment({ deptName: deptName.trim() });
            notification().success(`Department "${deptName.trim()}" added successfully!`);
            setDeptName('');
            setError('');
        } catch (err) {
            notification().error(err.message || 'Failed to add department. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add Department</h1>
                    <p className="text-gray-600 text-sm sm:text-base">Create a new department</p>
                </div>
                <button
                    onClick={() => window.history.back()}
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors text-sm"
                >
                    <ArrowLeft size={16} />
                    Back to Departments
                </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 space-y-6">
                <div className="flex items-center gap-2 mb-4">
                    <Building className="text-blue-600" size={20} />
                    <h2 className="text-lg font-semibold text-gray-900">Department Information</h2>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="deptName"
                        value={deptName}
                        onChange={handleInputChange}
                        placeholder="e.g., Human Resources, Engineering"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${error ? 'border-red-300' : 'border-gray-300'}`}
                        disabled={isSubmitting}
                    />
                    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t">
                    <button
                        onClick={() => window.history.back()}
                        type="button"
                        className="w-full sm:w-auto px-4 py-2 text-center text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || !deptName.trim()}
                        className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${isSubmitting || !deptName.trim()
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Adding...
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                Add Department
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddDepartment;
