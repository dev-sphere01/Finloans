import React from 'react';

const StepNavigation = ({ stepConfig, currentStep }) => {
    return (
        <div className="flex items-center justify-center mb-8 overflow-x-auto">
            <div className="flex items-center space-x-4">
                {Object.entries(stepConfig).map(([stepNum, config]) => (
                    <div key={stepNum} className="flex items-center">
                        <div
                            className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                                parseInt(stepNum) === currentStep
                                    ? "bg-slate-600 border-slate-600 text-white"
                                    : parseInt(stepNum) < currentStep
                                        ? "bg-green-500 border-green-500 text-white"
                                        : "bg-white border-gray-300 text-gray-400"
                            }`}
                        >
                            <span className="text-sm font-semibold">{stepNum}</span>
                        </div>
                        <span
                            className={`ml-2 text-sm font-medium hidden sm:block ${
                                parseInt(stepNum) === currentStep
                                    ? "text-slate-600"
                                    : "text-gray-500"
                            }`}
                        >
                            {config.title}
                        </span>
                        {parseInt(stepNum) < 5 && (
                            <div className="w-8 h-0.5 bg-gray-300 ml-4 hidden sm:block"></div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StepNavigation;
