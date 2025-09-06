import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import TableService from '@/services/TableService';
import LeavesService from '@/services/Leaves/leavesService';
import useAuthStore from '@/store/authStore';

// Helper formatters
const fmtDate = (iso) => {
  if (!iso) return '-';
  try { return new Date(iso).toLocaleDateString(); } catch { return '-'; }
};

const dayDiff = (start, end) => {
  if (!start || !end) return 1;
  try {
    const s = new Date(start);
    const e = new Date(end);
    const ms = e - s;
    return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)) + 1);
  } catch {
    return 1;
  }
};

const ApprovalsTable = () => {
  const { user } = useAuthStore();
  const tableRef = useRef(null);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const columns = useMemo(() => [
    {
      accessorKey: 'EmpID',
      header: 'Employee ID',
      enableSorting: true,
      enableColumnFilter: true,
      cell: (info) => <span className="text-gray-800">{info.getValue() ?? '-'}</span>,
    },
    {
      accessorKey: 'LeaveType',
      header: 'Type',
      enableSorting: true,
      enableColumnFilter: true,
      cell: (info) => <span className="text-gray-800">{info.getValue() ?? '-'}</span>,
    },
    {
      accessorKey: 'LeaveReason',
      header: 'Reason',
      enableSorting: false,
      enableColumnFilter: true,
      cell: (info) => (
        <span className="text-gray-800 line-clamp-1" title={info.getValue() || ''}>
          {info.getValue() ?? '-'}
        </span>
      ),
    },
    {
      accessorKey: 'StartDate',
      header: 'Start',
      enableSorting: true,
      enableColumnFilter: true,
      cell: (info) => <span className="text-gray-800">{fmtDate(info.getValue())}</span>,
    },
    {
      accessorKey: 'EndDate',
      header: 'End',
      enableSorting: true,
      enableColumnFilter: true,
      cell: (info) => <span className="text-gray-800">{fmtDate(info.getValue())}</span>,
    },
    {
      id: 'Days',
      header: 'Days',
      enableSorting: false,
      enableColumnFilter: false,
      cell: ({ row }) => {
        const s = row.original?.StartDate;
        const e = row.original?.EndDate;
        return <span className="text-gray-800">{dayDiff(s, e)}</span>;
      },
    },
    {
      accessorKey: 'CreatedAt',
      header: 'Applied On',
      enableSorting: true,
      enableColumnFilter: true,
      cell: (info) => <span className="text-gray-800">{fmtDate(info.getValue())}</span>,
    },
  ], []);

  const fetchData = useCallback(async () => {
    if (!user?.empId) return;
    try {
      setLoading(true);
      const tableState = tableRef.current?.getTableState?.();
      const resp = await LeavesService.getPendingApprovals(user.empId, tableState);
      setRows(resp.items || []);
      setTotalItems(resp.totalItems || 0);
      setTotalPages(resp.totalPages || 1);
      setCurrentPage(resp.currentPage || 1);
    } finally {
      setLoading(false);
    }
  }, [user?.empId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-800">Pending Approvals</h2>
      </div>

      <TableService
        ref={tableRef}
        columns={columns}
        data={rows}
        serverPagination={true}
        pageCount={totalPages}
        totalItems={totalItems}
        totalPages={totalPages}
        currentPage={currentPage}
        loading={loading}
        onRefresh={fetchData}
      />
    </div>
  );
};

export default ApprovalsTable;