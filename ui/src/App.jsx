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

import DashboardHome from '@/pages/Dashboard/Dashboard';

// User pages
import ProfilePage from '@/pages/Profile/ProfilePage';
import UserSettings from '@/pages/Profile/components/Settings';
import ChangePassword from '@/pages/Profile/components/ChangePassword';

// Administration pages
import UserRoles from '@/pages/Administration/UserRoles';
import RoleManagement from '@/pages/Administration/RoleManagement';
import AuditLogs from '@/pages/Administration/AuditLogs';
import Settings from '@/pages/Administration/Settings';

// Not found page
import NotFound from '@/pages/NotFound/NotFound';

// Notification wrapper (mounts toast globally)
import NotificationContainer from '@/components/NotificationContainer';

// Confirmation wrapper (mounts toast globally)
import ConfirmationProvider from '@/components/ConfirmationProvider';

// Demo pages
import ExcelUploadDemo from '@/demopages/ExcelUploadDemo';

import './App.css';
import EmployeeLayout from '@/layouts/EmployeeLayout';

//Employee Pages
import Home from '@/pages/EmployeePages/Home/Home';
import Profile from '@/pages/EmployeePages/Profile/Profile';
import EmpDataMapDemo from '@/demopages/EmpDataMapDemo';


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
        
          {/* ----------------------------- */}
          <Route path="/dashboard/profile" element={<Profile />} />


          {/* Administration routes */}
          <Route path="/administration/user-roles" element={<UserRoles />} />
          <Route path="/administration/role-management" element={<RoleManagement />} />
          <Route path="/administration/audit-logs" element={<AuditLogs />} />
          <Route path="/administration/settings" element={<Settings />} />

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