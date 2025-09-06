import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import OuterLayout from '@/layouts/OuterLayout';
import InnerLayout from '@/layouts/InnerLayout';
import Login from '@/pages/auth/Login';
// import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import Welcome from '@/pages/auth/Welcome/Welcome';
import ProtectedRoutes from '@/routes/ProtectedRoutes';
import GuestRoutes from '@/routes/GuestRoutes';
import useAuthStore from '@/store/authStore';

import AddEmployee from '@/pages/EmployeeManagement/AddEmployee/AddEmployee';
import ImportEmployees from '@/pages/EmployeeManagement/ImportEmployee/ImportEmployees';
import AllEmployees from '@/pages/EmployeeManagement/AllEmployees/AllEmployees';
import EmployeeDetails from '@/pages/EmployeeManagement/AllEmployees/components/EmployeeDetails';
import Onboarding from '@/pages/EmployeeManagement/OnBoarding/OnBoarding';

// Master Routes
import Departments from '@/pages/Masters/Departments/Departments';
import Positions from '@/pages/Masters/Positions/Positions';
import SalaryStructures from '@/pages/Payroll/SalaryStructures/SalaryStructures';
import PayrollSlabs from '@/pages/Masters/PayrollSlabs/PayrollSlabs';
import Assets from '@/pages/EmployeeManagement/Assets/Assets';

import ImportAttendance from '@/pages/Payroll/ImportAttendance';
import LoansAdvances from '@/pages/Payroll/Loans&Advances/CreateNew/LoansAdvances';
import LoanAdminDashboard from '@/pages/Payroll/Loans&Advances/ViewActive/ViewActive';
import Reports from '@/pages/Payroll/Reports';

import UserRoles from '@/pages/Administration/UserRoles';
import Settings from '@/pages/Administration/Settings';
import AuditLogs from '@/pages/Administration/AuditLogs';

import DashboardHome from '@/pages/Dashboard/Dashboard';

// User pages
import ProfilePage from '@/pages/Profile/ProfilePage';
import UserSettings from '@/pages/Profile/components/Settings';
import ChangePassword from '@/pages/Profile/components/ChangePassword';

// Not found page
import NotFound from '@/pages/NotFound/NotFound';

// Notification wrapper (mounts toast globally)
import NotificationContainer from '@/components/NotificationContainer';

// Confirmation wrapper (mounts toast globally)
import ConfirmationProvider from '@/components/ConfirmationProvider';

// Demo pages
import ExcelUploadDemo from '@/demopages/ExcelUploadDemo';

import './App.css';
import UpdateEmployee from '@/pages/EmployeeManagement/UpdateEmployee/UpdateEmployee';
import EmployeeLayout from '@/layouts/EmployeeLayout';

//Employee Pages
import Home from '@/pages/EmployeePages/Home/Home';
import Attendance from '@/pages/EmployeePages/Attendance/Attendance';
import BankDetails from '@/pages/EmployeePages/BankDetails/BankDetails';
import Documents from '@/pages/EmployeePages/Documents/Documents';
import LeaveManagement from '@/pages/EmployeePages/LeaveManagement/LeaveManagement';
import LoansAndAdvances from '@/pages/EmployeePages/LoansAndAdvances/LoansAndAdvances';
import Profile from '@/pages/EmployeePages/Profile/Profile';
import SalaryAndPayslips from '@/pages/EmployeePages/SalaryAndPaylips/SalaryAndPayslips';
import LeaveHistory from '@/pages/EmployeePages/LeaveManagement/components/LeaveHistory';
import EmpDataMapDemo from '@/demopages/EmpDataMapDemo';
import PayrollAssignment from '@/pages/Payroll/PayrollAssignment';
import CTCAssignment from '@/pages/Payroll/CTCAssignment';
import Academic from '@/pages/EmployeePages/AcadAndProf/Academic';
import Professional from '@/pages/EmployeePages/AcadAndProf/Professional';
import ProcessPayroll from './pages/Payroll/ProcessPayroll';


function App() {
  const { initializeAuth, getUserRole, isLoading, isInitialized } = useAuthStore();

  // Initialize auth state on app load
  React.useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const roleId = getUserRole(); // Get role from auth store

  // Show loading spinner while initializing auth
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      {/* ✅ Mount notifications globally — outside Routes */}
      <NotificationContainer />
      {/* ✅ Mount confirmation modal globally — outside Routes */}
      <ConfirmationProvider />

      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Public Routes */}
        <Route
          element={
            <GuestRoutes>
              <OuterLayout />
            </GuestRoutes>
          }
        >
          <Route path="/login" element={<Login />} />
          {/* <Route path="/register" element={<Register />} /> */}
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Welcome Route - for password change */}
        <Route
          path="/welcome"
          element={
            <ProtectedRoutes>
              <Welcome />
            </ProtectedRoutes>
          }
        />


        {/* Protected Routes */}

        {roleId === 1 ? (<Route
          element={
            <ProtectedRoutes>
              <InnerLayout />
            </ProtectedRoutes>
          }
        >
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/dashboard/add-employee" element={<AddEmployee />} />
          <Route path="/dashboard/import-employees" element={<ImportEmployees />} />
          <Route path="/dashboard/all-employees" element={<AllEmployees />} />
          {/* Updated route - removed the old AccessEmployee route and added the new EmployeeDetails route */}
          <Route path="/dashboard/all-employees/:id" element={<EmployeeDetails />} />
          <Route path="/dashboard/onboarding" element={<Onboarding />} />
          {/* New route for updating employee profiles from onboarding */}
          <Route path="/dashboard/onboarding/update-employee/:id" element={<UpdateEmployee />} />
          <Route path="/dashboard/departments/*" element={<Departments />} />
          <Route path="/dashboard/positions/*" element={<Positions />} />
          <Route path="/dashboard/payroll-slabs" element={<PayrollSlabs />} />
          <Route path="/dashboard/assets" element={<Assets />} />
          <Route path="/dashboard/import-attendance" element={<ImportAttendance />} />
          <Route path="/dashboard/salary-structures" element={<SalaryStructures />} />
          <Route path="/dashboard/loans-advances" element={<LoansAdvances />} />
          <Route path="/dashboard/loans-advances-view" element={<LoanAdminDashboard />} />
          <Route path="/dashboard/reports" element={<Reports />} />
          <Route path="/dashboard/user-roles" element={<UserRoles />} />
          <Route path="/dashboard/settings" element={<Settings />} />
          <Route path="/dashboard/audit-logs" element={<AuditLogs />} />
          <Route path="/dashboard/payroll-assignment" element={<PayrollAssignment />} />
          <Route path="/dashboard/process-payroll" element={<ProcessPayroll />} />
          <Route path="/dashboard/ctc-assignment" element={<CTCAssignment />} />
          <Route path="/dashboard/leave-management/apply" element={<LeaveManagement />} />
          <Route path="/dashboard/leave-management/history" element={<LeaveHistory />} />

          {/* ----------------------------- */}
          <Route path="/dashboard/attendance" element={<Attendance />} />
          <Route path="/dashboard/bank-details" element={<BankDetails />} />
          <Route path="/dashboard/documents" element={<Documents />} />
          <Route path="/dashboard/profile" element={<Profile />} />
          <Route path="/dashboard/salary-and-payslips" element={<SalaryAndPayslips />} />
          <Route path="/dashboard/loan-and-advance" element={<LoansAndAdvances />} />
          <Route path="/dashboard/academic" element={<Academic />} />
          <Route path="/dashboard/professional" element={<Professional />} />

          {/* Demo pages */}
          <Route path="/dashboard/excel-upload" element={<ExcelUploadDemo />} />
          <Route path='/dashboard/emp-data-map' element={<EmpDataMapDemo />} />

          {/* Profile routes */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<UserSettings />} />
          <Route path="/change-password" element={<ChangePassword />} />


          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Route>) : (
          <Route
            element={
              <ProtectedRoutes>
                <EmployeeLayout />
              </ProtectedRoutes>
            }
          >
            <Route path="/dashboard" element={<Home />} />
            <Route path="/dashboard/leave-management/apply" element={<LeaveManagement />} />
            <Route path="/dashboard/leave-management/history" element={<LeaveHistory />} />
            <Route path="/dashboard/attendance" element={<Attendance />} />
            <Route path="/dashboard/bank-details" element={<BankDetails />} />
            <Route path="/dashboard/documents" element={<Documents />} />
            <Route path="/dashboard/profile" element={<Profile />} />
            <Route path="/dashboard/salary-and-payslips" element={<SalaryAndPayslips />} />
            <Route path="/dashboard/loans-advances" element={<LoansAdvances />} />
            <Route path="/dashboard/loan-and-advance" element={<LoansAndAdvances />} />
            <Route path="/dashboard/academic" element={<Academic />} />
            <Route path="/dashboard/professional" element={<Professional />} />

            {/* Profile routes */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<UserSettings />} />
            <Route path="/change-password" element={<ChangePassword />} />
            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Route>)}

      </Routes>
    </Router>
  );
}

export default App;