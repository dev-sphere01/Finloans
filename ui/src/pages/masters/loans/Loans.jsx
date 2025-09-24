import React, { useState } from 'react';
import AllLoans from './components/AllLoans';
import AddLoan from './components/AddLoan';

const Loans = () => {
  const [view, setView] = useState('table'); // 'table' or 'form'
  const [editingLoan, setEditingLoan] = useState(null);

  const handleAddClick = () => {
    setEditingLoan(null);
    setView('form');
  };

  const handleEditClick = (loan) => {
    setEditingLoan(loan);
    setView('form');
  };

  const handleSave = () => {
    setView('table');
    setEditingLoan(null);
  };

  const handleCancel = () => {
    setView('table');
    setEditingLoan(null);
  };

  return (
    <div className="p-6 bg-slate-50 h-full">
      {view === 'table' ? (
        <>
          <div className="flex justify-end mb-4">
            <button
              onClick={handleAddClick}
              className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-800 transition-colors duration-200 font-medium"
            >
              Add Loan
            </button>
          </div>
          <AllLoans onEditLoan={handleEditClick} />
        </>
      ) : (
        <AddLoan
          onSave={handleSave}
          onCancel={handleCancel}
          loan={editingLoan}
        />
      )}
    </div>
  );
};

export default Loans;
