// components/ProtectedRoutes.jsx
import { Navigate, useLocation } from "react-router-dom";
import useAuthStore from "@/store/authStore";

const ProtectedRoutes = ({ children }) => {
    const { isAuthenticated, needsPasswordChange } = useAuthStore();
    const location = useLocation();

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // If user needs to change password and is not on welcome page, redirect to welcome
    if (needsPasswordChange() && location.pathname !== '/welcome') {
        return <Navigate to="/welcome" replace />;
    }

    // If user doesn't need to change password but is on welcome page, redirect to dashboard
    if (!needsPasswordChange() && location.pathname === '/welcome') {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoutes;
