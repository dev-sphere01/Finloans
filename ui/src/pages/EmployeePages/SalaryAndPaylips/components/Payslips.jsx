import React from 'react'

// Now receives slips array (from JSON) and uses period for labels
const Payslips = ({ slips, setSelectedIndex, handlePreview, handleDownload, getStatusColor, formatCurrency, formatDate, motion, Eye, Download, FileText, calculateTotals, CheckCircle }) => {
  return (
    <motion.section
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 h-[650px] flex flex-col"
    >
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h3 className="text-lg font-semibold text-gray-800">Available Pay Slips</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <FileText className="h-4 w-4" />
          <span>Last 3 months</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {slips.map((slip, index) => {
          const totals = calculateTotals(slip);

          return (
            <motion.div
              key={slip.period ?? index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
              onClick={() => setSelectedIndex(index)}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  {/* Use period as label; if not present, show a generic fallback */}
                  <h4 className="font-semibold text-gray-800">{slip.period ?? `Period ${index + 1}`}</h4>
                  {/* If your JSON has a pay period, show it; else keep it simple */}
                  {slip.payPeriod && (
                    <p className="text-xs text-gray-600">{slip.payPeriod}</p>
                  )}
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(slip.status ?? 'paid')}`}>
                  <CheckCircle className="h-3 w-3 inline mr-1" />
                  <span className="capitalize">{slip.status ?? 'paid'}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                <div>
                  <span className="text-gray-600">Gross Pay</span>
                  <div className="font-semibold text-gray-800">{formatCurrency(totals.totalEarnings)}</div>
                </div>
                <div>
                  <span className="text-gray-600">Deductions</span>
                  <div className="font-semibold text-red-600">-{formatCurrency(totals.totalDeductions)}</div>
                </div>
                <div>
                  <span className="text-gray-600">Net Pay</span>
                  <div className="font-semibold text-green-600">{formatCurrency(totals.netPay)}</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  {/* If your JSON has an exact pay date, show it; else show the period */}
                  {slip.payDate ? `Pay Date: ${formatDate(slip.payDate)}` : `Period: ${slip.period ?? '-'}`}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreview(index);
                    }}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md transition-colors text-xs"
                  >
                    <Eye className="h-3 w-3" />
                    <span>Preview</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(index);
                    }}
                    className="flex items-center space-x-1 px-3 py-1 bg-green-50 hover:bg-green-100 text-green-600 rounded-md transition-colors text-xs"
                  >
                    <Download className="h-3 w-3" />
                    <span>PDF</span>
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  )
}

export default Payslips