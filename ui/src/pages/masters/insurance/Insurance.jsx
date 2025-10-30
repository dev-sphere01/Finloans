import React, { useState } from 'react';
import AllInsurances from './components/AllInsurances';
import AddInsurance from './components/AddInsurance';
import EditInsurance from './components/EditInsurance';
import { ActionButton, PermissionGuard } from '@/components/permissions';

const Insurance = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [editingInsurance, setEditingInsurance] = useState(null);

  const tabs = [
    { id: 'all', label: 'All Insurances', icon: '🛡️' },
    { id: 'add', label: 'Add Insurance', icon: '➕' },
  ];

  const handleEditInsurance = (insurance) => {
    setEditingInsurance(insurance);
    setActiveTab('edit');
  };

  const handleCloseEdit = () => {
    setEditingInsurance(null);
    setActiveTab('all');
  };

  const handleInsuranceCreated = () => {
    setActiveTab('all');
  };

  const handleInsuranceUpdated = () => {
    setEditingInsurance(null);
    setActiveTab('all');
  };

  return (
    <PermissionGuard module="insurance" showMessage>
      <div className="space-y-6">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between p-4">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('all')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'all'
                    ? `border-blue-500 text-blue-600`
                    : `border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300`
                }`}
              >
                <span className="mr-2">🛡️</span>
                All Insurances
              </button>
              {editingInsurance && (
                <button
                  onClick={() => setActiveTab('edit')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === 'edit'
                      ? `border-blue-500 text-blue-600`
                      : `border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300`
                  }`}
                >
                  <span className="mr-2">✏️</span>
                  Edit Insurance
                </button>
              )}
            </nav>
            
            <div className="flex items-center gap-2">
              <ActionButton
                module="insurance"
                action="create"
                label="Add Insurance"
                onClick={() => setActiveTab('add')}
                className={activeTab === 'add' ? 'bg-green-600' : ''}
              />
            </div>
          </div>
        </div>

      <div className="mt-6">
        {activeTab === 'all' && (
          <AllInsurances
            onEditInsurance={handleEditInsurance}
            onViewInsurance={handleEditInsurance} // Use edit handler for view for now
          />
        )}
        {activeTab === 'add' && (
          <AddInsurance onSave={handleInsuranceCreated} onCancel={handleCloseEdit} />
        )}
        {activeTab === 'edit' && editingInsurance && (
          <EditInsurance
            insurance={editingInsurance}
            onSave={handleInsuranceUpdated}
            onCancel={handleCloseEdit}
          />
        )}
      </div>
      </div>
    </PermissionGuard>
  );
};

export default Insurance;
