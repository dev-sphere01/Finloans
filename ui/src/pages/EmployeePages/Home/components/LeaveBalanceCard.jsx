import React from 'react'

const LeaveBalanceCard = ({
    data,
    leavePieData,
    motion,
    User,
    Pie,
    handleRequestLeave
}) => {
    return (
        <motion.div
            className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center"
            whileHover={{ scale: 1.03 }}
        >
            <div className="flex items-center gap-2 mb-3">
                <User className="text-purple-600" size={22} />
                <h3 className="font-semibold text-lg text-gray-800">Leave Balance</h3>
            </div>
            <Pie data={leavePieData} className="mb-3 max-w-[180px]" />
            <div className="text-gray-600 mb-1 text-sm font-medium">
                {Object.entries(data.leaveBalance).map(([type, val]) => (
                    <span key={type} className="mx-1">
                        {type}: <b>{val}</b>
                    </span>
                ))}
            </div>
            <div className="text-xs text-gray-400">
                Used: {data.leavesTaken} &bull; Pending: {data.pendingLeaves}
            </div>
            <button className="mt-4 px-3 py-1 bg-slate-600 text-white rounded hover:bg-slate-700 text-sm shadow-md"
                onClick={handleRequestLeave}
            >
                Request Leave
            </button>
        </motion.div>
    )
}

export default LeaveBalanceCard