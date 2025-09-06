import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  CreditCard,
  GraduationCap,
  Briefcase,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronRight
} from 'lucide-react';

const PendingAlerts = ({ pendingData, loading, error }) => {
  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
          <span className="ml-3 text-blue-700 font-medium">Loading profile status...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-4 mb-6 border border-red-100">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
          <span className="text-red-700 font-medium">Failed to load profile status</span>
        </div>
      </div>
    );
  }

  if (!pendingData) return null;

  // Calculate total pending items
  const getTotalPendingCount = () => {
    let total = 0;
    if (pendingData.Employee) total += pendingData.Employee.length;
    if (pendingData.EmpBankDetails) total += pendingData.EmpBankDetails.length;
    if (pendingData.Academics) total += pendingData.Academics.length;
    if (pendingData.ProfessionalHistory) total += pendingData.ProfessionalHistory.length;
    if (pendingData.Documents?.Details) {
      const missingDocs = pendingData.Documents.Details.filter(doc => doc.Status === 'Missing');
      total += missingDocs.length;
    }
    return total;
  };

  const totalPending = getTotalPendingCount();

  const [isOpen, setIsOpen] = useState(false);

  if (totalPending === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 mb-6 border border-green-100"
      >
        <div className="flex items-center">
          <div className="bg-green-100 p-2 rounded-xl mr-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-green-800 font-semibold text-sm">Profile Complete!</h3>
            <p className="text-green-600 text-xs">All information submitted successfully.</p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Section configurations
  const sectionConfigs = {
    Employee: { title: 'Personal Info', icon: User, color: 'text-blue-600', bg: 'bg-blue-50' },
    EmpBankDetails: { title: 'Bank Details', icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-50' },
    Academics: { title: 'Education', icon: GraduationCap, color: 'text-green-600', bg: 'bg-green-50' },
    ProfessionalHistory: { title: 'Experience', icon: Briefcase, color: 'text-orange-600', bg: 'bg-orange-50' }
  };

  const pendingSections = [];

  // Collect all pending sections
  Object.entries(pendingData).forEach(([key, fields]) => {
    if (key === 'Documents') {
      const missingDocs = pendingData.Documents?.Details?.filter(doc => doc.Status === 'Missing') || [];
      if (missingDocs.length > 0) {
        pendingSections.push({
          key: 'Documents',
          title: 'Documents',
          icon: FileText,
          color: 'text-red-600',
          bg: 'bg-red-50',
          count: missingDocs.length,
          items: missingDocs.map(doc => doc.DocumentName)
        });
      }
    } else if (fields && fields.length > 0 && sectionConfigs[key]) {
      const config = sectionConfigs[key];
      pendingSections.push({
        key,
        ...config,
        count: fields.length,
        items: fields
      });
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      {/* Main Alert Bar */}
      <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 rounded-2xl border border-amber-200 overflow-hidden">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-amber-100 p-2 rounded-xl mr-3">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-amber-800 font-semibold text-sm">
                  Profile Completion Pending
                </h3>
                <p className="text-amber-600 text-xs">
                  {totalPending} items across {pendingSections.length} sections need attention
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">

              <button
                type="button"
                onClick={() => setIsOpen(prev => !prev)}
                className=" flex items-center justify-between bg-white border border-gray-200 hover:border-gray-300 rounded-xl p-2 transition-all"
              >

                <motion.div
                  animate={{ rotate: isOpen ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-gray-400"
                >
                  <ChevronRight className="h-4 w-4" />
                </motion.div>
              </button>

              {/* <div className="bg-amber-100 px-3 py-1 rounded-full">
                <span className="text-amber-700 text-xs font-semibold">{totalPending}</span>
              </div> */}
            </div>
          </div>

          {/* Compact Section List as Dropdown */}
          <div className="mt-">
            <motion.div
              initial={false}
              animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="space-y-2 mt-3">
                {pendingSections.map((section) => {
                  const IconComponent = section.icon;
                  return (
                    <motion.div
                      key={section.key}
                      whileHover={{ scale: 1.01 }}
                      className="bg-white rounded-xl p-3 border border-gray-100 hover:border-gray-200 transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1 min-w-0">
                          <div className={`${section.bg} p-2 rounded-lg mr-3 flex-shrink-0`}>
                            <IconComponent className={`h-4 w-4 ${section.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center">
                              <span className="text-gray-800 font-medium text-sm mr-2">{section.title}</span>
                              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                                {section.count}
                              </span>
                            </div>
                            <p className="text-gray-500 text-xs truncate">
                              {section.items.slice(0, 3).map(item =>
                                typeof item === 'string' ?
                                  item.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim() :
                                  item
                              ).join(', ')}
                              {section.items.length > 3 && ` +${section.items.length - 3} more`}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </motion.div>
  );
};

export default PendingAlerts;
