import React from 'react'

const AttendanceSummary = ({ attendancePercentage, currentData , motion}) => {
    return (
        <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className=" flex flex-col space-y-8"
        >
            {/* Attendance Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Summary</h3>

                <div className="space-y-4">
                    {/* Attendance Rate */}
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Attendance Rate</span>
                            <span className="font-semibold text-gray-800">{attendancePercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="h-2 rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
                                style={{ width: `${attendancePercentage}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Average Working Hours */}
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Avg. Working Hours</span>
                            <span className="font-semibold text-gray-800">8h 35m</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500 w-[85%]"></div>
                        </div>
                    </div>

                    {/* On-time Arrival Rate */}
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">On-time Arrival</span>
                            <span className="font-semibold text-gray-800">
                                {((currentData.present - currentData.late) / currentData.present * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="h-2 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-500"
                                style={{ width: `${((currentData.present - currentData.late) / currentData.present * 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Time Analysis */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Time Analysis</h3>

                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-2xl font-bold text-blue-700">09:05</div>
                        <div className="text-xs text-blue-600">Avg Check-in</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="text-2xl font-bold text-purple-700">18:12</div>
                        <div className="text-xs text-purple-600">Avg Check-out</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-2xl font-bold text-green-700">8h 47m</div>
                        <div className="text-xs text-green-600">Total Hours</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="text-2xl font-bold text-yellow-700">12m</div>
                        <div className="text-xs text-yellow-600">Avg Late Time</div>
                    </div>
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    {/* <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Most Productive Day</span>
                        <span className="font-semibold text-gray-800">Tuesday</span>
                    </div> */}
                    <div className="flex items-center justify-between text-sm mt-2">
                        <span className="text-gray-600">Longest Day</span>
                        <span className="font-semibold text-gray-800">9h 20m (Oct 3)</span>
                    </div>
                </div>
            </div>
        </motion.section>
    )
}

export default AttendanceSummary