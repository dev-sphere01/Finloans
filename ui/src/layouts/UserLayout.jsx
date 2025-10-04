import { useState, useEffect } from "react";
import Header from "@/layouts/components/userNav";
// layouts/UserLayout.jsx
import { Outlet, useLocation } from "react-router-dom";
const UserLayout = () => {
  return <>
    <Header />
    <Outlet />;
  </>
};

export default UserLayout;
