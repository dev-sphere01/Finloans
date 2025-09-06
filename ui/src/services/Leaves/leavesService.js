import API from '@/services/API';
import { notification } from '@/services';
import ErrorHandler from '@/services/ErrorHandler';

const notify = notification();

// Transform UI form data to API payload shape
const toApiPayload = (form, empId) => {
  const start = form.startDate ? new Date(form.startDate) : null;
  const end = form.endDate ? new Date(form.endDate) : null;

  return {
    LeaveID: 0,
    EmpID: empId || 0,
    LeaveType: form.leaveType || '',
    LeaveReason: form.reason || '',
    IsApproved: null,
    StartDate: start ? new Date(start.setHours(0, 0, 0, 0)).toISOString() : null,
    EndDate: end ? new Date(end.setHours(23, 59, 59, 999)).toISOString() : null,
    CreatedAt: new Date().toISOString(),
  };
};

// Build query string from table state (for server-side pagination/filtering)
const buildQueryFromTableState = (tableState) => {
  if (!tableState) return '';
  const params = new URLSearchParams();
  const { pagination, sorting, globalFilter, columnFilters } = tableState;

  if (pagination) {
    params.set('Page', String((pagination.pageIndex ?? 0) + 1));
    params.set('PageSize', String(pagination.pageSize ?? 10));
  }

  if (globalFilter) params.set('Search', globalFilter);

  if (Array.isArray(sorting) && sorting.length > 0) {
    const s = sorting[0];
    params.set('SortBy', s.id);
    params.set('SortDir', s.desc ? 'desc' : 'asc');
  }

  if (Array.isArray(columnFilters)) {
    columnFilters.forEach((f) => {
      if (f?.id && f?.value) params.set(f.id, f.value);
    });
  }

  return params.toString();
};

const LeavesService = {
  // Get leaves for a specific employee by EmpID (server-side)
  async getLeaves(empId) {
    return await ErrorHandler.handle(async () => {
      if (empId === undefined || empId === null) return [];
      const { data } = await API.get(`Leaves/GetLeavesbyEmpID/${empId}`);
      if (Array.isArray(data)) return data;
      if (data?.items) return data.items;
      if (data?.Items) return data.Items;
      return [];
    }, [] , (error) => {
      notify.error(`Failed to fetch leaves: ${error.message}`);
    });
  },

  // Get pending approvals for current approver (token-based). No server pagination/filters.
  async getPendingApprovals(id) {
    return await ErrorHandler.handle(async () => {
      const { data } = await API.get(`Leaves/GetLeavestobeApproved/${id}`);
      if (Array.isArray(data)) return data;
      if (data?.items) return data.items;
      if (data?.Items) return data.Items;
      return [];
    }, [], (error) => {
      notify.error(`Failed to fetch pending approvals: ${error.message}`);
    });
  },

  // Create a new leave request
  async createLeave(formData, currentUser) {
    return await ErrorHandler.handle(async () => {
      const payload = toApiPayload(formData, currentUser?.empId || 0);
      const { data } = await API.post('/Leaves', payload);
      notify.success('Leave application submitted');
      return data;
    }, null, (error) => {
      const message = error.response?.data?.message || error.message || 'Failed to submit leave';
      notify.error(message);
    });
  },

  // Approve a leave
  async approveLeave(leaveId, approverEmpId, rejectionReason = '') {
    return await ErrorHandler.handle(async () => {
      if (!leaveId || !approverEmpId) throw new Error('Missing leave or approver ID');
      // API expects [FromBody] string; sending a string works with JSON as well
      await API.put(`Leaves/Approved/${leaveId}/${approverEmpId}`, rejectionReason ?? '');
      notify.success('Leave approved');
      return true;
    }, false, (error) => {
      notify.error(error.response?.data?.message || error.message || 'Failed to approve leave');
    });
  },

  // Reject a leave
  async rejectLeave(leaveId, approverEmpId, rejectionReason) {
    return await ErrorHandler.handle(async () => {
      if (!leaveId || !approverEmpId) throw new Error('Missing leave or approver ID');
      if (!rejectionReason || !String(rejectionReason).trim()) throw new Error('Rejection reason is required');
      await API.put(`Leaves/Reject/${leaveId}/${approverEmpId}`, rejectionReason);
      notify.success('Leave rejected');
      return true;
    }, false, (error) => {
      notify.error(error.response?.data?.message || error.message || 'Failed to reject leave');
    });
  },
};

export default LeavesService;