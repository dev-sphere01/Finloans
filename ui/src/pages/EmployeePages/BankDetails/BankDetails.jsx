import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Save, X, Upload, CheckCircle, Info } from 'lucide-react';
import getBankById from '@/services/Employees/getBankById';
import useEmpDataStore from '@/store/empDataStore';
import getBaseFileURL from '@/utils/getBaseFileUrl';
import notification from '@/services/NotificationService';
import ImportBankDetails from '@/pages/EmployeePages/BankDetails/components/ImportBankDetails';

const MAX_FILE_SIZE_MB = 5;

const banks = [
  { id: 1, name: 'Union Bank of India' },
  { id: 2, name: 'Indian Bank' },
];

const initialBank = {
  bankName: "",
  accountNumber: "",
  ifsc: "",
  branch: "",
  cancelledCheque: null // or a placeholder cheque image string
};

const BankDetails = () => {
  const { currentEmployee, loading: empLoading } = useEmpDataStore();

  const baseFileURL = getBaseFileURL();
  const notify = notification();

  const [bank, setBank] = useState(initialBank);
  const [edit, setEdit] = useState(false);
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInput = useRef();

  // Fetch bank details when component mounts or currentEmployee changes
  useEffect(() => {
    const fetchBankDetails = async () => {
      if (!currentEmployee?.EmpID) return;

      setLoading(true);
      try {
        const bankData = await getBankById(currentEmployee.EmpID);

        if (bankData) {
          const formattedBankData = {
            bankName: bankData.BankName || '',
            accountNumber: bankData.AccountNumber || '',
            ifsc: bankData.IFSCCode || '',
            branch: bankData.BranchName || '',
            cancelledCheque: bankData.CancelledCheque || null
          };

          setBank(formattedBankData);

          // Set preview for cancelled cheque if it exists
          if (bankData.CancelledCheque) {
            setPreview(`${baseFileURL}${bankData.CancelledCheque}`);
          }
        } else {
          // No bank data found, keep initial empty state
          setBank({
            bankName: '',
            accountNumber: '',
            ifsc: '',
            branch: '',
            cancelledCheque: null
          });
          setPreview(null);
        }
      } catch (error) {
        console.error('Error fetching bank details:', error);
        // Keep initial bank data if fetch fails
      } finally {
        setLoading(false);
      }
    };

    fetchBankDetails();
  }, [currentEmployee?.EmpID, baseFileURL]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "cancelledCheque" && files[0]) {
      setBank(prev => ({ ...prev, cancelledCheque: files[0] }));
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setBank(prev => ({ ...prev, [name]: value }));
    }
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!bank.bankName.trim()) errs.bankName = "Enter your bank's name";
    if (!bank.accountNumber || isNaN(bank.accountNumber) || bank.accountNumber.length < 8)
      errs.accountNumber = "Enter a valid account number";
    if (!bank.ifsc.trim() || bank.ifsc.trim().length !== 11)
      errs.ifsc = "Enter a valid 11-character IFSC code";
    if (!bank.branch.trim()) errs.branch = "Enter branch name";
    // if (!bank.cancelledCheque) errs.cancelledCheque = "Upload a cancelled cheque";
    return errs;
  };

  const handleSave = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      notify.error('Please fix the highlighted errors.');
      return;
    }
    notify.success('Bank details updated successfully!');
    setEdit(false);
  };

  const handleCancel = async () => {
    // Refetch original data instead of using initialBank
    if (currentEmployee?.EmpID) {
      setLoading(true);
      try {
        const bankData = await getBankById(100);

        if (bankData) {
          const formattedBankData = {
            bankName: bankData.BankName || '',
            accountNumber: bankData.AccountNumber || '',
            ifsc: bankData.IFSCCode || '',
            branch: bankData.BranchName || '',
            cancelledCheque: bankData.CancelledCheque || null
          };

          setBank(formattedBankData);

          // Reset preview for cancelled cheque
          if (bankData.CancelledCheque) {
            setPreview(`${baseFileURL}${bankData.CancelledCheque}`);
          } else {
            setPreview(null);
          }
        } else {
          // No bank data found, reset to empty state
          setBank({
            bankName: '',
            accountNumber: '',
            ifsc: '',
            branch: '',
            cancelledCheque: null
          });
          setPreview(null);
        }
      } catch (error) {
        console.error('Error refetching bank details:', error);
        // Fallback to initial bank data
        setBank(initialBank);
        setPreview(null);
      } finally {
        setLoading(false);
      }
    } else {
      setBank(initialBank);
      setPreview(null);
    }

    setErrors({});
    setEdit(false);
  };

  // Show loading state while employee data or bank data is being fetched
  if (empLoading || loading || !currentEmployee) {
    return (
      <div className="h-full bg-gray-50 px-2 md:px-8 py-8 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bank details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 px-2 md:px-2 py-2">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full  "
      >
        {/* Top - Header and action */}
        <div className="flex justify-between items-center mb-8 px-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Bank Information</h1>
            <p className="text-gray-500 mt-1">
              {currentEmployee ?
                `${currentEmployee.FirstName} ${currentEmployee.LastName}'s salary account & cheque details` :
                'Your salary account & cheque details'
              }
            </p>
          </div>
          {!edit &&
            <button
              type="button"
              className="flex items-center bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg text-white font-medium text-sm shadow"
              onClick={() => {
                setEdit(true);
              }}
            >
              <Pencil className="w-4 h-4 mr-2" /> Update
            </button>
          }
        </div>

        {/* Card layout - horizontal */}
        <form onSubmit={handleSave} className="flex flex-col lg:flex-row grid-col-3 gap-2">
          {/* Info side */}
          <div className="flex-1 bg-white rounded-xl shadow-lg p-4 flex flex-col justify-center">
            {/* Bank Name */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Bank Name</label>
              <select
                name="bankName"
                value={bank.bankName}
                onChange={handleChange}
                disabled={!edit}
                className={`w-full px-3 py-2 text-lg bg-gray-50 rounded-md border ${errors.bankName ? 'border-red-500' : 'border-gray-200'} font-semibold text-gray-700 ${!edit ? 'cursor-default' : ''}`}
              >
                <option value="">Select bank</option>
                {banks.map(b => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>
              {errors.bankName && <p className="text-xs text-red-600 flex items-center mt-1"><Info className="w-3 h-3 mr-1" />{errors.bankName}</p>}
            </div>
            {/* Account Number and IFSC */}
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Account Number</label>
                <input
                  name="accountNumber"
                  value={bank.accountNumber}
                  onChange={handleChange}
                  disabled={!edit}
                  className={`w-full px-3 py-2 text-gray-700 bg-gray-50 rounded-md border ${errors.accountNumber ? 'border-red-500' : 'border-gray-200'} font-mono text-lg tracking-wider ${!edit ? 'cursor-default' : ''}`}
                />
                {errors.accountNumber && <p className="text-xs text-red-600 flex items-center mt-1"><Info className="w-3 h-3 mr-1" />{errors.accountNumber}</p>}
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 mb-1">IFSC Code</label>
                <input
                  name="ifsc"
                  value={bank.ifsc}
                  maxLength={11}
                  onChange={handleChange}
                  disabled={!edit}
                  className={`w-full px-3 py-2 text-gray-700 bg-gray-50 rounded-md border ${errors.ifsc ? 'border-red-500' : 'border-gray-200'} font-mono text-lg tracking-widest uppercase ${!edit ? 'cursor-default' : ''}`}
                />
                {errors.ifsc && <p className="text-xs text-red-600 flex items-center mt-1"><Info className="w-3 h-3 mr-1" />{errors.ifsc}</p>}
              </div>
            </div>
            {/* Branch Name */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Branch Name</label>
              <input
                name="branch"
                type="text"
                value={bank.branch}
                onChange={handleChange}
                disabled={!edit}
                className={`w-full px-3 py-2 text-lg bg-gray-50 rounded-md border ${errors.branch ? 'border-red-500' : 'border-gray-200'} font-semibold text-gray-700 ${!edit ? 'cursor-default' : ''}`}
              />
              {errors.branch && <p className="text-xs text-red-600 flex items-center mt-1"><Info className="w-3 h-3 mr-1" />{errors.branch}</p>}
            </div>
            {/* Save/Cancel buttons when editing */}
            {edit && (
              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  className="flex items-center px-5 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white font-medium shadow"
                >
                  <Save className="w-4 h-4 mr-2" /> Save
                </button>
                <button
                  type="button"
                  className="flex items-center px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium"
                  onClick={handleCancel}
                >
                  <X className="w-4 h-4 mr-2" /> Cancel
                </button>
              </div>
            )}
          </div>
          {/* Cheque side */}
          <div className="w-full lg:w-80 bg-white rounded-xl shadow-lg p-7 flex flex-col items-center justify-center gap-5">
            <span className="font-semibold text-gray-700 text-base mb-2">Cancelled Cheque</span>
            {edit ? (
              <div className="w-full flex flex-col items-center gap-3">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  name="cancelledCheque"
                  ref={fileInput}
                  onChange={handleChange}
                  disabled={!edit}
                  className="block text-sm text-gray-600"
                />
                {preview && (
                  <img src={preview} alt="Preview" className="w-48 h-32 object-cover border rounded shadow" />
                )}
                {errors.cancelledCheque && <p className="text-xs text-red-600 flex items-center mt-1"><Info className="w-3 h-3 mr-1" />{errors.cancelledCheque}</p>}
              </div>
            ) : (
              preview ? (
                <img src={preview} alt="Cancelled Cheque" className="w-56 h-36 object-cover border rounded shadow" />
              ) : (
                <div className="text-gray-400 text-center italic">
                  No cheque uploaded
                </div>
              )
            )}
          </div>
        </form>
      </motion.div>

      {/* Import Bank Details button */}

      {currentEmployee?.RoleID === 1 && (
        <div className='mt-5'>
          <ImportBankDetails />
        </div>
      )}
    </div>
  );
};

export default BankDetails;
