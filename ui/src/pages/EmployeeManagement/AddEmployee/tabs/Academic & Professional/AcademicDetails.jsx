import React from 'react';
import ProfessionalDetails from './ProfessionalDetails'; 

const AcademicDetails = ({ formData, handleInputChange, errors }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-700">Academic & Professional</h3>
        <p className="text-sm text-gray-500">Please provide your academic qualification and professional details</p>
      </div>

      {/* Academic Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Degree */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Degree <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="degree"
            value={formData.degree || ''}
            onChange={handleInputChange}
            className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ${
              errors.degree ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            placeholder="e.g., Bachelor of Engineering, Master of Science"
          />
          {errors.degree && (
            <p className="text-sm text-red-600 flex items-center">
              <i className="fas fa-exclamation-circle mr-1"></i>
              {errors.degree}
            </p>
          )}
        </div>

        {/* Institution */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Institution <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="institution"
            value={formData.institution || ''}
            onChange={handleInputChange}
            className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ${
              errors.institution ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            placeholder="e.g., University of Technology"
          />
          {errors.institution && (
            <p className="text-sm text-red-600 flex items-center">
              <i className="fas fa-exclamation-circle mr-1"></i>
              {errors.institution}
            </p>
          )}
        </div>

        {/* Year of Passing */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Year of Passing <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="yearOfPassing"
            value={formData.yearOfPassing || ''}
            onChange={handleInputChange}
            className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ${
              errors.yearOfPassing ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            placeholder="e.g., 2020"
          />
          {errors.yearOfPassing && (
            <p className="text-sm text-red-600 flex items-center">
              <i className="fas fa-exclamation-circle mr-1"></i>
              {errors.yearOfPassing}
            </p>
          )}
        </div>

        {/* Grade */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Grade/CGPA <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="grade"
            value={formData.grade || ''}
            onChange={handleInputChange}
            className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ${
              errors.grade ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            placeholder="e.g., 8.5 CGPA, First Class"
          />
          {errors.grade && (
            <p className="text-sm text-red-600 flex items-center">
              <i className="fas fa-exclamation-circle mr-1"></i>
              {errors.grade}
            </p>
          )}
        </div>
      </div>

      {/* Professional Section */}
      <ProfessionalDetails
        formData={formData}
        handleInputChange={handleInputChange}
        errors={errors}
      />
    </div>
  );
};

export default AcademicDetails;

