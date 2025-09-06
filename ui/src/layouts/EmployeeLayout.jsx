import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { useLocation, Outlet } from "react-router-dom";
import { getMenuConfig } from "./components/menuConfig";
import useEmpDataStore from "@/store/empDataStore";


const EmployeeLayout = () => {

  const {
    currentEmployee,
    fetchEmployeeById,
    getEmployeeDisplayName,
    loading,
    error
  } = useEmpDataStore();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    return typeof window !== "undefined" && window.innerWidth >= 1024;
  });

  const location = useLocation();
  const [activeTab, setActiveTab] = useState("home");

  // Get menu items for employee role (roleId: 2)
  const menuItems = getMenuConfig(currentEmployee?.RoleID);


  // Track active tab based on location
  useEffect(() => {
    const matchedItem = menuItems.find(
      (item) => item.type === "item" && location.pathname === item.path
    );
    setActiveTab(matchedItem ? matchedItem.id : "home");
  }, [location.pathname]);

  // Auto-open sidebar on desktop resize
  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 1024;
      if (isDesktop && !sidebarOpen) {
        setSidebarOpen(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sidebarOpen]);

  const getActiveTabTitle = () => {
    const item = menuItems.find((item) => item.id === activeTab && item.type === "item");
    return item ? item.name : "Page Not Found";
  };

  return (
    <div className="h-screen w-full flex overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-100">
        <Navbar
          getActiveTabTitle={getActiveTabTitle}
          setSidebarOpen={setSidebarOpen}
          sidebarOpen={sidebarOpen}
        />

        <motion.main
          className="flex-1 p-4 m-4 bg-white rounded-lg shadow-lg overflow-y-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.main>

        <Footer />
      </div>
    </div>
  );
};

export default EmployeeLayout;
