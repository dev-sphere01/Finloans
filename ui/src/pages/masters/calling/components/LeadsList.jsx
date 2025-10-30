import { useState, useMemo } from 'react';
import { ActionButton } from '@/components/permissions';
import TableService from '@/services/TableService';
import { EmailLink, PhoneLink } from '@/components/common/ContactLinks';
import { FaEye, FaPhone, FaUser, FaEnvelope, FaClock } from 'react-icons/fa';

const LeadsList = ({
  leads,
  isLoading,
  selectedLeads,
  onSelectionChange,
  onLeadClick,
  onStateChange,
  serverPagination,
  pageCount,
  totalItems,
  currentPage
}) => {
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      // Only select unassigned leads
      const unassignedLeads = leads.filter(lead => !lead.assignedTo || lead.status === 'unassigned');
      onSelectionChange(unassignedLeads.map(lead => lead.id));
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
      cell: ({ row }) => {
        const lead = row.original;
        const isAssigned = lead.assignedTo && lead.status !== 'unassigned';

        return (
          <input
            type="checkbox"
            checked={selectedLeads.includes(lead.id)}
            onChange={(e) => handleSelectLead(lead.id, e.target.checked)}
            disabled={isAssigned}
            className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${isAssigned ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            title={isAssigned ? 'This lead is already assigned' : ''}
          />
        );
      },
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
              <div
                className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600 hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  onLeadClick(lead);
                }}
              >
                {lead.name}
              </div>
              <div className="text-sm">
                <PhoneLink phone={lead.contactNo} className="text-gray-500" showIcon={true} />
              </div>
              {lead.email && (
                <div className="text-sm">
                  <EmailLink email={lead.email} className="text-gray-500" showIcon={true} />
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
          module="calling_admin"
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



  // Always show table, even when no data - let TableService handle empty state

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">

      <TableService
        columns={columns}
        data={leads}
        loading={isLoading}
        onStateChange={onStateChange}
        initialPageSize={10}
        serverPagination={serverPagination}
        serverFiltering={serverPagination}
        serverSorting={serverPagination}
        pageCount={pageCount}
        totalItems={totalItems}
        currentPage={currentPage}
      />
    </div>
  );
};

export default LeadsList;