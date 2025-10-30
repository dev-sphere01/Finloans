import React from 'react';
import { usePermissions } from '@/contexts/PermissionContext';
import useAuthStore from '@/store/authStore';

const PermissionTester = () => {
  const { user, permissions, hasPermission, isAdmin } = usePermissions();
  const authUser = useAuthStore(state => state.user);

  // Test permissions for calling modules
  const testPermissions = [
    { module: 'calling_admin', action: 'read' },
    { module: 'calling_admin', action: 'create' },
    { module: 'calling_admin', action: 'manage' },
    { module: 'calling_employee', action: 'read' },
    { module: 'calling_employee', action: 'start_call' },
    { module: 'calling_employee', action: 'end_call' },
    { module: 'users', action: 'read' },
    { module: 'roles', action: 'read' },
    { module: 'loans', action: 'read' },
    { module: 'insurance', action: 'read' },
    { module: 'credit-cards', action: 'read' },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Permission Tester</h2>
      
      {/* User Info */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-blue-800">Current User Info</h3>
        {isAdmin && (
          <div className="mb-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-yellow-800 text-sm font-medium">
            🔑 ADMIN USER - Has implicit access to all permissions
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Auth Store User:</strong>
            <pre className="mt-1 p-2 bg-white rounded text-xs overflow-auto">
              {JSON.stringify(authUser, null, 2)}
            </pre>
          </div>
          <div>
            <strong>Permission Context User:</strong>
            <pre className="mt-1 p-2 bg-white rounded text-xs overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      {/* Permissions Map */}
      <div className="mb-6 p-4 bg-green-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-green-800">User Permissions</h3>
        <pre className="p-3 bg-white rounded text-xs overflow-auto">
          {JSON.stringify(permissions, null, 2)}
        </pre>
      </div>

      {/* Permission Tests */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Permission Tests</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {testPermissions.map(({ module, action }) => {
            const hasAccess = hasPermission(module, action);
            return (
              <div
                key={`${module}.${action}`}
                className={`p-3 rounded-lg border-2 ${
                  hasAccess 
                    ? 'bg-green-100 border-green-300 text-green-800' 
                    : 'bg-red-100 border-red-300 text-red-800'
                }`}
              >
                <div className="font-medium">{module}</div>
                <div className="text-sm">{action}</div>
                <div className="text-xs mt-1">
                  {hasAccess ? '✅ ALLOWED' : '❌ DENIED'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Raw Role Data */}
      {user?.role && (
        <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-yellow-800">Raw Role Data</h3>
          <pre className="p-3 bg-white rounded text-xs overflow-auto">
            {JSON.stringify(user.role, null, 2)}
          </pre>
        </div>
      )}

      {/* Test Actions */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => console.log('Current permissions:', permissions)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Log Permissions to Console
          </button>
          <button
            onClick={() => console.log('Auth user:', authUser)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Log Auth User to Console
          </button>
          <button
            onClick={() => {
              const sessionUser = sessionStorage.getItem('user');
              console.log('Session user:', sessionUser ? JSON.parse(sessionUser) : null);
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Log Session User to Console
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionTester;