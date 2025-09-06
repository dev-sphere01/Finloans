import React, { useState, useEffect, useMemo } from 'react';
import PayrollSlabsServices from '@/services/PayrollSlabs/PayrollSlabs';
import {
    notification,
    TableService,
    ConfirmationService
} from '@/services';
import { Plus, Edit, Trash2 } from 'lucide-react';
import AddOrEditModal from './components/AddOrEditModal';

const PayrollSlabs = () => {
    const [slabs, setSlabs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        MinHours: '',
        MaxHours: '',
        Multiplier: '',
        IsFlatBasic: false,
        IsPenalty: false,
        Description: ''
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const notify = notification();

    // Load slabs on component mount
    useEffect(() => {
        loadSlabs();
    }, []);

    const loadSlabs = async () => {
        setLoading(true);
        try {
            const data = await PayrollSlabsServices.getAllSlabs();
            if (data) {
                setSlabs(data);
            }
        } catch (error) {
            notify.error('Failed to load payroll slabs');
        } finally {
            setLoading(false);
        }
    };

    // Reset form data
    const resetForm = () => {
        setFormData({
            MinHours: '',
            MaxHours: '',
            Multiplier: '',
            IsFlatBasic: false,
            IsPenalty: false,
            Description: ''
        });
        setErrors({});
        setEditingId(null);
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Validate form data
    const validateForm = () => {
        const newErrors = {};

        if (!formData.MinHours || formData.MinHours < 0) {
            newErrors.MinHours = 'Minimum hours is required and must be non-negative';
        }

        if (formData.MaxHours !== '' && formData.MaxHours < 0) {
            newErrors.MaxHours = 'Maximum hours must be non-negative';
        }

        if (formData.MaxHours !== '' && formData.MinHours !== '' &&
            parseFloat(formData.MaxHours) <= parseFloat(formData.MinHours)) {
            newErrors.MaxHours = 'Maximum hours must be greater than minimum hours';
        }

        if (!formData.Multiplier || formData.Multiplier <= 0) {
            newErrors.Multiplier = 'Multiplier is required and must be positive';
        }

        if (!formData.Description.trim()) {
            newErrors.Description = 'Description is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            notify.error('Please fix the validation errors');
            return;
        }

        setSubmitting(true);

        try {
            const payload = {
                MinHours: parseFloat(formData.MinHours),
                MaxHours: formData.MaxHours === '' ? null : parseFloat(formData.MaxHours),
                Multiplier: parseFloat(formData.Multiplier),
                IsFlatBasic: formData.IsFlatBasic,
                IsPenalty: formData.IsPenalty,
                Description: formData.Description.trim()
            };

            // For updates, include the SlabID in the payload as required by the API
            if (editingId) {
                payload.SlabID = editingId;
            }

            let result;
            if (editingId) {
                result = await PayrollSlabsServices.updateSlab(editingId, payload);
                if (result !== null) {
                    notify.success('Payroll slab updated successfully');
                } else {
                    notify.error('Failed to update payroll slab');
                    return;
                }
            } else {
                result = await PayrollSlabsServices.createSlab(payload);
                if (result !== null) {
                    notify.success('Payroll slab created successfully');
                } else {
                    notify.error('Failed to create payroll slab');
                    return;
                }
            }

            // Only proceed if we have a valid result
            if (result !== null) {
                setShowModal(false);
                resetForm();
                loadSlabs();
            }
        } catch (error) {
            notify.error(editingId ? 'Failed to update payroll slab' : 'Failed to create payroll slab');
        } finally {
            setSubmitting(false);
        }
    };

    // Handle edit action
    const handleEdit = (slab) => {
        const newFormData = {
            MinHours: slab.MinHours?.toString() || '',
            MaxHours: slab.MaxHours !== null ? slab.MaxHours?.toString() : '',
            Multiplier: slab.Multiplier?.toString() || '',
            IsFlatBasic: Boolean(slab.IsFlatBasic),
            IsPenalty: Boolean(slab.IsPenalty),
            Description: slab.Description || ''
        };
        setFormData(newFormData);
        setEditingId(slab.SlabID);
        setErrors({}); // Clear any existing errors
        setShowModal(true);
    };

    // Handle delete action
    const handleDelete = async (slab) => {
        const confirmed = await ConfirmationService.confirm({
            title: "Delete Payroll Slab",
            message: `Are you sure you want to delete this payroll slab? This action cannot be undone.`,
            confirmText: "Delete",
            cancelText: "Cancel"
        });

        if (confirmed) {
            try {
                const result = await PayrollSlabsServices.deleteSlab(slab.SlabID);
                if (result !== null) {
                    notify.success('Payroll slab deleted successfully');
                    loadSlabs();
                } else {
                    notify.error('Failed to delete payroll slab');
                }
            } catch (error) {
                notify.error('Failed to delete payroll slab');
            }
        }
    };

    // Handle add new slab
    const handleAddNew = () => {
        resetForm();
        setShowModal(true);
    };

    // Handle modal close
    const handleModalClose = () => {
        setShowModal(false);
        resetForm();
    };

    // Table columns configuration
    const columns = useMemo(() => [
        {
            accessorKey: 'SlabID',
            header: 'Slab ID',
            enableSorting: true,
            size: 100,
        },
        {
            accessorKey: 'MinHours',
            header: 'Min Hours',
            enableSorting: true,
            size: 120,
            cell: ({ row }) => (
                <span className="font-medium text-gray-900">
                    {row.original.MinHours}
                </span>
            ),
        },
        {
            accessorKey: 'MaxHours',
            header: 'Max Hours',
            enableSorting: true,
            size: 120,
            cell: ({ row }) => (
                <span className="font-medium text-gray-900">
                    {row.original.MaxHours || 'No Limit'}
                </span>
            ),
        },
        {
            accessorKey: 'Multiplier',
            header: 'Multiplier',
            enableSorting: true,
            size: 120,
            cell: ({ row }) => (
                <span className="font-semibold text-blue-600">
                    {row.original.Multiplier}x
                </span>
            ),
        },
        {
            accessorKey: 'IsFlatBasic',
            header: 'Flat Basic',
            enableSorting: true,
            size: 120,
            cell: ({ row }) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.original.IsFlatBasic
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                    }`}>
                    {row.original.IsFlatBasic ? 'Yes' : 'No'}
                </span>
            ),
        },
        {
            accessorKey: 'IsPenalty',
            header: 'Penalty',
            enableSorting: true,
            size: 120,
            cell: ({ row }) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.original.IsPenalty
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                    }`}>
                    {row.original.IsPenalty ? 'Yes' : 'No'}
                </span>
            ),
        },
        {
            accessorKey: 'Description',
            header: 'Description',
            enableSorting: false,
            size: 300,
            cell: ({ row }) => (
                <span className="text-sm text-gray-700 line-clamp-2">
                    {row.original.Description}
                </span>
            ),
        },
        {
            accessorKey: 'actions',
            header: 'Actions',
            enableSorting: false,
            size: 150,
            cell: ({ row }) => {
                const slab = row.original;
                return (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleEdit(slab)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors duration-200"
                            title="Edit Slab"
                        >
                            <Edit size={14} /> Edit
                        </button>
                        <button
                            onClick={() => handleDelete(slab)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors duration-200"
                            title="Delete Slab"
                        >
                            <Trash2 size={14} /> Delete
                        </button>
                    </div>
                );
            },
        },
    ], []);

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payroll Slabs</h1>
                        <p className="text-gray-600">Manage payroll calculation slabs and multipliers</p>
                    </div>
                    <button
                        onClick={handleAddNew}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        <Plus size={16} /> Add Slab
                    </button>
                </div>
            </div>

            {/* Table */}
            <div>
                <TableService
                    columns={columns}
                    data={slabs}
                    initialPageSize={10}
                    loading={loading}
                    serverPagination={false}
                />
            </div>

            {/* Modal */}
            <AddOrEditModal
                showModal={showModal}
                handleModalClose={handleModalClose}
                formData={formData}
                handleInputChange={handleInputChange}
                errors={errors}
                handleSubmit={handleSubmit}
                submitting={submitting}
                editingId={editingId}
            />
        </div>
    );
};

export default PayrollSlabs;
