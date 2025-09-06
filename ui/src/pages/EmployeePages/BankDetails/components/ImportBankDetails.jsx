import ExcelImportService from '@/services/ExcelMappingService';
import React, { useState, useCallback } from 'react';
import BankService from '@/services/Bank/bank';
import { Upload, CheckCircle, AlertCircle, Loader2, FileSpreadsheet, Download } from 'lucide-react';
import BulkBankTemplate from '@/templates/Bulk_Bank_Import_Template.xlsx';

const ImportBankDetails = () => {
    const [myData, setMyData] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null);
    const [uploadMessage, setUploadMessage] = useState('');

    const predefinedFields = [
        { key: 'empID', label: 'Employee ID', required: true, variations: ['employee id', 'Employee Id', 'EmployeeID', 'Empid', 'empid', 'EMPLOYEE ID', 'EMPLOYEE ID', 'EmpID'] },
        { key: 'bankName', label: 'Bank Name', required: true, variations: ['bank name', 'Bank Name', 'Bank', 'Name', 'bank', 'names', 'name', 'BANK NAME', 'NAMES'] },
        { key: 'accountNumber', label: 'Account Number', required: true, variations: ['account number', 'Account Number', 'Account', 'Number', 'account', 'number', 'ACCOUNT NUMBER', 'ACCOUNT NUMBER', 'AC No.'] },
        { key: 'ifscCode', label: 'IFSC Code', required: true, variations: ['ifsc code', 'IFSC Code', 'IFSC', 'Code', 'ifsc', 'code', 'IFSC CODE', 'IFSC CODE'] },
        { key: 'branchName', label: 'Branch Name', required: false, variations: ['branch name', 'Branch Name', 'Branch', 'Name', 'branch', 'name', 'BRANCH NAME', 'BRANCH NAME'] }
    ];

    const handleDataChange = useCallback((newData) => {
        setMyData(newData);
        setUploadStatus(null); // Reset status when new data is loaded
        setUploadMessage('');
        console.log('Received Data:', newData);
    }, []);

    const handleUpload = async () => {
        if (!myData || myData.length === 0) {
            setUploadStatus('error');
            setUploadMessage('No data to upload');
            return;
        }

        setIsUploading(true);
        setUploadStatus(null);
        setUploadMessage('');

        try {
            const result = await BankService.importBankDetails(myData);
            setUploadStatus('success');
            setUploadMessage(`Successfully uploaded ${myData.length} bank details`);
            console.log('Upload successful:', result);
        } catch (error) {
            setUploadStatus('error');
            setUploadMessage(error.message || 'Failed to upload bank details');
            console.error('Upload failed:', error);
        } finally {
            setIsUploading(false);
        }
    };

      // Download template function
      const downloadTemplate = () => {
        //date and time for file name
        const now = new Date();
        const date = now.toISOString().split('T')[0]; // YYYY-MM-DD format
        const time = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS format
        const filename = `Import_Employee_${date}_${time}.xlsx`;
    
        const link = document.createElement('a');
        link.href = BulkBankTemplate;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden p-3">
            <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  {/* Left Column - Excel Import Service */}
                <ExcelImportService
                    predefinedFields={predefinedFields}
                    onDataChange={handleDataChange}
                    debugMode={false}
                    exportJsonEnabled={false}
                />  
                </div>
                

                {/* Download Template Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5 text-gray-600" />
                        Template
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Download the Excel template with the correct column headers and format.
                    </p>
                    <button
                        onClick={downloadTemplate}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium p-2 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                    >
                        <Download className="w-4 h-4" />
                        Download Template
                    </button>
                </div>
            </div>

            {/* Upload Section */}
            {myData && myData.length > 0 && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            {myData.length} bank detail{myData.length !== 1 ? 's' : ''} ready to upload
                        </div>
                        <button
                            onClick={handleUpload}
                            disabled={isUploading}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${isUploading
                                    ? 'bg-gray-400 text-white cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4" />
                                    Upload Bank Details
                                </>
                            )}
                        </button>
                    </div>

                    {/* Status Message */}
                    {uploadStatus && (
                        <div className={`mt-3 p-3 rounded-md text-sm flex items-center gap-2 ${uploadStatus === 'success'
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                            {uploadStatus === 'success' ? (
                                <CheckCircle className="w-4 h-4" />
                            ) : (
                                <AlertCircle className="w-4 h-4" />
                            )}
                            {uploadMessage}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default ImportBankDetails