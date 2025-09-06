// src/services/Employees/updateEmpDocsById.js
import API from '@/services/API';

/**
 * Updates or uploads a single employee document
 * @param {Object} documentData - The document data to upload
 * @param {number|string} documentData.empId - The employee ID
 * @param {string} documentData.docName - The document name (e.g., "Aadhar", "PAN", etc.)
 * @param {string} documentData.docIDNumber - The document ID number (optional for some documents)
 * @param {File} documentData.docFile - The document file to upload
 * @returns {Promise<Object>} Promise that resolves to the API response
 * @throws {Error} Throws error if document upload fails
 */
const updateSingleDocument = async ({ empId, docName, docIDNumber, docFile }) => {
  try {
    // Validate required fields
    if (!empId) {
      throw new Error('Employee ID is required');
    }
    if (!docName) {
      throw new Error('Document name is required');
    }
    if (!docFile) {
      throw new Error('Document file is required');
    }

    // Create FormData for multipart/form-data request
    const formData = new FormData();
    formData.append('EmpId', empId.toString());
    formData.append('DocName', docName);
    formData.append('DocIDNumber', docIDNumber || '');
    formData.append('DocFile', docFile);

    const response = await API.post('/EmpDocs', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.data) {
      throw new Error('Invalid response format: No data received');
    }

    return response.data;
  } catch (error) {
    console.error('Error uploading document:', error);

    if (error.response) {
      const statusCode = error.response.status;
      const errorMessage = error.response.data?.message || error.response.data || 'Unknown server error';
      throw new Error(`Server error (${statusCode}): ${errorMessage}`);
    } else if (error.request) {
      throw new Error('Network error: Unable to connect to server');
    } else {
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
};

/**
 * Updates multiple employee documents in sequence
 * @param {number|string} empId - The employee ID
 * @param {Array<Object>} documents - Array of document objects to upload
 * @param {string} documents[].docName - The document name
 * @param {string} documents[].docIDNumber - The document ID number (optional)
 * @param {File} documents[].docFile - The document file
 * @param {Function} onProgress - Optional callback for progress updates
 * @returns {Promise<Array>} Promise that resolves to array of upload results
 * @throws {Error} Throws error if any document upload fails
 */
const updateMultipleDocuments = async (empId, documents, onProgress) => {
  try {
    if (!empId) {
      throw new Error('Employee ID is required');
    }
    if (!Array.isArray(documents) || documents.length === 0) {
      throw new Error('Documents array is required and must not be empty');
    }

    const results = [];
    const totalDocuments = documents.length;

    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      
      try {
        // Call progress callback if provided
        if (onProgress) {
          onProgress({
            current: i + 1,
            total: totalDocuments,
            documentName: doc.docName,
            status: 'uploading'
          });
        }

        const result = await updateSingleDocument({
          empId,
          docName: doc.docName,
          docIDNumber: doc.docIDNumber,
          docFile: doc.docFile
        });

        results.push({
          docName: doc.docName,
          success: true,
          data: result
        });

        // Call progress callback for success
        if (onProgress) {
          onProgress({
            current: i + 1,
            total: totalDocuments,
            documentName: doc.docName,
            status: 'completed'
          });
        }

      } catch (error) {
        results.push({
          docName: doc.docName,
          success: false,
          error: error.message
        });

        // Call progress callback for error
        if (onProgress) {
          onProgress({
            current: i + 1,
            total: totalDocuments,
            documentName: doc.docName,
            status: 'error',
            error: error.message
          });
        }

        // Continue with other documents instead of stopping
        console.error(`Failed to upload ${doc.docName}:`, error.message);
      }
    }

    // Check if any uploads failed
    const failedUploads = results.filter(result => !result.success);
    if (failedUploads.length > 0) {
      const failedNames = failedUploads.map(result => result.docName).join(', ');
      throw new Error(`Failed to upload documents: ${failedNames}`);
    }

    return results;
  } catch (error) {
    console.error('Error uploading multiple documents:', error);
    throw error;
  }
};

/**
 * Updates employee documents with validation and error handling
 * @param {Object} params - Parameters object
 * @param {number|string} params.empId - The employee ID
 * @param {Object} params.documents - Object containing document data by type
 * @param {Array} params.documentFields - Array of document field mappings (optional)
 * @param {Function} params.onProgress - Optional progress callback
 * @returns {Promise<Object>} Promise that resolves to upload summary
 */
const updateEmpDocsById = async ({ empId, documents, documentFields, onProgress }) => {
  try {
    if (!empId) {
      throw new Error('Employee ID is required');
    }
    if (!documents || typeof documents !== 'object') {
      throw new Error('Documents object is required');
    }

    // Convert documents object to array format
    const documentsArray = [];
    
    Object.entries(documents).forEach(([key, doc]) => {
      if (doc.file) {
        // Get the apiName from DOCUMENT_FIELDS mapping or doc itself
        let apiName = key; // fallback to key
        
        // First check if doc has apiName property
        if (doc.apiName) {
          apiName = doc.apiName;
        } 
        // Then check if documentFields mapping is provided
        else if (documentFields && Array.isArray(documentFields)) {
          const fieldMapping = documentFields.find(field => field.key === key);
          if (fieldMapping && fieldMapping.apiName) {
            apiName = fieldMapping.apiName;
          }
        }
        
        documentsArray.push({
          docName: apiName,
          docIDNumber: doc.docNumber || '',
          docFile: doc.file
        });
      }
    });

    if (documentsArray.length === 0) {
      throw new Error('No documents to upload');
    }

    // Upload documents
    const results = await updateMultipleDocuments(empId, documentsArray, onProgress);

    return {
      success: true,
      totalUploaded: results.length,
      results: results
    };

  } catch (error) {
    console.error('Error in updateEmpDocsById:', error);
    throw error;
  }
};

/**
 * Helper function to filter documents that need to be uploaded
 * @param {Object} documents - Documents object from component state
 * @returns {Object} Filtered documents that have files to upload
 */
const getDocumentsToUpload = (documents) => {
  const filtered = {};
  Object.entries(documents).forEach(([key, doc]) => {
    if (doc.file) {
      filtered[key] = doc;
    }
  });
  return filtered;
};

/**
 * Helper function to validate documents before upload
 * @param {Object} documents - Documents object to validate
 * @param {Array} documentFields - Document field mappings for validation
 * @returns {Object} Validation result with isValid and errors
 */
const validateDocumentsForUpload = (documents, documentFields = []) => {
  const errors = {};
  let isValid = true;

  Object.entries(documents).forEach(([key, doc]) => {
    if (doc.file) {
      const fieldConfig = documentFields.find(field => field.key === key);
      
      // Check if document number is required and missing
      if (fieldConfig?.hasDocNumber && fieldConfig?.required && !doc.docNumber?.trim()) {
        errors[`${key}DocNumber`] = `${fieldConfig.label} number is required`;
        isValid = false;
      }
      
      // Check file size (5MB limit)
      if (doc.file.size > 5 * 1024 * 1024) {
        errors[`${key}File`] = `File size exceeds 5 MB`;
        isValid = false;
      }
      
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(doc.file.type)) {
        errors[`${key}File`] = `File type not supported. Please upload JPG, PNG, or PDF files.`;
        isValid = false;
      }
    }
  });

  return { isValid, errors };
};

// Export individual functions for flexibility
export {
  updateSingleDocument,
  updateMultipleDocuments,
  getDocumentsToUpload,
  validateDocumentsForUpload
};

// Default export for main function
export default updateEmpDocsById;