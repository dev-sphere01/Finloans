import React, { useState, useEffect } from 'react';
import loanService from '@/services/loanService';
import notification from '@/services/NotificationService';

const EditLoan = ({ onSave, onCancel, loan }) => {
  const { success: notifySuccess, error: notifyError } = notification();
  const [form, setForm] = useState({
    loanName: '',
    loanType: '',
    loanImage: null,
    link: ''
  });

  useEffect(() => {
    if (loan) {
      setForm({
        loanName: loan.loanName,
        loanType: loan.loanType,
        loanImage: null,
        link: loan.link || ''
      });
    }
  }, [loan]);

  const handleChange = e => {
    const { name, value, files } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await loanService.updateLoan(loan._id, form);
      notifySuccess('Loan updated successfully!');
      onSave();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.error || 'Failed to update loan';
      notifyError(errorMsg);
    }
  };

  return (
    <div className="p-6 bg-slate-50 h-full">
      <div className="bg-gray-100 border border-slate-200 shadow-lg rounded-lg p-8 w-full max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-slate-700 mb-6 text-center">
          Edit Loan
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Loan Name</label>
              <input
                type="text"
                name="loanName"
                value={form.loanName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Loan Type</label>
              <input
                type="text"
                name="loanType"
                value={form.loanType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Loan Image</label>
              <input
                type="file"
                name="loanImage"
                onChange={handleChange}
                accept="image/*"
                className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Application Link</label>
              <input
                type="text"
                name="link"
                value={form.link}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
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
