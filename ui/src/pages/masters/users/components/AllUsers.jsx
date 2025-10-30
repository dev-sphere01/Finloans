import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import userService from '@/services/userService'
import TableService from '@/services/TableService'
import DeleteConfirmationModal from './DeleteConfirmationModal'
import { createColumnHelper } from '@tanstack/react-table'
import notification from '@/services/NotificationService'
import { ActionButton } from '@/components/permissions'

const AllUsers = ({ onEditUser, onViewUser }) => {
  const { success: notifySuccess, error: notifyError } = notification()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deletingUser, setDeletingUser] = useState(null)
  const tableRef = useRef(null)

  const [tableState, setTableState] = useState({
    pagination: { pageIndex: 0, pageSize: 10 },
    sorting: [{ id: 'createdAt', desc: true }],
    columnFilters: [],
    globalFilter: '',
  });

  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const currentPage = tableState.pagination.pageIndex + 1;
  const currentLimit = tableState.pagination.pageSize;
  const currentSortBy = tableState.sorting.length > 0 ? tableState.sorting[0].id : 'createdAt';
  const currentSortOrder = tableState.sorting.length > 0 ? (tableState.sorting[0].desc ? 'desc' : 'asc') : 'asc';
  const currentSearchTerm = tableState.globalFilter;

  const currentColumnFilters = useMemo(() => {
    const filters = {};
    tableState.columnFilters.forEach(f => {
      filters[f.id] = f.value;
    });
    return filters;
  }, [tableState.columnFilters]);

  const columnHelper = createColumnHelper()

  const columns = useMemo(
    () => [
      columnHelper.accessor('username', {
        header: 'Username',
        cell: (info) => {
          const handleClick = () => {
            if (onViewUser) {
              onViewUser(info.row.original);
            } else if (onEditUser) {
              onEditUser(info.row.original);
            }
          };
          return (
            <div
              className={`font-medium ${onViewUser || onEditUser ? 'text-blue-600 hover:underline cursor-pointer' : 'text-gray-900'}`}
              onClick={handleClick}
            >
              {info.getValue()}
            </div>
          );
        },
        enableColumnFilter: true,
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: (info) => (
          <div className="text-gray-600">
            {info.getValue()}
          </div>
        ),
        enableColumnFilter: true,
      }),
      columnHelper.accessor('fullName', {
        header: 'Full Name',
        cell: (info) => (
          <div className="text-gray-900">
            {info.getValue() || `${info.row.original.firstName} ${info.row.original.lastName}`}
          </div>
        ),
        enableColumnFilter: true,
      }),
      columnHelper.accessor('roleId_name', {
        header: 'Role',
        cell: (info) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {info.row.original.roleId?.name || 'No Role'}
          </span>
        ),
        enableColumnFilter: true,
        enableSorting: false,
      }),
      columnHelper.accessor('isActive', {
        header: 'Status',
        cell: (info) => (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            info.getValue() 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {info.getValue() ? 'Active' : 'Inactive'}
          </span>
        ),
        enableColumnFilter: true,
      }),
      columnHelper.accessor('createdAt', {
        header: 'Created',
        cell: (info) => (
          <div className="text-sm text-gray-500">
            {new Date(info.getValue()).toLocaleDateString()}
          </div>
        ),
        enableColumnFilter: false,
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: (info) => (
          <div className="flex items-center gap-1">
            <ActionButton
              module="users"
              action="read"
              label="View"
              size="sm"
              onClick={() => onViewUser && onViewUser(info.row.original)}
            />
            <ActionButton
              module="users"
              action="update"
              label="Edit"
              size="sm"
              onClick={() => onEditUser && onEditUser(info.row.original)}
            />
            <ActionButton
              module="users"
              action="delete"
              label="Delete"
              size="sm"
              onClick={() => handleDeleteClick(info.row.original)}
            />
          </div>
        ),
      }),
    ],
    [onEditUser, onViewUser]
  )

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = {
        page: currentPage,
        limit: currentLimit,
        sortBy: currentSortBy,
        sortOrder: currentSortOrder,
        ...currentColumnFilters
      }

      if (currentSearchTerm.trim()) {
        params.search = currentSearchTerm.trim()
      }

      const response = await userService.getUsers(params)
      setData(response.users || [])
      setTotalItems(response.pagination.total);
      setTotalPages(response.pagination.totalPages);

    } catch (err) {
      console.error('Error fetching users:', err)
      const errorMsg = err.response?.data?.message || err.error || 'Failed to fetch users'
      setError(errorMsg)
      // Don't call notify here to avoid dependency issues
    } finally {
      setLoading(false)
    }
  }, [currentPage, currentLimit, currentSortBy, currentSortOrder, currentSearchTerm, currentColumnFilters])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleDeleteClick = useCallback((user) => {
    setDeletingUser(user)
  }, [])

  const handleDeleteUser = useCallback(async () => {
    if (!deletingUser) return

    try {
      await userService.deleteUser(deletingUser._id)
      setDeletingUser(null)
      notifySuccess('User deleted successfully!')
      fetchUsers() // Refresh the list
    } catch (error) {
      console.error('Failed to delete user:', error)
      const errorMsg = error.response?.data?.message || error.error || 'Failed to delete user'
      notifyError(errorMsg)
    }
  }, [deletingUser, notifySuccess, notifyError])

  if (error) {
    return (
      <div className="rounded-lg shadow-md p-6 bg-white">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Users</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchUsers}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg shadow-md bg-white">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">All Users</h3>
              <p className="mt-1 text-sm text-gray-600">
                Manage and view all system users
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                Total: {totalItems} users
              </span>
              <button
                onClick={fetchUsers}
                disabled={loading}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm transition-colors disabled:opacity-50"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <TableService
            ref={tableRef}
            columns={columns}
            data={data}
            serverPagination={true}
            pageCount={totalPages}
            totalItems={totalItems}
            currentPage={currentPage}
            loading={loading}
            onStateChange={setTableState}
            onRefresh={fetchUsers}
          />
        </div>
      </div>

      {deletingUser && (
        <DeleteConfirmationModal
          userName={deletingUser.username}
          onConfirm={handleDeleteUser}
          onCancel={() => setDeletingUser(null)}
        />
      )}
    </>
  )
}

export default AllUsers