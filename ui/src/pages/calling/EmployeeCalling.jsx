import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useCallingStore from '@/store/callingStore';
import callingService from '@/services/callingService';
import TableService from '@/services/TableService';
import { FaPhone, FaEye, FaClock, FaUser } from 'react-icons/fa';

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

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  });
  const [stats, setStats] = useState({
    total: 0,
    assigned: 0,
    pending: 0,
    completed: 0,
    failed: 0
  });
  const isLoadingRef = useRef(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const lastParamsRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  useEffect(() => {
    // Restore any active calling session on page load
    restoreSession();
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    if (isLoadingRef.current) return;

    try {
      isLoadingRef.current = true;
      setLoading(true);
      
      // Load both leads and stats in parallel
      const [leadsData, statsData] = await Promise.all([
        callingService.getLeads({
          assignedToMe: true,
          page: 1,
          limit: 10
        }),
        callingService.getMyStats()
      ]);
      
      setLeads(leadsData.leads || []);
      setPagination({
        pageIndex: 0,
        pageSize: 10,
        totalItems: leadsData.pagination?.total || leadsData.totalItems || 0,
        totalPages: leadsData.pagination?.pages || leadsData.totalPages || 0
      });
      setStats(statsData);
      setIsInitialized(true);
    } catch (error) {
      console.error('Error loading assigned leads:', error);
      setLeads([]);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  };

  const handleTableStateChange = async (params = {}) => {
    // Only handle state changes after initial load
    if (!isInitialized || isLoadingRef.current) {
      return;
    }

    // Clear any existing debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Prevent duplicate calls with same parameters
    const paramsString = JSON.stringify(params);
    if (lastParamsRef.current === paramsString) {
      return;
    }

    // Debounce the API call
    debounceTimeoutRef.current = setTimeout(async () => {
      lastParamsRef.current = paramsString;

      try {
        isLoadingRef.current = true;
        setLoading(true);

        // Build query parameters with safe defaults
        const queryParams = {
          assignedToMe: true, // Always filter for current user
          page: (params.pagination?.pageIndex ?? 0) + 1,
          limit: params.pagination?.pageSize ?? 10,
          search: params.globalFilter || '',
          sortBy: params.sorting?.[0]?.id || '',
          sortOrder: params.sorting?.[0]?.desc ? 'desc' : 'asc'
        };

        // Add column filters
        if (params.columnFilters && Array.isArray(params.columnFilters)) {
          params.columnFilters.forEach(filter => {
            if (filter.id && filter.value !== undefined && filter.value !== null && filter.value !== '') {
              queryParams[filter.id] = filter.value;
            }
          });
        }

        const data = await callingService.getLeads(queryParams);
        setLeads(data.leads || []);
        setPagination({
          pageIndex: (data.pagination?.page || data.currentPage || 1) - 1,
          pageSize: data.pagination?.limit || data.limit || 10,
          totalItems: data.pagination?.total || data.totalItems || 0,
          totalPages: data.pagination?.pages || data.totalPages || 0
        });
      } catch (error) {
        console.error('Error loading leads:', error);
        setLeads([]);
        setPagination(prev => ({
          ...prev,
          totalItems: 0,
          totalPages: 0
        }));
      } finally {
        setLoading(false);
        isLoadingRef.current = false;
      }
    }, 300); // 300ms debounce
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



  return (
    <div className="p-6">
      {/* Header with Stats Chips */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Calling Queue</h1>
            <p className="text-gray-600 mt-1">Manage your assigned leads and calling activities</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
              {stats.total} Total
            </div>
            <div className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              {stats.assigned} Assigned
            </div>
            <div className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
              {stats.pending} Pending
            </div>
            <div className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
              {stats.completed} Completed
            </div>
            <div className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
              {stats.failed} Failed
            </div>
          </div>
        </div>
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



      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <TableService
          columns={columns}
          data={leads}
          loading={isLoading}
          onRowClick={handleRowClick}
          onStateChange={isInitialized ? handleTableStateChange : undefined}
          initialPageSize={10}
          serverPagination={true}
          serverFiltering={true}
          serverSorting={true}
          pageCount={pagination.totalPages}
          totalItems={pagination.totalItems}
          currentPage={pagination.pageIndex + 1}
        />
      </div>
    </div>
  );
};

export default EmployeeCalling;