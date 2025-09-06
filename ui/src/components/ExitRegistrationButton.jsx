// components/ExitRegistrationButton.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import useEmployeeStore from '@/store/employeeStore';
import notification from '@/services/NotificationService';
import { confirm } from '@/services/ConfirmationService';

const ExitRegistrationButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const notify = notification();
  
  // Check if we're in the employee registration flow
  const isInRegistrationFlow = location.pathname === '/dashboard/add-employee';
  
  // Get session data from store
  const { hasActiveSession, clearSession } = useEmployeeStore();
  
  // Only show the button if we're in registration flow and have an active session
  if (!isInRegistrationFlow || !hasActiveSession()) {
    return null;
  }
  
  const handleExitRegistration = async () => {
    try {
      // Show confirmation dialog
      const confirmed = await confirm({
        title: "Exit Employee Registration",
        message: "Are you sure you want to exit the employee registration process? All unsaved progress will be lost.",
      });
      
      if (confirmed) {
        // Clear the session
        clearSession();
        
        // Show notification
        notify.info('Registration session ended');
        
        // Redirect to employee list
        navigate('/dashboard/add-employee');
      }
    } catch (error) {
      console.error('Error exiting registration:', error);
      notify.error('Failed to exit registration. Please try again.');
    }
  };
  
  return (
    <motion.button
      onClick={handleExitRegistration}
      className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 border border-red-200 hover:border-red-300"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      title="Exit Employee Registration"
    >
      <FiX className="text-base" />
      <span className="hidden sm:inline">Exit Registration</span>
    </motion.button>
  );
};

export default ExitRegistrationButton;
