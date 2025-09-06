import React from 'react'

const DailyRecords = ({ currentData, getStatusColor, getStatusIcon, formatDate, motion, User}) => {
    return (
        <motion.section
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 h-[600px] flex flex-col"
        >
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h3 className="text-lg font-semibold text-gray-800">Daily Records</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>All 31 days</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {currentData.dailyRecords.map((record, index) => (
                    <motion.div
                        key={record.date}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.01 * index }}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="text-sm font-medium text-gray-800 min-w-[70px]">
                                {formatDate(record.date)}
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(record.status)}`}>
                                {getStatusIcon(record.status)}
                                <span className="capitalize">{record.status.replace('-', ' ')}</span>
                            </div>
                        </div>

                        <div className="text-right text-xs text-gray-600">
                            {record.checkIn && (
                                <>
                                    <div>In: {record.checkIn}</div>
                                    <div>Out: {record.checkOut}</div>
                                    <div className="font-medium">{record.hours}</div>
                                </>
                            )}
                            {!record.checkIn && record.status === 'weekend' && (
                                <div className="text-gray-400">Weekend</div>
                            )}
                            {!record.checkIn && record.status === 'absent' && (
                                <div className="text-red-500">No Record</div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.section>
    )
}

export default DailyRecords