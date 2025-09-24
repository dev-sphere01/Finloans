import React, { useState } from 'react';
import AllCreditCards from './components/AllCreditCards';
import AddCreditCard from './components/AddCreditCard';

const CreditCards = () => {
  const [view, setView] = useState('table'); // 'table' or 'form'
  const [editingCard, setEditingCard] = useState(null);

  const handleAddClick = () => {
    setEditingCard(null);
    setView('form');
  };

  const handleEditClick = (creditCard) => {
    setEditingCard(creditCard);
    setView('form');
  };

  const handleSave = () => {
    setView('table');
    setEditingCard(null);
  };

  const handleCancel = () => {
    setView('table');
    setEditingCard(null);
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
              Add Credit Card
            </button>
          </div>
          <AllCreditCards onEditCreditCard={handleEditClick} />
        </>
      ) : (
        <AddCreditCard
          onSave={handleSave}
          onCancel={handleCancel}
          creditCard={editingCard}
        />
      )}
    </div>
  );
};

export default CreditCards;
