import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaEye, FaDownload } from 'react-icons/fa';
import API from '@/services/API';
import notification from '@/services/NotificationService';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const notify = notification();

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      // Note: This endpoint would need to be implemented in the API
      // For now, we'll show a placeholder
      setLogs([]);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      notify.error('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    const colors = {
      'LOGIN': 'bg-green-100 text-green-800',
      'LOGOUT': 'bg-gray-100 text-gray-800',
      'PASSWORD_CHANGE': 'bg-blue-100 text-blue-800',
      'USER_CREATE': 'bg-purple-100 text-purple-800',
      'USER_UPDATE': 'bg-yellow-100 text-yellow-800',
      'USER_DELETE': 'bg-red-100 text-red-800',
      'ROLE_CREATE': 'bg-indigo-100 text-indigo-800',
      'ROLE_UPDATE': 'bg-orange-100 text-orange-800',
      'FAILED_LOGIN': 'bg-red-100 text-red-800',
    };
    return colors[action] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600">Monitor system activities and user actions</p>
        </div>
        <button
          onClick={() => notify.info('Export functionality coming soon')}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <FaDownload /> Export Logs
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
          />
        </div>
        
        <select
          value={selectedAction}
          onChange={(e) => setSelectedAction(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
        >
          <option value="">All Actions</option>
          <option value="LOGIN">Login</option>
          <option value="LOGOUT">Logout</option>
          <option value="PASSWORD_CHANGE">Password Change</option>
          <option value="USER_CREATE">User Create</option>
          <option value="USER_UPDATE">User Update</option>
          <option value="USER_DELETE">User Delete</option>
          <option value="ROLE_CREATE">Role Create</option>
          <option value="ROLE_UPDATE">Role Update</option>
          <option value="FAILED_LOGIN">Failed Login</option>
        </select>

        <input
          type="date"
          value={dateRange.start}
          onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
          className="px-3 py-2 border border-gray-300 rounded-lg"
          placeholder="Start Date"
        />

        <input
          type="date"
          value={dateRange.end}
          onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
          className="px-3 py-2 border border-gray-300 rounded-lg"
          placeholder="End Date"
        />
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Placeholder for when API is implemented */}
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <FaEye className="mx-auto text-4xl mb-4" />
                    <h3 className="text-lg font-medium mb-2">Audit Logs Coming Soon</h3>
                    <p>The audit logging system is being implemented and will be available soon.</p>
                    <p className="text-sm mt-2">All user activities and system changes will be tracked here.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Sample data structure for when API is ready */}
      <div className="mt-8 bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Sample Audit Log Entry:</h3>
        <pre className="text-xs text-gray-600 bg-white p-3 rounded border overflow-x-auto">
{`{
  "timestamp": "2025-01-15T10:30:00Z",
  "userId": "user123",
  "username": "john.doe",
  "action": "USER_UPDATE",
  "resource": "users",
  "resourceId": "user456",
  "details": {
    "updatedFields": ["email", "role"],
    "oldData": { "email": "old@example.com", "role": "Employee" },
    "newData": { "email": "new@example.com", "role": "Manager" }
  },
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "success": true
}`}
        </pre>
      </div>
    </div>
  );
};

export default AuditLogs;