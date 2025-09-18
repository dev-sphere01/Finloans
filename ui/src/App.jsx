// App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// css import
import './App.css'

// Layout imports
import OuterLayout from '@/layouts/OuterLayout';
import InnerLayout from '@/layouts/InnerLayout';

// wrapper imports
import GuestRoutes from '@/routes/GuestRoutes'
import ProtectedRoutes from '@/routes/ProtectedRoutes'

// services imports
import NotificationContainer from '@/components/NotificationContainer'
import ConfirmationProvider from '@/components/ConfirmationProvider'

// auth store
import useAuthStore from '@/store/authStore';

//guest pages imports
import Login from "@/pages/auth/Login"
import ForgotPassword from '@/pages/auth/ForgotPassword'
import Register from '@/pages/auth/Register'
import ChangePassword from '@/pages/auth/ChangePassword'

//authenticated pages imports
import Dashboard from '@/pages/dashboard/Dashboard'
import Profile from '@/pages/profile/Profile';
import Settings from '@/pages/settings/Settings';


function App() {
  const { initializeAuth, isLoading, isInitialized } = useAuthStore();

  // Initialize auth state on app load
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

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

        {/* Guest Routes with OuterLayout */}
        <Route element={
          <GuestRoutes>
            <OuterLayout />
          </GuestRoutes>
        }>
          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} /> /
          <Route path="/change-password" element={<ChangePassword />} /> /

          {/* Add more guest routes here */}
        </Route>

        {/* Protected Routes with InnerLayout */}
        <Route element={
          <ProtectedRoutes>
            <InnerLayout />
          </ProtectedRoutes>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Add more protected routes here as needed */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Catch all route - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
