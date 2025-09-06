import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, User, Building, GraduationCap, CreditCard, Settings, Eye, FileText } from 'lucide-react';
import EmployeeService from '@/services/Employees/employees';
import getBankById from '@/services/Employees/getBankById';
import getAcadById from '@/services/Employees/getAcadById';
import getDocsById from '@/services/Employees/getDocsById';
import {getProfById} from '@/services/Employees/empProfileDetails';
import getBaseFileURL from '@/utils/getBaseFileURL';
import PreviewModal from './PreviewModal';  

const EmployeeDetails = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [bankDetails, setBankDetails] = useState(null);
  const [academicDetails, setAcademicDetails] = useState(null);
  const [documentDetails, setDocumentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bankLoading, setBankLoading] = useState(false);
  const [bankError, setBankError] = useState(null);
  const [academicLoading, setAcademicLoading] = useState(false);
  const [academicError, setAcademicError] = useState(null);
  const [professionalDetails, setProfessionalDetails] = useState(null);
  const [professionalLoading, setProfessionalLoading] = useState(false);
  const [professionalError, setProfessionalError] = useState(null);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [documentError, setDocumentError] = useState(null);
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    documentUrl: '',
    documentName: ''
  });

  const fetchEmployeeDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await EmployeeService.getEmployeeById(id);
      console.log('Employee details:', response);
      setEmployee(response);

      // Fetch bank, academic, and document details after getting employee details
      if (response && response.EmpID) {
        fetchBankDetails(response.EmpID);
        fetchAcademicDetails(response.EmpID);
        fetchDocumentDetails(response.EmpID);
      }
    } catch (error) {
      console.error('Error fetching employee details:', error);
      setError(error.message || 'Failed to fetch employee details');
    } finally {
      setLoading(false);
    }
  };

  const fetchBankDetails = async (empId) => {
    try {
      setBankLoading(true);
      setBankError(null);
      const bankData = await getBankById(empId);
      console.log('Bank details:', bankData);
      setBankDetails(bankData);
    } catch (error) {
      console.error('Error fetching bank details:', error);
      setBankError(error.message || 'Failed to fetch bank details');
      setBankDetails(null);
    } finally {
      setBankLoading(false);
    }
  };

  const fetchAcademicDetails = async (empId) => {
    try {
      setAcademicLoading(true);
      setAcademicError(null);
      const academicData = await getAcadById(empId);
      console.log('Academic details:', academicData);
      setAcademicDetails(academicData);
    } catch (error) {
      console.error('Error fetching academic details:', error);
      setAcademicError(error.message || 'Failed to fetch academic details');
      setAcademicDetails(null);
    } finally {
      setAcademicLoading(false);
    }
  };

  const fetchDocumentDetails = async (empId) => {
    try {
      setDocumentLoading(true);
      setDocumentError(null);
      const documentData = await getDocsById(empId);
      console.log('Document details:', documentData);
      setDocumentDetails(documentData);
    } catch (error) {
      console.error('Error fetching document details:', error);
      setDocumentError(error.message || 'Failed to fetch document details');
      setDocumentDetails(null);
    } finally {
      setDocumentLoading(false);
    }
  };

  const fetchProfessionalDetails = async (empId) => {
    try {
      setProfessionalLoading(true);
      setProfessionalError(null);
      const professionalData = await getProfById(empId);
      console.log('Professional details:', professionalData);
      setProfessionalDetails(professionalData);
    } catch (error) {
      console.error('Error fetching professional details:', error);
      setProfessionalError(error.message || 'Failed to fetch professional details');
      setProfessionalDetails(null);
    } finally {
      setProfessionalLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeDetails();
    fetchBankDetails(id);
    fetchAcademicDetails(id);
    fetchDocumentDetails(id);
    fetchProfessionalDetails(id);
  }, [id]);

  const handlePreviewDocument = (documentPath, documentName) => {
    const baseUrl = getBaseFileURL();
    const fullUrl = `${baseUrl}${documentPath}`;
    console.log('Preview URL:', fullUrl); // Debug log
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
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading employee details...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            to="/dashboard/all-employees"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to All Employees
          </Link>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Employee Not Found</h2>
          <p className="text-gray-600 mb-4">The employee with ID {id} could not be found.</p>
          <Link
            to="/dashboard/all-employees"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to All Employees
          </Link>
        </div>
      </div>
    );
  }

  const InfoCard = ({ title, icon: Icon, children, className = "" }) => (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Icon className="text-blue-600" size={20} />
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );

  const InfoRow = ({ label, value }) => (
    <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 last:border-b-0">
      <span className="font-medium text-gray-700 mb-1 sm:mb-0">{label}:</span>
      <span className="text-gray-600">{value || 'Not provided'}</span>
    </div>
  );

  const InfoRowWithPreview = ({ label, value, documentPath, documentName, onPreview }) => (
    <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 last:border-b-0">
      <span className="font-medium text-gray-700 mb-1 sm:mb-0">{label}:</span>
      <div className="flex items-center gap-2">
        <span className="text-gray-600">{value || 'Not provided'}</span>
        {documentPath && (
          <button
            onClick={() => onPreview(documentPath, documentName)}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
          >
            <Eye size={12} />
            Preview
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/dashboard/all-employees"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to All Employees
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          {employee.FirstName} {employee.LastName}
        </h1>
        <p className="text-gray-600">EMP{employee.EmpID.toString().padStart(3, '0')} • Role ID: {employee.RoleID} • Status: {employee.IsActive ? 'Active' : 'Inactive'}</p>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Basic Information */}
        <InfoCard title="Basic Information" icon={User} className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <div className="space-y-2">
              <InfoRow label="First Name" value={employee.FirstName} />
              <InfoRow label="Last Name" value={employee.LastName} />
              <InfoRow label="Personal Email" value={employee.PersonalEmail} />
              <InfoRow label="Work Email" value={employee.WorkEmail} />
              <InfoRow label="Phone Number" value={employee.PhoneNumber} />
              <InfoRow label="Employee ID" value={`EMP${employee.EmpID.toString().padStart(3, '0')}`} />
            </div>
            <div className="space-y-2">
              <InfoRow label="Address" value={employee.Address} />
              <InfoRow label="Emergency Contact" value={employee.EmergencyContact} />
              <InfoRow label="Emergency Phone" value={employee.EmergencyContactNumber} />
              <InfoRow label="Date of Birth" value={employee.DateOfBirth ? new Date(employee.DateOfBirth).toLocaleDateString() : 'Not provided'} />
              <InfoRow label="Gender" value={employee.Gender} />
              <InfoRow label="Date of Joining" value={employee.DateOfJoining ? new Date(employee.DateOfJoining).toLocaleDateString() : 'Not provided'} />
            </div>
          </div>
        </InfoCard>

        {/* Bank Information */}
        <InfoCard title="Bank Information" icon={CreditCard} className="lg:col-span-2">
          {bankLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading bank information...</p>
            </div>
          ) : bankError ? (
            <div className="text-center py-8">
              <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No bank information found for this employee.</p>
              <p className="text-sm text-gray-400 mt-2">Bank details may not have been added yet.</p>
            </div>
          ) : bankDetails ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              <div className="space-y-2">
                <InfoRow label="Bank Name" value={bankDetails.BankName} />
                <InfoRow label="Account Number" value={bankDetails.AccountNumber} />
                <InfoRow label="IFSC Code" value={bankDetails.IFSCCode} />
              </div>
              <div className="space-y-2">
                <InfoRow label="Branch Name" value={bankDetails.BranchName} />
                <InfoRow label="Bank Detail ID" value={bankDetails.EbdID} />
                <InfoRowWithPreview
                  label="Cancelled Cheque"
                  value={bankDetails.CancelledCheque ? 'Uploaded' : 'Not uploaded'}
                  documentPath={bankDetails.CancelledCheque}
                  documentName="Cancelled Cheque"
                  onPreview={handlePreviewDocument}
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No bank information found for this employee.</p>
              <p className="text-sm text-gray-400 mt-2">Bank details may not have been added yet.</p>
            </div>
          )}
        </InfoCard>

        {/* Academic Information */}
        <InfoCard title="Academic Information" icon={GraduationCap} className="lg:col-span-2">
          {academicLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading academic information...</p>
            </div>
          ) : academicError ? (
            <div className="text-center py-8">
              <GraduationCap className="mx-auto h-12 w-12 text-red-400 mb-4" />
              <p className="text-red-500">Failed to load academic information</p>
              <p className="text-sm text-gray-400 mt-2">{academicError}</p>
            </div>
          ) : academicDetails && academicDetails.length > 0 ? (
            <div className="space-y-4">
              {academicDetails.map((academic, index) => (
                <div key={academic.EadID || index} className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoRow label="Degree" value={academic.Degree} />
                    <InfoRow label="Institution" value={academic.Institution} />
                    <InfoRow label="Year of Passing" value={academic.YearOfPassing} />
                    <InfoRow label="Grade" value={academic.Grade} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <GraduationCap className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No academic information found for this employee.</p>
              <p className="text-sm text-gray-400 mt-2">Academic details may not have been added yet.</p>
            </div>
          )}
        </InfoCard>

        {/* Professional Information */}
        <InfoCard title="Professional Information" icon={Settings} className="lg:col-span-2">
          {professionalLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading professional information...</p>
            </div>
          ) : professionalError ? (
            <div className="text-center py-8">
              <Settings className="mx-auto h-12 w-12 text-red-400 mb-4" />
              <p className="text-red-500">Failed to load professional information</p>
              <p className="text-sm text-gray-400 mt-2">{professionalError}</p>
            </div>
          ) : professionalDetails && professionalDetails.length > 0 ? (
            <div className="space-y-4">
              {professionalDetails.map((prof, index) => (
                <div key={prof.EpdID || index} className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoRow label="Previous Company" value={prof.PreviousCompany} />
                    <InfoRow label="Previous Position" value={prof.PreviousPosition} />
                    <InfoRow label="Previous Experience" value={prof.PreviousExperience} />
                    <InfoRowWithPreview
                      label="Experience Certificate"
                      value={prof.PreviousExperienceCeritificate ? 'Uploaded' : 'Not uploaded'}
                      documentPath={prof.PreviousExperienceCeritificate}
                      documentName="Experience Certificate"
                      onPreview={handlePreviewDocument}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Settings className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No professional information found for this employee.</p>
              <p className="text-sm text-gray-400 mt-2">Professional details may not have been added yet.</p>
            </div>
          )}
        </InfoCard>

        {/* Documents */}
        <InfoCard title="Documents" icon={FileText} className="lg:col-span-2">
          {documentLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading documents...</p>
            </div>
          ) : documentError ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">Failed to load documents</p>
              <p className="text-sm text-gray-400 mt-2">Documents may not have been added yet.</p>
            </div>
          ) : documentDetails && documentDetails.length > 0 ? (
            <div className="space-y-4">
              {documentDetails.map((document, index) => (
                <div key={document.EmpDocId || index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-2">{document.DocName}</h4>
                      <div className="space-y-1">
                        <InfoRow label="Document Number" value={document.DocIDNumber} />
                        <div className="flex flex-col sm:flex-row sm:justify-between py-2">
                          <span className="font-medium text-gray-700 mb-1 sm:mb-0">Document:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">Available</span>
                            <button
                              onClick={() => handlePreviewDocument(document.DocPath, document.DocName)}
                              className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                            >
                              <Eye size={14} />
                              Preview
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No documents found for this employee.</p>
              <p className="text-sm text-gray-400 mt-2">Documents may not have been uploaded yet.</p>
            </div>
          )}
        </InfoCard>
      </div>

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

export default EmployeeDetails;