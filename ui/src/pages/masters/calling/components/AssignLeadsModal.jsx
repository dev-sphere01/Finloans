import { useState } from 'react';
import { FaTimes, FaUserCheck } from 'react-icons/fa';

const AssignLeadsModal = ({ staff, selectedCount, onAssign, onClose }) => {
  const [selectedStaff, setSelectedStaff] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssign = async () => {
    if (!selectedStaff) {
      alert('Please select a staff member');
      return;
    }

    setIsAssigning(true);
    try {
      await onAssign(selectedStaff);
    } catch (error) {
      console.error('Error assigning leads:', error);
      alert('Error assigning leads. Please try again.');
    } finally {
      setIsAssigning(false);
    }
  };

  const selectedStaffMember = staff.find(member => member.id === selectedStaff);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Assign Leads</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Summary */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <FaUserCheck className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-900">
                Assigning {selectedCount} lead{selectedCount > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Staff Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Staff Member *
            </label>
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a staff member</option>
              {staff.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} - {member.role || 'Staff'}
                </option>
              ))}
            </select>
          </div>

          {/* Selected Staff Info */}
          {selectedStaffMember && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Selected Staff:</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Name:</span> {selectedStaffMember.name}</p>
                <p><span className="font-medium">Role:</span> {selectedStaffMember.role || 'Staff'}</p>
                {selectedStaffMember.email && (
                  <p><span className="font-medium">Email:</span> {selectedStaffMember.email}</p>
                )}
                {selectedStaffMember.currentLeads !== undefined && (
                  <p><span className="font-medium">Current Leads:</span> {selectedStaffMember.currentLeads}</p>
                )}
              </div>
            </div>
          )}

          {/* Confirmation Message */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Once assigned, the selected leads will be marked as "Assigned" 
              and will appear in the staff member's calling queue.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={!selectedStaff || isAssigning}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAssigning ? 'Assigning...' : `Assign ${selectedCount} Lead${selectedCount > 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignLeadsModal;