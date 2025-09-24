import React, { useState } from 'react';
import AllCreditCards from './components/AllCreditCards';
import AddCreditCard from './components/AddCreditCard';
import EditCreditCard from './components/EditCreditCard';

const CreditCards = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [editingCreditCard, setEditingCreditCard] = useState(null);

  const tabs = [
    { id: 'all', label: 'All Credit Cards', icon: '💳' },
    { id: 'add', label: 'Add Credit Card', icon: '➕' },
  ];

  const handleEditCreditCard = (creditCard) => {
    setEditingCreditCard(creditCard);
    setActiveTab('edit');
  };

  const handleCloseEdit = () => {
    setEditingCreditCard(null);
    setActiveTab('all');
  };

  const handleCreditCardCreated = () => {
    setActiveTab('all');
  };

  const handleCreditCardUpdated = () => {
    setEditingCreditCard(null);
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
          {editingCreditCard && (
            <button
              onClick={() => setActiveTab('edit')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'edit'
                  ? `border-blue-500 text-blue-600`
                  : `border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300`
              }`}
            >
              <span className="mr-2">✏️</span>
              Edit Credit Card
            </button>
          )}
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'all' && (
          <AllCreditCards
            onEditCreditCard={handleEditCreditCard}
            onViewCreditCard={handleEditCreditCard} // Use edit handler for view for now
          />
        )}
        {activeTab === 'add' && (
          <AddCreditCard onSave={handleCreditCardCreated} onCancel={handleCloseEdit} />
        )}
        {activeTab === 'edit' && editingCreditCard && (
          <EditCreditCard
            creditCard={editingCreditCard}
            onSave={handleCreditCardUpdated}
            onCancel={handleCloseEdit}
          />
        )}
      </div>
    </div>
  );
};

export default CreditCards;
