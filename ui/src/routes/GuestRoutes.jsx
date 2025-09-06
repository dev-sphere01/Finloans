// routes/GuestRoutes.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';

const GuestRoutes = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

export default GuestRoutes;
