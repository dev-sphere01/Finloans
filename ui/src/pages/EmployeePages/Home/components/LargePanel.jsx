import React from 'react'

const LargePanel = ({
    data,
    leaveReqs,
    announcements,
    unreadCount,
    toggleAnnouncementRead,
    approveLeave,
    rejectLeave,
    motion,
    Bell,
    CheckCircle,
    XCircle,
    Clock4,
    Calendar
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-5">
            {/* Announcements */}
            <motion.div
                className="bg-white rounded-xl shadow-lg p-6 flex flex-col"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
            >
                <div className="flex items-center gap-2 mb-3">
                    <Bell className="text-amber-500" size={22} />
                    <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                        Announcements & Messages
                        {unreadCount > 0 && (
                            <span className="bg-red-500 text-white rounded-full text-xs px-2 py-0.5 ml-1 font-semibold">
                                {unreadCount} New
                            </span>
                        )}
                    </h3>
                </div>
                <ul className="space-y-3 max-h-60 overflow-y-auto">
                    {announcements.slice(0, 7).map((a, i) => (
                        <li
                            key={i}
                            className={`flex items-center gap-3 cursor-pointer px-3 py-2 rounded ${a.read ? "bg-gray-100" : "bg-slate-50"
                                } hover:bg-slate-100 transition-colors`}
                            onClick={() => toggleAnnouncementRead(i)}
                            title="Click to toggle read/unread"
                        >
                            <span className="text-xs text-gray-400 w-16 flex-shrink-0">{a.date}</span>
                            <span className="flex-1 font-medium">{a.title}</span>
                            {a.read ? (
                                <CheckCircle className="text-green-500" size={18} />
                            ) : (
                                <XCircle className="text-red-400" size={18} />
                            )}
                        </li>
                    ))}
                </ul>
                <button className="mt-4 self-start text-slate-600 hover:underline text-sm font-medium">
                    See All Announcements
                </button>
            </motion.div>

            {/* Recent Activity & Leave Requests */}
            <div className="flex flex-col gap-6">
                {/* Recent Activity */}
                <motion.div
                    className="bg-white rounded-xl shadow-lg p-6"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                >
                    <div className="flex items-center gap-2 mb-3">
                        <Clock4 className="text-sky-500" size={22} />
                        <h3 className="font-semibold text-lg text-gray-800">Recent Activity</h3>
                    </div>
                    <ol className="relative border-l border-slate-300 px-3 py-2 max-h-52 overflow-y-auto">
                        {data.activity.map((event, idx) => (
                            <li key={idx} className="mb-5 ml-4 last:mb-0">
                                <span className="absolute -left-2 w-4 h-4 bg-slate-400 rounded-full mt-1 border border-white shadow"></span>
                                <time className="block text-xs text-gray-400 mb-1">{event.timestamp}</time>
                                <div className="text-gray-700 font-medium">{event.type}</div>
                            </li>
                        ))}
                    </ol>
                </motion.div>

                {/* Leave Requests - Demo Interactive Panel */}
                <motion.div
                    className="bg-white rounded-xl shadow-lg p-6 flex flex-col"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar className="text-green-600" size={22} />
                        <h3 className="font-semibold text-lg text-gray-800">Leave Requests</h3>
                    </div>

                    {leaveReqs.length === 0 ? (
                        <div className="text-gray-500 text-sm italic">No leave requests</div>
                    ) : (
                        <ul className="divide-y divide-gray-200 max-h-56 overflow-y-auto">
                            {leaveReqs.map((req) => (
                                <li
                                    key={req.id}
                                    className="flex items-center justify-between py-3 px-2"
                                >
                                    <div className="flex flex-col text-sm">
                                        <span className="font-semibold">
                                            {req.type} Leave - {req.days} day{req.days > 1 ? "s" : ""}
                                        </span>
                                        <span className="text-gray-400">{req.date}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {req.status === "pending" && (
                                            <>
                                                <button
                                                    onClick={() => approveLeave(req.id)}
                                                    className="p-1 rounded bg-green-600 text-white hover:bg-green-700 transition"
                                                    title="Approve"
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                                <button
                                                    onClick={() => rejectLeave(req.id)}
                                                    className="p-1 rounded bg-red-600 text-white hover:bg-red-700 transition"
                                                    title="Reject"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            </>
                                        )}
                                        {req.status === "approved" && (
                                            <span className="text-green-600 font-semibold">Approved</span>
                                        )}
                                        {req.status === "rejected" && (
                                            <span className="text-red-600 font-semibold">Rejected</span>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </motion.div>
            </div>
        </div>
    )
}

export default LargePanel