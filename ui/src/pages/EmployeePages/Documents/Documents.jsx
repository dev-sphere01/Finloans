import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, Eye, X, Info, CheckCircle } from "lucide-react";
import getDocsById from "@/services/Employees/getDocsById";
import updateEmpDocsById, { getDocumentsToUpload, validateDocumentsForUpload } from "@/services/Employees/updateEmpDocsById";
import getBaseFileURL from "@/utils/getBaseFileUrl";
import useAuthStore from "@/store/authStore";
import PreviewModal from "@/pages/EmployeeManagement/AllEmployees/components/PreviewModal";

const DOCUMENT_FIELDS = [
  { key: "aadhar", label: "Aadhar Card", required: true, apiName: "Aadhar", hasDocNumber: true },
  { key: "pan", label: "PAN Card", apiName: "PAN", hasDocNumber: true },
  { key: "tenth", label: "Secondary School Examination", apiName: "High School(10th)", hasDocNumber: false },
  { key: "twelfth", label: "Higher Secondary Examination", apiName: "Intermediate(12th)", hasDocNumber: false },
  { key: "graduation", label: "Graduation Certificate", apiName: "Graduation", hasDocNumber: false },
  { key: "pg", label: "Post Graduation Certificate", apiName: "Post Graduation", hasDocNumber: false }
];

const MAX_FILE_SIZE_MB = 5;

const Documents = () => {
  const user = useAuthStore((state) => state.user);
  const baseFileURL = getBaseFileURL();
  
  const [documents, setDocuments] = useState(
    DOCUMENT_FIELDS.reduce((acc, { key }) => {
      acc[key] = { docNumber: "", file: null, preview: null, existingDoc: null };
      return acc;
    }, {})
  );
  const [errors, setErrors] = useState({});
  const [previewModal, setPreviewModal] = useState({ isOpen: false, src: null, type: null });
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [existingDocuments, setExistingDocuments] = useState([]);

  // Function to fetch existing documents
  const fetchExistingDocuments = async () => {
    if (!user?.empId) {
      setLoading(false);
      return;
    }

    try {
      const existingDocs = await getDocsById(user.empId);
      setExistingDocuments(existingDocs);
      
      // Map existing documents to our document fields
      const updatedDocuments = DOCUMENT_FIELDS.reduce((acc, { key }) => {
        acc[key] = { docNumber: "", file: null, preview: null, existingDoc: null };
        return acc;
      }, {});
      
      DOCUMENT_FIELDS.forEach(({ key, apiName }) => {
        // Find the most recent document for this type
        const existingDoc = existingDocs
          .filter(doc => doc.DocName === apiName)
          .sort((a, b) => b.EmpDocId - a.EmpDocId)[0]; // Get the latest one
        
        if (existingDoc) {
          updatedDocuments[key] = {
            ...updatedDocuments[key],
            docNumber: existingDoc.DocIDNumber || "",
            existingDoc: {
              ...existingDoc,
              fullUrl: `${baseFileURL}${existingDoc.DocPath}`
            }
          };
        }
      });
      
      setDocuments(updatedDocuments);
    } catch (error) {
      console.error('Error fetching existing documents:', error);
      setErrors({ fetch: 'Failed to load existing documents' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch existing documents on component mount
  useEffect(() => {
    fetchExistingDocuments();
  }, [user?.empId, baseFileURL]);

  const handleDocNumberChange = (key, value) => {
    setDocuments(prev => ({ ...prev, [key]: { ...prev[key], docNumber: value } }));
    setErrors(prev => ({ ...prev, [`${key}DocNumber`]: "" }));
  };

  const handleFileChange = (key, file) => {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setErrors(prev => ({ ...prev, [`${key}File`]: `File size exceeds ${MAX_FILE_SIZE_MB} MB` }));
      return;
    }
    const preview = URL.createObjectURL(file);
    setDocuments(prev => ({ ...prev, [key]: { ...prev[key], file, preview } }));
    setErrors(prev => ({ ...prev, [`${key}File`]: "" }));
  };
  
  const removeFile = (key) => setDocuments(prev => ({ ...prev, [key]: { ...prev[key], file: null, preview: null } }));
  const validate = () => {
    const errs = {};
    DOCUMENT_FIELDS.forEach(({ key, label, required, hasDocNumber }) => {
      if (required) {
        const doc = documents[key];
        // Check if document number is provided (only for fields that have document numbers)
        if (hasDocNumber && !doc.docNumber.trim() && !doc.existingDoc?.DocIDNumber) {
          errs[`${key}DocNumber`] = `${label} number is required`;
        }
        // Check if document file exists (either new upload or existing document)
        if (!doc.file && !doc.existingDoc) {
          errs[`${key}File`] = `${label} document is required`;
        }
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors and success messages
    setErrors({});
    setSuccess("");
    
    // Get only documents with files to upload
    const documentsToUpload = getDocumentsToUpload(documents);
    
    if (Object.keys(documentsToUpload).length === 0) {
      setErrors({ submit: 'Please select at least one document to upload' });
      return;
    }
    
    // Validate documents before upload
    const validation = validateDocumentsForUpload(documentsToUpload, DOCUMENT_FIELDS);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    // Additional validation for required fields
    if (!validate()) return;
    
    try {
      setSubmitting(true);
      setUploadProgress({ current: 0, total: Object.keys(documentsToUpload).length });
      
      const result = await updateEmpDocsById({
        empId: user.empId,
        documents: documentsToUpload,
        documentFields: DOCUMENT_FIELDS,
        onProgress: (progress) => {
          setUploadProgress(progress);
        }
      });
      
      setSuccess(`Successfully uploaded ${result.totalUploaded} document(s)!`);
      
      // Clear uploaded files and refresh existing documents
      const clearedDocuments = { ...documents };
      Object.keys(documentsToUpload).forEach(key => {
        clearedDocuments[key] = {
          ...clearedDocuments[key],
          file: null,
          preview: null
        };
      });
      setDocuments(clearedDocuments);
      
      // Refresh the documents list to show newly uploaded documents
      await fetchExistingDocuments();
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(""), 5000);
      
    } catch (error) {
      console.error('Error uploading documents:', error);
      setErrors({ submit: error.message || 'Failed to upload documents' });
    } finally {
      setSubmitting(false);
      setUploadProgress(null);
    }
  };

  const closePreview = () => setPreviewModal({ isOpen: false, src: null, type: null });

  const openExistingDocPreview = (doc) => {
    setPreviewModal({
      isOpen: true,
      src: doc.fullUrl,
      type: doc.DocPath.split('.').pop().toLowerCase(),
      documentName: doc.DocName
    });
  };

  // Helper function to check if there are any new files to upload
  const hasFilesToUpload = () => {
    return Object.values(documents).some(doc => doc.file);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-5 px-3 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-5xl mx-auto bg-white rounded-xl shadow-md p-5 md:p-7"
        >
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading documents...</span>
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
        className=" bg-white rounded-xl shadow-md p-5 md:p-7"
      >
        <h1 className="text-2xl font-semibold text-slate-900 mb-6 md:mb-7">
          Upload Your Documents
        </h1>

        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-100 px-3 py-1.5 text-green-800 font-semibold text-sm">
            <CheckCircle className="w-5 h-5" />
            <span>{success}</span>
          </div>
        )}

        {errors.submit && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-100 px-3 py-1.5 text-red-800 font-semibold text-sm">
            <X className="w-5 h-5" />
            <span>{errors.submit}</span>
          </div>
        )}

        {errors.fetch && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-yellow-100 px-3 py-1.5 text-yellow-800 font-semibold text-sm">
            <Info className="w-5 h-5" />
            <span>{errors.fetch}</span>
          </div>
        )}

        {uploadProgress && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800">
                Uploading {uploadProgress.documentName}...
              </span>
              <span className="text-sm text-blue-600">
                {uploadProgress.current} / {uploadProgress.total}
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 md:gap-y-6">
            {DOCUMENT_FIELDS.map(({ key, label, required, hasDocNumber }) => {
              const doc = documents[key];
              const hasExistingDoc = doc.existingDoc;
              const hasNewFile = doc.file;
              
              return (
                <div key={key} className="border border-slate-200 rounded-lg p-3 bg-slate-50 flex flex-col gap-1">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 text-sm">{label} {required && <span className="text-red-500">*</span>}</span>
                      {hasExistingDoc && (
                        <CheckCircle className="w-4 h-4 text-green-600" title="Document already uploaded" />
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {hasExistingDoc && (
                        <button
                          type="button"
                          title="Preview existing document"
                          onClick={() => openExistingDocPreview(doc.existingDoc)}
                          className="text-green-600 hover:text-green-700 p-1"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      {hasNewFile && (
                        <button
                          type="button"
                          title="Preview new file"
                          onClick={() => setPreviewModal({ isOpen: true, src: doc.preview, type: doc.file.type })}
                          className="text-blue-600 hover:text-blue-700 p-1"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Existing document status */}
                  {hasExistingDoc && (
                    <div className="mb-2 p-2 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-green-800 font-medium">
                          Current: {doc.existingDoc.DocName}
                        </span>
                        {hasDocNumber && (
                          <span className="text-xs text-green-600">
                            ID: {doc.existingDoc.DocIDNumber || 'Not provided'}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Document Number Input - Only for Aadhar and PAN */}
                  {hasDocNumber && (
                    <div className="flex items-center gap-2 mb-1">
                      <input
                        type="text"
                        value={doc.docNumber}
                        onChange={(e) => handleDocNumberChange(key, e.target.value)}
                        placeholder={hasExistingDoc ? "Update Doc Number" : "Doc Number"}
                        className={`rounded-lg border px-3 py-1.5 text-xs text-slate-900 bg-white w-full ${errors[`${key}DocNumber`] ? "border-red-500" : "border-slate-300"}`}
                      />
                      {errors[`${key}DocNumber`] && (
                        <span title={errors[`${key}DocNumber`]} className="text-red-500">
                          <Info className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      id={`file-upload-${key}`}
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileChange(key, e.target.files[0])}
                      className="hidden"
                    />
                    <label
                      htmlFor={`file-upload-${key}`}
                      className="cursor-pointer inline-flex items-center gap-1 rounded-md bg-blue-600 hover:bg-blue-700 text-xs text-white font-semibold px-3 py-1.5 select-none transition"
                      title="Choose file"
                    >
                      <Upload className="w-4 h-4" />
                      {hasNewFile ? "Change" : hasExistingDoc ? "Replace" : "Upload"}
                    </label>

                    {doc.file && (
                      <>
                        <span className="truncate text-xs font-medium text-slate-700 max-w-[100px]">
                          {doc.file.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFile(key)}
                          className="text-red-500 hover:text-red-700"
                          title="Remove uploaded file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {errors[`${key}File`] && (
                      <span title={errors[`${key}File`]} className="text-red-500">
                        <Info className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <button
            type="submit"
            disabled={submitting || !hasFilesToUpload()}
            className={`w-full rounded-lg py-2 text-white font-semibold text-sm transition flex items-center justify-center gap-2 ${
              submitting || !hasFilesToUpload()
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Uploading...</span>
              </>
            ) : !hasFilesToUpload() ? (
              'Select documents to upload'
            ) : (
              'Save Documents'
            )}
          </button>
        </form>
      </motion.div>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={previewModal.isOpen}
        onClose={closePreview}
        documentUrl={previewModal.src}
        documentName={previewModal.documentName || "Document"}
      />
    </div>
  );
};

export default Documents;
