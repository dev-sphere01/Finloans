import React, { useState } from "react";

const Insurance = () => {
  const [form, setForm] = useState({
    insuranceType: "",
    links: [""] // Start with one empty link input
  });

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

  // Slot for API integration (submit)
  const handleSubmit = e => {
    e.preventDefault();
    // Filter out empty links before submission
    const filteredLinks = form.links.filter(link => link.trim() !== "");
    const submitData = {
      ...form,
      links: filteredLinks
    };
    console.log("Submit data:", submitData);
    // TODO: Integrate with backend API
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="bg-gray-100 border border-slate-200 shadow-lg rounded-lg p-8 w-full max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-slate-700 mb-6 text-center">Add Insurance</h2>
        <form onSubmit={handleSubmit}>
          
          {/* Insurance Type - Full Width */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-600 mb-2">Insurance Type</label>
            <input
              type="text"
              name="insuranceType"
              value={form.insuranceType}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="e.g. Health Insurance, Life Insurance, Vehicle Insurance"
            />
          </div>

          {/* Links Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-slate-600">Insurance Links</label>
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
                      placeholder="https://example.com/insurance-policy"
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
            <p className="text-xs text-gray-500 mt-2">Add relevant insurance policy links, application URLs, or reference documents</p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="px-8 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-800 transition-colors duration-200 font-medium"
            >
              Submit Insurance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Insurance;
