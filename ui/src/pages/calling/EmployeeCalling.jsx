import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useCallingStore from '@/store/callingStore';
import callingService from '@/services/callingService';
import TableService from '@/services/TableService';
import { FaPhone, FaEye, FaClock, FaUser } from 'react-icons/fa';
import { useMemo } from 'react';

const EmployeeCalling = () => {
  const navigate = useNavigate();
  const {
    leads,
    isLoading,
    setLeads,
    setLoading,
    restoreSession,
    isCallSessionActive,
    sessionData
  } = useCallingStore();

  useEffect(() => {
    // Restore any active calling session on page load
    restoreSession();
    loadAssignedLeads();
  }, []);

  const loadAssignedLeads = async () => {
    try {
      setLoading(true);
      // Get leads assigned to current user
      const data = await callingService.getLeads({ assignedToMe: true });
      setLeads(data.leads || []);
    } catch (error) {
      console.error('Error loading assigned leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      assigned: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] || statusStyles.assigned}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Assigned'}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Lead Details',
      cell: ({ row }) => {
        const lead = row.original;
        return (
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10">
              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                <FaUser className="h-5 w-5 text-gray-600" />
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">
                {lead.name}
              </div>
              <div className="text-sm text-gray-500 flex items-center">
                <FaPhone className="h-3 w-3 mr-1" />
                {lead.contactNo}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'selectedService',
      header: 'Service',
      cell: ({ row }) => {
        const lead = row.original;
        return (
          <div>
            <div className="text-sm text-gray-900">{lead.selectedService}</div>
            {lead.serviceSubcategory && (
              <div className="text-sm text-gray-500">{lead.serviceSubcategory}</div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => getStatusBadge(getValue()),
    },
    {
      accessorKey: 'assignedAt',
      header: 'Assigned',
      cell: ({ getValue }) => (
        <div className="text-sm text-gray-500 flex items-center">
          <FaClock className="h-3 w-3 mr-1" />
          {formatDate(getValue())}
        </div>
      ),
    },
    {
      accessorKey: 'lastCallAt',
      header: 'Last Call',
      cell: ({ getValue }) => (
        <div className="text-sm text-gray-500">
          {getValue() ? formatDate(getValue()) : 'Never'}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStartCall(row.original);
            }}
            className="p-2 bg-green-600 text-white hover:bg-green-700 rounded transition-colors"
            title="Start Call"
          >
            <FaPhone className="h-3 w-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails(row.original);
            }}
            className="p-2 bg-blue-600 text-white hover:bg-blue-700 rounded transition-colors"
            title="View Details"
          >
            <FaEye className="h-3 w-3" />
          </button>
        </div>
      ),
      enableSorting: false,
      enableColumnFilter: false,
    },
  ], []);

  const handleStartCall = (lead) => {
    navigate(`/calling/lead/${lead.id}?startCall=true`);
  };

  const handleViewDetails = (lead) => {
    navigate(`/calling/lead/${lead.id}`);
  };

  const handleRowClick = (row) => {
    handleViewDetails(row.original);
  };

  const getLeadsByStatus = () => {
    const statusCounts = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {});

    return {
      total: leads.length,
      assigned: statusCounts.assigned || 0,
      pending: statusCounts.pending || 0,
      completed: statusCounts.completed || 0,
      failed: statusCounts.failed || 0
    };
  };

  const stats = getLeadsByStatus();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Calling Queue</h1>
        <p className="text-gray-600 mt-1">Manage your assigned leads and calling activities</p>
      </div>

      {/* Active Session Alert */}
      {isCallSessionActive && sessionData && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-orange-800">Active Calling Session</h3>
              <p className="text-sm text-orange-700">
                You have an active call session for lead: {sessionData.currentData.name}
              </p>
            </div>
            <button
              onClick={() => navigate(`/calling/lead/${sessionData.leadId}`)}
              className="px-4 py-2 bg-orange-600 text-white hover:bg-orange-700 rounded-md transition-colors"
            >
              Resume Session
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Leads</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{stats.assigned}</div>
          <div className="text-sm text-gray-600">Assigned</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          <div className="text-sm text-gray-600">Failed</div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Assigned Leads ({leads.length})
          </h2>
        </div>

        <TableService
          columns={columns}
          data={leads}
          loading={isLoading}
          onRowClick={handleRowClick}
          initialPageSize={10}
        />
      </div>
    </div>
  );
};

export default EmployeeCalling;