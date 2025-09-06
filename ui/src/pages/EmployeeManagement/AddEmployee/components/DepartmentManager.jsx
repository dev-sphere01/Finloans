import React, { useState, useEffect } from 'react';
import DepartmentService from '@/services/Departments/createDepartments';
import getAllDepartments from '@/services/Departments/getAllDepartments';
import PositionService from '@/services/Positions/positions';

const DepartmentManager = ({ onClose, onDepartmentCreated }) => {
  const [activeTab, setActiveTab] = useState('department');
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [loading, setLoading] = useState(false);

  // Form states
  const [departmentForm, setDepartmentForm] = useState({
    name: ''
  });

  const [positionForm, setPositionForm] = useState({
    name: '',
    departmentId: '',
    reportsTo: []
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      fetchPositions(selectedDepartment);
    }
  }, [selectedDepartment]);

  const fetchDepartments = async () => {
    try {
      const data = await getAllDepartments();
      setDepartments(data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchPositions = async (departmentId) => {
    try {
      const data = await PositionService.getPositionsByDepartment(departmentId);
      setPositions(data || []);
    } catch (error) {
      console.error('Error fetching positions:', error);
    }
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    if (!departmentForm.name.trim()) return;

    setLoading(true);
    try {
      const newDepartment = await DepartmentService.createDepartment({
        DeptName: departmentForm.name.trim()
      });

      if (newDepartment) {
        setDepartmentForm({ name: '' });
        await fetchDepartments();
        onDepartmentCreated && onDepartmentCreated(newDepartment);
      }
    } catch (error) {
      console.error('Error creating department:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePosition = async (e) => {
    e.preventDefault();
    if (!positionForm.name.trim() || !positionForm.departmentId) return;

    setLoading(true);
    try {
      const newPosition = await DepartmentService.createPosition({
        DeptID: parseInt(positionForm.departmentId),
        PositionName: positionForm.name.trim(),
        ReportsTo: positionForm.reportsTo
      });

      if (newPosition) {
        setPositionForm({ name: '', departmentId: '', reportsTo: [] });
        if (selectedDepartment) {
          await fetchPositions(selectedDepartment);
        }
      }
    } catch (error) {
      console.error('Error creating position:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReportsToChange = (positionId, checked) => {
    setPositionForm(prev => ({
      ...prev,
      reportsTo: checked 
        ? [...prev.reportsTo, parseInt(positionId)]
        : prev.reportsTo.filter(id => id !== parseInt(positionId))
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Department & Position Management
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('department')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'department'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <i className="fas fa-building mr-2"></i>
            Create Department
          </button>
          <button
            onClick={() => setActiveTab('position')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'position'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <i className="fas fa-briefcase mr-2"></i>
            Create Position
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'department' && (
            <div className="space-y-6">
              {/* Create Department Form */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Create New Department
                </h3>
                <form onSubmit={handleCreateDepartment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={departmentForm.name}
                      onChange={(e) => setDepartmentForm({ name: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter department name"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !departmentForm.name.trim()}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Creating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-plus mr-2"></i>
                        Create Department
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Existing Departments */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Existing Departments ({departments.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {departments.map((dept) => (
                    <div
                      key={dept.DeptID}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-800">{dept.DeptName}</h4>
                          <p className="text-sm text-gray-500">ID: {dept.DeptID}</p>
                        </div>
                        <i className="fas fa-building text-gray-400"></i>
                      </div>
                    </div>
                  ))}
                </div>
                {departments.length === 0 && (
                  <p className="text-gray-500 text-center py-8">
                    No departments found. Create your first department above.
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'position' && (
            <div className="space-y-6">
              {/* Create Position Form */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Create New Position
                </h3>
                <form onSubmit={handleCreatePosition} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={positionForm.departmentId}
                        onChange={(e) => {
                          setPositionForm(prev => ({ ...prev, departmentId: e.target.value }));
                          setSelectedDepartment(e.target.value);
                        }}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                          <option key={dept.DeptID} value={dept.DeptID}>
                            {dept.DeptName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Position Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={positionForm.name}
                        onChange={(e) => setPositionForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter position name"
                        required
                      />
                    </div>
                  </div>

                  {/* Reports To Section */}
                  {positions.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reports To (Optional)
                      </label>
                      <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
                        {positions.map((position) => (
                          <label key={position.PositionID} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={positionForm.reportsTo.includes(position.PositionID)}
                              onChange={(e) => handleReportsToChange(position.PositionID, e.target.checked)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{position.PositionName}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !positionForm.name.trim() || !positionForm.departmentId}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Creating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-plus mr-2"></i>
                        Create Position
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Existing Positions */}
              {selectedDepartment && (
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Positions in {departments.find(d => d.DeptID == selectedDepartment)?.DeptName} ({positions.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {positions.map((position) => (
                      <div
                        key={position.PositionID}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-800">{position.PositionName}</h4>
                          <i className="fas fa-briefcase text-gray-400"></i>
                        </div>
                        <p className="text-sm text-gray-500 mb-1">ID: {position.PositionID}</p>
                        {position.ReportsTo && position.ReportsTo.length > 0 && (
                          <p className="text-sm text-gray-600">
                            Reports to: {position.ReportsTo.length} position(s)
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  {positions.length === 0 && (
                    <p className="text-gray-500 text-center py-8">
                      No positions found in this department. Create the first position above.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepartmentManager;
