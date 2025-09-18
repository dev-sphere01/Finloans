// components/GuestRoutes.jsx
import { Navigate } from "react-router-dom";
import useAuthStore from "@/store/authStore";

const GuestRoutes = ({ children }) => {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);

    // If authenticated, redirect to dashboard
    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    // If not authenticated, show guest routes
    return children;
};

export default GuestRoutes;
