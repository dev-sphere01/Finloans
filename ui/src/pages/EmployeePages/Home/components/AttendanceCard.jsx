import React from 'react'

const AttendanceCard = ({ attendancePieData, data, motion, CalendarCheck, Pie }) => {
    return (
        <motion.div
            className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center"
            whileHover={{ scale: 1.03 }}
        >
            <div className="flex items-center gap-2 mb-3">
                <CalendarCheck className="text-green-600" size={22} />
                <h3 className="font-semibold text-lg text-gray-800">Attendance</h3>
            </div>
            <Pie data={attendancePieData} className="mb-3 max-w-[180px]" />
            <div className="text-gray-600 text-center text-sm flex flex-wrap justify-center gap-2 font-medium">
                {Object.entries(data.attendance)
                    .filter(([k]) => ["present", "absent", "late"].includes(k))
                    .map(([k, v]) => (
                        <span key={k} className="mx-1">
                            {k.charAt(0).toUpperCase() + k.slice(1)}: <b>{v}</b>
                        </span>
                    ))}
            </div>
            <div className="mt-2 text-xs text-gray-400">
                Month: {data.attendance.hoursMonth}h &bull; Week: {data.attendance.hoursWeek}h
            </div>
        </motion.div>
    )
}

export default AttendanceCard