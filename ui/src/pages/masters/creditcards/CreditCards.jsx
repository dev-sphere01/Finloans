import React, { useState } from 'react';
import AllCreditCards from './components/AllCreditCards';
import AddCreditCard from './components/AddCreditCard';
import EditCreditCard from './components/EditCreditCard';
import { ActionButton, PermissionGuard } from '@/components/permissions';

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
    <PermissionGuard module="credit-cards" showMessage>
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
                <span className="mr-2">💳</span>
                All Credit Cards
              </button>
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
            
            <div className="flex items-center gap-2">
              <ActionButton
                module="credit-cards"
                action="create"
                label="Add Credit Card"
                onClick={() => setActiveTab('add')}
                className={activeTab === 'add' ? 'bg-green-600' : ''}
              />
            </div>
          </div>
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
    </PermissionGuard>
  );
};

export default CreditCards;
