import React from 'react'

// Professional details section to be embedded within AcademicDetails
// Expects same props shape as AcademicDetails so parent can manage single form state
const ProfessionalDetails = ({ formData, handleInputChange, errors }) => {
  return (
    <div className="space-y-6 mt-8">
      <div className="text-center mb-2">
        <h3 className="text-lg font-semibold text-gray-700">Professional Details</h3>
        <p className="text-sm text-gray-500">Provide your latest professional information</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Previous Company */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Previous Company
          </label>
          <input
            type="text"
            name="previousCompany"
            value={formData.previousCompany || ''}
            onChange={handleInputChange}
            className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ${
              errors.previousCompany ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            placeholder="e.g., Acme Corp"
          />
          {errors.previousCompany && (
            <p className="text-sm text-red-600 flex items-center">
              <i className="fas fa-exclamation-circle mr-1"></i>
              {errors.previousCompany}
            </p>
          )}
        </div>

        {/* Previous Position */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Previous Position
          </label>
          <input
            type="text"
            name="previousPosition"
            value={formData.previousPosition || ''}
            onChange={handleInputChange}
            className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ${
              errors.previousPosition ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            placeholder="e.g., Software Engineer"
          />
          {errors.previousPosition && (
            <p className="text-sm text-red-600 flex items-center">
              <i className="fas fa-exclamation-circle mr-1"></i>
              {errors.previousPosition}
            </p>
          )}
        </div>

        {/* Previous Experience */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Previous Experience
          </label>
          <input
            type="text"
            name="previousExperience"
            value={formData.previousExperience || ''}
            onChange={handleInputChange}
            className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ${
              errors.previousExperience ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            placeholder="e.g., 3.5 years"
          />
          {errors.previousExperience && (
            <p className="text-sm text-red-600 flex items-center">
              <i className="fas fa-exclamation-circle mr-1"></i>
              {errors.previousExperience}
            </p>
          )}
        </div>

        {/* Previous Experience Certificate */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Experience Certificate (optional)
          </label>
          <input
            type="file"
            name="previousExperienceCertificate"
            onChange={handleInputChange}
            accept="image/*,.pdf"
            className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ${
              errors.previousExperienceCertificate ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          />
          {formData.previousExperienceCertificate && formData.previousExperienceCertificate instanceof File && (
            <p className="text-sm text-green-600 flex items-center">
              <i className="fas fa-check-circle mr-1"></i>
              Selected: {formData.previousExperienceCertificate.name}
            </p>
          )}
          {errors.previousExperienceCertificate && (
            <p className="text-sm text-red-600 flex items-center">
              <i className="fas fa-exclamation-circle mr-1"></i>
              {errors.previousExperienceCertificate}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfessionalDetails