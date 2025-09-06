import React, { useState, useEffect } from 'react';
import getAllDepartments from '@/services/Departments/getAllDepartments';
import PositionService from '@/services/Positions/positions';
import DepartmentManager from '../components/DepartmentManager';

const Posting = ({ formData, handleInputChange, errors }) => {
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [loadingPositions, setLoadingPositions] = useState(false);
  const [showDepartmentManager, setShowDepartmentManager] = useState(false);

  // Fetch departments on component mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  // Fetch positions when department changes
  useEffect(() => {
    if (formData.department) {
      fetchPositions(formData.department);
    } else {
      setPositions([]);
    }
  }, [formData.department]);

  const fetchDepartments = async () => {
    setLoadingDepartments(true);
    try {
      const departmentData = await getAllDepartments();
      setDepartments(departmentData || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments([]);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const fetchPositions = async (departmentId) => {
    setLoadingPositions(true);
    try {
      const positionData = await PositionService.getPositionsByDepartment(departmentId);
      setPositions(positionData || []);
    } catch (error) {
      console.error('Error fetching positions:', error);
      setPositions([]);
    } finally {
      setLoadingPositions(false);
    }
  };

  const types = [
    { label: 'Fixed', id: 1 },
    { label: 'Hourly', id: 2 }
  ]

  const location = [
    { label: 'Tagore Town Office', id: 1 },
    { label: 'Naini Factory', id: 2 }
  ]
  // Get positions based on selected department
  const availablePositions = positions;

  // Handle department change - reset position when department changes
  const handleDepartmentChange = (e) => {
    handleInputChange(e);

    // Reset position when department changes
    if (formData.position) {
      const positionResetEvent = {
        target: {
          name: 'position',
          value: ''
        }
      };
      handleInputChange(positionResetEvent);
    }
  };

  const handleDepartmentCreated = (newDepartment) => {
    // Refresh departments list
    fetchDepartments();
    // Optionally select the newly created department
    const departmentSelectEvent = {
      target: {
        name: 'department',
        value: newDepartment.DeptID.toString()
      }
    };
    handleDepartmentChange(departmentSelectEvent);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Department Field */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Department <span className="text-red-500">*</span>
          </label>
          <select
            name="department"
            value={formData.department}
            onChange={handleDepartmentChange}
            disabled={loadingDepartments}
            className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 appearance-none bg-white ${loadingDepartments
              ? "bg-gray-100 cursor-not-allowed border-gray-200"
              : errors.department
                ? "border-red-300 bg-red-50"
                : "border-gray-300 hover:border-gray-400"
              }`}
          >
            <option value="">
              {loadingDepartments ? "Loading departments..." : "Select department"}
            </option>
            {departments.map((dept) => (
              <option key={dept.DeptID} value={dept.DeptID}>
                {dept.DeptName}
              </option>
            ))}
          </select>
          {errors.department && (
            <p className="text-sm text-red-600 flex items-center">
              <i className="fas fa-exclamation-circle mr-1"></i>
              {errors.department}
            </p>
          )}
        </div>

        {/* Position Field */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Position <span className="text-red-500">*</span>
          </label>
          <select
            name="position"
            value={formData.position}
            onChange={handleInputChange}
            disabled={!formData.department || loadingPositions}
            className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 appearance-none bg-white ${(!formData.department || loadingPositions)
              ? "bg-gray-100 cursor-not-allowed border-gray-200"
              : errors.position
                ? "border-red-300 bg-red-50"
                : "border-gray-300 hover:border-gray-400"
              }`}
          >
            <option value="">
              {!formData.department
                ? "Select department first"
                : loadingPositions
                  ? "Loading positions..."
                  : availablePositions.length === 0
                    ? "No positions available"
                    : "Select position"
              }
            </option>
            {availablePositions.map((position) => (
              <option key={position.PositionID} value={position.PositionID}>
                {position.PositionName}
              </option>
            ))}
          </select>
          {errors.position && (
            <p className="text-sm text-red-600 flex items-center">
              <i className="fas fa-exclamation-circle mr-1"></i>
              {errors.position}
            </p>
          )}
        </div>

        {/* Type Field */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Type <span className="text-red-500">*</span>
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 appearance-none bg-white ${
              errors.type
                ? "border-red-300 bg-red-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <option value="">Select type</option>
            {types.map((type) => (
              <option key={type.id} value={type.id}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.type && (
            <p className="text-sm text-red-600 flex items-center">
              <i className="fas fa-exclamation-circle mr-1"></i>
              {errors.type}
            </p>
          )}
        </div>

        {/* Location Field */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Location <span className="text-red-500">*</span>
          </label>
          <select
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 appearance-none bg-white ${
              errors.location
                ? "border-red-300 bg-red-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <option value="">Select location</option>
            {location.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.label}
              </option>
            ))}
          </select>
          {errors.location && (
            <p className="text-sm text-red-600 flex items-center">
              <i className="fas fa-exclamation-circle mr-1"></i>
              {errors.location}
            </p>
          )}
        </div>
      </div>

      {/* Department Manager Modal */}
      {showDepartmentManager && (
        <DepartmentManager
          onClose={() => setShowDepartmentManager(false)}
          onDepartmentCreated={handleDepartmentCreated}
        />
      )}
    </>
  );
};

export default Posting;