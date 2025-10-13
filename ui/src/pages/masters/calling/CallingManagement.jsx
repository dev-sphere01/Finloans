import { useState, useEffect } from 'react';
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

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [staffData, servicesData, leadsData] = await Promise.all([
        callingService.getStaff(),
        callingService.getServices(),
        callingService.getLeads()
      ]);
      setStaff(staffData);
      setServices(servicesData);
      setLeads(leadsData.leads || []);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLeads = async () => {
    try {
      setLoading(true);
      const data = await callingService.getLeads();
      setLeads(data.leads || []);
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLead = async (leadData) => {
    try {
      await callingService.createLead(leadData);
      setShowAddModal(false);
      loadLeads();
    } catch (error) {
      console.error('Error adding lead:', error);
    }
  };

  const handleBulkImport = async (file) => {
    try {
      await callingService.bulkImportLeads(file);
      setShowImportModal(false);
      loadLeads();
    } catch (error) {
      console.error('Error importing leads:', error);
    }
  };

  const handleAssignLeads = async (staffId) => {
    try {
      await callingService.assignLeads(selectedLeads, staffId);
      assignLeadsToStaff(selectedLeads, staffId);
      setSelectedLeads([]);
      setShowAssignModal(false);
    } catch (error) {
      console.error('Error assigning leads:', error);
    }
  };

  const handleLeadClick = (lead) => {
    navigate(`/calling/lead/${lead.id}`);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calling Management</h1>
          <p className="text-gray-600 mt-1">Manage leads and calling activities</p>
        </div>
        
        <div className="flex gap-2">
          <ActionButton
            module="calling"
            action="create"
            label="Add Lead"
            icon={<FaPlus />}
            onClick={() => setShowAddModal(true)}
          />
          
          <ActionButton
            module="calling"
            action="create"
            label="Bulk Import"
            icon={<FaFileImport />}
            onClick={() => setShowImportModal(true)}
          />
          
          {selectedLeads.length > 0 && (
            <ActionButton
              module="calling"
              action="update"
              label={`Assign ${selectedLeads.length} Lead${selectedLeads.length > 1 ? 's' : ''}`}
              icon={<FaUserCheck />}
              onClick={() => setShowAssignModal(true)}
            />
          )}
        </div>
      </div>

      <LeadsList
        leads={leads}
        isLoading={isLoading}
        selectedLeads={selectedLeads}
        onSelectionChange={setSelectedLeads}
        onLeadClick={handleLeadClick}
        onStateChange={(state) => {
          // Handle table state changes if needed for server-side operations
          console.log('Table state changed:', state);
        }}
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