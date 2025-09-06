import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Save, X, Briefcase, Upload, Eye } from "lucide-react";
import { getProfById, updateProfById, addOrUpdateProfessionalDetail } from "@/services/Employees/empProfileDetails";
import useAuthStore from "@/store/authStore";
import notification from "@/services/NotificationService";
import PreviewModal from "@/pages/EmployeeManagement/AllEmployees/components/PreviewModal";
import getBaseFileURL from "@/utils/getBaseFileUrl";

const Professional = () => {
  const user = useAuthStore((state) => state.user);
  const notify = notification();

  const [professionalDetails, setProfessionalDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    PreviousCompany: "",
    PreviousPosition: "",
    PreviousExperience: "",
    PreviousExperienceCeritificate: ""
  });
  const [errors, setErrors] = useState({});
  const [certificateFile, setCertificateFile] = useState(null);
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    documentUrl: '',
    documentName: ''
  });

  // Fetch professional details on component mount
  useEffect(() => {
    fetchProfessionalDetails();
  }, [user?.empId]);

  const fetchProfessionalDetails = async () => {
    if (!user?.empId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const details = await getProfById(user.empId);
      // Set all professional details
      setProfessionalDetails(details || []);
    } catch (error) {
      console.error('Error fetching professional details:', error);
      notify.error('Failed to load professional details');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.PreviousCompany.trim()) {
      newErrors.PreviousCompany = "Previous company is required";
    }
    if (!formData.PreviousPosition.trim()) {
      newErrors.PreviousPosition = "Previous position is required";
    }
    if (!formData.PreviousExperience.trim()) {
      newErrors.PreviousExperience = "Previous experience is required";
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCertificateFile(file);
      // No need to convert to base64 - we'll send the file directly
      console.log('Certificate file selected:', file.name);
    }
  };

  const handleAdd = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      // Pass the certificate file separately to the service
      await addOrUpdateProfessionalDetail(user.empId, formData, certificateFile);

      notify.success("Professional experience added successfully!");
      setShowAddForm(false);
      setFormData({
        PreviousCompany: "",
        PreviousPosition: "",
        PreviousExperience: "",
        PreviousExperienceCeritificate: ""
      });
      setCertificateFile(null);
      await fetchProfessionalDetails();
    } catch (error) {
      console.error('Error adding professional detail:', error);
      notify.error(error.message || 'Failed to add professional experience');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setFormData({ ...professionalDetails[index] });
    setErrors({});
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const currentDetail = professionalDetails[editingIndex];
      // Update the professional detail with existing ID
      const updatedDetail = {
        ...currentDetail,
        PreviousCompany: formData.PreviousCompany,
        PreviousPosition: formData.PreviousPosition,
        PreviousExperience: formData.PreviousExperience,
        PreviousExperienceCeritificate: formData.PreviousExperienceCeritificate
      };

      console.log('Component sending to service:', updatedDetail);
      await updateProfById(user.empId, updatedDetail);

      notify.success("Professional experience updated successfully!");
      setEditingIndex(-1);
      setFormData({
        PreviousCompany: "",
        PreviousPosition: "",
        PreviousExperience: "",
        PreviousExperienceCeritificate: ""
      });
      setCertificateFile(null);
      await fetchProfessionalDetails();
    } catch (error) {
      console.error('Error updating professional detail:', error);
      notify.error(error.message || 'Failed to update professional experience');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setEditingIndex(-1);
    setShowAddForm(false);
    setFormData({
      PreviousCompany: "",
      PreviousPosition: "",
      PreviousExperience: "",
      PreviousExperienceCeritificate: ""
    });
    setCertificateFile(null);
    setErrors({});
  };

  const handlePreviewCertificate = (certificatePath, companyName, position) => {
    const baseUrl = getBaseFileURL();
    const fullUrl = `${baseUrl}${certificatePath}`;
    const documentName = `${companyName}_${position}_Certificate`;

    setPreviewModal({
      isOpen: true,
      documentUrl: fullUrl,
      documentName: documentName
    });
  };

  const closePreviewModal = () => {
    setPreviewModal({
      isOpen: false,
      documentUrl: '',
      documentName: ''
    });
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
            <span className="ml-3 text-gray-600">Loading professional details...</span>
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
            <Briefcase className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-semibold text-slate-900">Professional Experience</h1>
            {professionalDetails.length > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {professionalDetails.length} experience{professionalDetails.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            disabled={showAddForm || editingIndex !== -1}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold text-sm px-4 py-2 transition"
          >
            <Plus className="w-4 h-4" />
            Add Experience
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50"
          >
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Add Professional Experience</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Previous Company <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.PreviousCompany}
                  onChange={(e) => handleInputChange('PreviousCompany', e.target.value)}
                  placeholder="e.g., Tech Solutions Inc."
                  className={`w-full rounded-lg border px-3 py-2 text-sm ${errors.PreviousCompany ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:outline-none`}
                />
                {errors.PreviousCompany && <p className="text-red-500 text-xs mt-1">{errors.PreviousCompany}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Previous Position <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.PreviousPosition}
                  onChange={(e) => handleInputChange('PreviousPosition', e.target.value)}
                  placeholder="e.g., Senior Software Developer"
                  className={`w-full rounded-lg border px-3 py-2 text-sm ${errors.PreviousPosition ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:outline-none`}
                />
                {errors.PreviousPosition && <p className="text-red-500 text-xs mt-1">{errors.PreviousPosition}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Previous Experience <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.PreviousExperience}
                  onChange={(e) => handleInputChange('PreviousExperience', e.target.value)}
                  placeholder="e.g., 3 years"
                  className={`w-full rounded-lg border px-3 py-2 text-sm ${errors.PreviousExperience ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:outline-none`}
                />
                {errors.PreviousExperience && <p className="text-red-500 text-xs mt-1">{errors.PreviousExperience}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experience Certificate
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                    id="certificate-upload"
                  />
                  <label
                    htmlFor="certificate-upload"
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm px-3 py-2 cursor-pointer transition"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Certificate
                  </label>
                  {certificateFile && (
                    <span className="text-sm text-green-600">{certificateFile.name}</span>
                  )}
                </div>
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
                {submitting ? 'Adding...' : 'Add Experience'}
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

        {/* Professional Details Display */}
        <div>
          {professionalDetails.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No Professional Experience Found</h3>
              <p className="text-gray-400 mb-4">Add your previous work experience to get started.</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 transition"
              >
                <Plus className="w-4 h-4" />
                Add Your Professional Experience
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {professionalDetails.map((detail, index) => (
                <motion.div
                  key={detail.EpdID || index}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border border-gray-200 rounded-lg p-6 bg-gray-50"
                >
                  {editingIndex === index ? (
                    // Edit Form
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Professional Experience</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Previous Company <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.PreviousCompany}
                            onChange={(e) => handleInputChange('PreviousCompany', e.target.value)}
                            className={`w-full rounded-lg border px-3 py-2 text-sm ${errors.PreviousCompany ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:outline-none`}
                          />
                          {errors.PreviousCompany && <p className="text-red-500 text-xs mt-1">{errors.PreviousCompany}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Previous Position <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.PreviousPosition}
                            onChange={(e) => handleInputChange('PreviousPosition', e.target.value)}
                            className={`w-full rounded-lg border px-3 py-2 text-sm ${errors.PreviousPosition ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:outline-none`}
                          />
                          {errors.PreviousPosition && <p className="text-red-500 text-xs mt-1">{errors.PreviousPosition}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Previous Experience <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.PreviousExperience}
                            onChange={(e) => handleInputChange('PreviousExperience', e.target.value)}
                            className={`w-full rounded-lg border px-3 py-2 text-sm ${errors.PreviousExperience ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:outline-none`}
                          />
                          {errors.PreviousExperience && <p className="text-red-500 text-xs mt-1">{errors.PreviousExperience}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Experience Certificate
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              onChange={handleFileChange}
                              className="hidden"
                              id={`certificate-upload-edit-${index}`}
                            />
                            <label
                              htmlFor={`certificate-upload-edit-${index}`}
                              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm px-3 py-2 cursor-pointer transition"
                            >
                              <Upload className="w-4 h-4" />
                              Upload Certificate
                            </label>
                            {certificateFile && (
                              <span className="text-sm text-green-600">{certificateFile.name}</span>
                            )}
                          </div>
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
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">{detail.PreviousPosition}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
                          <div>
                            <span className="font-medium text-gray-700 block mb-1">Company:</span>
                            <p className="text-gray-900">{detail.PreviousCompany}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 block mb-1">Experience:</span>
                            <p className="text-gray-900">{detail.PreviousExperience}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 block mb-1">Certificate:</span>
                            <div className="flex items-center gap-2">
                              {detail.PreviousExperienceCeritificate ? (
                                <>
                                  <span className="text-green-600">Available</span>
                                  <button
                                    onClick={() => handlePreviewCertificate(
                                      detail.PreviousExperienceCeritificate,
                                      detail.PreviousCompany,
                                      detail.PreviousPosition
                                    )}
                                    className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                                    title="Preview Certificate"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                </>
                              ) : (
                                <span className="text-gray-400">Not uploaded</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleEdit(index)}
                          disabled={submitting || editingIndex !== -1 || showAddForm}
                          className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={previewModal.isOpen}
        onClose={closePreviewModal}
        documentUrl={previewModal.documentUrl}
        documentName={previewModal.documentName}
      />
    </div>
  );
};

export default Professional;