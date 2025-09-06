import React, { useEffect, useMemo, useRef, useState } from 'react';
import { UploadCloud, Loader2, CheckCircle2, XCircle, Calendar, Users } from 'lucide-react';
import API from '@/services/API';
import notification from '@/services/NotificationService.jsx';
import { uploadAttendanceExcel } from '@/services/Attendance/Attendance';


// NOTE: This page now uses a simple generic table to avoid double header rendering
// caused by the advanced TableService (which shows grouped headers + filter row).
// We render a single header row and an optional expandable details row.

const ImportAttendance = () => {
  const notify = notification();

  // File upload state
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);

  // Regularization state
  const [regularizing, setRegularizing] = useState(false);

  // Year/Month selection state
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [fetching, setFetching] = useState(false);
  const [employees, setEmployees] = useState([]);

  // For resetting input after successful upload
  const fileInputRef = useRef(null);

  // Years: current year +/- range
  const years = useMemo(() => {
    const current = new Date().getFullYear();
    const start = current - 5;
    const end = current + 1;
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, []);

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  // Location selection (temporary hardcoded list; replace with API-driven options if available)
  const [locationId, setLocationId] = useState('');
  const locations = useMemo(() => ([
    { id: 1, name: 'Tagore Town Office' },
    { id: 2, name: 'Naini Factory' },
  ]), []);

  // Auto-fetch on year + month selection
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!year || !month) return;
      setFetching(true);
      try {
        const { data } = await API.get(`/Attendances/GetEmployeesWithAttendance/${year}/${month}`);
        setEmployees(Array.isArray(data) ? data : []);
        notify.success('Attendance data loaded');
      } catch (error) {
        console.error('Failed to fetch employees with attendance:', error);
        setEmployees([]);
        notify.error('Failed to load attendance data');
      } finally {
        setFetching(false);
      }
    };

    fetchEmployees();
  }, [year, month]);

  const onFileChange = (e) => {
    const picked = e.target.files?.[0];
    if (!picked) return;

    const allowed = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    const isValidExt = /(\.xlsx|\.xls)$/i.test(picked.name);
    const isValidMime = allowed.includes(picked.type) || picked.type === '';

    if (!isValidExt && !isValidMime) {
      notify.error('Please select a valid Excel file (.xlsx or .xls)');
      return;
    }

    setFile(picked);
    setFileName(picked.name);
  };

  const handleUpload = async () => {
    if (!file) {
      notify.warning('Please choose an Excel file to upload');
      return;
    }
    if (!locationId) {
      notify.warning('Please select a location');
      return;
    }

    const form = new FormData();
    // Backend is expected to read the file from the "file" field
    form.append('file', file);

    setUploading(true);
    try {
      // file posted here with location in path
      await API.post(`/Attendances/ImportAttendance/${locationId}`, form);
      // await uploadAttendanceExcel(file); // this service is not tested yet...

      notify.success('Attendance file uploaded successfully');
      // Clear input after success
      setFile(null);
      setFileName('');
      if (fileInputRef.current) fileInputRef.current.value = '';

      // If year/month already chosen, refresh list
      if (year && month) {
        setFetching(true);
        try {
          const { data } = await API.get(`/Attendances/GetEmployeesWithAttendance/${year}/${month}`);
          setEmployees(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error('Refresh after upload failed:', err);
        } finally {
          setFetching(false);
        }
      }
    } catch (error) {
      console.error('Upload failed:', error);
      const msg = error?.response?.data?.message || 'Upload failed. Please try again.';
      notify.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleRegularization = async () => {
    setRegularizing(true);
    try {
      // Endpoint per requirement. Base URL already contains '/api', so keep relative path consistent
      await API.post('/Attendances/LeaveRegularization');
      notify.success('Attendance regularization completed');
      // Refresh the page as requested
      window.location.reload();
    } catch (error) {
      console.error('Regularization failed:', error);
      const msg = error?.response?.data?.message || 'Regularization failed. Please try again.';
      notify.error(msg);
    } finally {
      setRegularizing(false);
    }
  };

  // Build a flat set of columns for a simple generic table (single header row)
  const columns = useMemo(() => {
    if (!employees || employees.length === 0) return [];

    // Base employee columns, excluding AttendanceRecords array and internal flags
    const keys = Object.keys(employees[0]).filter((k) => k !== 'AttendanceRecords' && !k.startsWith('__'));

    const baseCols = keys.map((key) => ({
      key,
      header: key,
      render: (row) => {
        const v = row[key];
        if (v == null) return '';
        return typeof v === 'object' ? JSON.stringify(v) : String(v);
      },
    }));

    // Additional column: attendance records count
    const attendanceCountCol = {
      key: '__attendance_count',
      header: 'Attendance Records',
      render: (row) => {
        const recs = row?.AttendanceRecords || [];
        return `${recs.length} records`;
      },
    };

    return [...baseCols, attendanceCountCol];
  }, [employees]);

  const handleRowClick = (row) => {
    setEmployees((prev) =>
      prev.map((r) => (r.EmpID === row.EmpID ? { ...r, __expanded: !r.__expanded } : r))
    );
  };

  const formatDate = (iso) => {
    try {
      if (!iso) return '';
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return String(iso);
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
    } catch {
      return String(iso ?? '');
    }
  };

  // Fallback: sum HH:MM:SS strings if API TotalHoursWorked is missing
  const sumTotalHours = (records = []) => {
    let totalSeconds = 0;
    for (const rec of records) {
      const t = rec?.TotalHours;
      if (!t) continue;
      const [hh = '0', mm = '0', ss = '0'] = String(t).split(':');
      const h = parseInt(hh, 10);
      const m = parseInt(mm, 10);
      const s = parseInt(ss, 10);
      if (Number.isFinite(h) && Number.isFinite(m) && Number.isFinite(s)) {
        totalSeconds += h * 3600 + m * 60 + s;
      }
    }
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return `${h}:${pad(m)}:${pad(s)}`;
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 bg-white shadow-xl rounded-lg space-y-8">
      <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
        <UploadCloud className="w-7 h-7 text-blue-600" />
        Import Attendance
      </h1>

      {/* Location selector */}
      <div className="max-w-sm">
        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
        <div className="relative">
          <select
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            className="w-full border rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Location</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Upload section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <label className="md:col-span-2 flex items-center justify-between gap-3 bg-gray-50 border-2 border-dashed border-gray-300 px-4 py-3 rounded-md cursor-pointer hover:bg-gray-100 transition text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-gray-600" />
            <div className="flex flex-col">
              <span className="font-medium">
                {fileName ? 'Change File' : 'Upload Excel (.xlsx or .xls)'}
              </span>
              <span className="text-xs text-gray-500">Max size depends on server limits</span>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={onFileChange}
            className="hidden"
          />
        </label>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <button
            onClick={handleUpload}
            disabled={uploading || !file}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded text-white font-semibold transition w-full md:w-auto ${
              uploading || !file ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Uploading...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" /> Upload Attendance
              </>
            )}
          </button>

          <button
            onClick={handleRegularization}
            disabled={regularizing}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded text-white font-semibold transition w-full md:w-auto ${
              regularizing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {regularizing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Regularizing...
              </>
            ) : (
              <>Attendance Regularization</>
            )}
          </button>
        </div>
      </div>

      {fileName && (
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <CheckCircle2 className="text-green-500 w-5 h-5" />
          <span>Selected file: {fileName}</span>
          <button
            className="ml-2 text-red-600 hover:text-red-700 flex items-center gap-1 text-xs"
            onClick={() => {
              setFile(null); setFileName(''); if (fileInputRef.current) fileInputRef.current.value = '';
            }}
          >
            <XCircle className="w-4 h-4" /> Clear
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
          <div className="relative">
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value) || '')}
              className="w-full border rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Year</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <Calendar className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
          <div className="relative">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value) || '')}
              className="w-full border rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Month</option>
              {months.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <Calendar className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Employees with attendance {year && month ? `(${year}-${String(month).padStart(2, '0')})` : ''}
          </h2>
          {!fetching && (
            <span className="text-sm text-gray-600">Total: {employees.length}</span>
          )}
        </div>

        {/* Generic simple table - single header row */}
        <div className="overflow-x-auto border rounded-md">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className="px-3 py-2 text-left font-semibold whitespace-nowrap">{col.header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!fetching && employees.length === 0 && (
                <tr>
                  <td className="px-3 py-4 text-center text-gray-500" colSpan={columns.length}>No data found.</td>
                </tr>
              )}

              {employees.map((row, idx) => (
                <React.Fragment key={idx}>
                  <tr
                    className="border-t hover:bg-slate-50 cursor-pointer"
                    onClick={() => handleRowClick(row)}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="px-3 py-2 whitespace-nowrap">
                        {col.render(row)}
                      </td>
                    ))}
                  </tr>
                  {row.__expanded && (
                    <tr className="bg-slate-50">
                      <td colSpan={columns.length}>
                        <div className="p-3">
                          <div className="overflow-x-auto border rounded-md">
                            <table className="min-w-full text-sm">
                              <thead className="bg-gray-100 text-gray-700">
                                <tr>
                                  <th className="px-3 py-2 text-left font-semibold">Date</th>
                                  <th className="px-3 py-2 text-left font-semibold">Time In</th>
                                  <th className="px-3 py-2 text-left font-semibold">Time Out</th>
                                  <th className="px-3 py-2 text-left font-semibold">Total Hours</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(row.AttendanceRecords || []).length === 0 ? (
                                  <tr>
                                    <td className="px-3 py-2 text-gray-500" colSpan={4}>No records</td>
                                  </tr>
                                ) : (
                                  (row.AttendanceRecords || []).map((r, i) => (
                                    <tr key={i} className="border-t">
                                      <td className="px-3 py-2 whitespace-nowrap">{formatDate(r.Date)}</td>
                                      <td className="px-3 py-2 whitespace-nowrap">{r.CheckInTime ?? ''}</td>
                                      <td className="px-3 py-2 whitespace-nowrap">{r.CheckOutTime ?? ''}</td>
                                      <td className="px-3 py-2 whitespace-nowrap">{r.TotalHours ?? ''}</td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                              <tfoot>
                                <tr className="bg-gray-50 font-semibold">
                                  <td className="px-3 py-2 text-right" colSpan={3}>Total Working Hours in this month</td>
                                  <td className="px-3 py-2 whitespace-nowrap">{row.TotalHoursWorked ?? sumTotalHours(row.AttendanceRecords || [])}</td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}

              {fetching && (
                <tr>
                  <td className="px-3 py-4 text-center text-gray-500" colSpan={columns.length}>Loading...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ImportAttendance;