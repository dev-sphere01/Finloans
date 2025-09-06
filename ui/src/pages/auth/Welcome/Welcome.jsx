import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import useEmpDataStore from '@/store/empDataStore';
import ChangePassword from './components/ChangePassword';
import { FaUserCheck, FaKey, FaExclamationTriangle } from 'react-icons/fa';

const Welcome = () => {
    const navigate = useNavigate();
    const { user, needsPasswordChange, isAuthenticated } = useAuthStore();
    
    // Employee data store
    const { 
        currentEmployee, 
        fetchEmployeeById, 
        getEmployeeDisplayName, 
        loading: empLoading 
    } = useEmpDataStore();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        if (!needsPasswordChange()) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, needsPasswordChange, navigate]);

    // Fetch employee data when user is available
    useEffect(() => {
        if (user?.empId && !currentEmployee) {
            fetchEmployeeById(user.empId);
        }
    }, [user?.empId, currentEmployee, fetchEmployeeById]);

    if (!isAuthenticated || !needsPasswordChange()) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-5xl border border-slate-200 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2">

                    {/* Left Section */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-100 p-8 flex flex-col justify-center">
                        <div className="flex items-center mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                <FaUserCheck className="text-white text-2xl" />
                            </div>
                            <div className="ml-4">
                                <h1 className="text-2xl font-bold text-gray-800">
                                    Welcome, {empLoading ? 'Loading...' : getEmployeeDisplayName()}!
                                </h1>
                                <p className="text-gray-600">Employee ID: {user?.empId}</p>
                                {currentEmployee?.WorkEmail && (
                                    <p className="text-gray-500 text-sm">{currentEmployee.WorkEmail}</p>
                                )}
                            </div>
                        </div>

                        <div className="bg-white border border-amber-200 rounded-lg p-5 shadow-sm">
                            <div className="flex items-start">
                                <FaExclamationTriangle className="text-amber-500 text-xl mt-1 flex-shrink-0" />
                                <div className="ml-3">
                                    <h3 className="text-amber-800 font-semibold text-lg mb-2">Password Setup Required</h3>
                                    <p className="text-amber-700 text-sm mb-3">
                                        This is your first time logging in with an auto-generated password.
                                        Please set a new, secure password before accessing the system.
                                    </p>
                                    <div className="flex items-center text-amber-600 text-sm">
                                        <FaKey className="mr-2" />
                                        One-time security requirement
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="p-8 flex items-center justify-center bg-gray-50">
                        <div className="w-full max-w-md">
                            <ChangePassword />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Welcome;
