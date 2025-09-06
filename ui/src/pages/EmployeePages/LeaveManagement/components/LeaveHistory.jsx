import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Filter, Search, Eye } from 'lucide-react';

const LeaveHistory = ({ items = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Adapt API items to UI-friendly fields
  const leaveHistory = (items || []).map((item) => ({
    id: item.LeaveID || item.id,
    type: item.LeaveType || item.type,
    startDate: item.StartDate || item.startDate,
    endDate: item.EndDate || item.endDate,
    days: item.StartDate && item.EndDate ? Math.max(1, Math.ceil((new Date(item.EndDate) - new Date(item.StartDate)) / (1000*60*60*24)) + 1) : item.days || 1,
    reason: item.LeaveReason || item.reason,
    status: item.IsApproved === true ? 'approved' : (item.IsApproved === false ? 'rejected' : 'pending'),
    appliedDate: item.CreatedAt || item.appliedDate,
    approvedBy: item.ApproverName || null,
    approvedDate: item.approvedDate || null,
    rejectionReason: item.rejectionReason || null,
  }));

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Sick Leave':
        return 'bg-green-100 text-green-800';
      case 'Personal Leave':
        return 'bg-yellow-100 text-yellow-800';
      case 'Paid Leave':
        return 'bg-blue-100 text-blue-800';
      case 'Annual Leave':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredHistory = leaveHistory.filter(leave => {
    const matchesSearch = leave.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         leave.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || leave.status === statusFilter;
    const matchesType = typeFilter === 'all' || leave.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: leaveHistory.length,
    approved: leaveHistory.filter(l => l.status === 'approved').length,
    pending: leaveHistory.filter(l => l.status === 'pending').length,
    rejected: leaveHistory.filter(l => l.status === 'rejected').length,
    totalDays: leaveHistory.filter(l => l.status === 'approved').reduce((sum, l) => sum + l.days, 0)
  };

  return (
    <div className="min-h-screen bg-gray-50 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-3 py-4"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            Leave History
          </h1>
          <p className="text-gray-600 text-sm">
            Review your past leave applications and their status
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6"
        >
          <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">Total Applications</div>
            <div className="text-xl font-bold text-gray-800">{stats.total}</div>
          </div>
          <div className="bg-green-50 rounded-lg shadow-sm p-3 border border-green-200">
            <div className="text-xs text-green-600 mb-1">Approved</div>
            <div className="text-xl font-bold text-green-700">{stats.approved}</div>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow-sm p-3 border border-yellow-200">
            <div className="text-xs text-yellow-600 mb-1">Pending</div>
            <div className="text-xl font-bold text-yellow-700">{stats.pending}</div>
          </div>
          <div className="bg-red-50 rounded-lg shadow-sm p-3 border border-red-200">
            <div className="text-xs text-red-600 mb-1">Rejected</div>
            <div className="text-xl font-bold text-red-700">{stats.rejected}</div>
          </div>
          <div className="bg-blue-50 rounded-lg shadow-sm p-3 border border-blue-200">
            <div className="text-xs text-blue-600 mb-1">Days Taken</div>
            <div className="text-xl font-bold text-blue-700">{stats.totalDays}</div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by reason or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              >
                <option value="all">All Types</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Personal Leave">Personal Leave</option>
                <option value="Paid Leave">Paid Leave</option>
                <option value="Annual Leave">Annual Leave</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-center md:justify-start">
              <span className="text-sm text-gray-600">
                {filteredHistory.length} of {leaveHistory.length} applications
              </span>
            </div>
          </div>
        </motion.div>

        {/* Leave History List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          {filteredHistory.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200 text-center">
              <div className="text-gray-400 mb-2">
                <Calendar className="h-12 w-12 mx-auto" />
              </div>
              <p className="text-gray-600">No leave applications found matching your criteria.</p>
            </div>
          ) : (
            filteredHistory.map((leave, index) => (
              <motion.div
                key={leave.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Leave Type and Status */}
                  <div className="md:col-span-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(leave.type)}`}>
                        {leave.type}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(leave.status)}`}>
                        {getStatusIcon(leave.status)}
                        <span className="capitalize">{leave.status}</span>
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Applied: {formatDate(leave.appliedDate)}
                    </div>
                  </div>

                  {/* Dates and Duration */}
                  <div className="md:col-span-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-800">
                        {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      {leave.days} day{leave.days > 1 ? 's' : ''}
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="md:col-span-4">
                    <p className="text-sm text-gray-800 line-clamp-2">
                      {leave.reason}
                    </p>
                  </div>

                  {/* Approval Info */}
                  <div className="md:col-span-2">
                    {leave.status === 'approved' && (
                      <div className="text-xs text-gray-600">
                        <div>Approved by: {leave.approvedBy}</div>
                        {/* <div>On: {formatDate(leave.approvedDate)}</div> */}
                      </div>
                    )}
                    {leave.status === 'rejected' && (
                      <div className="text-xs text-red-600">
                        <div>Rejected by: {leave.approvedBy}</div>
                        <div>Reason: {leave.rejectionReason}</div>
                      </div>
                    )}
                    {leave.status === 'pending' && (
                      <div className="text-xs text-yellow-600">
                        Awaiting approval
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LeaveHistory;
