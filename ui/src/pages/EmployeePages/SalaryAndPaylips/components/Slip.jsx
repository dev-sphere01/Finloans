import { useEffect, useState } from 'react';
import { Download, FileText } from 'lucide-react';
import Logo from '@/assets/images/CUPL_Watermark.png';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount ?? 0);
};

const formatNumber = (num) => {
    if (typeof num === 'string') return num;
    if (num == null) return '-';
    return num.toString();
};

// Added optional autoExport prop to trigger PDF generation on mount
const Slip = ({ data, autoExport = false }) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const handlePDFExport = async () => {
        setIsGenerating(true);

        try {
            // Create a new window with the payslip content for printing
            const printWindow = window.open('', '_blank');
            const payslipElement = document.getElementById('payslip-content');

            printWindow.document.write(`
        <html>
          <head>
            <title>Payslip - ${data.employee.FirstName} ${data.employee.LastName} - ${data.period}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                line-height: 1;
                color: #000;
                background: white;
                padding:5px;
              }
              .payslip-container {
                max-width: 210mm;
                margin: 0 auto;
                padding: 20mm;
                background: white;
              }
              .header { 
                display: flex; 
                justify-content: space-between; 
                align-items: flex-start; 
                margin-bottom: 30px;
                border-bottom: 2px solid #000;
                padding-bottom: 10px;
              }
              .company-info h1 { 
                font-size: 24px; 
                font-weight: bold; 
                margin-bottom: 10px;
              }
              .payslip-title { 
                font-size: 28px; 
                font-weight: bold; 
                margin-bottom: 10px;
              }
              .company-details { 
                font-size: 12px; 
                line-height: 1.5;
              }
              .logo-container {
                width: 150px;
                // height: 80px;
                background: white;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
              }
              .logo-container img {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
                padding: 8px;
                filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
              }
              .employee-section { 
                margin-bottom: 15px;
              }
              .employee-name { 
                font-size: 20px; 
                font-weight: bold; 
                margin-bottom: 5px;
                border-bottom: 1px solid #000;
                padding-bottom: 5px;
              }
              .employee-grid { 
                display: grid; 
                grid-template-columns: 1fr 1fr 1fr 1fr; 
                gap: 15px;
                margin-bottom: 20px;
              }
              .field-group { 
                display: flex; 
                flex-direction: column;
              }
              .field-label { 
                font-size: 11px; 
                color: #666; 
                margin-bottom: 2px;
                font-weight: 500;
              }
              .field-value { 
                font-size: 12px; 
                font-weight: 600;
              }
              .salary-details { 
                margin-bottom: 8px;
              }
              .section-title { 
                font-size: 16px; 
                font-weight: bold; 
                margin-bottom: 5px;
              }
              .salary-row { 
                display: grid; 
                grid-template-columns: 1fr 1fr 1fr 1fr; 
                gap: 15px;
                background: #f8f9fa;
                padding: 12px;
                border-radius: 4px;
              }
              .earnings-deductions { 
                display: grid; 
                grid-template-columns: 1fr 1fr; 
                gap: 20px; 
                margin-bottom: 10px;
              }
              .earnings, .deductions { 
                border: 1px solid #ddd;
                border-radius: 4px;
                overflow: hidden;
              }
              .earnings-header, .deductions-header { 
                background: #f8f9fa; 
                padding: 12px; 
                font-weight: bold;
                border-bottom: 1px solid #ddd;
              }
              .earnings-content, .deductions-content { 
                padding: 15px;
              }
              .earning-item, .deduction-item { 
                display: flex; 
                justify-content: space-between; 
                margin-bottom: 8px;
                font-size: 13px;
              }
              .earning-item:last-child, .deduction-item:last-child { 
                margin-top: 10px;
                padding-top: 10px;
                border-top: 1px solid #ddd;
                font-weight: bold;
              }
              .net-salary { 
                background: #f8f9fa; 
                padding: 10px; 
                border-radius: 4px; 
                margin-bottom: 10px;
                border: 1px solid #ddd;
              }
              .net-amount { 
                display: flex; 
                justify-content: space-between; 
                align-items: center; 
                margin-bottom: 5px;
              }
              .net-amount-label { 
                font-size: 16px; 
                font-weight: bold;
              }
              .net-amount-value { 
                font-size: 18px; 
                font-weight: bold; 
                color: #2563eb;
              }
              .net-words { 
                font-style: italic; 
                color: #666;
                font-size: 13px;
              }
              .note { 
                margin: 0px 0px;
                font-size: 12px;
                font-weight: bold;
              }
              .leave-details { 
                margin-top: 5px;
              }
              .leave-table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 0px;
                font-size: 11px;
              }
              .leave-table th, .leave-table td { 
                border: 1px solid #ddd; 
                padding: 8px; 
                text-align: center;
              }
              .leave-table th { 
                background: #f8f9fa; 
                font-weight: bold;
              }
              @media print {
                .payslip-container { margin: 0; padding: 15mm; }
                body { -webkit-print-color-adjust: exact; }
              }
            </style>
          </head>
          <body>
            ${payslipElement.innerHTML}
          </body>
        </html>
      `);

            printWindow.document.close();

            // Wait for content to load then trigger print
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 500);

        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    useEffect(() => {
        if (autoExport) {
            // small delay to ensure content is in DOM
            const t = setTimeout(() => handlePDFExport(), 300);
            return () => clearTimeout(t);
        }
    }, [autoExport]);

    return (
        <div className="max-w-6xl mx-auto p-2 bg-white ">
            {/* Export Controls */}
            <div className="flex justify-between items-center mb-6 bg-gray-50 p-1 rounded ">
                <div className="flex items-center gap-3">
                    <FileText size={24} className="text-blue-600" />
                    <h1 className="font-barlow text-md font-semibold text-gray-800">
                        Payslip Generator
                    </h1>
                </div>
                <button
                    onClick={handlePDFExport}
                    disabled={isGenerating}
                    className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Download size={18} />
                    {isGenerating ? 'Generating...' : 'Export PDF'}
                </button>
            </div>

            {/* Payslip Content */}
            <div
                id="payslip-content"
                className="payslip-container bg-white border border-gray-200 rounded p-4 shadow-lg overflow-y-scroll"
                style={{ maxHeight: 'calc(100vh - 300px)' }}
            >
                {/* Header */}
                <div className="header flex justify-between items-start mb-4 border-b-2 border-gray-800 pb-4">
                    <div className="company-info">
                        <h1 className="payslip-title text-3xl font-bold text-gray-800 mb-3">
                            PAYSLIP {data.period}
                        </h1>
                        <div className="company-details text-sm text-gray-700 leading-relaxed">
                            <div className="font-bold text-base mb-2">{data.company.name}</div>
                            <div>{data.company.address}</div>
                            <div>{data.company.city}</div>
                        </div>
                    </div>
                    <div className="logo-container w-52 h-40 rounded-xl flex items-center justify-center bg-white overflow-hidden">
                        {/* Company Logo */}
                        <img
                            src={Logo}
                            alt="Company Logo"
                            className="max-w-full max-h-full object-contain p-2"
                            style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))' }}
                        />
                    </div>
                </div>

                {/* Employee Information */}
                <div className="employee-section mb-8">
                    <h2 className="employee-name text-xl font-bold text-gray-800 mb-2 border-b border-gray-800 pb-">
                        {data.employee.FirstName} {data.employee.LastName}
                    </h2>
                    <div className="employee-grid grid grid-cols-4 gap-6 mb-6">
                        <div className="field-group">
                            <div className="field-label text-xs text-gray-500 mb-1 font-medium">Employee ID</div>
                            <div className="field-value text-sm font-semibold">{data.employee.EmpID}</div>
                        </div>
                        <div className="field-group">
                            <div className="field-label text-xs text-gray-500 mb-1 font-medium">Date Joined</div>
                            <div className="field-value text-sm font-semibold">{data.employee.DateOfJoining}</div>
                        </div>
                        <div className="field-group">
                            <div className="field-label text-xs text-gray-500 mb-1 font-medium">Department</div>
                            <div className="field-value text-sm font-semibold">{data.employee.department}</div>
                        </div>
                        <div className="field-group">
                            <div className="field-label text-xs text-gray-500 mb-1 font-medium">Designation</div>
                            <div className="field-value text-sm font-semibold">{data.employee.designation}</div>
                        </div>
                        <div className="field-group">
                            <div className="field-label text-xs text-gray-500 mb-1 font-medium">Payment Mode</div>
                            <div className="field-value text-sm font-semibold">{data.employee.paymentMode}</div>
                        </div>
                        <div className="field-group">
                            <div className="field-label text-xs text-gray-500 mb-1 font-medium">Bank Name</div>
                            <div className="field-value text-sm font-semibold">{data.bankDetails?.BankName || "N/A"}</div>
                        </div>
                        <div className="field-group">
                            <div className="field-label text-xs text-gray-500 mb-1 font-medium">Bank Branch</div>
                            <div className="field-value text-sm font-semibold">{data.bankDetails?.BranchName || "N/A"}</div>
                        </div>
                        <div className="field-group">
                            <div className="field-label text-xs text-gray-500 mb-1 font-medium">Bank IFSC</div>
                            <div className="field-value text-sm font-semibold">{data.bankDetails?.IFSCCode || "N/A"}</div>
                        </div>
                        <div className="field-group">
                            <div className="field-label text-xs text-gray-500 mb-1 font-medium">Bank Account</div>
                            <div className="field-value text-sm font-semibold">{data.bankDetails?.AccountNumber || "N/A"}</div>
                        </div>
                        <div className="field-group">
                            <div className="field-label text-xs text-gray-500 mb-1 font-medium">UAN</div>
                            <div className="field-value text-sm font-semibold">{data.bankDetails?.UAN || "N/A"}</div>
                        </div>
                        <div className="field-group">
                            <div className="field-label text-xs text-gray-500 mb-1 font-medium">PF Number</div>
                            <div className="field-value text-sm font-semibold">{data.bankDetails?.PFNumber || "N/A"}</div>
                        </div>
                        <div className="field-group">
                            <div className="field-label text-xs text-gray-500 mb-1 font-medium">PAN Number</div>
                            <div className="field-value text-sm font-semibold">{data.employee.panNumber}</div>
                        </div>
                    </div>
                </div>

                {/* Salary Details */}
                <div className="salary-details mb-2">
                    <h3 className="section-title text-lg font-bold text-gray-800 mb-1">SALARY DETAILS</h3>
                    <div className="salary-row grid grid-cols-4 gap-6 bg-gray-50 p-4 rounded-lg">
                        <div className="field-group">
                            <div className="field-label text-xs text-gray-500 mb-1 font-medium">Actual Payable Days</div>
                            <div className="field-value text-sm font-semibold">{formatNumber(data.salaryDetails.actualPayableDays)}</div>
                        </div>
                        <div className="field-group">
                            <div className="field-label text-xs text-gray-500 mb-1 font-medium">Total Working Days</div>
                            <div className="field-value text-sm font-semibold">{formatNumber(data.salaryDetails.totalWorkingDays)}</div>
                        </div>
                        <div className="field-group">
                            <div className="field-label text-xs text-gray-500 mb-1 font-medium">Loss Of Pay Days</div>
                            <div className="field-value text-sm font-semibold">{formatNumber(data.salaryDetails.lossOfPayDays)}</div>
                        </div>
                        <div className="field-group">
                            <div className="field-label text-xs text-gray-500 mb-1 font-medium">Days Payable</div>
                            <div className="field-value text-sm font-semibold">{formatNumber(data.salaryDetails.daysPayable)}</div>
                        </div>
                    </div>
                </div>

                {/* Earnings and Deductions */}
                <div className="earnings-deductions grid grid-cols-2 gap-2 mb-6">
                    <div className="earnings border border-gray-200 rounded-lg overflow-hidden">
                        <div className="earnings-header bg-gray-50 p-2 font-bold text-gray-800 border-b border-gray-200">
                            EARNINGS
                        </div>
                        <div className="earnings-content p-2">
                            <div className="earning-item flex justify-between mb-2 text-sm">
                                <span>Basic</span>
                                <span>{formatCurrency(data.earnings.basic)}</span>
                            </div>
                            <div className="earning-item flex justify-between mb-2 text-sm">
                                <span>HRA</span>
                                <span>{formatCurrency(data.earnings.hra)}</span>
                            </div>
                            <div className="earning-item flex justify-between mb-2 text-sm">
                                <span>Special Allowance</span>
                                <span>{formatCurrency(data.earnings.specialAllowance)}</span>
                            </div>
                            <div className="earning-item flex justify-between mb-2 text-sm">
                                <span>Mobile Bill Allowance</span>
                                <span>{formatCurrency(data.earnings.mobileBillAllowance)}</span>
                            </div>
                            <div className="earning-item flex justify-between mb-2 text-sm">
                                <span>Leave Encashment</span>
                                <span>{formatCurrency(data.earnings.leaveEncashment)}</span>
                            </div>
                            <div className="earning-item flex justify-between mt-4 pt-4 border-t border-gray-200 font-bold text-sm">
                                <span>Total Earnings (A)</span>
                                <span>{formatCurrency(data.earnings.total)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="deductions border border-gray-200 rounded-lg overflow-hidden">
                        <div className="deductions-header bg-gray-50 p-2 font-bold text-gray-800 border-b border-gray-200">
                            TAXES & DEDUCTIONS
                        </div>
                        <div className="deductions-content p-2">
                            <div className="deduction-item flex justify-between mb-2 text-sm">
                                <span>PF Employee</span>
                                <span>{formatCurrency(data.deductions.pfEmployee)}</span>
                            </div>
                            <div className="deduction-item flex justify-between mb-2 text-sm">
                                <span>Asset Purchase</span>
                                <span>{formatCurrency(data.deductions.assetPurchase)}</span>
                            </div>
                            <div className="deduction-item flex justify-between mt-4 pt-4 border-t border-gray-200 font-bold text-sm">
                                <span>Total Taxes & Deductions (B)</span>
                                <span>{formatCurrency(data.deductions.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Net Salary */}
                <div className="net-salary bg-gray-50 p-2 rounded-lg mb-2 border border-gray-200">
                    <div className="net-amount flex justify-between items-center mb-1">
                        <span className="net-amount-label text-lg font-bold text-gray-800">Net Salary Payable (A - B)</span>
                        <span className="net-amount-value text-xl font-bold text-blue-600">{formatCurrency(data.netSalary.amount)}</span>
                    </div>
                    <div className="net-words italic text-gray-600 text-sm">
                        <span className="font-medium">Net Salary in words:</span> {data.netSalary.inWords}
                    </div>
                </div>

                {/* Note */}
                <div className="note text-sm font-bold text-gray-800 mb-2">
                    **Note : All amounts displayed in this payslip are in INR
                </div>

                {/* Leave Details */}
                {/* <div className="leave-details">
                    <h3 className="section-title text-lg font-bold text-gray-800 mb-2">LEAVE DETAILS</h3>
                    <table className="leave-table w-full border-collapse text-xs">
                        <thead>
                            <tr>
                                <th className="border border-gray-300 p-2 bg-gray-50 font-bold">LEAVE TYPE</th>
                                <th className="border border-gray-300 p-2 bg-gray-50 font-bold">OPENING</th>
                                <th className="border border-gray-300 p-2 bg-gray-50 font-bold">ACCRUED</th>
                                <th className="border border-gray-300 p-2 bg-gray-50 font-bold">CREDIT</th>
                                <th className="border border-gray-300 p-2 bg-gray-50 font-bold">AVAILED</th>
                                <th className="border border-gray-300 p-2 bg-gray-50 font-bold">EXPIRED/ENCASHED</th>
                                <th className="border border-gray-300 p-2 bg-gray-50 font-bold">CLOSING</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.leaveDetails.map((leave, index) => (
                                <tr key={index}>
                                    <td className="border border-gray-300 p-2 text-left">{leave.type}</td>
                                    <td className="border border-gray-300 p-2 text-center">{formatNumber(leave.opening)}</td>
                                    <td className="border border-gray-300 p-2 text-center">{formatNumber(leave.accrued)}</td>
                                    <td className="border border-gray-300 p-2 text-center">{formatNumber(leave.credit)}</td>
                                    <td className="border border-gray-300 p-2 text-center">{formatNumber(leave.availed)}</td>
                                    <td className="border border-gray-300 p-2 text-center">{formatNumber(leave.expired)}</td>
                                    <td className="border border-gray-300 p-2 text-center">{formatNumber(leave.closing)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div> */}
            </div>
        </div>
    );
}

export default Slip;