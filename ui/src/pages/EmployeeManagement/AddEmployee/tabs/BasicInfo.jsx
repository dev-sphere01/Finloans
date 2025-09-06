import React from 'react';

const BasicInfo = ({ formData, handleInputChange, errors }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Grid for first, middle and last names */}
      <div className="grid grid-cols-2 gap-6">
        {/* First Name */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            required
            className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ${
              errors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            placeholder="Enter first name"
          />
          {errors.firstName && (
            <p className="text-sm text-red-600 flex items-center">
              <i className="fas fa-exclamation-circle mr-1"></i>
              {errors.firstName}
            </p>
          )}
        </div>
        {/* Middle Name */}
        {/* <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Middle Name</label>
          <input
            type="text"
            name="middleName"
            value={formData.middleName}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 border-gray-300 hover:border-gray-400"
            placeholder="Enter middle name"
          />
        </div> */}
        {/* Last Name */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 border-gray-300 hover:border-gray-400"
            placeholder="Enter last name"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        {/* Personal Email */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Personal Email</label>
          <input
            type="email"
            name="personalEmail"
            value={formData.personalEmail}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 border-gray-300 hover:border-gray-400"
            placeholder="Enter personal email"
          />
        </div>
        {/* Work Email */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Work Email</label>
          <input
            type="email"
            name="workEmail"
            value={formData.workEmail}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 border-gray-300 hover:border-gray-400"
            placeholder="Enter work email"
          />
        </div>
      </div>
      {/* Numbers */}
      <div className="grid grid-cols-3 gap-6">
        {/* Phone Number */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="phoneNumber"
            maxLength={10}
            minLength={10}
            value={formData.phoneNumber}
            onChange={handleInputChange}
            required
            className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ${
              errors.phoneNumber ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            placeholder="Enter phone number"
          />
          {errors.phoneNumber && (
            <p className="text-sm text-red-600 flex items-center">
              <i className="fas fa-exclamation-circle mr-1"></i>
              {errors.phoneNumber}
            </p>
          )}
        </div>
        {/* Emergency Contact Name */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Emergency Contact Name</label>
          <input
            type="text"
            name="emergencyContact"
            
            value={formData.emergencyContact}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 border-gray-300 hover:border-gray-400"
            placeholder="Enter emergency contact"
          />
        </div>
        {/* Emergency Contact Number */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Emergency Contact Number</label>
          <input
            type="tel"
            name="emergencyContactNumber"
            value={formData.emergencyContactNumber}
            onChange={handleInputChange}
            maxLength={10}
            minLength={10}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 border-gray-300 hover:border-gray-400"
            placeholder="Enter emergency contact number"
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-6">
        {/* DOB */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Date of Birth <span className="text-red-500">*</span>
            </label>
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleInputChange}
            required
            className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 border-gray-300 hover:border-gray-400  
              ${errors.gender ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`}
          />
          {errors.dob && (
            <p className="text-sm text-red-600 flex items-center">
              <i className="fas fa-exclamation-circle mr-1"></i>
              {errors.dob}
            </p>
          )}
        </div>
        {/* DOJ */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Date of Joining</label>
          <input
            type="date"
            name="doj"
            value={formData.doj}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 border-gray-300 hover:border-gray-400"
          />
        </div>
        {/* Gender */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Gender <span className="text-red-500">*</span>
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            required
            className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 appearance-none bg-white ${
              errors.gender ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          {errors.gender && (
            <p className="text-sm text-red-600 flex items-center">
              <i className="fas fa-exclamation-circle mr-1"></i>
              {errors.gender}
            </p>
          )}
        </div>
      </div>
      {/* Profile Picture */}
      {/* <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">Profile Picture</label>
        <input
          type="file"
          name="profilePicture"
          onChange={handleInputChange}
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 border-gray-300 hover:border-gray-400"
        />
      </div> */}
      {/* Address */}
      <div className="space-y-2 col-span-2">
        <label className="block text-sm font-semibold text-gray-700">
          Address <span className="text-red-500">*</span>
        </label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          rows={2}
          required
          className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ${
            errors.address ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
          }`}
          placeholder="Enter address"
        />
        {errors.address && (
          <p className="text-sm text-red-600 flex items-center">
            <i className="fas fa-exclamation-circle mr-1"></i>
            {errors.address}
          </p>
        )}
      </div>
    </div>
  );
};

export default BasicInfo;
