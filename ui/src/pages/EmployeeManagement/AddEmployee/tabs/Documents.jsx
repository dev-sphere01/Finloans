import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Eye, X, Info, CheckCircle, FileText } from 'lucide-react';
import API from '@/services/API';
import notification from '@/services/NotificationService';

const DOCUMENT_TYPES = [
  { key: 'aadhar', label: 'Aadhar', required: false, headerName: 'Aadhar' },
  { key: 'pan', label: 'PAN', required: false, headerName: 'PAN' },
  { key: 'highSchool', label: 'High School(10th)', required: false, headerName: 'High School(10th)' },
  { key: 'intermediate', label: 'Intermediate(12th)', required: false, headerName: 'Intermediate(12th)' },
  { key: 'graduation', label: 'Graduation', required: false, headerName: 'Graduation' },
  { key: 'postGraduation', label: 'Post Graduation', required: false, headerName: 'Post Graduation' }
];

const MAX_FILE_SIZE_MB = 5;

const Documents = ({ formData, handleInputChange, errors, employeeId }) => {
  const [previewModal, setPreviewModal] = useState({ isOpen: false, src: null, type: null, title: null });
  const [uploadStatus, setUploadStatus] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  // Handle file selection
  const handleFileChange = (docType, file) => {
    if (!file) {
      const fieldName = `${docType}File`;
      const syntheticEvent = {
        target: {
          name: fieldName,
          type: 'file',
          files: []
        }
      };
      handleInputChange(syntheticEvent);
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      notification.error(`File size exceeds ${MAX_FILE_SIZE_MB} MB`);
      return;
    }

    const fieldName = `${docType}File`;
    const syntheticEvent = {
      target: {
        name: fieldName,
        type: 'file',
        files: [file]
      }
    };
    handleInputChange(syntheticEvent);
  };

  // Handle document number change
  const handleDocNumberChange = (docType, value) => {
    const fieldName = `${docType}DocNumber`;
    const syntheticEvent = {
      target: {
        name: fieldName,
        value: value,
        type: 'text'
      }
    };
    handleInputChange(syntheticEvent);
  };

  // Handle preview
  const handlePreview = (file, title) => {
    if (file && file instanceof File) {
      const src = URL.createObjectURL(file);
      setPreviewModal({ 
        isOpen: true, 
        src, 
        type: file.type, 
        title 
      });
    }
  };

  // Close preview modal
  const closePreview = () => {
    if (previewModal.src) {
      URL.revokeObjectURL(previewModal.src);
    }
    setPreviewModal({ isOpen: false, src: null, type: null, title: null });
  };

  // Upload all documents
  const handleUploadAll = async () => {
    if (!employeeId) {
      notification.error('Employee ID is required for document upload');
      return;
    }

    setIsUploading(true);
    const uploadPromises = [];

    DOCUMENT_TYPES.forEach(({ key, headerName }) => {
      const file = formData[`${key}File`];
      const docNumber = formData[`${key}DocNumber`];

      if (file) {
        const formDataToSend = new FormData();
        formDataToSend.append('EmpId', employeeId);
        formDataToSend.append('DocName', headerName);
        
        // Only send document number for Aadhar and PAN
        const requiresDocNumber = ['aadhar', 'pan'].includes(key.toLowerCase());
        formDataToSend.append('DocIDNumber', requiresDocNumber ? (docNumber || '') : '');
        
        formDataToSend.append('DocFile', file);

        uploadPromises.push(
          API.post('/EmpDocs', formDataToSend, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          })
          .then(() => {
            setUploadStatus(prev => ({ ...prev, [key]: 'success' }));
          })
          .catch((error) => {
            console.error(`Error uploading ${headerName}:`, error);
            setUploadStatus(prev => ({ ...prev, [key]: 'error' }));
            throw error;
          })
        );
      }
    });

    try {
      await Promise.all(uploadPromises);
      notification.success('All documents uploaded successfully!');
    } catch (error) {
      notification.error('Some documents failed to upload. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="p-2 bg-slate-100 rounded-full">
              <FileText className="w-6 h-6 text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Upload Documents</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {DOCUMENT_TYPES.map(({ key, label, required }) => {
            const fileFieldName = `${key}File`;
            const docNumberFieldName = `${key}DocNumber`;
            const selectedFile = formData[fileFieldName];
            const docNumber = formData[docNumberFieldName] || '';
            const fileError = errors[fileFieldName];
            const docNumberError = errors[docNumberFieldName];
            const status = uploadStatus[key];

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: DOCUMENT_TYPES.findIndex(doc => doc.key === key) * 0.1 }}
                className={`border-2 rounded-xl p-5 transition-all duration-200 ${
                  required 
                    ? 'border-slate-200 bg-slate-50 hover:border-slate-300' 
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                } ${(fileError || docNumberError) ? 'border-red-300 bg-red-50' : ''} ${
                  status === 'success' ? 'border-green-300 bg-green-50' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${required ? 'bg-red-500' : 'bg-gray-400'}`}></div>
                    {label} {required && <span className="text-red-500 text-lg">*</span>}
                  </h4>
                  {selectedFile && (
                    <button
                      type="button"
                      onClick={() => handlePreview(selectedFile, label)}
                      className="text-blue-600 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100 transition-colors"
                      title="Preview document"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  {status === 'success' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>

                {/* Document Number Input */}
                {(['aadhar', 'pan'].includes(key)) && (
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Document Number
                    </label>
                    <input
                      type="text"
                      value={docNumber}
                      onChange={(e) => handleDocNumberChange(key, e.target.value)}
                      placeholder={`Enter ${label.toLowerCase()} number`}
                      className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ${
                        docNumberError 
                          ? 'border-red-300 bg-red-50 focus:ring-red-200' 
                          : 'border-gray-300 hover:border-gray-400 bg-white focus:bg-white'
                      }`}
                    />
                    {docNumberError && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                        <Info className="w-3 h-3" />
                        <span>{docNumberError}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* File Upload */}
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-gray-700">
                    Upload File
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      id={`file-${key}`}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange(key, e.target.files[0])}
                      className="hidden"
                    />
                    <label
                      htmlFor={`file-${key}`}
                      className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg transition-all duration-200 hover:scale-105 ${
                        selectedFile
                          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                          : 'bg-slate-600 text-white hover:bg-slate-700 shadow-md'
                      }`}
                    >
                      <Upload className="w-4 h-4" />
                      {selectedFile ? 'Change File' : 'Choose File'}
                    </label>
                    
                    {selectedFile && (
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 flex-1 min-w-0">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-xs text-gray-700 truncate font-medium">
                            {selectedFile.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleFileChange(key, null)}
                          className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors"
                          title="Remove file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {fileError && (
                    <div className="flex items-center gap-1 text-xs text-red-600">
                      <Info className="w-3 h-3" />
                      <span>{fileError}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Upload All Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="flex justify-center"
        >
          <button
            type="button"
            onClick={handleUploadAll}
            disabled={isUploading}
            className="px-2 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 text-sm"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload All Documents
              </>
            )}
          </button>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.8 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-full flex-shrink-0">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-sm text-blue-800">
              <p className="font-bold mb-2">Upload Instructions:</p>
              <ul className="space-y-1 text-xs leading-relaxed">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  Accepted formats: Images (JPG, PNG) and PDF files
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  Maximum file size: {MAX_FILE_SIZE_MB}MB per document
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  Ensure documents are clear and readable
                </li>
                {/* <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                  <span className="font-semibold">Aadhar and High School certificates are mandatory</span>
                </li> */}
              </ul>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Preview Modal */}
      {previewModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {previewModal.title} Preview
              </h3>
              <button
                onClick={closePreview}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
              {previewModal.type && previewModal.type.startsWith("image/") ? (
                <img
                  src={previewModal.src}
                  alt="Document preview"
                  className="w-full h-auto max-h-[70vh] object-contain rounded"
                />
              ) : (
                <iframe
                  title="Document Preview"
                  src={previewModal.src}
                  className="w-full h-[70vh] rounded border-none"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Documents;
