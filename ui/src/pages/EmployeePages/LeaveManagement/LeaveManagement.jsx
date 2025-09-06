import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Info, SendHorizontal, CheckCircle, X } from 'lucide-react';

//compoments imports
import ApplyLeave from '@/pages/EmployeePages/LeaveManagement/components/ApplyLeave';
import LeaveBalance from '@/pages/EmployeePages/LeaveManagement/components/LeaveBalance';
import LeaveHistory from '@/pages/EmployeePages/LeaveManagement/components/LeaveHistory';
import ApprovalsTableLite from '@/pages/EmployeePages/LeaveManagement/components/ApprovalsTableLite';

// services
import LeavesService from '@/services/Leaves/leavesService';
import useAuthStore from '@/store/authStore';


const LeaveManagement = () => {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    OnDutyHours: '' // For On-Duty leave type only
  });
  
  const [errors, setErrors] = useState({});
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [history, setHistory] = useState([]);

  const fetchHistory = async () => {
    const empId = user?.empId ?? user?.EmpID;
    if (!empId) { setHistory([]); return; }
    const data = await LeavesService.getLeaves(empId);
    setHistory(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchHistory();
  }, [user?.empId, user?.EmpID]);

  // Leave balance data with lighter colors
  const leaveBalances = [
    { type: 'Sick Leave', balance: 12, total: 15, color: 'from-green-200 to-green-300', bgColor: 'bg-green-50 border-green-100' },
    { type: 'Personal Leave', balance: 8, total: 10, color: 'from-yellow-200 to-yellow-300', bgColor: 'bg-yellow-50 border-yellow-100' },
    { type: 'Paid Leave', balance: 20, total: 25, color: 'from-blue-200 to-blue-300', bgColor: 'bg-blue-50 border-blue-100' },
    { type: 'Annual Leave', balance: 18, total: 20, color: 'from-purple-200 to-purple-300', bgColor: 'bg-purple-50 border-purple-100' }
  ];

  const leaveTypes = ['Sick', 'Personal', 'Paid', 'Annual', 'On-Duty', 'Miss'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.leaveType) {
      newErrors.leaveType = 'Please select a leave type';
    }

    // if (!formData.startDate) {
    //   newErrors.startDate = 'Start date is required';
    // }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    // Hours validation for On-Duty
    if (formData.leaveType === 'On-Duty') {
      const hoursNum = Number(formData.OnDutyHours);
      if (!formData.OnDutyHours && formData.OnDutyHours !== 0) {
        newErrors.OnDutyHours = 'Hours is required for On-Duty';
      } else if (Number.isNaN(hoursNum)) {
        newErrors.OnDutyHours = 'Hours must be a number';
      } else if (!Number.isInteger(hoursNum)) {
        newErrors.OnDutyHours = 'Hours must be a whole number';
      } else if (hoursNum < 1 || hoursNum > 15) {
        newErrors.OnDutyHours = 'Hours must be between 1 and 15';
      }
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason is required';
    } else if (formData.reason.length < 10) {
      newErrors.reason = 'Reason must be at least 10 characters';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length !== 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const created = await LeavesService.createLeave(formData, user);
      if (created) {
        setShowSuccessAlert(true);
        setFormData({ leaveType: '', startDate: '', endDate: '', reason: '', OnDutyHours: '' });
        // refresh list (if we load history from API later)
        await fetchHistory();
        setTimeout(() => setShowSuccessAlert(false), 5000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeSuccessAlert = () => {
    setShowSuccessAlert(false);
  };

  const roleId = user?.roleId;

  return (
    <div className="h-full bg-gray-50 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-3 py-4"
      >
        {/* Success Alert */}
        {showSuccessAlert && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-green-700 font-medium text-sm">
                Leave application submitted successfully!
              </span>
            </div>
            <button
              onClick={closeSuccessAlert}
              className="text-green-600 hover:text-green-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            Leave Management
          </h1>
          <p className="text-gray-600 text-sm">
            Manage your leave applications and view remaining balances
          </p>
        </motion.div>

        {/* Main Content - Side by Side Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          
          {/* Left Side - Leave Balances */}
          {/*<LeaveBalance
          leaveBalances={leaveBalances}
          motion={motion}
          Calendar={Calendar}
          Info={Info}
          />*/}

          {/* Right Side - Apply for Leave Form */}
          <ApplyLeave 
          formData={formData} 
          handleInputChange={handleInputChange} 
          errors={errors} 
          handleSubmit={handleSubmit}
          motion={motion}
          leaveTypes={leaveTypes}
          SendHorizontal={SendHorizontal}
          isSubmitting={isSubmitting}
          />
        </div>

        {/* Approvals Table for managers (only show to admins/managers) */}
        {roleId === 1 && (
          <div className="mt-6">
            <ApprovalsTableLite />
          </div>
        )}

        {/* History - optional list below */}
        <div className="mt-6">
          <LeaveHistory items={history} />
        </div>
      </motion.div>
    </div>
  );
};

export default LeaveManagement;
