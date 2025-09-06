import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, Save, Trash2, Users, Clock } from 'lucide-react';
import { confirm } from '@/services/ConfirmationService';
import notification from '@/services/NotificationService';
import PositionService from '@/services/Positions/positions';
import { getAllDepartments, getDepartmentById } from '@/services/Departments';

const EditPosition = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        positionName: '',
        deptID: '',
        reportsTo: []
    });
    const [originalData, setOriginalData] = useState({});
    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);
    const [filteredPositions, setFilteredPositions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                // Load departments and positions first
                const [deptData, posData] = await Promise.all([
                    getAllDepartments(),
                    PositionService.getAllPositions()
                ]);
                
                setDepartments(deptData);
                setPositions(posData);

                // Load position data
                const position = await PositionService.getPositionById(id);
                if (position) {
                    const positionFormData = {
                        positionName: position.PositionName || '',
                        deptID: position.DeptID ? position.DeptID.toString() : '',
                        reportsTo: Array.isArray(position.ReportsTo) ? position.ReportsTo.map(id => id.toString()) : []
                    };
                    
                    setFormData(positionFormData);
                    
                    // Set original data for comparison
                    const originalFormData = {
                        ...positionFormData,
                        positionID: position.PositionID,
                        createdAt: position.CreatedAt || new Date().toISOString(),
                        deptName: ''
                    };
                    setOriginalData(originalFormData);

                    // Get department name
                    if (position.DeptID) {
                        try {
                            const dept = await getDepartmentById(position.DeptID);
                            setOriginalData(prev => ({ 
                                ...prev, 
                                deptName: dept?.DeptName || 'Unknown Department' 
                            }));
                        } catch (error) {
                            console.error('Error loading department name:', error);
                            setOriginalData(prev => ({ 
                                ...prev, 
                                deptName: 'Unknown Department' 
                            }));
                        }
                    }
                } else {
                    notification().error('Position not found');
                    navigate('/dashboard/positions');
                }
            } catch (error) {
                console.error('Error loading position:', error);
                notification().error('Failed to load position data');
                navigate('/dashboard/positions');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadInitialData();
        }
    }, [id, navigate]);

    // Filter positions by selected department and search term
    useEffect(() => {
        if (formData.deptID) {
            let filtered = positions.filter(pos => 
                pos.DeptID === parseInt(formData.deptID) && 
                pos.PositionID !== parseInt(id) // Exclude current position
            );
            
            // Apply search filter if search term exists
            if (searchTerm.trim()) {
                filtered = filtered.filter(pos =>
                    pos.PositionName.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }
            
            setFilteredPositions(filtered);
        } else {
            setFilteredPositions([]);
        }
    }, [formData.deptID, positions, id, searchTerm]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // If department is changing, clear search term and invalid reports to
        if (name === 'deptID') {
            setSearchTerm('');
            // Clear reports to that are not in the new department
            if (value) {
                const validReportsTo = formData.reportsTo.filter(posId => {
                    const pos = positions.find(p => p.PositionID === parseInt(posId));
                    return pos && pos.DeptID === parseInt(value);
                });
                setFormData(prev => ({
                    ...prev,
                    [name]: value,
                    reportsTo: validReportsTo
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    [name]: value,
                    reportsTo: []
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        // Clear errors when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleReportsToAdd = (positionId) => {
        const positionIdStr = positionId.toString();
        // Only add if not already present (prevent duplicates)
        if (!formData.reportsTo.includes(positionIdStr)) {
            setFormData(prev => ({
                ...prev,
                reportsTo: [...prev.reportsTo, positionIdStr]
            }));
        }
    };

    const removeReportsTo = (positionId) => {
        const positionIdStr = positionId.toString();
        setFormData(prev => ({
            ...prev,
            reportsTo: prev.reportsTo.filter(id => id !== positionIdStr)
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.positionName?.trim()) {
            newErrors.positionName = 'Position name is required';
        } else if (formData.positionName.trim().length < 2) {
            newErrors.positionName = 'Position name must be at least 2 characters long';
        } else if (formData.positionName.trim().length > 50) {
            newErrors.positionName = 'Position name must not exceed 50 characters';
        }

        if (!formData.deptID) {
            newErrors.deptID = 'Department is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const hasChanges = () => {
        return (
            formData.positionName.trim() !== originalData.positionName ||
            formData.deptID !== originalData.deptID ||
            JSON.stringify(formData.reportsTo.sort()) !== JSON.stringify(originalData.reportsTo.sort())
        );
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

        setIsSubmitting(true);
        notification().loading('Updating position...');

        try {
            const updateData = {
                PositionID: originalData.positionID || parseInt(id),
                PositionName: formData.positionName.trim(),
                DeptID: parseInt(formData.deptID),
                ReportsTo: formData.reportsTo.map(id => parseInt(id))
            };

            // Use the correct function name from the service
            await PositionService.editPosition(id, updateData);
            notification().success(`Position "${formData.positionName.trim()}" updated successfully!`);
            
            // Update original data to reflect changes
            setOriginalData(prev => ({
                ...prev,
                positionName: formData.positionName.trim(),
                deptID: formData.deptID,
                reportsTo: formData.reportsTo
            }));
        } catch (error) {
            console.error('Error updating position:', error);
            notification().error(error.message || 'Failed to update position. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        const confirmed = await confirm({
            title: "Delete Position",
            message: `Are you sure you want to delete "${originalData.positionName}"? This action cannot be undone.`
        });

        if (confirmed) {
            setIsDeleting(true);
            notification().loading('Deleting position...');

            try {
                // Note: You'll need to implement deletePosition in the service
                // await PositionService.deletePosition(id);
                notification().success(`Position "${originalData.positionName}" deleted successfully!`);
                navigate('/dashboard/positions');
            } catch (error) {
                console.error('Error deleting position:', error);
                notification().error('Failed to delete position. Please try again.');
                setIsDeleting(false);
            }
        } else {
            notification().info('Position deletion cancelled');
        }
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-64">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading position data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Position</h1>
                    <p className="text-gray-600">Modify position information and manage settings</p>
                </div>
                <Link
                    to="/dashboard/positions"
                    className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                >
                    <ArrowLeft size={16} />
                    Back to Positions
                </Link>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Form - Takes 2/3 of the width on large screens */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Briefcase className="text-green-600" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Position Information</h2>
                                <p className="text-sm text-gray-500">
                                    {originalData.createdAt && (
                                        `Created on ${new Date(originalData.createdAt).toLocaleDateString('en-IN', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}`
                                    )}
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Position Name */}
                                <div>
                                    <label htmlFor="positionName" className="block text-sm font-medium text-gray-700 mb-2">
                                        Position Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="positionName"
                                        name="positionName"
                                        value={formData.positionName}
                                        onChange={handleInputChange}
                                        placeholder="Enter position name"
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                                            errors.positionName
                                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                        }`}
                                        disabled={isSubmitting}
                                    />
                                    {errors.positionName && (
                                        <p className="mt-1 text-sm text-red-600">{errors.positionName}</p>
                                    )}
                                </div>

                                {/* Department */}
                                <div>
                                    <label htmlFor="deptID" className="block text-sm font-medium text-gray-700 mb-2">
                                        Department <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="deptID"
                                        name="deptID"
                                        value={formData.deptID}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                                            errors.deptID
                                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                        }`}
                                        disabled={isSubmitting}
                                    >
                                        <option value="">Select a department</option>
                                        {departments.map(dept => (
                                            <option key={dept.DeptID} value={dept.DeptID}>
                                                {dept.DeptName}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.deptID && (
                                        <p className="mt-1 text-sm text-red-600">{errors.deptID}</p>
                                    )}
                                </div>
                            </div>

                            {/* Reports To */}
                            {formData.deptID && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Reports To (Optional)
                                    </label>
                                    <p className="text-xs text-gray-500 mb-3">
                                        Select positions that this position will report to. You can select multiple positions.
                                    </p>

                                    {/* Selected badges */}
                                    {formData.reportsTo.length > 0 && (
                                        <div className="mb-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-xs font-medium text-gray-600">
                                                    Selected ({formData.reportsTo.length}):
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, reportsTo: [] }))}
                                                    className="text-xs text-red-600 hover:text-red-800 underline"
                                                    title="Clear all selected positions"
                                                >
                                                    Clear All
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {formData.reportsTo.map((posId) => {
                                                    const selected = positions.find(p => p.PositionID === parseInt(posId));
                                                    return (
                                                        <span
                                                            key={posId}
                                                            className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                                        >
                                                            {selected?.PositionName || `Position ${posId}`}
                                                            <button
                                                                type="button"
                                                                onClick={() => removeReportsTo(posId)}
                                                                className="ml-1 text-blue-500 hover:text-red-500 font-bold"
                                                                title="Remove this position"
                                                            >
                                                                ×
                                                            </button>
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Search input */}
                                    <input
                                        type="text"
                                        placeholder="Search positions in this department..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        disabled={isSubmitting}
                                    />

                                    {/* Available positions */}
                                    <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg">
                                        {filteredPositions.length === 0 ? (
                                            <p className="text-sm text-gray-500 p-4 text-center">
                                                {searchTerm.trim() 
                                                    ? `No positions found matching "${searchTerm}"` 
                                                    : "No positions available in this department"
                                                }
                                            </p>
                                        ) : (
                                            <>
                                                <div className="p-3 bg-gray-50 border-b text-xs text-gray-600">
                                                    Available positions ({filteredPositions.length}):
                                                </div>
                                                {filteredPositions.map((pos) => {
                                                    const isSelected = formData.reportsTo.includes(pos.PositionID.toString());
                                                    return (
                                                        <div
                                                            key={pos.PositionID}
                                                            onClick={() => {
                                                                if (!isSelected) {
                                                                    handleReportsToAdd(pos.PositionID);
                                                                }
                                                            }}
                                                            className={`px-4 py-3 transition-colors border-b border-gray-100 last:border-b-0 ${
                                                                isSelected
                                                                    ? 'bg-blue-50 text-blue-700 font-medium cursor-not-allowed opacity-60'
                                                                    : 'cursor-pointer hover:bg-blue-50 text-gray-700'
                                                            }`}
                                                            title={isSelected ? "Already selected" : "Click to add"}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <span>{pos.PositionName}</span>
                                                                {isSelected && (
                                                                    <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                                                                        Selected
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end pt-6 border-t border-gray-200 gap-3">
                                <Link
                                    to="/dashboard/positions"
                                    className={`px-6 py-2 rounded-lg font-medium transition-colors text-center ${
                                        isSubmitting
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
                                            : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                                    }`}
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !formData.positionName.trim() || !hasChanges()}
                                    className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                                        isSubmitting || !formData.positionName.trim() || !hasChanges()
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
                                            {hasChanges() ? 'Update Position' : 'No Changes'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Sidebar - Statistics and Quick Actions */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Position Stats */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Position Overview</h3>
                        <div className="space-y-4">
                            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 text-center">
                                <p className="text-lg font-bold text-green-600 mb-1 truncate">
                                    {originalData.deptName || 'Loading...'}
                                </p>
                                <p className="text-sm text-green-800">Department</p>
                            </div>
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 text-center">
                                <p className="text-2xl font-bold text-blue-600 mb-1">
                                    {formData.reportsTo.length}
                                </p>
                                <p className="text-sm text-blue-800">Reports To</p>
                            </div>
                            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 text-center">
                                <p className="text-lg font-bold text-purple-600 mb-1 truncate">
                                    {originalData.positionName || 'Loading...'}
                                </p>
                                <p className="text-sm text-purple-800">Position Name</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <button
                                className="w-full flex items-center gap-3 px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                onClick={() => {/* Handle view employees */ }}
                            >
                                <div className="p-2 bg-blue-100 rounded">
                                    <Users className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">View Employees</p>
                                    <p className="text-xs text-gray-500">See all position holders</p>
                                </div>
                            </button>

                            <button
                                className="w-full flex items-center gap-3 px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                onClick={() => {/* Handle position history */ }}
                            >
                                <div className="p-2 bg-green-100 rounded">
                                    <Clock className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Position History</p>
                                    <p className="text-xs text-gray-500">View change history</p>
                                </div>
                            </button>

                            {/* Delete Button - Uncomment when ready */}
                            {/* <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                            >
                                <div className="p-2 bg-red-100 rounded">
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-red-900">Delete Position</p>
                                    <p className="text-xs text-red-500">Permanently remove position</p>
                                </div>
                            </button> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditPosition;
