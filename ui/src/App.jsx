// App.jsx
import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// css import
import "./App.css";

// Layout imports
import OuterLayout from "@/layouts/OuterLayout";
import InnerLayout from "@/layouts/InnerLayout";
import UserLayout from "@/layouts/UserLayout";

// wrapper imports
import GuestRoutes from "@/routes/GuestRoutes";
import ProtectedRoutes from "@/routes/ProtectedRoutes";

// services imports
import NotificationContainer from "@/components/NotificationContainer";
import ConfirmationProvider from "@/components/ConfirmationProvider";
import { PermissionProvider } from "@/components/permissions";

// auth store
import useAuthStore from "@/store/authStore";

//guest pages imports
import Login from "@/pages/auth/Login";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import Register from "@/pages/auth/Register";
import PartnerRegistration from "@/pages/auth/PartnerRegistration";
import ChangePassword from "@/pages/auth/ChangePassword";

//authenticated pages imports
import Dashboard from "@/pages/dashboard/Dashboard";
import UserProfile from "@/pages/Profile/UserProfile";
import UserProfilePage from "@/pages/userPages/profile/UserProfile";
import Settings from "@/pages/settings/Settings";
import CreditCards from "@/pages/masters/creditcards/CreditCards";
import Insurance from "@/pages/masters/insurance/Insurance";
import Loans from "@/pages/masters/loans/Loans";
import Users from "@/pages/masters/users/Users";
import UserFormPage from "@/pages/masters/users/UserFormPage";
import Role from "@/pages/masters/roles/Role";
import ApplicationsList from "@/pages/masters/applications/ApplicationsList";

// Calling module imports
import CallingManagement from "@/pages/masters/calling/CallingManagement";
import BulkUpload from "@/pages/calling/BulkUpload";
import EmployeeCalling from "@/pages/calling/EmployeeCalling";
import LeadDetails from "@/pages/calling/LeadDetails";

import LandingPage from "@/pages/userPages/landingPage/LandingPage";
import ServicesPage from "@/pages/userPages/services/Servicespage";
import ApplicationSuccess from "./pages/userPages/apply/ApplicationSuccess";
import CibilScore from "./pages/userPages/apply/CibilScore";
import CibilCheck from "./pages/userPages/apply/CibilCheck";
import UnifiedApplicationForm from "./pages/userPages/apply/UnifiedApplicationForm";

function App() {
  const { initializeAuth, isLoading, isInitialized, user } = useAuthStore();
  // console.log("user", user);
  const role = user?.roleName;

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
      {/* ✅ Mount permission provider globally */}
      <PermissionProvider>
        {isInitialized && (
          <Routes>
            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" />} />

            {/* Guest Routes with OuterLayout */}
            <Route
              element={
                <GuestRoutes>
                  <OuterLayout />
                </GuestRoutes>
              }
            >
              {/* Auth routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/change-password" element={<ChangePassword />} />
              <Route path="/partner-registration" element={<PartnerRegistration />} />
              {/* Add more guest routes here */}
            </Route>

            {/* User routes - only accessible by users with "user" role */}
            {role === "user" && (
              <Route
                element={
                  <ProtectedRoutes requiredRole="user">
                    <UserLayout />
                  </ProtectedRoutes>
                }
              >
                <Route path="/dashboard" element={<LandingPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/services/:serviceType" element={<ServicesPage />} />
                <Route path="/cibil-score" element={<CibilScore />} />
                <Route path="/cibil-check" element={<CibilCheck />} />
                <Route path="/profile" element={<UserProfilePage />} />

                {/* Unified Application Form Routes */}
                <Route path="/apply/:serviceType/:subType" element={<UnifiedApplicationForm />} />
                <Route path="/apply/:serviceType" element={<UnifiedApplicationForm />} />

                <Route path="/application-success" element={<ApplicationSuccess />} />
                {/* Add more protected routes here as needed */}
              </Route>
            )}

            {/* Admin/Staff routes - only accessible by authenticated users with valid admin/staff roles */}
            {role && role !== "user" && (
              <Route
                element={
                  <ProtectedRoutes>
                    <InnerLayout />
                  </ProtectedRoutes>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/loans" element={<Loans />} />
                <Route path="/dashboard/credit-cards" element={<CreditCards />} />
                <Route path="/dashboard/insurance" element={<Insurance />} />
                <Route path="/dashboard/applications" element={<ApplicationsList />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/dashboard/users" element={<Users />} />
                <Route path="/dashboard/users/add" element={<UserFormPage />} />
                <Route path="/dashboard/users/edit/:userId" element={<UserFormPage />} />
                <Route path="/dashboard/roles" element={<Role />} />

                {/* Calling module routes */}
                <Route path="/dashboard/calling-management" element={<CallingManagement />} />
                <Route path="/dashboard/calling-management/bulk-upload" element={<BulkUpload />} />
                <Route path="/dashboard/my-calls" element={<EmployeeCalling />} />
                <Route path="/calling/lead/:leadId" element={<LeadDetails />} />
              </Route>
            )}

            {/* Catch all route - redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </PermissionProvider>
    </Router>
  );
}

export default App;
