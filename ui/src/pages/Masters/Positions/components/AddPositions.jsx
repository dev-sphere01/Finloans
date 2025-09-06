import React, { useEffect, useState } from 'react';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';
import { getAllDepartments } from '@/services/Departments';
import PositionService from '@/services/Positions/positions';
import API from '@/services/API';
import notification from '@/services/NotificationService';

const AddPosition = () => {
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [filteredPositions, setFilteredPositions] = useState([]);

  const [deptID, setDeptID] = useState('');
  const [positionName, setPositionName] = useState('');
  const [reportsTo, setReportsTo] = useState([]);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const deptData = await getAllDepartments();
        setDepartments(deptData);

        const posData = await PositionService.getAllPositions();
        setPositions(posData);
      } catch (error) {
        notification().error('Failed to load initial data.');
      }
    };
    fetchInitialData();
  }, []);

  // Filter positions by selected department
  useEffect(() => {
    if (deptID) {
      const filtered = positions.filter(pos => pos.DeptID === parseInt(deptID));
      setFilteredPositions(filtered);
    } else {
      setFilteredPositions([]);
    }
    setReportsTo([]);
  }, [deptID, positions]);

  const validateForm = () => {
    const newErrors = {};

    if (!deptID) newErrors.deptID = 'Department is required';
    if (!positionName.trim()) {
      newErrors.positionName = 'Position name is required';
    } else if (positionName.trim().length < 2) {
      newErrors.positionName = 'Must be at least 2 characters';
    } else if (positionName.trim().length > 50) {
      newErrors.positionName = 'Must not exceed 50 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      notification().error('Please fix form errors before submitting.');
      return;
    }

    const payload = {
      DeptID: parseInt(deptID),
      PositionName: positionName.trim(),
      ReportsTo: reportsTo.map(id => parseInt(id)),
    };

    try {
      setIsSubmitting(true);
      notification().loading('Creating position...');

      const res = await API.post('/Positions', payload);

      notification().success(`Position "${positionName}" added successfully!`);
      setDeptID('');
      setPositionName('');
      setReportsTo([]);
      setErrors({});
    } catch (err) {
      notification().error(err.message || 'Failed to create position');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add Position</h1>
          <p className="text-gray-600 text-sm sm:text-base">Create a new position under a department</p>
        </div>
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          Back to Positions
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="text-blue-600" size={20} />
          <h2 className="text-lg font-semibold text-gray-900">Position Information</h2>
        </div>

        <div className="grid grid-cols-2 gap-2 flex align-center">
          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department <span className="text-red-500">*</span>
            </label>
            <select
              value={deptID}
              onChange={(e) => setDeptID(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.deptID ? 'border-red-300' : 'border-gray-300'}`}
              disabled={isSubmitting}
            >
              <option value="">Select a department</option>
              {departments.map(dept => (
                <option key={dept.DeptID} value={dept.DeptID}>{dept.DeptName}</option>
              ))}
            </select>
            {errors.deptID && <p className="mt-1 text-sm text-red-600">{errors.deptID}</p>}
          </div>

          {/* Position Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Position Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={positionName}
              onChange={(e) => setPositionName(e.target.value)}
              placeholder="e.g., Manager, Analyst"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.positionName ? 'border-red-300' : 'border-gray-300'}`}
              disabled={isSubmitting}
            />
            {errors.positionName && <p className="mt-1 text-sm text-red-600">{errors.positionName}</p>}
          </div>
        </div>
        
        {/* Reports To */}
        {deptID && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reports To (Optional)
            </label>

            {/* Selected badges */}
            {reportsTo.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {reportsTo.map((id) => {
                  const selected = filteredPositions.find(p => p.PositionID === parseInt(id));
                  return (
                    <span
                      key={id}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {selected?.PositionName || `Position ${id}`}
                      <button
                        type="button"
                        onClick={() =>
                          setReportsTo(reportsTo.filter(r => r !== id))
                        }
                        className="ml-1 text-blue-500 hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            {/* Dropdown */}
            <input
              type="text"
              placeholder="Search positions..."
              onChange={(e) => {
                const search = e.target.value.toLowerCase();
                const filtered = positions.filter(
                  (p) =>
                    p.DeptID === parseInt(deptID) &&
                    p.PositionName.toLowerCase().includes(search)
                );
                setFilteredPositions(filtered);
              }}
              className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />

            <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg">
              {filteredPositions.length === 0 ? (
                <p className="text-sm text-gray-500 p-2">No matches found</p>
              ) : (
                filteredPositions.map((pos) => (
                  <div
                    key={pos.PositionID}
                    onClick={() => {
                      if (!reportsTo.includes(String(pos.PositionID))) {
                        setReportsTo([...reportsTo, String(pos.PositionID)]);
                      }
                    }}
                    className={`cursor-pointer px-3 py-2 hover:bg-blue-100 ${reportsTo.includes(String(pos.PositionID))
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700'
                      }`}
                  >
                    {pos.PositionName}
                  </div>
                ))
              )}
            </div>
          </div>
        )}


        {/* Footer Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t">
          <button
            onClick={() => window.history.back()}
            type="button"
            className="w-full sm:w-auto px-4 py-2 text-center text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !positionName.trim()}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${isSubmitting || !positionName.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Adding...
              </>
            ) : (
              <>
                <Save size={16} />
                Add Position
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPosition;
