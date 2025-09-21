import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenuAlt3, HiX } from 'react-icons/hi';
import { FiBell, FiLogOut, FiUser, FiSettings } from 'react-icons/fi';
import useAuthStore from '@/store/authStore';

import { useNavigate } from 'react-router-dom';
import Breadcrumb from '@/components/BreadCrumb';
import notification from '@/services/NotificationService';
import { confirm } from '@/services/ConfirmationService';
// import TokenStatus from './TokenStatus'; //later to be integrated

import getBaseFileURL from '@/utils/getBaseFileUrl';
import { handleTokenExpiration } from '@/utils/logoutUtils';


const Navbar = ({ getActiveTabTitle, setSidebarOpen, sidebarOpen }) => {

    const notify = notification();
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const logout = useAuthStore((state) => state.logout);
    const user = useAuthStore((state) => state.user);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    const baseFileURL = getBaseFileURL();

    const handleLogout = async () => {
        // custom message and title
        const confirmed = await confirm({
            title: "Logout Confirmation",
            message: "Are you sure you want to log out?",
        });

        if (confirmed) {
            // Use centralized logout utility
            handleTokenExpiration();
            notify.info("Loggin Out !")
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setProfileDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <motion.header
            className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200/80 sticky top-0 z-30"
            initial={{ y: -60 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            <div className="flex items-center justify-between lg:px-6 lg:py-1.5 ">
                <div className="flex items-center space-x-4">
                    {/* Sidebar Toggle Button - Works on all screen sizes */}
                    <motion.button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2.5 rounded-xl text-gray-500 hover:text-slate-600 hover:bg-slate-50 transition-all duration-200 lg:hidden"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {sidebarOpen ? (
                            <HiX className="text-xl" />
                        ) : (
                            <HiMenuAlt3 className="text-xl" />
                        )}
                    </motion.button>

                    {/* Page Title */}
                    <div className="flex items-center space-x-3">
                        <div>
                            <motion.h1
                                className="text-xl font-bold text-gray-900"
                                key={getActiveTabTitle()}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* {getActiveTabTitle()} */}
                            </motion.h1>
                            <Breadcrumb />
                        </div>
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center space-x-4">
                    {/* Token Status */}
                    {/* <TokenStatus className="hidden lg:flex" /> */}


                    {/* Search */}
                        <div className="hidden md:flex items-center space-x-2 bg-gray-50 rounded-xl px-4 py-2.5 min-w-[300px] border border-slate-700/20">
                            <i className="fas fa-search text-gray-400"></i>
                            <input
                                type="text"
                                placeholder="Search employees, departments..."
                                className="bg-transparent flex-1 text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
                            />
                        </div>
                    

                    {/* Notifications */}
                    <motion.button
                        className="relative p-2.5 text-gray-500 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <FiBell className="text-xl" />
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                            3
                        </span>
                    </motion.button>

                    {/* Profile Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <motion.div
                            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                            className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-xl cursor-pointer transition-all duration-200"
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="w-8 h-8 bg-slate-100 border border-gray-200 rounded-full flex items-center justify-center">
                                    <FiUser />
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-sm font-medium text-gray-900">
                                    {user?.name || "Administrator"}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {user?.role || "Administrator"}
                                </p>
                            </div>
                            <motion.i
                                className="fas fa-chevron-down text-gray-400 text-xs"
                                animate={{ rotate: profileDropdownOpen ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                            />
                        </motion.div>

                        {/* Dropdown Menu */}
                        <AnimatePresence>
                            {profileDropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200/80 py-2 z-50"
                                >
                                    {/* User Info */}
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <p className="text-sm font-medium text-gray-900">
                                            {user?.name || "N/A"}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {user?.email || "N/A"}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            Employee ID: {user?.id || "N/A"}
                                        </p>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="py-1">
                                        <motion.button
                                            onClick={() => {
                                                navigate('/profile');
                                                setProfileDropdownOpen(false); // optional: close the dropdown
                                            }}
                                            whileHover={{ backgroundColor: '#f9fafb' }}
                                            className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors duration-200 cursor-pointer"
                                        >
                                            <FiUser className="text-gray-400" />
                                            <span>View Profile</span>
                                        </motion.button>


                                        <motion.button
                                            onClick={() => {
                                                navigate('/settings');
                                                setProfileDropdownOpen(false); // optional: close the dropdown
                                            }}
                                            whileHover={{ backgroundColor: '#f9fafb' }}
                                            className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors duration-200 cursor-pointer"
                                        >
                                            <FiSettings className="text-gray-400" />
                                            <span>Settings</span>
                                        </motion.button>

                                        <div className="border-t border-gray-100 my-1"></div>

                                        <motion.button
                                            onClick={handleLogout}
                                            whileHover={{ backgroundColor: '#fef2f2' }}
                                            className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:text-red-700 transition-colors duration-200 cursor-pointer"
                                        >
                                            <FiLogOut className="text-red-500" />
                                            <span>Logout</span>
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </motion.header>
    );
};

export default Navbar;
