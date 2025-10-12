import React from 'react';
import { ActionButton, PermissionGuard } from '@/components/permissions';

const TestActionButton = () => {
  const handleAction = (module, action) => {
    console.log(`${action.toUpperCase()} action on ${module}`);
    alert(`${action.toUpperCase()} action on ${module}`);
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-4">ActionButton Test</h2>
      
      {/* Test basic buttons */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-3">Basic Action Buttons</h3>
        <div className="flex flex-wrap gap-2">
          <ActionButton 
            module="users" 
            action="read" 
            onClick={() => handleAction('users', 'read')} 
          />
          <ActionButton 
            module="users" 
            action="create" 
            onClick={() => handleAction('users', 'create')} 
          />
          <ActionButton 
            module="users" 
            action="update" 
            onClick={() => handleAction('users', 'update')} 
          />
          <ActionButton 
            module="users" 
            action="delete" 
            onClick={() => handleAction('users', 'delete')} 
          />
          <ActionButton 
            module="users" 
            action="manage" 
            onClick={() => handleAction('users', 'manage')} 
          />
        </div>
      </div>

      {/* Test with custom labels */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-3">Custom Labels</h3>
        <div className="flex flex-wrap gap-2">
          <ActionButton 
            module="loans" 
            action="read" 
            label="View Loans"
            onClick={() => handleAction('loans', 'read')} 
          />
          <ActionButton 
            module="loans" 
            action="create" 
            label="Add New Loan"
            onClick={() => handleAction('loans', 'create')} 
          />
          <ActionButton 
            module="loans" 
            action="delete" 
            label="Remove Loan"
            onClick={() => handleAction('loans', 'delete')} 
          />
        </div>
      </div>

      {/* Test different sizes */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-3">Different Sizes</h3>
        <div className="flex flex-wrap gap-2 items-center">
          <ActionButton 
            module="applications" 
            action="read" 
            label="Small"
            size="sm"
            onClick={() => handleAction('applications', 'read')} 
          />
          <ActionButton 
            module="applications" 
            action="create" 
            label="Medium"
            size="md"
            onClick={() => handleAction('applications', 'create')} 
          />
          <ActionButton 
            module="applications" 
            action="update" 
            label="Large"
            size="lg"
            onClick={() => handleAction('applications', 'update')} 
          />
        </div>
      </div>

      {/* Test PermissionGuard */}
      <PermissionGuard module="insurance" showMessage>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">Insurance Management (Protected)</h3>
          <div className="flex flex-wrap gap-2">
            <ActionButton 
              module="insurance" 
              action="read" 
              onClick={() => handleAction('insurance', 'read')} 
            />
            <ActionButton 
              module="insurance" 
              action="create" 
              onClick={() => handleAction('insurance', 'create')} 
            />
            <ActionButton 
              module="insurance" 
              action="update" 
              onClick={() => handleAction('insurance', 'update')} 
            />
            <ActionButton 
              module="insurance" 
              action="delete" 
              onClick={() => handleAction('insurance', 'delete')} 
            />
          </div>
        </div>
      </PermissionGuard>
    </div>
  );
};

export default TestActionButton;