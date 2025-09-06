//ExportExcelService.jsx
import React from "react";
import * as XLSX from "xlsx";
import { motion } from "framer-motion";
import { Download } from "lucide-react";

/**
 * ExcelExporter Component
 * @param {Array} data - Array of objects (rows)
 * @param {Array} sheetConfigs - [{ sheetName: string, filter: (row)=>boolean }]
 * @param {string} fileName - Name of the Excel file
 */
const ExcelExporter = ({ data, sheetConfigs, fileName = "Payroll.xlsx", disabled = false }) => {
  const handleExport = () => {
    const workbook = XLSX.utils.book_new();

    sheetConfigs.forEach((config) => {
      const filteredData = data.filter(config.filter);
      const worksheet = XLSX.utils.json_to_sheet(filteredData);
      XLSX.utils.book_append_sheet(workbook, worksheet, config.sheetName);
    });

    XLSX.writeFile(workbook, fileName);
  };

  return (

    <button
      onClick={handleExport}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 rounded-sm ${disabled ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-700'} ${disabled ? '' : 'cursor-pointer'} text-white px-4 py-2 font-medium shadow-md transition`}
    >
      <Download className="w-4 h-4" />
      Export to Excel
    </button>


  );
}

export default ExcelExporter;

// =======================
// Example Usage
// =======================
// export default function PayrollExportDemo() {
//   const payrollData = [
//     {
//       empName: "Person1",
//       bankName: "Indian Bank",
//       ifscCode: "FGH56GH789",
//       accountNumber: 4567898765456789,
//       netPay: 77000,
//     },
//     {
//       empName: "Person2",
//       bankName: "Union Bank",
//       ifscCode: "FGH56567789",
//       accountNumber: 4568768765456789,
//       netPay: 87000,
//     },
//     {
//       empName: "Person3",
//       bankName: "PNB",
//       ifscCode: "FGHJKGH789",
//       accountNumber: 1237898765456789,
//       netPay: 70000,
//     },
//   ];

//   const sheetConfigs = [
//     {
//       sheetName: "Indian Bank",
//       filter: (row) => row.bankName === "Indian Bank",
//     },
//     {
//       sheetName: "Union Bank",
//       filter: (row) => row.bankName === "Union Bank",
//     },
//     {
//       sheetName: "Others",
//       filter: (row) =>
//         row.bankName !== "Indian Bank" && row.bankName !== "Union Bank",
//     },
//   ];

//   return (
//       <ExcelExporter
//         data={payrollData}
//         sheetConfigs={sheetConfigs}
//         fileName="PayrollData.xlsx"
//       />
//   );
// }
