import React, { useState } from 'react';
import AllLoans from './components/AllLoans';
import AddLoan from './components/AddLoan';
import EditLoan from './components/EditLoan';

const Loans = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [editingLoan, setEditingLoan] = useState(null);

  const tabs = [
    { id: 'all', label: 'All Loans', icon: '💰' },
    { id: 'add', label: 'Add Loan', icon: '➕' },
  ];

  const handleEditLoan = (loan) => {
    setEditingLoan(loan);
    setActiveTab('edit');
  };

  const handleCloseEdit = () => {
    setEditingLoan(null);
    setActiveTab('all');
  };

  const handleLoanCreated = () => {
    setActiveTab('all');
  };

  const handleLoanUpdated = () => {
    setEditingLoan(null);
    setActiveTab('all');
  };

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === tab.id
                  ? `border-blue-500 text-blue-600`
                  : `border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300`
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
          {editingLoan && (
            <button
              onClick={() => setActiveTab('edit')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'edit'
                  ? `border-blue-500 text-blue-600`
                  : `border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300`
              }`}
            >
              <span className="mr-2">✏️</span>
              Edit Loan
            </button>
          )}
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'all' && (
          <AllLoans
            onEditLoan={handleEditLoan}
            onViewLoan={handleEditLoan} // Use edit handler for view for now
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
    </div>
  );
};

export default Loans;
