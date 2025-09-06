import React from 'react'

const ProgressBar = ({ completionPercentage }) => {
    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                    Overall Progress
                </span>
                <span className="text-sm font-medium text-slate-600">
                    {completionPercentage}%
                </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                    className="bg-gradient-to-r from-slate-500 to-slate-600 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${completionPercentage}%` }}
                ></div>
            </div>
        </div>
    )
}

export default ProgressBar