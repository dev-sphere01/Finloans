import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import creditCardService from '@/services/creditCardService'
import TableService from '@/services/TableService'
import { createColumnHelper } from '@tanstack/react-table'
import notification from '@/services/NotificationService'

const AllCreditCards = ({ onEditCreditCard, onViewCreditCard }) => {
  const { success: notifySuccess, error: notifyError } = notification()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deletingCard, setDeletingCard] = useState(null)
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
      columnHelper.accessor('creditCardName', {
        header: 'Card Name',
        cell: (info) => (
          <div className="font-medium text-gray-900">
            {info.getValue()}
          </div>
        ),
        enableColumnFilter: true,
      }),
      columnHelper.accessor('cibilRange', {
        header: 'CIBIL Range',
        cell: (info) => (
          <div className="text-gray-600">
            {info.getValue()}
          </div>
        ),
        enableColumnFilter: true,
      }),
      columnHelper.accessor('creditCardPic', {
        header: 'Image',
        cell: (info) => (
            <img src={info.getValue()} alt="Credit Card" className="h-10 w-16 object-cover" />
        ),
        enableColumnFilter: false,
        enableSorting: false,
      }),
      columnHelper.accessor('link', {
        header: 'Apply Link',
        cell: (info) => (
            <a href={info.getValue()} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                Apply
            </a>
        ),
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewCreditCard && onViewCreditCard(info.row.original)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-sm transition-colors"
              title="View Card"
            >
              View
            </button>
            <button
              onClick={() => onEditCreditCard && onEditCreditCard(info.row.original)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm transition-colors"
              title="Edit Card"
            >
              Edit
            </button>
            <button
              onClick={() => handleDeleteClick(info.row.original)}
              className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm transition-colors"
              title="Delete Card"
            >
              Delete
            </button>
          </div>
        ),
      }),
    ],
    [onEditCreditCard, onViewCreditCard]
  )

  const fetchCreditCards = useCallback(async () => {
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

      const response = await creditCardService.getCreditCards(params)
      setData(response.cards || [])
      setTotalItems(response.pagination.total);
      setTotalPages(response.pagination.pages);

    } catch (err) {
      console.error('Error fetching credit cards:', err)
      const errorMsg = err.response?.data?.message || err.error || 'Failed to fetch credit cards'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [currentPage, currentLimit, currentSortBy, currentSortOrder, currentSearchTerm, currentColumnFilters])

  useEffect(() => {
    fetchCreditCards()
  }, [fetchCreditCards])

  const handleDeleteClick = useCallback((card) => {
    setDeletingCard(card)
  }, [])

  const handleDeleteCard = useCallback(async () => {
    if (!deletingCard) return

    try {
      await creditCardService.deleteCreditCard(deletingCard._id)
      setDeletingCard(null)
      notifySuccess('Credit card deleted successfully!')
      fetchCreditCards() // Refresh the list
    } catch (error) {
      console.error('Failed to delete credit card:', error)
      const errorMsg = error.response?.data?.message || error.error || 'Failed to delete credit card'
      notifyError(errorMsg)
    }
  }, [deletingCard, notifySuccess, notifyError])

  if (error) {
    return (
      <div className="rounded-lg shadow-md p-6 bg-white">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Credit Cards</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchCreditCards}
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
              <h3 className="text-lg font-medium text-gray-900">All Credit Cards</h3>
              <p className="mt-1 text-sm text-gray-600">
                Manage and view all credit cards
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                Total: {totalItems} cards
              </span>
              <button
                onClick={fetchCreditCards}
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
            onRefresh={fetchCreditCards}
          />
        </div>
      </div>

      {deletingCard && (
        // I will need to create a DeleteConfirmationModal for credit cards
        // For now, I will just use a simple confirm
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
            <div className="p-8 border w-96 shadow-lg rounded-md bg-white">
                <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900">Confirm Deletion</h3>
                    <p className="text-sm text-gray-500 mt-2">Are you sure you want to delete this credit card?</p>
                    <div className="flex justify-center mt-4">
                        <button
                            onClick={() => setDeletingCard(null)}
                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md mr-2"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDeleteCard}
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

export default AllCreditCards
