import { useState, useEffect } from "react";

// layouts/UserLayout.jsx
import { Outlet, useLocation } from "react-router-dom";
const UserLayout = () => {
  return <Outlet />;
};

export default UserLayout;
