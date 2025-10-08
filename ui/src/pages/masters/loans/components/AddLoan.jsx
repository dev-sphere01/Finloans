import React, { useState } from 'react';
import loanService from '@/services/loanService';
import notification from '@/services/NotificationService';

const AddLoan = ({ onSave, onCancel }) => {
  const { success: notifySuccess, error: notifyError } = notification();
  const [form, setForm] = useState({
    loanType: '',
    subType: '',
    links: [''],
    requiredDocuments: [{ name: '', isRequired: true, description: '' }]
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDocumentChange = (index, field, value) => {
    const newDocuments = [...form.requiredDocuments];
    newDocuments[index] = {
      ...newDocuments[index],
      [field]: field === 'isRequired' ? value === 'true' : value
    };
    setForm(prev => ({
      ...prev,
      requiredDocuments: newDocuments
    }));
  };

  const addDocument = () => {
    setForm(prev => ({
      ...prev,
      requiredDocuments: [
        ...prev.requiredDocuments,
        { name: '', isRequired: true, description: '' }
      ]
    }));
  };

  const removeDocument = (index) => {
    if (form.requiredDocuments.length > 1) {
      const newDocuments = form.requiredDocuments.filter((_, i) => i !== index);
      setForm(prev => ({
        ...prev,
        requiredDocuments: newDocuments
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
    const filteredLinks = form.links.filter(link => link.trim() !== "");
    const filteredDocuments = form.requiredDocuments.filter(doc => doc.name.trim() !== "");
    
    const submitData = {
      ...form,
      links: filteredLinks,
      requiredDocuments: filteredDocuments
    };

    try {
      console.log('Submitting loan data:', submitData); // Debug log
      await loanService.createLoan(submitData);
      notifySuccess('Loan created successfully!');
      onSave();
    } catch (error) {
      console.error('Create loan error:', error); // Debug log
      const errorMsg = error.response?.data?.message || error.error || 'Failed to create loan';
      notifyError(errorMsg);
    }
  };

  return (
    <div className="mx-auto p-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Compact Header */}
        <div className="bg-blue-600 px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-medium text-white">Add Loan Product</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1 text-xs bg-white/20 text-white rounded hover:bg-white/30 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          {/* Basic Info - Compact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loan Type <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="loanType"
                value={form.loanType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Personal Loan, Home Loan, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sub Type</label>
              <input
                type="text"
                name="subType"
                value={form.subType}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Secured, Unsecured, etc."
              />
            </div>
          </div>

          {/* Links - Compact */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Application Links</label>
              <button
                type="button"
                onClick={addLinkField}
                className="text-xs px-2 py-1 text-blue-600 bg-blue-50 rounded hover:bg-blue-100"
              >
                + Add
              </button>
            </div>
            
            <div className="space-y-2">
              {form.links.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-6">{index + 1}.</span>
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => handleLinkChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/loan-application"
                  />
                  {form.links.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLinkField(index)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                      title="Remove"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Documents - Ultra Compact */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Required Documents</label>
              <button
                type="button"
                onClick={addDocument}
                className="text-xs px-2 py-1 text-green-600 bg-green-50 rounded hover:bg-green-100"
              >
                + Add
              </button>
            </div>
            
            <div className="space-y-2">
              {form.requiredDocuments.map((doc, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <span className="text-xs text-gray-500 w-6">{index + 1}.</span>
                  
                  <input
                    type="text"
                    value={doc.name}
                    onChange={(e) => handleDocumentChange(index, 'name', e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    placeholder="Document name"
                  />
                  
                  <input
                    type="text"
                    value={doc.description}
                    onChange={(e) => handleDocumentChange(index, 'description', e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    placeholder="Description (optional)"
                  />
                  
                  <select
                    value={doc.isRequired.toString()}
                    onChange={(e) => handleDocumentChange(index, 'isRequired', e.target.value)}
                    className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="true">Required</option>
                    <option value="false">Optional</option>
                  </select>
                  
                  {form.requiredDocuments.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                      title="Remove"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Compact Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              Create Loan Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLoan;
