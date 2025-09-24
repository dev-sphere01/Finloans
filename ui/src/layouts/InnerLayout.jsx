import { useState, useEffect } from "react";
import { motion as M, AnimatePresence } from "framer-motion";

// layouts/InnerLayout.jsx
import { Outlet, useLocation } from "react-router-dom";
import useAuthStore from '@/store/authStore';

// components imports
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer'

// navigation items 
import { getNavConfig } from "./components/NavConfig";

const InnerLayout = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("");
  // Initialize sidebar state based on screen size
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Check if we're on desktop (lg breakpoint and above)
    return typeof window !== 'undefined' && window.innerWidth >= 1024;
  });


  useEffect(() => {
    const currentPath = location.pathname.split("/")[2];
    // e.g., "add-employee" from "/dashboard/add-employee"
    setActiveTab(currentPath || "dashboard");
  }, [location]);


  // Handle window resize to manage sidebar state
  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 1024;
      // Only auto-open on desktop if it's currently closed
      // Don't auto-close on mobile since user might want to keep it open
      if (isDesktop && !sidebarOpen) {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  // Get menu items based on user's role permissions
  // const menuItems = getNavConfig(user?.rolePermissions || []);
  const menuItems = getNavConfig(1 || []); // <--- temporary until role based access 

  const getActiveTabTitle = () => {
    const item = menuItems.find(
      (item) => item.id === activeTab && item.type === "item"
    );
    return item ? item.name : activeTab === "dashboard" ? "Dashboard" : "Page Not Found";
  };

  return (
    <div className="inner-layout h-screen w-full flex overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">

      {/* Sidebar Container */}
      <div className="h-full overflow-y-auto z-50">
        <Sidebar
          menuItems={menuItems}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <M.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-100">
        <Navbar
          getActiveTabTitle={getActiveTabTitle}
          setSidebarOpen={setSidebarOpen}
          sidebarOpen={sidebarOpen}
        />

        <M.main
          className="flex-1 p-4 m-1 bg-white rounded-lg shadow-lg overflow-y-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </M.main>

        <Footer />
      </div>
    </div>
  );
};

export default InnerLayout;
