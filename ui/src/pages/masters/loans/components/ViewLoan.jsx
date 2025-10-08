import React from 'react';
import { X, ExternalLink, FileText, CheckCircle, XCircle } from 'lucide-react';

const ViewLoan = ({ loan, onClose }) => {
  if (!loan) return null;

  const requiredDocs = loan.requiredDocuments?.filter(doc => doc.isRequired) || [];
  const optionalDocs = loan.requiredDocuments?.filter(doc => !doc.isRequired) || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Loan Details</h2>
            <p className="text-gray-300 text-sm">View loan product information</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Basic Information
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Loan Type</label>
                <div className="text-lg font-medium text-gray-900">{loan.loanType}</div>
              </div>

              {loan.subType && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Sub Type</label>
                  <div className="text-gray-900">{loan.subType}</div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                <div className="flex items-center gap-2">
                  {loan.isActive ? (
                    <>
                      <CheckCircle size={16} className="text-green-500" />
                      <span className="text-green-700 font-medium">Active</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={16} className="text-red-500" />
                      <span className="text-red-700 font-medium">Inactive</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Timestamps
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Created</label>
                <div className="text-gray-900">
                  {new Date(loan.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Last Updated</label>
                <div className="text-gray-900">
                  {new Date(loan.updatedAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Application Links */}
          {loan.links && loan.links.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
                Application Links
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {loan.links.map((link, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                      >
                        {link}
                      </a>
                    </div>
                    <ExternalLink size={16} className="text-blue-500 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Required Documents */}
          {loan.requiredDocuments && loan.requiredDocuments.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
                Document Requirements
              </h3>

              {/* Required Documents */}
              {requiredDocs.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-md font-medium text-red-700 mb-3 flex items-center gap-2">
                    <FileText size={16} />
                    Required Documents ({requiredDocs.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {requiredDocs.map((doc, index) => (
                      <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="font-medium text-red-900">{doc.name}</div>
                        {doc.description && (
                          <div className="text-sm text-red-700 mt-1">{doc.description}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Optional Documents */}
              {optionalDocs.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-blue-700 mb-3 flex items-center gap-2">
                    <FileText size={16} />
                    Optional Documents ({optionalDocs.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {optionalDocs.map((doc, index) => (
                      <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="font-medium text-blue-900">{doc.name}</div>
                        {doc.description && (
                          <div className="text-sm text-blue-700 mt-1">{doc.description}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No Documents Message */}
          {(!loan.requiredDocuments || loan.requiredDocuments.length === 0) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
                Document Requirements
              </h3>
              <div className="text-center py-8 text-gray-500">
                <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No document requirements defined for this loan type.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewLoan;