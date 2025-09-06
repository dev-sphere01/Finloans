import { Info } from 'lucide-react'
import React from 'react'

const ApplyLeave = ({ formData, handleInputChange, errors, handleSubmit ,motion,leaveTypes,SendHorizontal, isSubmitting}) => {
    return (
        <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm p-5 border border-gray-200"
        >
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Apply for Leave
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    {/* Leave Type */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Leave Type *
                        </label>
                        <select
                            name="leaveType"
                            value={formData.leaveType}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 text-sm bg-gray-50 border rounded-md text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors ${errors.leaveType ? 'border-red-300' : 'border-gray-300'
                                }`}
                        >
                            <option value="">Select type</option>
                            {leaveTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                        {errors.leaveType && (
                            <div className="flex items-center mt-1 text-red-600 text-xs">
                                <Info className="h-3 w-3 mr-1" />
                                {errors.leaveType}
                            </div>
                        )}
                    </div>

                    {/* Start Date */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Start Date *
                        </label>
                        <div className="relative">
                            <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 text-sm bg-gray-50 border rounded-md text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors ${errors.startDate ? 'border-red-300' : 'border-gray-300'
                                    }`}
                            />
                        </div>
                        {errors.startDate && (
                            <div className="flex items-center mt-1 text-red-600 text-xs">
                                <Info className="h-3 w-3 mr-1" />
                                {errors.startDate}
                            </div>
                        )}
                    </div>
                </div>

                <div className={`grid ${formData.leaveType === 'On-Duty' ? 'grid-cols-3' : 'grid-cols-2'} gap-3`}>
                    {/* End Date */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            End Date *
                        </label>
                        <div className="relative">
                            <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 text-sm bg-gray-50 border rounded-md text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors ${errors.endDate ? 'border-red-300' : 'border-gray-300'
                                    }`}
                            />
                        </div>
                        {errors.endDate && (
                            <div className="flex items-center mt-1 text-red-600 text-xs">
                                <Info className="h-3 w-3 mr-1" />
                                {errors.endDate}
                            </div>
                        )}
                    </div>

                    {/* Hours - Only for On-Duty */}
                    {formData.leaveType === 'On-Duty' && (
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Hours (1-15) *
                            </label>
                            <input
                                type="number"
                                name="OnDutyHours"
                                min={1}
                                max={15}
                                value={formData.OnDutyHours}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 text-sm bg-gray-50 border rounded-md text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors ${errors.OnDutyHours ? 'border-red-300' : 'border-gray-300'}`}
                                placeholder="Enter on duty hours"
                            />
                            {errors.OnDutyHours && (
                                <div className="flex items-center mt-1 text-red-600 text-xs">
                                    <Info className="h-3 w-3 mr-1" />
                                    {errors.OnDutyHours}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Submit Button - Aligns at the end */}
                    <div className="flex items-end">
                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition-colors focus:ring-2 focus:ring-blue-400 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                            disabled={
                                isSubmitting ||
                                !!errors.endDate ||
                                !!errors.leaveType ||
                                !!errors.reason ||
                                (formData.leaveType === 'On-Duty' && !!errors.OnDutyHours)
                            }
                        >
                            <SendHorizontal className="h-4 w-4" />
                            <span>{isSubmitting ? 'Submitting...' : 'Submit'}</span>
                        </motion.button>
                    </div>
                </div>

                {/* Reason - Full Width */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Reason *
                    </label>
                    <textarea
                        name="reason"
                        value={formData.reason}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Provide reason for leave..."
                        className={`w-full px-3 py-2 text-sm bg-gray-50 border rounded-md text-gray-800 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors resize-none ${errors.reason ? 'border-red-300' : 'border-gray-300'
                            }`}
                    />
                    {errors.reason && (
                        <div className="flex items-center mt-1 text-red-600 text-xs">
                            <Info className="h-3 w-3 mr-1" />
                            {errors.reason}
                        </div>
                    )}
                </div>
            </form>
        </motion.section>
    )
}

export default ApplyLeave