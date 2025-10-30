import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import insuranceService from '@/services/insuranceService'
import TableService from '@/services/TableService'
import { createColumnHelper } from '@tanstack/react-table'
import notification from '@/services/NotificationService'
import { ActionButton } from '@/components/permissions'

const AllInsurances = ({ onEditInsurance, onViewInsurance }) => {
  const { success: notifySuccess, error: notifyError } = notification()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deletingInsurance, setDeletingInsurance] = useState(null)
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
      columnHelper.accessor('insuranceType', {
        header: 'Insurance Type',
        cell: (info) => {
          const handleClick = () => {
            if (onViewInsurance) {
              onViewInsurance(info.row.original);
            } else if (onEditInsurance) {
              onEditInsurance(info.row.original);
            }
          };
          const insurance = info.row.original;
          return (
            <div className="space-y-1 min-w-48">
              <div
                className={`font-medium text-sm ${onViewInsurance || onEditInsurance ? 'text-blue-600 hover:underline cursor-pointer' : 'text-gray-900'}`}
                onClick={handleClick}
              >
                {info.getValue()}
              </div>
              {insurance.description && (
                <div className="text-xs text-gray-500 line-clamp-3 max-w-48">
                  {insurance.description}
                </div>
              )}
              {!insurance.description && (
                <div className="text-xs text-gray-400">No description</div>
              )}
            </div>
          );
        },
        enableColumnFilter: true,
      }),
      columnHelper.accessor('subTypes', {
        header: 'Sub Types',
        cell: (info) => {
          const subTypes = info.getValue() || [];
          const activeSubTypes = subTypes.filter(st => st.isActive);
          const inactiveSubTypes = subTypes.filter(st => !st.isActive);
          
          return (
            <div className="space-y-2 min-w-48">
              <div className="text-sm">
                <span className="font-medium text-gray-700">
                  {activeSubTypes.length} active
                </span>
                {inactiveSubTypes.length > 0 && (
                  <span className="text-gray-500 ml-2">
                    ({inactiveSubTypes.length} inactive)
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {activeSubTypes.map((subType, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    title={subType.description || subType.name}
                  >
                    {subType.name}
                  </span>
                ))}
                {inactiveSubTypes.map((subType, index) => (
                  <span
                    key={`inactive-${index}`}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
                    title={`${subType.description || subType.name} (Inactive)`}
                  >
                    {subType.name}
                  </span>
                ))}
              </div>
              {subTypes.length === 0 && (
                <span className="text-xs text-gray-400">No subtypes</span>
              )}
            </div>
          );
        },
        enableColumnFilter: false,
        enableSorting: false,
      }),
      columnHelper.accessor('isActive', {
        header: 'Status',
        cell: (info) => (
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              info.getValue()
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {info.getValue() ? 'Active' : 'Inactive'}
          </span>
        ),
        enableColumnFilter: true,
        filterFn: 'equals',
      }),
      columnHelper.accessor('icon', {
        header: 'Icon',
        cell: (info) => (
          <div className="text-sm text-gray-600 text-center">
            {info.getValue() ? (
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs">
                {info.getValue()}
              </span>
            ) : (
              <span className="text-gray-400 text-xs">No icon</span>
            )}
          </div>
        ),
        enableColumnFilter: false,
      }),
      columnHelper.accessor('color', {
        header: 'Color',
        cell: (info) => (
          <div className="text-sm text-gray-600">
            {info.getValue() ? (
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded bg-gradient-to-r ${info.getValue()}`}></div>
                <span className="text-xs text-gray-500 truncate max-w-20" title={info.getValue()}>
                  {info.getValue().split(' ')[0]}...
                </span>
              </div>
            ) : (
              <span className="text-gray-400 text-xs">No color</span>
            )}
          </div>
        ),
        enableColumnFilter: false,
      }),
      columnHelper.accessor('displayOrder', {
        header: 'Order',
        cell: (info) => (
          <div className="text-sm text-gray-600 text-center">
            {info.getValue() || 0}
          </div>
        ),
        enableColumnFilter: false,
      }),
      columnHelper.accessor('links', {
        header: 'Links',
        cell: (info) => {
          const links = info.getValue() || [];
          return (
            <div className="space-y-1 min-w-32">
              {links.length > 0 ? (
                <>
                  <div className="text-sm font-medium text-gray-700">
                    {links.length} link{links.length !== 1 ? 's' : ''}
                  </div>
                  {links.slice(0, 1).map((link, index) => (
                    <a
                      key={index}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs text-blue-500 hover:underline truncate max-w-32"
                      title={link}
                    >
                      {link.length > 30 ? `${link.substring(0, 30)}...` : link}
                    </a>
                  ))}
                  {links.length > 1 && (
                    <div className="text-xs text-gray-500" title={`Total ${links.length} links`}>
                      +{links.length - 1} more
                    </div>
                  )}
                </>
              ) : (
                <span className="text-xs text-gray-400">No links</span>
              )}
            </div>
          );
        },
        enableColumnFilter: false,
        enableSorting: false,
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
              module="insurance"
              action="read"
              label="View"
              size="sm"
              onClick={() => onViewInsurance && onViewInsurance(info.row.original)}
            />
            <ActionButton
              module="insurance"
              action="update"
              label="Edit"
              size="sm"
              onClick={() => onEditInsurance && onEditInsurance(info.row.original)}
            />
            <ActionButton
              module="insurance"
              action="delete"
              label="Delete"
              size="sm"
              onClick={() => handleDeleteClick(info.row.original)}
            />
          </div>
        ),
      }),
    ],
    [onEditInsurance, onViewInsurance]
  )

  const fetchInsurances = useCallback(async () => {
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

      const response = await insuranceService.getInsurances(params)
      setData(response.items || [])
      setTotalItems(response.pagination?.totalItems || 0);
      setTotalPages(response.pagination?.totalPages || 0);

    } catch (err) {
      console.error('Error fetching insurances:', err)
      const errorMsg = err.response?.data?.message || err.error || 'Failed to fetch insurances'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [currentPage, currentLimit, currentSortBy, currentSortOrder, currentSearchTerm, currentColumnFilters])

  useEffect(() => {
    fetchInsurances()
  }, [fetchInsurances])

  const handleDeleteClick = useCallback((insurance) => {
    setDeletingInsurance(insurance)
  }, [])

  const handleDeleteInsurance = useCallback(async () => {
    if (!deletingInsurance) return

    try {
      await insuranceService.deleteInsurance(deletingInsurance._id)
      setDeletingInsurance(null)
      notifySuccess('Insurance deleted successfully!')
      fetchInsurances() // Refresh the list
    } catch (error) {
      console.error('Failed to delete insurance:', error)
      const errorMsg = error.response?.data?.message || error.error || 'Failed to delete insurance'
      notifyError(errorMsg)
    }
  }, [deletingInsurance, notifySuccess, notifyError])

  if (error) {
    return (
      <div className="rounded-lg shadow-md p-6 bg-white">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Insurances</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchInsurances}
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
              <h3 className="text-lg font-medium text-gray-900">All Insurances</h3>
              <p className="mt-1 text-sm text-gray-600">
                Manage and view all insurance products
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                Total: {totalItems} insurances
              </span>
              <button
                onClick={fetchInsurances}
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
            onRefresh={fetchInsurances}
          />
        </div>
      </div>

      {deletingInsurance && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
            <div className="p-8 border w-96 shadow-lg rounded-md bg-white">
                <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900">Confirm Deletion</h3>
                    <p className="text-sm text-gray-500 mt-2">Are you sure you want to delete this insurance?</p>
                    <div className="flex justify-center mt-4">
                        <button
                            onClick={() => setDeletingInsurance(null)}
                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md mr-2"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDeleteInsurance}
                            className="px-4 py-2 bg-red-600 text-white rounded-md"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </>
  )
}

export default AllInsurances
