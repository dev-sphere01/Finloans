import { useState, useMemo } from 'react';
import { ActionButton } from '@/components/permissions';
import TableService from '@/services/TableService';
import { FaEye, FaPhone, FaUser, FaEnvelope, FaClock } from 'react-icons/fa';

const LeadsList = ({ 
  leads, 
  isLoading, 
  selectedLeads, 
  onSelectionChange, 
  onLeadClick,
  onStateChange
}) => {
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      onSelectionChange(leads.map(lead => lead.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectLead = (leadId, checked) => {
    if (checked) {
      onSelectionChange([...selectedLeads, leadId]);
    } else {
      onSelectionChange(selectedLeads.filter(id => id !== leadId));
      setSelectAll(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      unassigned: 'bg-gray-100 text-gray-800',
      assigned: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] || statusStyles.unassigned}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unassigned'}
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
      id: 'select',
      header: () => (
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={(e) => handleSelectAll(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700">Select</label>
        </div>
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedLeads.includes(row.original.id)}
          onChange={(e) => handleSelectLead(row.original.id, e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      ),
      enableSorting: false,
      enableColumnFilter: false,
    },
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
              {lead.email && (
                <div className="text-sm text-gray-500 flex items-center">
                  <FaEnvelope className="h-3 w-3 mr-1" />
                  {lead.email}
                </div>
              )}
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
      accessorKey: 'assignedToName',
      header: 'Assigned To',
      cell: ({ row }) => {
        const lead = row.original;
        return (
          <div>
            <div className="text-sm text-gray-900">
              {lead.assignedToName || '-'}
            </div>
            {lead.assignedAt && (
              <div className="text-sm text-gray-500 flex items-center">
                <FaClock className="h-3 w-3 mr-1" />
                {formatDate(lead.assignedAt)}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ getValue }) => (
        <div className="text-sm text-gray-500">
          {formatDate(getValue())}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <ActionButton
          module="calling"
          action="read"
          icon={<FaEye />}
          onClick={(e) => {
            e.stopPropagation();
            onLeadClick(row.original);
          }}
          size="sm"
        />
      ),
      enableSorting: false,
      enableColumnFilter: false,
    },
  ], [selectedLeads, selectAll, onLeadClick]);

  const handleRowClick = (row) => {
    onLeadClick(row.original);
  };

  if (!leads || leads.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <FaPhone className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
        <p className="text-gray-500">Start by adding your first lead or importing from Excel.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">
          Leads ({leads.length})
        </h2>
      </div>

      <TableService
        columns={columns}
        data={leads}
        loading={isLoading}
        onRowClick={handleRowClick}
        onStateChange={onStateChange}
        initialPageSize={10}
      />
    </div>
  );
};

export default LeadsList;