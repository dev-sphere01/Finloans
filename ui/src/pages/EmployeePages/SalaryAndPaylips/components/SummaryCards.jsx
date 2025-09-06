import React from 'react'

const SummaryCards = ({
    currentData,
    formatCurrency,
    netPay,
    formatDate,
    motion,
    DollarSign,
    Calendar,
    Building,
    User
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6"
        >
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-gray-600">Latest</span>
                </div>
                <div className="text-xl font-bold text-gray-800">{formatCurrency(netPay)}</div>
                <div className="text-xs text-gray-500">{currentData.month}</div>
            </div>

            <div className="bg-blue-50 rounded-lg shadow-sm p-4 border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span className="text-xs text-blue-600">Pay Date</span>
                </div>
                <div className="text-lg font-bold text-blue-700">{formatDate(currentData.payDate)}</div>
                <div className="text-xs text-blue-500">Next: Nov 01, 2024</div>
            </div>

            <div className="bg-purple-50 rounded-lg shadow-sm p-4 border border-purple-200">
                <div className="flex items-center space-x-2 mb-2">
                    <Building className="h-4 w-4 text-purple-600" />
                    <span className="text-xs text-purple-600">YTD Earnings</span>
                </div>
                <div className="text-lg font-bold text-purple-700">₹8,40,000</div>
                <div className="text-xs text-purple-500">Jan - Oct 2024</div>
            </div>

            <div className="bg-yellow-50 rounded-lg shadow-sm p-4 border border-yellow-200">
                <div className="flex items-center space-x-2 mb-2">
                    <User className="h-4 w-4 text-yellow-600" />
                    <span className="text-xs text-yellow-600">Available Slips</span>
                </div>
                <div className="text-lg font-bold text-yellow-700">3</div>
                <div className="text-xs text-yellow-500">Last 3 months</div>
            </div>
        </motion.div>
    )
}

export default SummaryCards