import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Info } from 'lucide-react';
import insuranceService from '@/services/insuranceService';
import notification from '@/services/NotificationService';

const EditInsurance = ({ onSave, onCancel, insurance }) => {
  const { success: notifySuccess, error: notifyError } = notification();
  const [form, setForm] = useState({
    insuranceType: '',
    description: '',
    subTypes: [{ name: '', description: '', isActive: true }],
    isActive: true,
    links: [''],
    icon: '',
    color: '',
    displayOrder: 0
  });

  useEffect(() => {
    if (insurance) {
      setForm({
        insuranceType: insurance.insuranceType || '',
        description: insurance.description || '',
        subTypes: insurance.subTypes && insurance.subTypes.length > 0 
          ? insurance.subTypes 
          : [{ name: '', description: '', isActive: true }],
        isActive: insurance.isActive !== undefined ? insurance.isActive : true,
        links: insurance.links && insurance.links.length > 0 ? insurance.links : [''],
        icon: insurance.icon || '',
        color: insurance.color || '',
        displayOrder: insurance.displayOrder || 0
      });
    }
  }, [insurance]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'displayOrder' ? parseInt(value) || 0 : value)
    }));
  };

  const handleSubTypeChange = (index, field, value) => {
    const newSubTypes = [...form.subTypes];
    newSubTypes[index] = {
      ...newSubTypes[index],
      [field]: field === 'isActive' ? value : value
    };
    setForm(prev => ({
      ...prev,
      subTypes: newSubTypes
    }));
  };

  const addSubType = () => {
    setForm(prev => ({
      ...prev,
      subTypes: [...prev.subTypes, { name: '', description: '', isActive: true }]
    }));
  };

  const removeSubType = (index) => {
    if (form.subTypes.length > 1) {
      const newSubTypes = form.subTypes.filter((_, i) => i !== index);
      setForm(prev => ({
        ...prev,
        subTypes: newSubTypes
      }));
    }
  };

  const handleLinkChange = (index, value) => {
    const newLinks = [...form.links];
    newLinks[index] = value;
    setForm(prev => ({
      ...prev,
      links: newLinks
    }));
  };

  const addLinkField = () => {
    setForm(prev => ({
      ...prev,
      links: [...prev.links, ""]
    }));
  };

  const removeLinkField = (index) => {
    if (form.links.length > 1) {
      const newLinks = form.links.filter((_, i) => i !== index);
      setForm(prev => ({
        ...prev,
        links: newLinks
      }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    // Validate form
    if (!form.insuranceType.trim()) {
      notifyError('Insurance type is required');
      return;
    }

    if (form.subTypes.some(st => !st.name.trim())) {
      notifyError('All subtype names are required');
      return;
    }

    const filteredLinks = form.links.filter(link => link.trim() !== "");
    const filteredSubTypes = form.subTypes.filter(st => st.name.trim() !== "");
    
    const submitData = {
      ...form,
      links: filteredLinks,
      subTypes: filteredSubTypes
    };

    try {
      await insuranceService.updateInsurance(insurance._id, submitData);
      notifySuccess('Insurance type updated successfully!');
      onSave();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.error || 'Failed to update insurance type';
      notifyError(errorMsg);
    }
  };

  return (
    <div className="p-4 bg-slate-50 h-full">
      <div className="bg-white border border-slate-200 shadow-lg rounded-lg p-6 w-full max-w-5xl mx-auto">
        <h2 className="text-xl font-semibold text-slate-700 mb-4 text-center">
          Edit Insurance Type
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-base font-medium text-gray-900 mb-3">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Insurance Type <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="insuranceType"
                  value={form.insuranceType}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="e.g. Health Insurance"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Display Order</label>
                <input
                  type="number"
                  name="displayOrder"
                  value={form.displayOrder}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="0"
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Active
                </label>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-600 mb-1">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Brief description of this insurance type"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Icon</label>
                <select
                  name="icon"
                  value={form.icon}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Select Icon</option>
                  <option value="heart">Heart (Life)</option>
                  <option value="shield">Shield (Health)</option>
                  <option value="car">Car (Vehicle)</option>
                  <option value="home">Home (Property)</option>
                  <option value="plane">Plane (Travel)</option>
                  <option value="briefcase">Briefcase (Business)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Color Theme</label>
                <select
                  name="color"
                  value={form.color}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Select Color</option>
                  <option value="from-red-500 to-pink-500">Red to Pink</option>
                  <option value="from-green-500 to-emerald-500">Green to Emerald</option>
                  <option value="from-blue-500 to-cyan-500">Blue to Cyan</option>
                  <option value="from-purple-500 to-indigo-500">Purple to Indigo</option>
                  <option value="from-orange-500 to-red-500">Orange to Red</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sub Types Section */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-600">
                  Insurance Sub Types <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-slate-500 mt-1">Define specific categories under this insurance type</p>
              </div>
              <button
                type="button"
                onClick={addSubType}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                <Plus size={16} />
                Add Sub Type
              </button>
            </div>
            
            <div className="space-y-4">
              {form.subTypes.map((subType, index) => (
                <div key={index} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-slate-700">Sub Type #{index + 1}</h4>
                    {form.subTypes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSubType(index)}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                        title="Remove sub type"
                      >
                        <Trash2 size={14} />
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={subType.name}
                        onChange={(e) => handleSubTypeChange(index, 'name', e.target.value)}
                        required
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="e.g. individual, family, term, whole"
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <label className="flex items-center gap-2 text-sm text-slate-600">
                        <input
                          type="checkbox"
                          checked={subType.isActive}
                          onChange={(e) => handleSubTypeChange(index, 'isActive', e.target.checked)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        Active
                      </label>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                    <textarea
                      value={subType.description}
                      onChange={(e) => handleSubTypeChange(index, 'description', e.target.value)}
                      rows="2"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="Brief description of this sub type"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Links Section */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-slate-600">Reference Links</label>
              <button
                type="button"
                onClick={addLinkField}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors duration-200"
              >
                <Plus size={16} />
                Add Link
              </button>
            </div>
            
            <div className="space-y-3">
              {form.links.map((link, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <div className="flex-1">
                    <input
                      type="url"
                      value={link}
                      onChange={(e) => handleLinkChange(index, e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="https://example.com/insurance-policy"
                    />
                  </div>
                  {form.links.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLinkField(index)}
                      className="flex items-center justify-center w-10 h-10 text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200 border border-red-200"
                      title="Remove link"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
              <Info size={12} />
              Add relevant insurance policy links, application URLs, or reference documents
            </p>
          </div>

          {/* Status */}
          <div className="border-t pt-6">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Active (Insurance type will be available for applications)
            </label>
          </div>

          {/* Sub Types Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-medium text-gray-900">Sub Types</h3>
                <p className="text-xs text-slate-500">Define categories under this insurance type</p>
              </div>
              <button
                type="button"
                onClick={addSubType}
                className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus size={14} />
                Add
              </button>
            </div>
            
            <div className="space-y-3">
              {form.subTypes.map((subType, index) => (
                <div key={index} className="bg-white p-3 rounded border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-700">#{index + 1}</span>
                    {form.subTypes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSubType(index)}
                        className="text-red-600 hover:bg-red-50 p-1 rounded"
                        title="Remove"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={subType.name}
                        onChange={(e) => handleSubTypeChange(index, 'name', e.target.value)}
                        required
                        className="w-full px-2 py-1 text-sm border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                        placeholder="e.g. individual, term"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                      <input
                        type="text"
                        value={subType.description}
                        onChange={(e) => handleSubTypeChange(index, 'description', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                        placeholder="Brief description"
                      />
                    </div>

                    <div className="flex items-end">
                      <label className="flex items-center gap-2 text-xs text-slate-600">
                        <input
                          type="checkbox"
                          checked={subType.isActive}
                          onChange={(e) => handleSubTypeChange(index, 'isActive', e.target.checked)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        Active
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Links Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-medium text-gray-900">Reference Links</h3>
                <p className="text-xs text-slate-500">Add policy links or reference documents</p>
              </div>
              <button
                type="button"
                onClick={addLinkField}
                className="flex items-center gap-1 px-3 py-1 text-xs bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors"
              >
                <Plus size={14} />
                Add
              </button>
            </div>
            
            <div className="space-y-2">
              {form.links.map((link, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <div className="flex-shrink-0 text-xs text-slate-500 font-medium w-6">
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <input
                      type="url"
                      value={link}
                      onChange={(e) => handleLinkChange(index, e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-slate-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                      placeholder="https://example.com/policy"
                    />
                  </div>
                  {form.links.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLinkField(index)}
                      className="text-red-600 hover:bg-red-50 p-1 rounded"
                      title="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Update Insurance Type
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditInsurance;
