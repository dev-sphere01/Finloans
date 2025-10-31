import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, CheckCircle, AlertCircle, Users, Download } from 'lucide-react';
import ExcelMapper from '@/services/ExcelMappingService';
import callingService from '@/services/callingService';
import { ActionButton } from '@/components/permissions';

const BulkUpload = () => {
  const navigate = useNavigate();
  const [mappedData, setMappedData] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  const [error, setError] = useState('');

  // Define the predefined fields for lead mapping
  const predefinedFields = [
    {
      key: 'name',
      label: 'Name',
      required: true,
      variations: ['name', 'names', 'full name', 'full_name', 'customer name', 'lead name', 'client name']
    },
    {
      key: 'contactNo',
      label: 'Contact Number',
      required: true,
      variations: ['contact', 'phone', 'mobile', 'phone number', 'mobile number', 'contact number', 'contactno', 'contact_no']
    },
    {
      key: 'email',
      label: 'Email',
      required: false,
      variations: ['email', 'email address', 'mail', 'e-mail', 'email_address']
    },
    {
      key: 'selectedService',
      label: 'Service',
      required: true,
      variations: ['service', 'services', 'selected service', 'selectedservice', 'selected_service', 'product', 'requirement']
    },
    {
      key: 'serviceSubcategory',
      label: 'Service Subcategory',
      required: false,
      variations: ['subcategory', 'sub category', 'service subcategory', 'service_subcategory', 'category']
    },
    {
      key: 'notes',
      label: 'Notes',
      required: false,
      variations: ['notes', 'note', 'remarks', 'comments', 'description', 'details']
    }
  ];

  // Callback function to receive data from ExcelMapper
  const handleDataChange = useCallback((newData) => {
    setMappedData(newData);
    setError('');
    setUploadResults(null);
  }, []);

  // Reset function for ExcelMapper
  const handleFileReset = useCallback(() => {
    setMappedData([]);
    setError('');
    setUploadResults(null);
  }, []);

  // Download template function
  const downloadTemplate = useCallback(() => {
    // Create a comprehensive CSV template with sample data
    const csvContent = `Name,Contact Number,Email,Service,Service Subcategory,Notes
John Doe,9876543210,john.doe@example.com,Personal Loan,Home Loan,Interested in home loan for property purchase
Jane Smith,9876543211,jane.smith@example.com,Credit Card,Premium Card,Looking for premium credit card with rewards
Mike Johnson,9876543212,mike.johnson@example.com,Insurance,Health Insurance,Health insurance inquiry for family coverage
Sarah Wilson,9876543213,sarah.wilson@example.com,Business Loan,SME Loan,Small business expansion loan requirement
David Brown,9876543214,david.brown@example.com,Investment,Mutual Funds,Investment planning and mutual fund options
Lisa Davis,9876543215,lisa.davis@example.com,Car Loan,New Car Loan,Looking for car loan with competitive interest rates`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'leads_bulk_upload_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, []);

  // Handle bulk upload to server
  const handleBulkUpload = async () => {
    if (mappedData.length === 0) {
      setError('No data to upload. Please map your file first.');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      console.log(`Starting bulk upload of ${mappedData.length} leads`);
      
      // Show progress for large uploads
      if (mappedData.length > 1000) {
        console.log('Large dataset detected, processing in chunks...');
      }

      const response = await callingService.bulkCreateLeads(mappedData);

      setUploadResults(response.results || response);

      // Show success message
      if (response.results) {
        const { success, failed, total } = response.results;
        console.log(`Upload completed: ${success}/${total} successful, ${failed} failed`);
        
        // if (success > 0) {
        //   // Auto-redirect after successful upload
        //   setTimeout(() => {
        //     navigate('/dashboard/calling-management');
        //   }, 3000);
        // }
      }
    } catch (error) {
      console.error('Bulk upload error:', error);
      setError(error.response?.data?.error || error.message || 'Failed to upload leads. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard/calling-management')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Calling Management
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">Bulk Upload Leads</h1>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={downloadTemplate}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
              >
                <Download className="h-4 w-4" />
                <span>Download Template</span>
              </button>

              {mappedData.length > 0 && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{mappedData.length} leads ready</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Instructions */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-medium text-gray-900 mb-3">Upload Instructions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Required Fields</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>Name:</strong> Full name of the lead</li>
                  <li>• <strong>Contact Number:</strong> 10-digit mobile number</li>
                  <li>• <strong>Service:</strong> Service they're interested in</li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Optional Fields</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>Email:</strong> Email address</li>
                  <li>• <strong>Service Subcategory:</strong> Specific service type</li>
                  <li>• <strong>Notes:</strong> Additional information</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Tip:</strong> The system will automatically map your columns based on common header names.
                You can manually adjust the mapping if needed.
              </p>
            </div>
          </div>

          {/* Excel Mapper Component */}
          <ExcelMapper
            predefinedFields={predefinedFields}
            onDataChange={handleDataChange}
            onFileReset={handleFileReset}
            debugMode={false}
            exportJsonEnabled={false}
          />

          {/* Upload Actions */}
          {mappedData.length > 0 && (
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">
                      {mappedData.length} leads ready for upload
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleFileReset}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Reset
                  </button>

                  <ActionButton
                    module="calling_admin"
                    action="bulk_import"
                    label="Upload"
                    onClick={handleBulkUpload}
                    disabled={isUploading || mappedData.length === 0}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        <span>Upload {mappedData.length} Leads</span>
                      </>
                    )}
                  </ActionButton>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-6 border-t border-gray-200">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Upload Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Upload Results */}
          {uploadResults && (
            <div className="p-6 border-t border-gray-200">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Upload Results</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {uploadResults.total || mappedData.length}
                    </div>
                    <div className="text-sm text-blue-700">Total Processed</div>
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {uploadResults.success || 0}
                    </div>
                    <div className="text-sm text-green-700">Successfully Created</div>
                  </div>

                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {uploadResults.failed || 0}
                    </div>
                    <div className="text-sm text-red-700">Failed</div>
                  </div>
                </div>

                {uploadResults.errors && uploadResults.errors.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Errors:</h4>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                      {uploadResults.errors.map((error, index) => (
                        <div key={index} className="text-sm text-red-700 mb-1">
                          Row {error.row}: {error.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {uploadResults.success > 0 && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-sm text-green-700">
                        Upload completed successfully!
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkUpload;