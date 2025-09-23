import React, { useState } from 'react';
import AllInsurances from './components/AllInsurances';
import AddInsurance from './components/AddInsurance';

const Insurance = () => {
  const [view, setView] = useState('table'); // 'table' or 'form'
  const [editingInsurance, setEditingInsurance] = useState(null);

  const handleAddClick = () => {
    setEditingInsurance(null);
    setView('form');
  };

  const handleEditClick = (insurance) => {
    setEditingInsurance(insurance);
    setView('form');
  };

  const handleSave = () => {
    setView('table');
    setEditingInsurance(null);
  };

  const handleCancel = () => {
    setView('table');
    setEditingInsurance(null);
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
              Add Insurance
            </button>
          </div>
          <AllInsurances onEditInsurance={handleEditClick} />
        </>
      ) : (
        <AddInsurance
          onSave={handleSave}
          onCancel={handleCancel}
          insurance={editingInsurance}
        />
      )}
    </div>
  );
};

export default Insurance;
