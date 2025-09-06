import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle, XCircle, AlertTriangle, ChevronLeft, ChevronRight, Filter, Download, User } from 'lucide-react';
import AttendanceSummary from '@/pages/EmployeePages/Attendance/components/AttendanceSummary';
import DailyRecords from '@/pages/EmployeePages/Attendance/components/DailyRecords';

const Attendance = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Mock attendance data for last 3 months with full 31 days for October
  const attendanceData = {
    '2024-10': {
      totalDays: 31,
      workingDays: 23,
      present: 19,
      absent: 1,
      late: 2,
      halfDays: 2,
      overtime: 5,
      dailyRecords: [
        { date: "2024-10-01", status: "present", checkIn: "09:00", checkOut: "18:00", hours: "9h 0m" },
        { date: "2024-10-02", status: "present", checkIn: "09:00", checkOut: "18:00", hours: "9h 0m" },
        { date: "2024-10-03", status: "present", checkIn: "09:00", checkOut: "18:00", hours: "9h 0m" },
        { date: "2024-10-04", status: "present", checkIn: "09:00", checkOut: "18:00", hours: "9h 0m" },
        { date: "2024-10-05", status: "weekend", checkIn: null, checkOut: null, hours: null },
        { date: "2024-10-06", status: "weekend", checkIn: null, checkOut: null, hours: null },
        { date: "2024-10-07", status: "present", checkIn: "09:00", checkOut: "18:00", hours: "9h 0m" },
        { date: "2024-10-08", status: "present", checkIn: "09:00", checkOut: "18:00", hours: "9h 0m" },
        { date: "2024-10-09", status: "late", checkIn: "09:30", checkOut: "18:00", hours: "8h 30m" },
        { date: "2024-10-10", status: "absent", checkIn: null, checkOut: null, hours: null },
        { date: "2024-10-11", status: "present", checkIn: "09:00", checkOut: "18:00", hours: "9h 0m" },
        { date: "2024-10-12", status: "weekend", checkIn: null, checkOut: null, hours: null },
        { date: "2024-10-13", status: "weekend", checkIn: null, checkOut: null, hours: null },
        { date: "2024-10-14", status: "present", checkIn: "09:00", checkOut: "18:00", hours: "9h 0m" },
        { date: "2024-10-15", status: "present", checkIn: "09:00", checkOut: "18:00", hours: "9h 0m" },
        { date: "2024-10-16", status: "half-day", checkIn: "09:00", checkOut: "13:00", hours: "4h 0m" },
        { date: "2024-10-17", status: "present", checkIn: "09:00", checkOut: "18:00", hours: "9h 0m" },
        { date: "2024-10-18", status: "present", checkIn: "09:00", checkOut: "18:00", hours: "9h 0m" },
        { date: "2024-10-19", status: "weekend", checkIn: null, checkOut: null, hours: null },
        { date: "2024-10-20", status: "weekend", checkIn: null, checkOut: null, hours: null },
        { date: "2024-10-21", status: "present", checkIn: "09:00", checkOut: "18:00", hours: "9h 0m" },
        { date: "2024-10-22", status: "present", checkIn: "09:00", checkOut: "18:00", hours: "9h 0m" },
        { date: "2024-10-23", status: "present", checkIn: "09:00", checkOut: "18:00", hours: "9h 0m" },
        { date: "2024-10-24", status: "present", checkIn: "09:00", checkOut: "18:00", hours: "9h 0m" },
        { date: "2024-10-25", status: "late", checkIn: "09:30", checkOut: "18:00", hours: "8h 30m" },
        { date: "2024-10-26", status: "weekend", checkIn: null, checkOut: null, hours: null },
        { date: "2024-10-27", status: "weekend", checkIn: null, checkOut: null, hours: null },
        { date: "2024-10-28", status: "present", checkIn: "09:00", checkOut: "18:00", hours: "9h 0m" },
        { date: "2024-10-29", status: "present", checkIn: "09:00", checkOut: "18:00", hours: "9h 0m" },
        { date: "2024-10-30", status: "present", checkIn: "09:00", checkOut: "18:00", hours: "9h 0m" },
        { date: "2024-10-31", status: "half-day", checkIn: "09:00", checkOut: "13:00", hours: "4h 0m" }
      ]
    },
    '2024-9': {
      totalDays: 30,
      workingDays: 21,
      present: 19,
      absent: 0,
      late: 2,
      halfDays: 0,
      overtime: 8,
      dailyRecords: []
    },
    '2024-8': {
      totalDays: 31,
      workingDays: 22,
      present: 18,
      absent: 2,
      late: 4,
      halfDays: 2,
      overtime: 3,
      dailyRecords: []
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getCurrentMonthKey = () => `${selectedYear}-${selectedMonth + 1}`;
  const currentData = attendanceData[getCurrentMonthKey()] || attendanceData['2024-10'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'absent':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'late':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'half-day':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'weekend':
        return 'bg-gray-50 text-gray-500 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-3 w-3" />;
      case 'absent':
        return <XCircle className="h-3 w-3" />;
      case 'late':
        return <Clock className="h-3 w-3" />;
      case 'half-day':
        return <AlertTriangle className="h-3 w-3" />;
      default:
        return <Calendar className="h-3 w-3" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric'
    });
  };

  const attendancePercentage = ((currentData.present + currentData.halfDays * 0.5) / currentData.workingDays * 100).toFixed(1);

  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      if (selectedMonth === 0) {
        setSelectedMonth(11);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    } else {
      if (selectedMonth === 11) {
        setSelectedMonth(0);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-3 py-4"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6 flex justify-between items-start"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">
              Attendance Tracker
            </h1>
            <p className="text-gray-600 text-sm">
              Track your daily attendance and working hours
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </motion.div>

        {/* Month Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 mb-6"
        >
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>

            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-800">
                {months[selectedMonth]} {selectedYear}
              </h2>
              <p className="text-sm text-gray-600">
                Attendance: {attendancePercentage}%
              </p>
            </div>

            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6"
        >
          <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
            <div className="text-xs text-gray-600 mb-1">Working Days</div>
            <div className="text-xl font-bold text-gray-800">{currentData.workingDays}</div>
          </div>
          <div className="bg-green-50 rounded-lg shadow-sm p-3 border border-green-200">
            <div className="text-xs text-green-600 mb-1">Present</div>
            <div className="text-xl font-bold text-green-700">{currentData.present}</div>
          </div>
          <div className="bg-red-50 rounded-lg shadow-sm p-3 border border-red-200">
            <div className="text-xs text-red-600 mb-1">Absent</div>
            <div className="text-xl font-bold text-red-700">{currentData.absent}</div>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow-sm p-3 border border-yellow-200">
            <div className="text-xs text-yellow-600 mb-1">Late Arrivals</div>
            <div className="text-xl font-bold text-yellow-700">{currentData.late}</div>
          </div>
          <div className="bg-blue-50 rounded-lg shadow-sm p-3 border border-blue-200">
            <div className="text-xs text-blue-600 mb-1">Half Days</div>
            <div className="text-xl font-bold text-blue-700">{currentData.halfDays}</div>
          </div>
          <div className="bg-purple-50 rounded-lg shadow-sm p-3 border border-purple-200">
            <div className="text-xs text-purple-600 mb-1">Overtime</div>
            <div className="text-xl font-bold text-purple-700">{currentData.overtime}</div>
          </div>
        </motion.div>

        {/* Main Content - Side by Side with Equal Heights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left Side - Daily Records with Fixed Height */}
          <DailyRecords
            currentData={currentData}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
            formatDate={formatDate}
            motion={motion}
            User={User}
          />

          {/* Right Side - Summary & Insights with Matching Height and Proper Spacing */}
          <AttendanceSummary
            attendancePercentage={attendancePercentage}
            currentData={currentData}
            motion={motion}
          />

        </div>
      </motion.div>
    </div>
  );
};

export default Attendance;
