import React, { useState, useEffect } from 'react';
import insuranceService from '@/services/insuranceService';
import notification from '@/services/NotificationService';

const EditInsurance = ({ onSave, onCancel, insurance }) => {
  const { success: notifySuccess, error: notifyError } = notification();
  const [form, setForm] = useState({
    insuranceName: '',
    insuranceType: '',
    insuranceImage: null,
    link: ''
  });

  useEffect(() => {
    if (insurance) {
      setForm({
        insuranceName: insurance.insuranceName,
        insuranceType: insurance.insuranceType,
        insuranceImage: null,
        link: insurance.link || ''
      });
    }
  }, [insurance]);

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
      await insuranceService.updateInsurance(insurance._id, form);
      notifySuccess('Insurance updated successfully!');
      onSave();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.error || 'Failed to update insurance';
      notifyError(errorMsg);
    }
  };

  return (
    <div className="p-6 bg-slate-50 h-full">
      <div className="bg-gray-100 border border-slate-200 shadow-lg rounded-lg p-8 w-full max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-slate-700 mb-6 text-center">
          Edit Insurance
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Insurance Name</label>
              <input
                type="text"
                name="insuranceName"
                value={form.insuranceName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Insurance Type</label>
              <input
                type="text"
                name="insuranceType"
                value={form.insuranceType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Insurance Image</label>
              <input
                type="file"
                name="insuranceImage"
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
              Update Insurance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditInsurance;
