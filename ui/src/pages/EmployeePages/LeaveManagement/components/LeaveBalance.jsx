import React from 'react'

const LeaveBalance = ({motion,leaveBalances}) => {
  return (
    <motion.section
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Leave Balances
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {leaveBalances.map((leave, index) => (
                <motion.div
                  key={leave.type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className={`${leave.bgColor} border rounded-xl shadow-sm p-4`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-800 text-sm">
                      {leave.type}
                    </h3>
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${leave.color}`}></div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Remaining</span>
                      <span className="font-semibold text-gray-800">
                        {leave.balance} days
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full bg-gradient-to-r ${leave.color} transition-all duration-500`}
                        style={{ width: `${(leave.balance / leave.total) * 100}%` }}
                      ></div>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      {leave.balance} of {leave.total} days
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
  )
}

export default LeaveBalance