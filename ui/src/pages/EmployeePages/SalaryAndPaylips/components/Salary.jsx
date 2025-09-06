import React from 'react'

const Salary = ({ currentData, formatCurrency, formatDate, motion, totalEarnings, totalDeductions, netPay }) => {
    return (
        <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="h-[650px] flex flex-col space-y-4"
        >
            {/* Earnings & Deductions - Flexible Height with Overflow */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex-1 min-h-0 flex flex-col">
                <div className="flex justify-between">

                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex-shrink-0">Salary Breakdown</h3>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex-shrink-0"></h3>

                </div>

                <div className="flex-1 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 p-2">
                    {/* Earnings Section */}
                    <div>
                        <h4 className="text-sm font-semibold text-green-700 mb-3 pb-2 border-b border-green-100">
                            Earnings
                        </h4>
                        <div className="space-y-2">
                            {Object.entries(currentData.earnings).map(([key, value]) => (
                                <div key={key} className="flex justify-between items-center py-1">
                                    <span className="text-sm text-gray-600 capitalize">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                    <span className="text-sm font-medium text-gray-800 min-w-[80px] text-right">
                                        {formatCurrency(value)}
                                    </span>
                                </div>
                            ))}
                            <div className="border-t border-gray-200 pt-2 mt-3">
                                <div className="flex justify-between items-center py-1">
                                    <span className="text-sm font-semibold text-gray-800">Total Earnings</span>
                                    <span className="text-sm font-bold text-green-600 min-w-[80px] text-right">
                                        {formatCurrency(totalEarnings)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Deductions Section */}
                    <div>
                        <h4 className="text-sm font-semibold text-red-700 mb-3 pb-2 border-b border-red-100">
                            Deductions
                        </h4>
                        <div className="space-y-2">
                            {Object.entries(currentData.deductions).map(([key, value]) => (
                                <div key={key} className="flex justify-between items-center py-1">
                                    <span className="text-sm text-gray-600 capitalize">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                    <span className="text-sm font-medium text-red-600 min-w-[80px] text-right">
                                        -{formatCurrency(value)}
                                    </span>
                                </div>
                            ))}
                            <div className="border-t border-gray-200 pt-2 mt-3">
                                <div className="flex justify-between items-center py-1">
                                    <span className="text-sm font-semibold text-gray-800">Total Deductions</span>
                                    <span className="text-sm font-bold text-red-600 min-w-[80px] text-right">
                                        -{formatCurrency(totalDeductions)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Net Pay Section - Fixed Height */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-4 flex-shrink-0">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Net Pay</h3>
                        <div className="text-sm text-blue-600">
                            Period: {currentData.period ?? '-'}
                        </div>
                        {currentData?.netSalary?.inWords && (
                            <div className="text-xs text-gray-600 mt-1">{currentData.netSalary.inWords}</div>
                        )}
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{formatCurrency(netPay)}</div>
                        <div className="text-xs text-gray-600">{currentData?.employee?.bankAccount}</div>
                    </div>
                </div>
            </div>

            {/* Attendance Summary - Fixed Height */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex-shrink-0">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Attendance Summary</h3>
                <div className="grid grid-cols-4 gap-3">
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-gray-800">{currentData?.salaryDetails?.totalWorkingDays ?? '-'}</div>
                        <div className="text-xs text-gray-600 mt-1">Working Days</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-600">{currentData?.salaryDetails?.daysPayable ?? '-'}</div>
                        <div className="text-xs text-gray-600 mt-1">Present</div>
                    </div>
                    <div className="text-center p-2 bg-red-50 rounded-lg">
                        <div className="text-lg font-bold text-red-600">{currentData?.salaryDetails?.lossOfPayDays ?? '-'}</div>
                        <div className="text-xs text-gray-600 mt-1">Leaves</div>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded-lg">
                        <div className="text-lg font-bold text-purple-600">-</div>
                        <div className="text-xs text-gray-600 mt-1">Overtime</div>
                    </div>
                </div>
            </div>
        </motion.section>
    )
}

export default Salary