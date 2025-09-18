import React, { useState } from "react";

const CreditCards = () => {
  const [form, setForm] = useState({
    creditCardName: "",
    cibilRange: "",
    creditCardPic: "",
    link: ""
  });

  const handleChange = e => {
    const { name, value, files } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  // Slot for API integration (submit)
  const handleSubmit = e => {
    e.preventDefault();
    // TODO: Integrate with backend API
  };

  return (
    <div className="p-6 bg-slate-50 h-full">
      <div className="bg-gray-100 border border-slate-200 shadow-lg rounded-lg p-8 w-full max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-slate-700 mb-6 text-center">Add Credit Card</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Credit Card Name</label>
              <input
                type="text"
                name="creditCardName"
                value={form.creditCardName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                placeholder="e.g. HDFC Diners Club"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">CIBIL Range</label>
              <input
                type="text"
                name="cibilRange"
                value={form.cibilRange}
                onChange={handleChange}
                required
                pattern="\d{3}-\d{3}"
                className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                placeholder="e.g. 700-750"
              />
              <span className="text-xs text-gray-500 mt-1 block">Format: 700-750</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Credit Card Image</label>
              <input
                type="file"
                name="creditCardPic"
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
                placeholder="e.g. https://apply.hdfc.com"
              />
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="px-8 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-800 transition-colors duration-200 font-medium"
            >
              Submit Credit Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreditCards;
