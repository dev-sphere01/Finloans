import React, { useState, useEffect } from 'react';
import loanService from '@/services/loanService';
import notification from '@/services/NotificationService';

const EditLoan = ({ onSave, onCancel, loan }) => {
  const { success: notifySuccess, error: notifyError } = notification();
  const [form, setForm] = useState({
    loanType: '',
    subType: '',
    links: [''],
    requiredDocuments: [{ name: '', isRequired: true, description: '' }]
  });

  useEffect(() => {
    if (loan) {
      setForm({
        loanType: loan.loanType || '',
        subType: loan.subType || '',
        links: loan.links && loan.links.length > 0 ? loan.links : [''],
        requiredDocuments: loan.requiredDocuments && loan.requiredDocuments.length > 0 
          ? loan.requiredDocuments 
          : [{ name: '', isRequired: true, description: '' }]
      });
    }
  }, [loan]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
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
      console.log('Updating loan data:', submitData); // Debug log
      console.log('Loan ID:', loan._id); // Debug log
      await loanService.updateLoan(loan._id, submitData);
      notifySuccess('Loan updated successfully!');
      onSave();
    } catch (error) {
      console.error('Update loan error:', error); // Debug log
      const errorMsg = error.response?.data?.message || error.error || 'Failed to update loan';
      notifyError(errorMsg);
    }
  };

  return (
    <div className=" mx-auto p-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Compact Header */}
        <div className="bg-gray-600 px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-medium text-white">Edit Loan Product</h2>
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
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
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
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Secured, Unsecured, etc."
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-slate-600">Loan Application Links</label>
              <button
                type="button"
                onClick={addLinkField}
                className="px-4 py-1 text-sm bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors duration-200"
              >
                + Add Link
              </button>
            </div>
            
            <div className="space-y-3">
              {form.links.map((link, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <div className="md:col-span-1">
                    <span className="text-sm text-slate-500 font-medium">#{index + 1}</span>
                  </div>
                  <div className="md:col-span-10">
                    <input
                      type="url"
                      value={link}
                      onChange={(e) => handleLinkChange(index, e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                      placeholder="https://example.com/loan-application"
                    />
                  </div>
                  <div className="md:col-span-1">
                    {form.links.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLinkField(index)}
                        className="w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200 border border-red-200"
                        title="Remove link"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">Add relevant loan application URLs, bank portals, or reference documents</p>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-slate-600">Required Documents</label>
              <button
                type="button"
                onClick={addDocument}
                className="px-4 py-1 text-sm bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors duration-200"
              >
                + Add Document
              </button>
            </div>
            
            <div className="space-y-4">
              {form.requiredDocuments.map((doc, index) => (
                <div key={index} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                    <div className="md:col-span-1">
                      <span className="text-sm text-slate-500 font-medium">#{index + 1}</span>
                    </div>
                    
                    <div className="md:col-span-5">
                      <label className="block text-xs text-slate-500 mb-1">Document Name</label>
                      <input
                        type="text"
                        value={doc.name}
                        onChange={(e) => handleDocumentChange(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                        placeholder="e.g. PAN Card, Salary Slip, Bank Statement"
                      />
                    </div>
                    
                    <div className="md:col-span-4">
                      <label className="block text-xs text-slate-500 mb-1">Description (Optional)</label>
                      <input
                        type="text"
                        value={doc.description}
                        onChange={(e) => handleDocumentChange(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                        placeholder="Additional details or format requirements"
                      />
                    </div>
                    
                    <div className="md:col-span-1">
                      <label className="block text-xs text-slate-500 mb-1">Required</label>
                      <select
                        value={doc.isRequired.toString()}
                        onChange={(e) => handleDocumentChange(index, 'isRequired', e.target.value)}
                        className="w-full px-2 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                      >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>
                    
                    <div className="md:col-span-1">
                      <label className="block text-xs text-slate-500 mb-1">Action</label>
                      {form.requiredDocuments.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDocument(index)}
                          className="w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200 border border-red-200"
                          title="Remove document"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">Define what documents applicants need to provide for this loan type</p>
          </div>

          <div className="flex justify-center gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-8 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-800 transition-colors duration-200 font-medium"
            >
              Update Loan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLoan;
