import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useCallingStore from '@/store/callingStore';
import callingService from '@/services/callingService';
import { ActionButton } from '@/components/permissions';
import LeadsList from './components/LeadsList';
import AddLeadModal from './components/AddLeadModal';
import BulkImportModal from './components/BulkImportModal';
import AssignLeadsModal from './components/AssignLeadsModal';
import { FaPlus, FaFileImport, FaUserCheck } from 'react-icons/fa';

const CallingManagement = () => {
  const navigate = useNavigate();
  const {
    leads,
    isLoading,
    staff,
    services,
    setLeads,
    setLoading,
    setStaff,
    setServices,
    assignLeadsToStaff
  } = useCallingStore();

  const [selectedLeads, setSelectedLeads] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  });
  const isLoadingRef = useRef(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    if (isLoadingRef.current) return;

    try {
      isLoadingRef.current = true;
      setLoading(true);
      const [staffData, servicesData] = await Promise.all([
        callingService.getStaff(),
        callingService.getServices()
      ]);
      setStaff(staffData);
      setServices(servicesData);
      // Load leads with initial pagination - use simple call for first load
      const data = await callingService.getLeads({ page: 1, limit: 10 });
      setLeads(data.leads || []);
      setPagination({
        pageIndex: 0,
        pageSize: 10,
        totalItems: data.pagination?.total || data.totalItems || 0,
        totalPages: data.pagination?.pages || data.totalPages || 0
      });
      setIsInitialized(true);
    } catch (error) {
      console.error('Error loading initial data:', error);
      setLeads([]);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  };

  const lastParamsRef = useRef(null);
  const debounceTimeoutRef = useRef(null);



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

  const refreshLeads = async () => {
    if (isLoadingRef.current) return;

    try {
      isLoadingRef.current = true;
      setLoading(true);
      const data = await callingService.getLeads({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize
      });
      setLeads(data.leads || []);
      setPagination(prev => ({
        ...prev,
        totalItems: data.pagination?.total || data.totalItems || 0,
        totalPages: data.pagination?.pages || data.totalPages || 0
      }));
    } catch (error) {
      console.error('Error refreshing leads:', error);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  };

  const handleAddLead = async (leadData) => {
    try {
      await callingService.createLead(leadData);
      setShowAddModal(false);
      refreshLeads();
    } catch (error) {
      console.error('Error adding lead:', error);
    }
  };

  const handleBulkImport = async (file) => {
    try {
      await callingService.bulkImportLeads(file);
      setShowImportModal(false);
      refreshLeads();
    } catch (error) {
      console.error('Error importing leads:', error);
    }
  };

  const handleAssignLeads = async (staffId) => {
    try {
      // Filter out already assigned leads
      const unassignedLeadIds = selectedLeads.filter(leadId => {
        const lead = leads.find(l => l.id === leadId);
        return lead && (!lead.assignedTo || lead.status === 'unassigned');
      });

      if (unassignedLeadIds.length === 0) {
        alert('All selected leads are already assigned to staff members.');
        return;
      }

      if (unassignedLeadIds.length < selectedLeads.length) {
        const assignedCount = selectedLeads.length - unassignedLeadIds.length;
        const proceed = confirm(
          `${assignedCount} lead(s) are already assigned and will be skipped. Continue with ${unassignedLeadIds.length} unassigned lead(s)?`
        );
        if (!proceed) return;
      }

      await callingService.assignLeads(unassignedLeadIds, staffId);
      assignLeadsToStaff(unassignedLeadIds, staffId);
      setSelectedLeads([]);
      setShowAssignModal(false);
      refreshLeads(); // Refresh to get updated data
    } catch (error) {
      console.error('Error assigning leads:', error);
      alert('Failed to assign leads. Please try again.');
    }
  };

  const handleLeadClick = (lead) => {
    navigate(`/calling/lead/${lead.id}`);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h6 className="text-2xl font-bold text-gray-900">Calling Management</h6>
        </div>

        <div className="flex gap-2 items-center">
          <div className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
            {pagination.totalItems} Leads
          </div>

          <ActionButton
            module="calling"
            action="create"
            label="Add Lead"
            icon={<FaPlus />}
            onClick={() => setShowAddModal(true)}
            size="sm"
          />

          <ActionButton
            module="calling"
            action="create"
            label="Bulk Import"
            icon={<FaFileImport />}
            onClick={() => setShowImportModal(true)}
            size="sm"
          />

          {selectedLeads.length > 0 && (() => {
            const unassignedCount = selectedLeads.filter(leadId => {
              const lead = leads.find(l => l.id === leadId);
              return lead && (!lead.assignedTo || lead.status === 'unassigned');
            }).length;
            
            const assignedCount = selectedLeads.length - unassignedCount;
            
            return (
              <ActionButton
                module="calling"
                action="update"
                label={
                  assignedCount > 0 
                    ? `Assign ${unassignedCount} Lead${unassignedCount !== 1 ? 's' : ''} (${assignedCount} already assigned)`
                    : `Assign ${unassignedCount} Lead${unassignedCount !== 1 ? 's' : ''}`
                }
                icon={<FaUserCheck />}
                onClick={() => setShowAssignModal(true)}
                size="sm"
                disabled={unassignedCount === 0}
              />
            );
          })()}


        </div>
      </div>

      <LeadsList
        leads={leads}
        isLoading={isLoading}
        selectedLeads={selectedLeads}
        onSelectionChange={setSelectedLeads}
        onLeadClick={handleLeadClick}
        onStateChange={isInitialized ? handleTableStateChange : undefined}
        serverPagination={true}
        pageCount={pagination.totalPages}
        totalItems={pagination.totalItems}
        currentPage={pagination.pageIndex + 1}
      />

      {showAddModal && (
        <AddLeadModal
          services={services}
          onSave={handleAddLead}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {showImportModal && (
        <BulkImportModal
          onImport={handleBulkImport}
          onClose={() => setShowImportModal(false)}
        />
      )}

      {showAssignModal && (
        <AssignLeadsModal
          staff={staff}
          selectedCount={selectedLeads.length}
          onAssign={handleAssignLeads}
          onClose={() => setShowAssignModal(false)}
        />
      )}
    </div>
  );
};

export default CallingManagement;