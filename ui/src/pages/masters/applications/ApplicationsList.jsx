import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
    FileText,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    Download,
    RefreshCw,
    User,
    CreditCard,
    Shield,
    DollarSign
} from 'lucide-react';
import applicationService from '@/services/applicationService';
import TableService from '@/services/TableService';

export default function ApplicationsList() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const isMountedRef = useRef(true);

    // Pagination state for server-side pagination
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
    });

    // Fetch applications function
    const fetchApplications = useCallback(async (tableState) => {
        if (!isMountedRef.current) return;

        try {
            setLoading(true);
            setError(null);

            // Build query parameters from table state
            const params = {
                page: (tableState?.pagination?.pageIndex || 0) + 1,
                limit: tableState?.pagination?.pageSize || 10,
                sortBy: tableState?.sorting?.[0]?.id || 'submittedAt',
                sortOrder: tableState?.sorting?.[0]?.desc ? 'desc' : 'asc',
                ...(tableState?.globalFilter && { search: tableState.globalFilter }),
            };

            // Add column filters
            if (tableState?.columnFilters) {
                tableState.columnFilters.forEach(filter => {
                    params[filter.id] = filter.value;
                });
            }

            console.log('Fetching applications with params:', params);
            const response = await applicationService.getApplications(params);

            console.log('Full API response:', response);

            if (response.success && isMountedRef.current) {
                const applicationsData = response.data || [];
                console.log('Setting applications data:', applicationsData);
                setApplications(applicationsData);
                setPagination({
                    currentPage: response.pagination?.currentPage || 1,
                    totalPages: response.pagination?.totalPages || 1,
                    totalItems: response.pagination?.totalItems || 0,
                    itemsPerPage: response.pagination?.itemsPerPage || 10
                });
                console.log('Applications set successfully:', applicationsData.length, 'items');
            } else if (isMountedRef.current) {
                console.log('API call failed or no success flag:', response);
                setError(response.message || 'Failed to fetch applications');
            }
        } catch (err) {
            console.error('Error fetching applications:', err);
            if (isMountedRef.current) {
                if (err.code === 'ERR_NETWORK' || err.code === 'ERR_INSUFFICIENT_RESOURCES') {
                    setError('Cannot connect to server. Please ensure the API server is running on http://localhost:4000');
                } else {
                    setError('Failed to load applications. Please try again.');
                }
            }
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    }, []); // Empty dependency array to prevent recreation

    // Handle table state changes
    const handleTableStateChange = useCallback((newState) => {
        console.log('Table state changed:', newState);
        fetchApplications(newState);
    }, [fetchApplications]);

    // Initial load
    useEffect(() => {
        fetchApplications();

        return () => {
            isMountedRef.current = false;
        };
    }, [fetchApplications]);

    // Manual refresh function
    const handleRefresh = useCallback(() => {
        fetchApplications();
    }, [fetchApplications]);

    // Status update
    const updateStatus = async (applicationId, newStatus, note = '') => {
        try {
            const response = await applicationService.updateApplicationStatus(applicationId, newStatus, note);

            if (response.success) {
                handleRefresh(); // Refresh the list
                if (selectedApplication?.applicationId === applicationId) {
                    const updatedApp = await applicationService.getApplication(applicationId);
                    setSelectedApplication(updatedApp.data);
                }
            } else {
                alert('Failed to update status: ' + response.message);
            }
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update status. Please try again.');
        }
    };

    // View application details
    const viewDetails = async (applicationId) => {
        try {
            const response = await applicationService.getApplication(applicationId);
            if (response.success) {
                setSelectedApplication(response.data);
                setShowDetails(true);
            }
        } catch (err) {
            console.error('Error fetching application details:', err);
            alert('Failed to load application details.');
        }
    };

    // Handle row click
    const handleRowClick = (row) => {
        viewDetails(row.original.applicationId);
    };

    // Get status badge
    const getStatusBadge = (status) => {
        const statusConfig = {
            'pending': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
            'under-review': { color: 'bg-blue-100 text-blue-800', icon: Eye },
            'approved': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
            'rejected': { color: 'bg-red-100 text-red-800', icon: XCircle },
            'cancelled': { color: 'bg-gray-100 text-gray-800', icon: AlertCircle }
        };

        const config = statusConfig[status] || statusConfig['pending'];
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                <Icon size={12} />
                {status.replace('-', ' ').toUpperCase()}
            </span>
        );
    };

    // Get service icon
    const getServiceIcon = (serviceType) => {
        const icons = {
            'credit-card': CreditCard,
            'insurance': Shield,
            'loan': DollarSign
        };
        return icons[serviceType] || FileText;
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Define table columns
    const columns = useMemo(() => [
      
        {
            id: 'serviceType',
            header: 'Service Type',
            accessorKey: 'serviceType',
            cell: ({ row }) => (
                <div>
                    <div className="text-sm font-medium text-gray-900">
                        {row.original.serviceType.replace('-', ' ').toUpperCase()}
                    </div>
                    {row.original.subType && (
                        <div className="text-sm text-gray-500">
                            {row.original.subType.toUpperCase()}
                        </div>
                    )}
                </div>
            ),
            enableSorting: true,
            enableColumnFilter: true,
        },
        {
            id: 'applicantDetails',
            header: 'Applicant Details',
            accessorKey: 'fullName',
            cell: ({ row }) => (
                <div>
                    <div className="text-sm font-medium text-gray-900">{row.original.fullName}</div>
                    <div className="text-sm text-gray-500">PAN: {row.original.panNumber}</div>
                    {row.original.dateOfBirth && (
                        <div className="text-sm text-gray-500">
                            DOB: {new Date(row.original.dateOfBirth).toLocaleDateString()}
                        </div>
                    )}
                </div>
            ),
            enableSorting: true,
            enableColumnFilter: true,
        },
        {
            id: 'contactInfo',
            header: 'Contact Info',
            accessorKey: 'mobileNumber',
            cell: ({ row }) => (
                <div>
                    <div className="text-sm text-gray-900">{row.original.mobileNumber}</div>
                    <div className="text-sm text-gray-500">{row.original.location}</div>
                    {row.original.aadhaarNumber && (
                        <div className="text-sm text-gray-500">
                            Aadhaar: {row.original.aadhaarNumber.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3')}
                        </div>
                    )}
                </div>
            ),
            enableSorting: false,
            enableColumnFilter: true,
        },
        {
            id: 'financialInfo',
            header: 'Financial Info',
            cell: ({ row }) => (
                <div>
                    {row.original.monthlyIncome && (
                        <div className="text-sm font-medium text-gray-900">
                            ₹{row.original.monthlyIncome.toLocaleString()}/month
                        </div>
                    )}
                    {row.original.employmentType && (
                        <div className="text-sm text-gray-500 capitalize">
                            {row.original.employmentType}
                        </div>
                    )}
                    {row.original.companyName && (
                        <div className="text-sm text-gray-500">
                            {row.original.companyName}
                        </div>
                    )}
                    {row.original.workExperience && (
                        <div className="text-sm text-gray-500">
                            {row.original.workExperience} years exp.
                        </div>
                    )}
                    {row.original.creditScore && (
                        <div className="text-sm text-blue-600 font-medium">
                            CIBIL: {row.original.creditScore}
                        </div>
                    )}
                </div>
            ),
            enableSorting: false,
            enableColumnFilter: false,
        },
        {
            id: 'serviceDetails',
            header: 'Service Details',
            cell: ({ row }) => (
                <div>
                    {/* Credit Card Details */}
                    {row.original.serviceType === 'credit-card' && (
                        <div>
                            {row.original.selectedCard?.name && (
                                <div className="text-sm font-medium text-gray-900">
                                    {row.original.selectedCard.name}
                                </div>
                            )}
                            {row.original.selectedCard?.bank && (
                                <div className="text-sm text-gray-500">
                                    {row.original.selectedCard.bank}
                                </div>
                            )}
                            {row.original.selectedCard?.limit && (
                                <div className="text-sm text-gray-500">
                                    Limit: {row.original.selectedCard.limit}
                                </div>
                            )}
                            {row.original.preApproved && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                                    Pre-approved
                                </span>
                            )}
                        </div>
                    )}

                    {/* Insurance Details */}
                    {row.original.serviceType === 'insurance' && (
                        <div>
                            {row.original.coverageAmount && (
                                <div className="text-sm font-medium text-gray-900">
                                    ₹{row.original.coverageAmount.toLocaleString()}
                                </div>
                            )}
                            {row.original.nomineeDetails && (
                                <div className="text-sm text-gray-500">
                                    Nominee: {row.original.nomineeDetails}
                                </div>
                            )}
                            {row.original.subType === 'vehicle' && (
                                <div className="text-sm text-gray-500">
                                    {row.original.vehicleModel} ({row.original.vehicleYear})
                                    <br />
                                    {row.original.vehicleNumber}
                                </div>
                            )}
                            {row.original.subType === 'property' && (
                                <div className="text-sm text-gray-500">
                                    {row.original.propertyType}
                                    <br />
                                    ₹{row.original.propertyValue?.toLocaleString()}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Loan Details */}
                    {row.original.serviceType === 'loan' && (
                        <div>
                            {row.original.loanAmount && (
                                <div className="text-sm font-medium text-gray-900">
                                    ₹{row.original.loanAmount.toLocaleString()}
                                </div>
                            )}
                            {row.original.loanPurpose && (
                                <div className="text-sm text-gray-500">
                                    {row.original.loanPurpose.length > 30
                                        ? row.original.loanPurpose.substring(0, 30) + '...'
                                        : row.original.loanPurpose
                                    }
                                </div>
                            )}
                            {row.original.subType === 'business' && (
                                <div className="text-sm text-gray-500">
                                    {row.original.businessType}
                                    {row.original.businessAge && ` (${row.original.businessAge}y)`}
                                    {row.original.annualTurnover && (
                                        <div>Turnover: ₹{row.original.annualTurnover.toLocaleString()}</div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ),
            enableSorting: false,
            enableColumnFilter: false,
        },
        {
            id: 'status',
            header: 'Status',
            accessorKey: 'status',
            cell: ({ row }) => (
                <div>
                    {getStatusBadge(row.original.status)}
                    {row.original.reviewedAt && (
                        <div className="text-xs text-gray-500 mt-1">
                            Reviewed: {formatDate(row.original.reviewedAt)}
                        </div>
                    )}
                </div>
            ),
            enableSorting: true,
            enableColumnFilter: true,
        },
        {
            id: 'submittedAt',
            header: 'Submitted Date',
            accessorKey: 'submittedAt',
            cell: ({ row }) => (
                <div>
                    <div className="text-sm text-gray-900">
                        {formatDate(row.original.submittedAt)}
                    </div>
                    {row.original.createdAt && row.original.createdAt !== row.original.submittedAt && (
                        <div className="text-xs text-gray-500">
                            Created: {formatDate(row.original.createdAt)}
                        </div>
                    )}
                </div>
            ),
            enableSorting: true,
            enableColumnFilter: false,
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex flex-col gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            viewDetails(row.original.applicationId);
                        }}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded flex items-center gap-1"
                        title="View Details"
                    >
                        <Eye size={14} />
                        <span className="text-xs">View</span>
                    </button>
                    <select
                        value={row.original.status}
                        onChange={(e) => {
                            e.stopPropagation();
                            updateStatus(row.original.applicationId, e.target.value);
                        }}
                        className="text-xs border border-gray-300 rounded px-1 py-1 w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <option value="pending">Pending</option>
                        <option value="under-review">Under Review</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            ),
            enableSorting: false,
            enableColumnFilter: false,
        },
    ], []);

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Applications Management</h1>
                    <p className="text-gray-600">Manage and review all application submissions</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        <Download size={16} />
                        Export
                    </button>
                </div>
            </div>

            {/* Applications Table */}
            <div className="bg-white rounded-lg shadow-sm  overflow-hidden">
                {error ? (
                    <div className="flex flex-col justify-center items-center py-12">
                        <AlertCircle size={48} className="text-red-500 mb-4" />
                        <span className="text-red-600 text-center max-w-md mb-4">{error}</span>
                        <button
                            onClick={handleRefresh}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : (
                    <TableService
                        columns={columns}
                        data={applications}
                        loading={loading}
                        serverPagination={true}
                        pageCount={pagination.totalPages}
                        totalItems={pagination.totalItems}
                        totalPages={pagination.totalPages}
                        currentPage={pagination.currentPage}
                        onStateChange={handleTableStateChange}
                        onRowClick={handleRowClick}
                        initialPageSize={10}
                    />
                )}
            </div>

            {/* Application Details Modal */}
            {showDetails && selectedApplication && (
                <ApplicationDetailsModal
                    application={selectedApplication}
                    onClose={() => setShowDetails(false)}
                    onStatusUpdate={(status, note) => {
                        updateStatus(selectedApplication.applicationId, status, note);
                    }}
                />
            )}
        </div>
    );
}

// Application Details Modal Component
function ApplicationDetailsModal({ application, onClose, onStatusUpdate }) {
    const [note, setNote] = useState('');
    const [newStatus, setNewStatus] = useState(application.status);

    const handleStatusUpdate = () => {
        onStatusUpdate(newStatus, note);
        setNote('');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">
                            Application Details - {application.applicationId}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <XCircle size={24} />
                        </button>
                    </div>

                    {/* Application Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <User size={20} />
                                Personal Information
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                <div><strong>Full Name:</strong> {application.fullName}</div>
                                <div><strong>PAN Number:</strong> {application.panNumber}</div>
                                <div><strong>Aadhaar Number:</strong> {application.aadhaarNumber}</div>
                                <div><strong>Date of Birth:</strong> {new Date(application.dateOfBirth).toLocaleDateString()}</div>
                                <div><strong>Mobile:</strong> {application.mobileNumber}</div>
                                <div><strong>Location:</strong> {application.location}</div>
                                <div><strong>Address:</strong> {application.currentAddress}</div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <FileText size={20} />
                                Application Details
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                <div><strong>Application ID:</strong> {application.applicationId}</div>
                                <div><strong>Service Type:</strong> {application.serviceType.replace('-', ' ').toUpperCase()}</div>
                                {application.subType && <div><strong>Sub Type:</strong> {application.subType.toUpperCase()}</div>}
                                <div><strong>Status:</strong> {application.status.replace('-', ' ').toUpperCase()}</div>
                                <div><strong>Submitted:</strong> {new Date(application.submittedAt).toLocaleString()}</div>
                                {application.reviewedAt && <div><strong>Reviewed:</strong> {new Date(application.reviewedAt).toLocaleString()}</div>}
                                {application.reviewedBy && <div><strong>Reviewed By:</strong> {application.reviewedBy.firstName} {application.reviewedBy.lastName}</div>}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <DollarSign size={20} />
                                Financial Information
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                {application.monthlyIncome && <div><strong>Monthly Income:</strong> ₹{application.monthlyIncome.toLocaleString()}</div>}
                                {application.employmentType && <div><strong>Employment Type:</strong> {application.employmentType.toUpperCase()}</div>}
                                {application.companyName && <div><strong>Company:</strong> {application.companyName}</div>}
                                {application.workExperience && <div><strong>Work Experience:</strong> {application.workExperience} years</div>}
                                {application.creditScore && <div><strong>Credit Score:</strong> {application.creditScore}</div>}
                            </div>
                        </div>
                    </div>

                    {/* Service Specific Details */}
                    {application.serviceType === 'credit-card' && application.selectedCard && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Credit Card Details</h3>
                            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                                <div><strong>Card:</strong> {application.selectedCard.name}</div>
                                <div><strong>Bank:</strong> {application.selectedCard.bank}</div>
                                <div><strong>Limit:</strong> {application.selectedCard.limit}</div>
                                {application.preApproved && <div><strong>Pre-approved:</strong> Yes</div>}
                            </div>
                        </div>
                    )}

                    {application.serviceType === 'insurance' && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Insurance Details</h3>
                            <div className="bg-green-50 p-4 rounded-lg space-y-2">
                                {application.coverageAmount && <div><strong>Coverage Amount:</strong> ₹{application.coverageAmount.toLocaleString()}</div>}
                                {application.nomineeDetails && <div><strong>Nominee:</strong> {application.nomineeDetails}</div>}
                                {application.medicalHistory && <div><strong>Medical History:</strong> {application.medicalHistory}</div>}
                                {application.subType === 'vehicle' && (
                                    <>
                                        {application.vehicleNumber && <div><strong>Vehicle Number:</strong> {application.vehicleNumber}</div>}
                                        {application.vehicleModel && <div><strong>Vehicle Model:</strong> {application.vehicleModel}</div>}
                                        {application.vehicleYear && <div><strong>Vehicle Year:</strong> {application.vehicleYear}</div>}
                                    </>
                                )}
                                {application.subType === 'property' && (
                                    <>
                                        {application.propertyType && <div><strong>Property Type:</strong> {application.propertyType}</div>}
                                        {application.propertyValue && <div><strong>Property Value:</strong> ₹{application.propertyValue.toLocaleString()}</div>}
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {application.serviceType === 'loan' && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Loan Details</h3>
                            <div className="bg-yellow-50 p-4 rounded-lg space-y-2">
                                {application.loanAmount && <div><strong>Loan Amount:</strong> ₹{application.loanAmount.toLocaleString()}</div>}
                                {application.loanPurpose && <div><strong>Loan Purpose:</strong> {application.loanPurpose}</div>}
                                {application.collateral && <div><strong>Collateral:</strong> {application.collateral}</div>}
                                {application.subType === 'business' && (
                                    <>
                                        {application.businessType && <div><strong>Business Type:</strong> {application.businessType}</div>}
                                        {application.businessAge && <div><strong>Business Age:</strong> {application.businessAge} years</div>}
                                        {application.annualTurnover && <div><strong>Annual Turnover:</strong> ₹{application.annualTurnover.toLocaleString()}</div>}
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Status Update Section */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Update Status</h3>
                        <div className="flex gap-4 items-end">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="under-review">Under Review</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div className="flex-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Note (Optional)</label>
                                <input
                                    type="text"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Add a note about this status change..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <button
                                onClick={handleStatusUpdate}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Update
                            </button>
                        </div>
                    </div>

                    {/* Notes History */}
                    {application.notes && application.notes.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes History</h3>
                            <div className="space-y-2">
                                {application.notes.map((note, index) => (
                                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                        <div className="text-sm text-gray-600">
                                            {new Date(note.addedAt).toLocaleString()} - {note.addedBy?.firstName} {note.addedBy?.lastName}
                                        </div>
                                        <div className="text-gray-900">{note.note}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}