import React from 'react';

const DeleteConfirmationModal = ({ onConfirm, onCancel, userName }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Confirm Deletion</h2>
        <p>Are you sure you want to delete the user <strong>{userName}</strong>? This action cannot be undone.</p>
        <div className="flex justify-end mt-4">
          <button onClick={onCancel} className="bg-gray-500 text-white px-4 py-2 rounded mr-2">
            Cancel
          </button>
          <button onClick={onConfirm} className="bg-red-500 text-white px-4 py-2 rounded">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
