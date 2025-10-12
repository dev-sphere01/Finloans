import React, { useState, useEffect, useMemo } from 'react';
import API from '@/services/API';
import TableService from '@/services/TableService';
import roleService from '@/services/roleService';
import notification from '@/services/NotificationService';
import { createColumnHelper } from '@tanstack/react-table';
import { ActionButton } from '@/components/permissions';


const AllRoles = ({ onEditRole }) => {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(null)

  // TableService state
  const [tableState, setTableState] = useState({
    pagination: { pageIndex: 0, pageSize: 10 },
    sorting: [{ id: 'level', desc: false }], // Default sort by level ascending
    columnFilters: [],
    globalFilter: '',
  });

  // Pagination states (derived from tableState for API calls)
  const currentPage = tableState.pagination.pageIndex + 1;
  const currentLimit = tableState.pagination.pageSize;
  const currentSortBy = tableState.sorting.length > 0 ? tableState.sorting[0].id : 'level';
  const currentSortOrder = tableState.sorting.length > 0 ? (tableState.sorting[0].desc ? 'desc' : 'asc') : 'asc';
  const currentSearchTerm = tableState.globalFilter;

  // Column filters (derived from tableState for API calls)
  const currentColumnFilters = useMemo(() => {
    const filters = {};
    tableState.columnFilters.forEach(f => {
      filters[f.id] = f.value;
    });
    return filters;
  }, [tableState.columnFilters]);


  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);


  useEffect(() => {
    fetchRoles()
  }, [currentPage, currentLimit, currentSortBy, currentSortOrder, currentSearchTerm, currentColumnFilters])

  const fetchRoles = async () => {
    try {
      setLoading(true)
      setError('')

      // Build query parameters
      const params = {
        page: currentPage,
        limit: currentLimit,
        sortBy: currentSortBy,
        sortOrder: currentSortOrder,
        ...currentColumnFilters
      }

      // Add search if provided
      if (currentSearchTerm.trim()) {
        params.search = currentSearchTerm.trim()
      }

      const response = await roleService.getAll(params)

      if (response) {
        setRoles(response.roles || [])
        setTotalItems(response.pagination.total);
        setTotalPages(response.pagination.totalPages);
      } else {
        setError('Failed to fetch roles');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  }

    const handleDeleteRole = async (roleId, roleName) => {
      if (!window.confirm(`Are you sure you want to delete the role "${roleName}"? This action cannot be undone.`)) return;

      try {
        setDeleteLoading(roleId);
        const response = await API.roles.delete(roleId);
        if (response.success) {
          notification.success('Role deleted successfully!');
          fetchRoles(); // Re-fetch roles to update the table
        } else {
          notification.error(response.message || 'Failed to delete role');
        }
      } catch (err) {
        notification.error(err.response?.data?.message || 'Failed to delete role');
      } finally {
        setDeleteLoading(null);
      }
    };

  const columnHelper = createColumnHelper();


  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      header: 'Role Name',
      cell: info => {
        const handleClick = () => {
          // AllRoles does not have onViewRole prop, so only check onEditRole
          if (onEditRole) {
            onEditRole(info.row.original);
          }
        };
        return (
          <div
            className={`flex items-center font-medium ${onEditRole ? 'text-blue-600 hover:underline cursor-pointer' : 'text-gray-900'}`}
            onClick={handleClick}
          >
            <div>
              <div className="text-sm">
                {info.getValue()}
              </div>
              {info.row.original.isSystem && (
                <div className="text-xs text-purple-600 font-medium">System Role</div>
              )}
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor('description', {
      header: 'Description',
      enableSorting: false,
      enableColumnFilter: true,
    }),
    columnHelper.accessor('permissions', {
      header: 'Permissions',
      cell: info => `${info.getValue()?.length || 0} permissions`,
      enableSorting: false,
      enableColumnFilter: false,
    }),
    columnHelper.accessor('isActive', {
      header: 'Status',
      cell: info => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          info.getValue()
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {info.getValue() ? 'Active' : 'Inactive'}
        </span>
      ),
      filterFn: (row, columnId, filterValue) => {
        if (filterValue === 'all') return true;
        return row.original[columnId] === (filterValue === 'active');
      },
      enableColumnFilter: true,
    }),
    columnHelper.accessor('createdAt', {
      header: 'Created',
      cell: info => info.getValue() ? new Date(info.getValue()).toLocaleDateString() : 'N/A',
      enableColumnFilter: false,
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: info => (
        <div className="flex items-center gap-1">
          <ActionButton
            module="roles"
            action="read"
            label="View"
            size="sm"
            onClick={() => onEditRole(info.row.original)}
          />
          <ActionButton
            module="roles"
            action="update"
            label="Edit"
            size="sm"
            onClick={() => onEditRole(info.row.original)}
          />
          {!info.row.original.isSystem && (
            <ActionButton
              module="roles"
              action="delete"
              label="Delete"
              size="sm"
              disabled={deleteLoading === info.row.original._id}
              onClick={() => handleDeleteRole(info.row.original._id, info.row.original.name)}
            />
          )}
        </div>
      ),
      enableSorting: false,
      enableColumnFilter: false,
    }),
  ], [onEditRole, handleDeleteRole, deleteLoading]);


  return (
    <div className="rounded-lg shadow-md bg-white ">
      {/* Header */}
      {/* <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              All Roles
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Manage and view all system roles
            </p>
          </div>

          <div className="mt-4 sm:mt-0">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {totalItems} role{totalItems !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 mb-4">
          <div className="flex items-center justify-between">
            <span>❌ {error}</span>
            <button onClick={() => setError('')} className="text-red-600 font-bold">×</button>
          </div>
        </div>
      )} */}

      <TableService
        columns={columns}
        data={roles}
        serverPagination={true}
        pageCount={totalPages}
        totalItems={totalItems}
        currentPage={currentPage}
        loading={loading}
        onStateChange={setTableState}
      />
    </div>
  );
};

export default AllRoles;