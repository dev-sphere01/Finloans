import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import LeavesService from '@/services/Leaves/leavesService';
import useAuthStore from '@/store/authStore';

// Lightweight, page-local table with client-side pagination only
const fmtDate = (iso) => {
  if (!iso) return '-';
  try { return new Date(iso).toLocaleDateString(); } catch { return '-'; }
};

const ApprovalsTableLite = () => {
  const { isAuthenticated, user } = useAuthStore();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pageIndex, setPageIndex] = useState(0); // 0-based
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return rows;
    const s = search.toLowerCase();
    return rows.filter((r) =>
      String(r?.EmpID ?? '').toLowerCase().includes(s) ||
      String(r?.EmployeeName ?? '').toLowerCase().includes(s) ||
      String(r?.LeaveReason ?? '').toLowerCase().includes(s)
    );
  }, [rows, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPageRows = useMemo(() => {
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    return filtered.slice(start, end);
  }, [filtered, pageIndex, pageSize]);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated || !user?.empId) return;
    try {
      setLoading(true);
      const data = await LeavesService.getPendingApprovals(user.empId);
      // Expect full array; keep as-is
      setRows(Array.isArray(data) ? data : []);
      setPageIndex(0);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.empId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <h2 className="text-lg font-semibold text-gray-800">Pending Approvals</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPageIndex(0); }}
            placeholder="Search by ID/Name/Reason"
            className="px-3 py-2 rounded border border-slate-300 text-gray-800 bg-white w-64 text-sm"
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Rows:</span>
            <select
              className="px-2 py-1 rounded border border-slate-300 text-gray-800 bg-white text-sm"
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPageIndex(0); }}
            >
              {[5,10,20,50,100].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-auto rounded border border-slate-200">
        <table className="min-w-full table-fixed text-gray-800">
          <thead>
            <tr className="bg-gray-100 text-left text-sm">
              <th className="px-3 py-2 border-b w-[18%]">Employee</th>
              <th className="px-3 py-2 border-b w-[10%]">Type</th>
              <th className="px-3 py-2 border-b w-[36%]">Reason</th>
              <th className="px-3 py-2 border-b w-[10%]">Start</th>
              <th className="px-3 py-2 border-b w-[10%]">End</th>
              <th className="px-3 py-2 border-b w-[10%]">Applied On</th>
              <th className="px-3 py-2 border-b w-[16%]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-6 text-slate-500">Loading...</td></tr>
            ) : currentPageRows.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-6 text-gray-700">No records</td></tr>
            ) : currentPageRows.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="px-3 py-2 border-b text-sm">{row.EmployeeName ?? '-'}</td>
                <td className="px-3 py-2 border-b text-sm">{row.LeaveType ?? '-'}</td>
                <td className="px-3 py-2 border-b text-sm align-top">
                  <div className="truncate" title={row.LeaveReason || ''}>{row.LeaveReason ?? '-'}</div>
                </td>
                <td className="px-3 py-2 border-b text-sm">{fmtDate(row.StartDate)}</td>
                <td className="px-3 py-2 border-b text-sm">{fmtDate(row.EndDate)}</td>
                <td className="px-3 py-2 border-b text-sm">{fmtDate(row.CreatedAt)}</td>
                <td className="px-3 py-2 border-b text-sm">
                  <div className="flex items-center gap-2">
                    <button
                      className="px-2 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700"
                      onClick={async () => {
                        const ok = window.confirm('Approve this leave?');
                        if (!ok) return;
                        await LeavesService.approveLeave(row.LeaveID, user.empId);
                        fetchData();
                      }}
                    >Approve</button>
                    <button
                      className="px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700"
                      onClick={async () => {
                        const reason = window.prompt('Enter rejection reason');
                        if (reason && reason.trim()) {
                          await LeavesService.rejectLeave(row.LeaveID, user.empId, reason.trim());
                          fetchData();
                        }
                      }}
                    >Reject</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-700">
          {filtered.length > 0 ? (
            <>Showing {pageIndex * pageSize + 1} to {Math.min((pageIndex + 1) * pageSize, filtered.length)} of {filtered.length} results</>
          ) : 'No results'}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-2 py-1 border rounded disabled:opacity-50"
            onClick={() => setPageIndex(0)}
            disabled={pageIndex === 0}
          >{'<<'}</button>
          <button
            className="px-2 py-1 border rounded disabled:opacity-50"
            onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
            disabled={pageIndex === 0}
          >{'<'}</button>
          <span className="text-sm">Page {pageIndex + 1} of {pageCount}</span>
          <button
            className="px-2 py-1 border rounded disabled:opacity-50"
            onClick={() => setPageIndex((p) => Math.min(pageCount - 1, p + 1))}
            disabled={pageIndex >= pageCount - 1}
          >{'>'}</button>
          <button
            className="px-2 py-1 border rounded disabled:opacity-50"
            onClick={() => setPageIndex(pageCount - 1)}
            disabled={pageIndex >= pageCount - 1}
          >{'>>'}</button>
        </div>
      </div>
    </div>
  );
};

export default ApprovalsTableLite;