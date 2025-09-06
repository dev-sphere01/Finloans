import React from 'react';

const BankDetails = ({ formData, handleInputChange, errors }) => {

  const banks = [
    { id: 1, name: 'Union Bank of India' },
    { id: 2, name: 'Indian Bank' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          Bank Name <span className="text-red-500">*</span>
        </label>
        <select
          name="bankName"
          value={formData.bankName}
          onChange={handleInputChange}
          className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ${errors.bankName ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"}`}
        >
          <option value="">Select bank</option>
          {banks.map((b) => (
            <option key={b.id} value={b.name}>{b.name}</option>
          ))}
        </select>
        {errors.bankName && (
          <p className="text-sm text-red-600 flex items-center">
            <i className="fas fa-exclamation-circle mr-1"></i>
            {errors.bankName}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          Account Number <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="accountNumber"
          value={formData.accountNumber}
          onChange={handleInputChange}
          className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ${errors.accountNumber ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"}`}
          placeholder="Enter account number"
        />
        {errors.accountNumber && (
          <p className="text-sm text-red-600 flex items-center">
            <i className="fas fa-exclamation-circle mr-1"></i>
            {errors.accountNumber}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          IFSC Code <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="ifscCode"
          value={formData.ifscCode}
          onChange={handleInputChange}
          className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ${errors.ifscCode ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"}`}
          placeholder="Enter IFSC code"
        />
        {errors.ifscCode && (
          <p className="text-sm text-red-600 flex items-center">
            <i className="fas fa-exclamation-circle mr-1"></i>
            {errors.ifscCode}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          Branch Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="branchName"
          value={formData.branchName}
          onChange={handleInputChange}
          className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ${errors.branchName ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"}`}
          placeholder="Enter branch name"
        />
        {errors.branchName && (
          <p className="text-sm text-red-600 flex items-center">
            <i className="fas fa-exclamation-circle mr-1"></i>
            {errors.branchName}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          Cancelled Cheque <span className="text-red-500">*</span>
        </label>
        <input
          type="file"
          name="cancelledCheque"
          onChange={handleInputChange}
          accept="image/*,.pdf"
          className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ${errors.cancelledCheque ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-gray-400"}`}
        />
        {formData.cancelledCheque && formData.cancelledCheque instanceof File && (
          <p className="text-sm text-green-600 flex items-center">
            <i className="fas fa-check-circle mr-1"></i>
            Selected: {formData.cancelledCheque.name}
          </p>
        )}
        {errors.cancelledCheque && (
          <p className="text-sm text-red-600 flex items-center">
            <i className="fas fa-exclamation-circle mr-1"></i>
            {errors.cancelledCheque}
          </p>
        )}
      </div>
    </div>
  );
};

export default BankDetails;
