import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiLogOut, FiChevronDown } from "react-icons/fi";
import { FaHome } from "react-icons/fa";
import { NavLink, useLocation } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { confirm } from "@/services/ConfirmationService";
import notification from "@/services/NotificationService"; // Changed import
import { handleTokenExpiration } from "@/utils/logoutUtils";

const Sidebar = ({ sidebarOpen, setSidebarOpen, menuItems }) => {
    console.log(menuItems)
    const [isMobile, setIsMobile] = React.useState(false);
    const notify = notification(); // Added this line
    const [expandedSection, setExpandedSection] = useState(null);
    const logout = useAuthStore((state) => state.logout);
    const user = useAuthStore((state) => state.user);
    const navigate = useNavigate();
    const location = useLocation();
    const sidebarRef = useRef(null);

    // Group menu items by sections
    const groupedMenuItems = React.useMemo(() => {
        const sections = {};
        let currentSection = null;

        menuItems.forEach((item) => {
            if (item.type === "heading") {
                currentSection = {
                    id: item.id,
                    name: item.name,
                    items: []
                };
                sections[item.id] = currentSection;
            } else if (item.type === "item" && currentSection) {
                currentSection.items.push(item);
            }
        });

        return Object.values(sections);
    }, [menuItems]);

    // Initialize with first section expanded
    React.useEffect(() => {
        if (groupedMenuItems.length > 0 && !expandedSection) {
            setExpandedSection(groupedMenuItems[0].id);
        }
    }, [groupedMenuItems, expandedSection]);

    const handleLogout = async () => {
        const confirmed = await confirm({
            title: "Confirm Logout",
            message: "Are you sure you want to log out of your account?",
        });

        if (confirmed) {
            notify.success("Logged out"); // Changed usage
            handleTokenExpiration();
        }
    };

    // Handle accordion toggle
    const toggleSection = (sectionId) => {
        // Always allow switching to a different section
        setExpandedSection(sectionId);
        // Note: We don't allow collapsing the same section to ensure at least one remains open
    };

    // Check if current route belongs to a section and expand it (only when route changes)
    React.useEffect(() => {
        const currentPath = location.pathname.split("/")[2];
        if (currentPath) {
            // Find which section contains the current route
            const currentSection = groupedMenuItems.find(section =>
                section.items.some(item => item.id === currentPath)
            );
            // Only auto-expand if no section is currently expanded
            if (currentSection && !expandedSection) {
                setExpandedSection(currentSection.id);
            }
        } else if ((location.pathname === "/dashboard" || location.pathname === "/dashboard/") && !expandedSection) {
            // If on dashboard route and no section is expanded, keep the first section expanded
            if (groupedMenuItems.length > 0) {
                setExpandedSection(groupedMenuItems[0].id);
            }
        }
    }, [location.pathname, groupedMenuItems]); // Removed expandedSection dependency

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                sidebarRef.current &&
                !sidebarRef.current.contains(event.target) &&
                sidebarOpen &&
                isMobile
            ) {
                setSidebarOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [sidebarOpen, isMobile]);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    return (
        <motion.div
            ref={sidebarRef}
            initial={false}
            animate={{
                x: isMobile ? (sidebarOpen ? 0 : -280) : 0,
                opacity: isMobile ? (sidebarOpen ? 1 : 0) : 1,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl border-r border-gray-200/80
        lg:relative lg:translate-x-0 lg:opacity-100 lg:shadow-lg
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                }`}
        >
            {/* Header */}
            <div
                className="flex items-center justify-center h-16 bg-gradient-to-r from-gray-600 to-slate-700 border-b border-gray-500/20 cursor-pointer gap-2 "
                onClick={() => navigate("/dashboard")}
            >
                <span className="text-white">
                    <FaHome size={25} />
                </span>
                <motion.h1
                    className="text-white text-xl font-bold tracking-wide "
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    FinLoans
                </motion.h1>
            </div>

            {/* Navigation - Accordion Style */}
            <nav className="flex-1 px-2 py-2 overflow-y-auto h-[calc(100vh-8rem)]">
                <AnimatePresence>
                    {groupedMenuItems.map((section, sectionIndex) => (
                        <motion.div
                            key={section.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: sectionIndex * 0.05 }}
                            className="mb-2"
                        >
                            {/* Section Header */}
                            <button
                                onClick={() => toggleSection(section.id)}
                                className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 group"
                            >
                                <span className="uppercase tracking-wider text-xs">
                                    {section.name}
                                </span>
                                <motion.div
                                    animate={{
                                        rotate: expandedSection === section.id ? 0 : 90
                                    }}
                                    transition={{ duration: 0.2 }}
                                    className="text-gray-400 group-hover:text-gray-600"
                                >
                                    <FiChevronDown size={16} />
                                </motion.div>
                            </button>

                            {/* Section Items */}
                            <AnimatePresence>
                                {expandedSection === section.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="overflow-hidden"
                                    >
                                        <div className="pl-2 space-y-1">
                                            {section.items.map((item, itemIndex) => (
                                                <motion.div
                                                    key={item.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: itemIndex * 0.05 }}
                                                >
                                                    <NavLink
                                                        to={`/dashboard/${item.id}`}
                                                        onClick={() => isMobile && setSidebarOpen(false)}
                                                        className={({ isActive }) => {
                                                            // Check for exact match to prevent parent route highlighting
                                                            const currentPath = location.pathname;
                                                            const linkPath = `/dashboard/${item.id}`;
                                                            const isExactMatch = currentPath === linkPath;

                                                            return `w-full flex items-center px-4 py-2.5 rounded-md text-left text-sm font-medium transition-all duration-200 group ${isExactMatch
                                                                ? "bg-gradient-to-r from-gray-100 to-gray-50 border-l-4 border-gray-600 text-gray-800 font-semibold shadow-sm"
                                                                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:pl-5"
                                                                }`;
                                                        }}
                                                    >
                                                        <div className="mr-3 text-base text-gray-400 group-hover:text-gray-600 transition-colors duration-200">
                                                            {item.icon}
                                                        </div>
                                                        <span>{item.name}</span>
                                                    </NavLink>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </nav>

            {/* Bottom User Info */}
            <div className="p-0 border-t border-gray-200">
                <div className="flex items-center justify-between bg-gray-50 rounded-lg px-1 py-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                            <i className="fas fa-user text-white text-sm"></i>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {user?.email || "Admin User"}
                            </p>
                            <p className="text-xs text-gray-500">System Administrator</p>
                        </div>
                    </div>
                    <motion.button
                        onClick={handleLogout}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-md transition-all duration-200 group cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <FiLogOut size={25} />
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

export default Sidebar;