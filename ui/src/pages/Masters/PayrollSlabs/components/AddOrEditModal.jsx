import React from 'react'

const AddOrEditModal = ({ showModal, handleModalClose, formData, handleInputChange, errors, handleSubmit, submitting, editingId }) => {
    return (
        <div>
            {showModal && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {editingId ? 'Edit Payroll Slab' : 'Add New Payroll Slab'}
                                </h2>
                                <button
                                    onClick={handleModalClose}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Min Hours */}
                                    <div>
                                        <label htmlFor="MinHours" className="block text-sm font-medium text-gray-700 mb-2">
                                            Minimum Hours <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            id="MinHours"
                                            name="MinHours"
                                            value={formData.MinHours}
                                            onChange={handleInputChange}
                                            min="0"
                                            step="0.01"
                                            placeholder="Enter minimum hours"
                                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.MinHours
                                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                                }`}
                                            disabled={submitting}
                                        />
                                        {errors.MinHours && (
                                            <p className="mt-1 text-sm text-red-600">{errors.MinHours}</p>
                                        )}
                                    </div>

                                    {/* Max Hours */}
                                    <div>
                                        <label htmlFor="MaxHours" className="block text-sm font-medium text-gray-700 mb-2">
                                            Maximum Hours
                                        </label>
                                        <input
                                            type="number"
                                            id="MaxHours"
                                            name="MaxHours"
                                            value={formData.MaxHours}
                                            onChange={handleInputChange}
                                            min="0"
                                            step="0.01"
                                            placeholder="Enter maximum hours (optional)"
                                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.MaxHours
                                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                                }`}
                                            disabled={submitting}
                                        />
                                        {errors.MaxHours && (
                                            <p className="mt-1 text-sm text-red-600">{errors.MaxHours}</p>
                                        )}
                                    </div>

                                    {/* Multiplier */}
                                    <div>
                                        <label htmlFor="Multiplier" className="block text-sm font-medium text-gray-700 mb-2">
                                            Multiplier <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            id="Multiplier"
                                            name="Multiplier"
                                            value={formData.Multiplier}
                                            onChange={handleInputChange}
                                            min="0"
                                            step="0.01"
                                            placeholder="Enter multiplier"
                                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.Multiplier
                                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                                }`}
                                            disabled={submitting}
                                        />
                                        {errors.Multiplier && (
                                            <p className="mt-1 text-sm text-red-600">{errors.Multiplier}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Checkboxes */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Is Flat Basic */}
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="IsFlatBasic"
                                            name="IsFlatBasic"
                                            checked={formData.IsFlatBasic}
                                            onChange={handleInputChange}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            disabled={submitting}
                                        />
                                        <label htmlFor="IsFlatBasic" className="ml-2 block text-sm text-gray-700">
                                            Is Flat Basic
                                        </label>
                                    </div>

                                    {/* Is Penalty */}
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="IsPenalty"
                                            name="IsPenalty"
                                            checked={formData.IsPenalty}
                                            onChange={handleInputChange}
                                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                            disabled={submitting}
                                        />
                                        <label htmlFor="IsPenalty" className="ml-2 block text-sm text-gray-700">
                                            Is Penalty
                                        </label>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label htmlFor="Description" className="block text-sm font-medium text-gray-700 mb-2">
                                        Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        id="Description"
                                        name="Description"
                                        value={formData.Description}
                                        onChange={handleInputChange}
                                        rows={3}
                                        placeholder="Enter description for this slab"
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none ${errors.Description
                                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                            }`}
                                        disabled={submitting}
                                    />
                                    {errors.Description && (
                                        <p className="mt-1 text-sm text-red-600">{errors.Description}</p>
                                    )}
                                </div>

                                {/* Form Actions */}
                                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={handleModalClose}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                        disabled={submitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <span className="flex items-center gap-2">
                                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                {editingId ? 'Updating...' : 'Creating...'}
                                            </span>
                                        ) : (
                                            editingId ? 'Update Slab' : 'Create Slab'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AddOrEditModal