import React, { useState } from 'react';
import AllLoans from './components/AllLoans';
import AddLoan from './components/AddLoan';
import EditLoan from './components/EditLoan';
import ViewLoan from './components/ViewLoan';
import { ActionButton, PermissionGuard } from '@/components/permissions';

const Loans = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [editingLoan, setEditingLoan] = useState(null);
  const [viewingLoan, setViewingLoan] = useState(null);

  const tabs = [
    { id: 'all', label: 'All Loans', icon: '💰' },
    { id: 'add', label: 'Add Loan', icon: '➕' },
  ];

  const handleEditLoan = (loan) => {
    setEditingLoan(loan);
    setViewingLoan(null);
    setActiveTab('edit');
  };

  const handleViewLoan = (loan) => {
    setViewingLoan(loan);
    setEditingLoan(null);
  };

  const handleCloseEdit = () => {
    setEditingLoan(null);
    setActiveTab('all');
  };

  const handleCloseView = () => {
    setViewingLoan(null);
  };

  const handleLoanCreated = () => {
    setActiveTab('all');
  };

  const handleLoanUpdated = () => {
    setEditingLoan(null);
    setActiveTab('all');
  };

  return (
    <PermissionGuard module="loans" showMessage>
      <div className="space-y-6">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between p-4">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('all')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'all'
                    ? `border-blue-500 text-blue-600`
                    : `border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300`
                  }`}
              >
                <span className="mr-2">💰</span>
                All Loans
              </button>
              {editingLoan && (
                <button
                  onClick={() => setActiveTab('edit')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'edit'
                      ? `border-blue-500 text-blue-600`
                      : `border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300`
                    }`}
                >
                  <span className="mr-2">✏️</span>
                  Edit Loan
                </button>
              )}
            </nav>
            
            <div className="flex items-center gap-2">
              <ActionButton
                module="loans"
                action="create"
                label="Add Loan"
                onClick={() => setActiveTab('add')}
                className={activeTab === 'add' ? 'bg-green-600' : ''}
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          {activeTab === 'all' && (
            <AllLoans
              onEditLoan={handleEditLoan}
              onViewLoan={handleViewLoan}
            />
          )}
          {activeTab === 'add' && (
            <AddLoan onSave={handleLoanCreated} onCancel={handleCloseEdit} />
          )}
          {activeTab === 'edit' && editingLoan && (
            <EditLoan
              loan={editingLoan}
              onSave={handleLoanUpdated}
              onCancel={handleCloseEdit}
            />
          )}
        </div>

        {/* View Loan Modal */}
        {viewingLoan && (
          <ViewLoan
            loan={viewingLoan}
            onClose={handleCloseView}
          />
        )}
      </div>
    </PermissionGuard>
  );
};

export default Loans;
