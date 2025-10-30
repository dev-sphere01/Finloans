import { useState, useEffect } from "react";
import { Menu, X, Phone, Mail, User, LogOut, ChevronDown } from "lucide-react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import useAuthStore from "@/store/authStore";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { confirm } from "@/services/ConfirmationService";
import notification from "@/services/NotificationService";
import { handleTokenExpiration } from "@/utils/logoutUtils";

export default function Header({ setIsApplyModalOpen }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Auth store and navigation
    const user = useAuthStore((state) => state.user);
    const navigate = useNavigate();
    const location = useLocation();
    const notify = notification();

    // Scroll progress
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navItems = [
        { name: "Home", href: "/dashboard", type: "route" },
        // { name: "Services", href: "/dashboard#services", type: "hash-route" },
        { name: "Check CIBIL", href: "/cibil-check", type: "route" },
        // { name: "About", href: "/about", type: "route" },
        // { name: "Contact", href: "/contact", type: "route" },
    ];

    const handleLogout = async () => {
        const confirmed = await confirm({
            title: "Confirm Logout",
            message: "Are you sure you want to log out of your account?",
        });

        if (confirmed) {
            notify.success("Logged out successfully");
            setIsProfileOpen(false);
            handleTokenExpiration();
        }
    };

    const handleNavClick = (e, href, type) => {
        if (type === 'route') {
            // For route navigation, use React Router
            navigate(href);
        } else if (type === 'hash-route') {
            // For hash route navigation (e.g., /dashboard#services)
            const [path, hash] = href.split('#');
            navigate(path);
            
            // Wait for navigation to complete, then scroll to section
            setTimeout(() => {
                const targetElement = document.getElementById(hash);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                    });
                }
            }, 100);
        } else if (type === 'scroll') {
            // For scroll navigation, use smooth scroll
            e.preventDefault();
            const targetId = href.replace('#', '');
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            }
        }

        // Close mobile menu if open
        setIsMenuOpen(false);
    };

    // Check if current route is active
    const isActiveRoute = (href, type) => {
        if (type === 'hash-route') {
            const [path] = href.split('#');
            return location.pathname === path;
        }
        if (href === '/dashboard' && location.pathname === '/dashboard') return true;
        if (href !== '/dashboard' && location.pathname.startsWith(href)) return true;
        return false;
    };

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`sticky top-0 left-0 right-0 z-50 transition-all duration-200 ${isScrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-slate-50"
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <motion.div
                        className="flex items-center space-x-3 cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => navigate('/dashboard')}
                    >
                        <img
                            src="https://finloansfinancialservices.com/non-bg-logo.png"
                            alt="Finloans Logo"
                            className="h-20 w-auto rounded"
                        />
                    </motion.div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        {navItems.map((item, index) => (
                            item.type === 'route' ? (
                                <motion.div
                                    key={item.name}
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    <Link
                                        to={item.href}
                                        className={`font-medium transition-colors duration-200 relative group cursor-pointer ${isActiveRoute(item.href, item.type)
                                                ? 'text-[#2D9DB2]'
                                                : 'text-slate-700 hover:text-[#2D9DB2]'
                                            }`}
                                    >
                                        {item.name}
                                        <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#2D9DB2] transition-all duration-300 ${isActiveRoute(item.href, item.type) ? 'w-full' : 'w-0 group-hover:w-full'
                                            }`}></span>
                                    </Link>
                                </motion.div>
                            ) : (
                                <motion.button
                                    key={item.name}
                                    onClick={(e) => handleNavClick(e, item.href, item.type)}
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className={`font-medium transition-colors duration-200 relative group cursor-pointer ${isActiveRoute(item.href, item.type)
                                            ? 'text-[#2D9DB2]'
                                            : 'text-slate-700 hover:text-[#2D9DB2]'
                                        }`}
                                >
                                    {item.name}
                                    <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#2D9DB2] transition-all duration-300 ${isActiveRoute(item.href, item.type) ? 'w-full' : 'w-0 group-hover:w-full'
                                        }`}></span>
                                </motion.button>
                            )
                        ))}
                    </nav>

                    {/* Right Section (Contact + Profile) */}
                    <div className="hidden lg:flex items-center space-x-6">
                        {/* Contact Info */}
                        <div className="flex items-center space-x-4 text-sm text-slate-600">
                            <div className="flex items-center space-x-1">
                                <Phone size={16} className="text-[#2D9DB2]" />
                                <span>+91 98765 43210</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <Mail size={16} className="text-[#2D9DB2]" />
                                <span>info@finloans.com</span>
                            </div>
                        </div>

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center space-x-2 px-3 py-2 rounded-full bg-slate-100 hover:bg-slate-200 transition group"
                            >
                                <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-gradient-to-r from-[#2D9DB2] to-[#1e7a8c] rounded-full flex items-center justify-center">
                                        <User className="text-white" size={16} />
                                    </div>
                                    {user && (
                                        <div className="hidden md:block text-left">
                                            <p className="text-sm font-medium text-slate-700 truncate max-w-24">
                                                {user.fullName || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username || user.email)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <ChevronDown
                                    size={16}
                                    className={`transition-transform text-slate-500 group-hover:text-slate-700 ${isProfileOpen ? "rotate-180" : ""
                                        }`}
                                />
                            </button>

                            <AnimatePresence>
                                {isProfileOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg overflow-hidden border border-slate-200"
                                    >
                                        <button
                                            onClick={() => {
                                                navigate("/profile");
                                                setIsProfileOpen(false);
                                            }}
                                            className="flex w-full items-center px-4 py-2 text-slate-700 hover:bg-slate-100 transition-colors"
                                        >
                                            <User size={16} className="mr-2 text-[#2D9DB2]" />
                                            Profile
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="flex w-full items-center px-4 py-2 text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors border-t border-slate-100"
                                        >
                                            <LogOut size={16} className="mr-2 text-red-500" />
                                            Logout
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 text-slate-700 hover:text-[#2D9DB2] transition-colors duration-200"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="md:hidden bg-white border-t border-slate-200 shadow-lg"
                    >
                        <div className="px-6 py-4 space-y-4">
                            {navItems.map((item, index) => (
                                item.type === 'route' ? (
                                    <motion.div
                                        key={item.name}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                    >
                                        <Link
                                            to={item.href}
                                            onClick={() => setIsMenuOpen(false)}
                                            className={`block font-medium py-2 transition-colors duration-200 cursor-pointer ${isActiveRoute(item.href)
                                                    ? 'text-[#2D9DB2]'
                                                    : 'text-slate-700 hover:text-[#2D9DB2]'
                                                }`}
                                        >
                                            {item.name}
                                        </Link>
                                    </motion.div>
                                ) : (
                                    <motion.a
                                        key={item.name}
                                        href={item.href}
                                        onClick={(e) => handleNavClick(e, item.href, item.type)}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                        className="block text-slate-700 hover:text-[#2D9DB2] font-medium py-2 transition-colors duration-200 cursor-pointer"
                                    >
                                        {item.name}
                                    </motion.a>
                                )
                            ))}

                            {/* Mobile Profile Section */}
                            <div className="border-t border-slate-200 pt-4">
                                {user && (
                                    <div className="flex items-center px-4 py-2 mb-2">
                                        <div className="w-8 h-8 bg-gradient-to-r from-[#2D9DB2] to-[#1e7a8c] rounded-full flex items-center justify-center mr-3">
                                            <User className="text-white" size={16} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-700">
                                                {user.fullName || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username || "User")}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                <button
                                    onClick={() => {
                                        navigate("/profile");
                                        setIsMenuOpen(false);
                                    }}
                                    className="flex w-full items-center px-4 py-2 text-slate-700 hover:bg-slate-100 transition-colors"
                                >
                                    <User size={16} className="mr-2 text-[#2D9DB2]" />
                                    Profile
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="flex w-full items-center px-4 py-2 text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                                >
                                    <LogOut size={16} className="mr-2 text-red-500" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Scroll Progress Bar */}
            <motion.div
                className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2D9DB2] to-[#1e7a8c] origin-left z-[9999]"
                style={{ scaleX }}
            />
        </motion.header>
    );
}
