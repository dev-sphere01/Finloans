import React from 'react'
import { useNavigate } from 'react-router-dom'

const PayrollCard = ({ data, salaryGrowth , motion}) => {

    const navigate = useNavigate();

    const handlePayslipClick = () => {
        navigate('/dashboard/salary-and-payslips')
    }


    return (
        <motion.div
            className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center"
            whileHover={{ scale: 1.03 }}
        >
            <div className="flex items-center gap-2 mb-3">

                <h3 className="font-semibold text-lg text-gray-800">₹ Payroll</h3>
            </div>
            <div className="text-green-800 font-bold mb-1 text-2xl flex items-center gap-2">
                ₹{data.lastSalary.amount}
                {salaryGrowth && (
                    <span
                        title={`Monthly growth: ${salaryGrowth}%`}
                        className={`text-sm font-semibold ${salaryGrowth > 0 ? "text-green-600" : "text-red-600"
                            }`}
                    >
                        {/* ({salaryGrowth > 0 ? "↑" : "↓"}
                        {Math.abs(salaryGrowth)}%) */}
                    </span>
                )}
            </div>
            <div className="text-gray-500 text-sm">Last: {data.lastSalary.date}</div>
            <div className="text-gray-400 text-xs mb-3">Next: {data.nextPayday}</div>
            <button className="text-emerald-600 rounded border border-emerald-500 px-3 py-1 hover:bg-emerald-50 text-xs shadow-md" 
            onClick={handlePayslipClick}>
                Download Payslip
            </button>
        </motion.div>
    )
}

export default PayrollCard