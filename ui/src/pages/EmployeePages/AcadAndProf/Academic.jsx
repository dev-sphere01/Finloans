import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, Save, X, GraduationCap } from "lucide-react";
import getAcadById from "@/services/Employees/getAcadById";
import updateAcadById, { addOrUpdateAcademicDetail } from "@/services/Employees/updateAcadById";
import useAuthStore from "@/store/authStore";
import notification from "@/services/NotificationService";

const Academic = () => {
  const user = useAuthStore((state) => state.user);
  const notify = notification();

  const [academicDetail, setAcademicDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    Degree: "",
    Institution: "",
    YearOfPassing: "",
    Grade: ""
  });
  const [errors, setErrors] = useState({});

  // Fetch academic details on component mount
  useEffect(() => {
    fetchAcademicDetails();
  }, [user?.empId]);

  const fetchAcademicDetails = async () => {
    if (!user?.empId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const details = await getAcadById(user.empId);
      // Get the latest academic detail (highest qualification)
      const latestDetail = details && details.length > 0 ? details[details.length - 1] : null;
      setAcademicDetail(latestDetail);
    } catch (error) {
      console.error('Error fetching academic details:', error);
      notify.error('Failed to load academic details');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.Degree.trim()) {
      newErrors.Degree = "Degree is required";
    }
    if (!formData.Institution.trim()) {
      newErrors.Institution = "Institution is required";
    }
    if (!formData.YearOfPassing.trim()) {
      newErrors.YearOfPassing = "Year of passing is required";
    } else if (!/^\d{4}$/.test(formData.YearOfPassing)) {
      newErrors.YearOfPassing = "Please enter a valid 4-digit year";
    }
    if (!formData.Grade.trim()) {
      newErrors.Grade = "Grade/CGPA is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleAdd = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      await addOrUpdateAcademicDetail(user.empId, formData);
      
      notify.success("Academic qualification added successfully!");
      setShowAddForm(false);
      setFormData({ Degree: "", Institution: "", YearOfPassing: "", Grade: "" });
      await fetchAcademicDetails();
    } catch (error) {
      console.error('Error adding academic detail:', error);
      notify.error(error.message || 'Failed to add academic qualification');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({ ...academicDetail });
    setErrors({});
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      // Update the academic detail with existing ID
      const updatedDetail = {
        ...academicDetail,
        Degree: formData.Degree,
        Institution: formData.Institution,
        YearOfPassing: formData.YearOfPassing,
        Grade: formData.Grade
      };
      
      console.log('Component sending to service:', updatedDetail);
      await updateAcadById(user.empId, updatedDetail);
      
      notify.success("Academic qualification updated successfully!");
      setIsEditing(false);
      setFormData({ Degree: "", Institution: "", YearOfPassing: "", Grade: "" });
      await fetchAcademicDetails();
    } catch (error) {
      console.error('Error updating academic detail:', error);
      notify.error(error.message || 'Failed to update academic qualification');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setShowAddForm(false);
    setFormData({ Degree: "", Institution: "", YearOfPassing: "", Grade: "" });
    setErrors({});
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-5 px-3 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-xl shadow-md p-5 md:p-7"
        >
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading academic details...</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-5 px-3 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-xl shadow-md p-5 md:p-7"
      >
        <div className="flex items-center justify-between mb-6 md:mb-7">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-semibold text-slate-900">Academic Qualification</h1>
          </div>
          {!academicDetail && (
            <button
              onClick={() => setShowAddForm(true)}
              disabled={showAddForm || isEditing}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold text-sm px-4 py-2 transition"
            >
              <Plus className="w-4 h-4" />
              Add Qualification
            </button>
          )}
        </div>

        {/* Add Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50"
          >
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Add Academic Qualification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Degree <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.Degree}
                  onChange={(e) => handleInputChange('Degree', e.target.value)}
                  placeholder="e.g., Bachelor of Engineering"
                  className={`w-full rounded-lg border px-3 py-2 text-sm ${errors.Degree ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:outline-none`}
                />
                {errors.Degree && <p className="text-red-500 text-xs mt-1">{errors.Degree}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Institution <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.Institution}
                  onChange={(e) => handleInputChange('Institution', e.target.value)}
                  placeholder="e.g., University of Technology"
                  className={`w-full rounded-lg border px-3 py-2 text-sm ${errors.Institution ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:outline-none`}
                />
                {errors.Institution && <p className="text-red-500 text-xs mt-1">{errors.Institution}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year of Passing <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.YearOfPassing}
                  onChange={(e) => handleInputChange('YearOfPassing', e.target.value)}
                  placeholder="e.g., 2023"
                  className={`w-full rounded-lg border px-3 py-2 text-sm ${errors.YearOfPassing ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:outline-none`}
                />
                {errors.YearOfPassing && <p className="text-red-500 text-xs mt-1">{errors.YearOfPassing}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade/CGPA <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.Grade}
                  onChange={(e) => handleInputChange('Grade', e.target.value)}
                  placeholder="e.g., 8.5 or A+"
                  className={`w-full rounded-lg border px-3 py-2 text-sm ${errors.Grade ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:outline-none`}
                />
                {errors.Grade && <p className="text-red-500 text-xs mt-1">{errors.Grade}</p>}
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={handleAdd}
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold text-sm px-4 py-2 transition"
              >
                {submitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {submitting ? 'Adding...' : 'Add Qualification'}
              </button>
              <button
                onClick={handleCancel}
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-lg bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white font-semibold text-sm px-4 py-2 transition"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {/* Academic Detail Display */}
        <div>
          {!academicDetail ? (
            <div className="text-center py-12">
              <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No Academic Qualification Found</h3>
              <p className="text-gray-400 mb-4">Add your highest educational qualification to get started.</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 transition"
              >
                <Plus className="w-4 h-4" />
                Add Your Academic Qualification
              </button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="border border-gray-200 rounded-lg p-6 bg-gray-50"
            >
              {isEditing ? (
                // Edit Form
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Academic Qualification</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Degree <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.Degree}
                        onChange={(e) => handleInputChange('Degree', e.target.value)}
                        className={`w-full rounded-lg border px-3 py-2 text-sm ${errors.Degree ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:outline-none`}
                      />
                      {errors.Degree && <p className="text-red-500 text-xs mt-1">{errors.Degree}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Institution <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.Institution}
                        onChange={(e) => handleInputChange('Institution', e.target.value)}
                        className={`w-full rounded-lg border px-3 py-2 text-sm ${errors.Institution ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:outline-none`}
                      />
                      {errors.Institution && <p className="text-red-500 text-xs mt-1">{errors.Institution}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Year of Passing <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.YearOfPassing}
                        onChange={(e) => handleInputChange('YearOfPassing', e.target.value)}
                        className={`w-full rounded-lg border px-3 py-2 text-sm ${errors.YearOfPassing ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:outline-none`}
                      />
                      {errors.YearOfPassing && <p className="text-red-500 text-xs mt-1">{errors.YearOfPassing}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Grade/CGPA <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.Grade}
                        onChange={(e) => handleInputChange('Grade', e.target.value)}
                        className={`w-full rounded-lg border px-3 py-2 text-sm ${errors.Grade ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:outline-none`}
                      />
                      {errors.Grade && <p className="text-red-500 text-xs mt-1">{errors.Grade}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={handleUpdate}
                      disabled={submitting}
                      className="inline-flex items-center gap-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold text-sm px-4 py-2 transition"
                    >
                      {submitting ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {submitting ? 'Updating...' : 'Update'}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={submitting}
                      className="inline-flex items-center gap-2 rounded-lg bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white font-semibold text-sm px-4 py-2 transition"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // Display Mode
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">{academicDetail.Degree}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
                      <div>
                        <span className="font-medium text-gray-700 block mb-1">Institution:</span>
                        <p className="text-gray-900">{academicDetail.Institution}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 block mb-1">Year of Passing:</span>
                        <p className="text-gray-900">{academicDetail.YearOfPassing}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 block mb-1">Grade/CGPA:</span>
                        <p className="text-gray-900">{academicDetail.Grade}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={handleEdit}
                      disabled={submitting || isEditing || showAddForm}
                      className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Academic;