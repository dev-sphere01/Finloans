import React from "react";
// menu item icons imports
import {
  Users, FileSpreadsheet, ShieldCheck, Settings, BarChart3, Building, 
  Briefcase, DollarSign, Calculator, Layers, CreditCard, Clock, 
  Calendar, Landmark, User, FileText, Bell, Megaphone, TrendingUp
} from "lucide-react";

// Define menu structure based on modules and permissions
const MODULE_MENU_MAPPING = {
  // System Administration
  users: { 
    id: "user-management", 
    name: "User Management", 
    icon: <Users size={18} />, 
    path: "/administration/user-roles",
    category: "administration"
  },
  roles: { 
    id: "role-management", 
    name: "Role Management", 
    icon: <ShieldCheck size={18} />, 
    path: "/administration/role-management",
    category: "administration"
  },
  audit: { 
    id: "audit-logs", 
    name: "Audit Logs", 
    icon: <FileText size={18} />, 
    path: "/administration/audit-logs",
    category: "administration"
  },
  settings: { 
    id: "settings", 
    name: "System Settings", 
    icon: <Settings size={18} />, 
    path: "/administration/settings",
    category: "administration"
  },

  // Analytics & Reports
  dashboard: { 
    id: "dashboard", 
    name: "Dashboard", 
    icon: <BarChart3 size={18} />, 
    path: "/dashboard",
    category: "analytics"
  },
  reports: { 
    id: "reports", 
    name: "Reports", 
    icon: <FileSpreadsheet size={18} />, 
    path: "/reports",
    category: "analytics"
  },
  analytics: { 
    id: "analytics", 
    name: "Analytics", 
    icon: <TrendingUp size={18} />, 
    path: "/analytics",
    category: "analytics"
  },

  // HR Management
  employees: { 
    id: "employees", 
    name: "Employee Management", 
    icon: <Users size={18} />, 
    path: "/hr/employees",
    category: "hr"
  },
  departments: { 
    id: "departments", 
    name: "Departments", 
    icon: <Building size={18} />, 
    path: "/masters/departments",
    category: "hr"
  },
  positions: { 
    id: "positions", 
    name: "Positions", 
    icon: <Briefcase size={18} />, 
    path: "/masters/positions",
    category: "hr"
  },

  // Finance & Payroll
  payroll: { 
    id: "payroll", 
    name: "Payroll Management", 
    icon: <DollarSign size={18} />, 
    path: "/finance/payroll",
    category: "finance"
  },
  salary_structure: { 
    id: "salary-structure", 
    name: "Salary Structure", 
    icon: <Calculator size={18} />, 
    path: "/masters/salary-structure",
    category: "finance"
  },
  payroll_slabs: { 
    id: "payroll-slabs", 
    name: "Payroll Slabs", 
    icon: <Layers size={18} />, 
    path: "/masters/payroll-slabs",
    category: "finance"
  },
  loans_advances: { 
    id: "loans-advances", 
    name: "Loans & Advances", 
    icon: <CreditCard size={18} />, 
    path: "/finance/loans-advances",
    category: "finance"
  },
  banking: { 
    id: "banking", 
    name: "Banking", 
    icon: <Landmark size={18} />, 
    path: "/finance/banking",
    category: "finance"
  },

  // Operations
  attendance: { 
    id: "attendance", 
    name: "Attendance", 
    icon: <Clock size={18} />, 
    path: "/operations/attendance",
    category: "operations"
  },
  leaves: { 
    id: "leaves", 
    name: "Leave Management", 
    icon: <Calendar size={18} />, 
    path: "/operations/leaves",
    category: "operations"
  },
  documents: { 
    id: "documents", 
    name: "Documents", 
    icon: <FileText size={18} />, 
    path: "/operations/documents",
    category: "operations"
  },

  // Communication
  notifications: { 
    id: "notifications", 
    name: "Notifications", 
    icon: <Bell size={18} />, 
    path: "/communication/notifications",
    category: "communication"
  },
  announcements: { 
    id: "announcements", 
    name: "Announcements", 
    icon: <Megaphone size={18} />, 
    path: "/communication/announcements",
    category: "communication"
  },

  // Personal
  profile: { 
    id: "profile", 
    name: "My Profile", 
    icon: <User size={18} />, 
    path: "/profile",
    category: "personal"
  }
};

// Category definitions for menu grouping
const MENU_CATEGORIES = {
  administration: { name: "Administration", order: 1 },
  analytics: { name: "Analytics & Reports", order: 2 },
  hr: { name: "Human Resources", order: 3 },
  finance: { name: "Finance & Payroll", order: 4 },
  operations: { name: "Operations", order: 5 },
  communication: { name: "Communication", order: 6 },
  personal: { name: "Personal", order: 7 }
};

// Static demo items (to be removed in production)
const DEMO_ITEMS = [
  { id: "demo", name: "Demo Pages (Dev)", type: "heading" },
  { id: "excel-upload", name: "Excel Import Demo", icon: <FileSpreadsheet size={18} />, type: "item", path: "/dashboard/excel-upload" },
  { id: "emp-data-map", name: "Employee Data Mapping", icon: <Users size={18} />, type: "item", path: "/dashboard/emp-data-map" },
];

// 🔑 Function to generate menu based on user permissions
export const getMenuConfig = (userPermissions = []) => {
  const menuItems = [];
  const categorizedItems = {};

  // Group permissions by category
  userPermissions.forEach(permission => {
    const moduleConfig = MODULE_MENU_MAPPING[permission.resource];
    if (moduleConfig && permission.actions.includes('read')) {
      const category = moduleConfig.category;
      if (!categorizedItems[category]) {
        categorizedItems[category] = [];
      }
      categorizedItems[category].push({
        ...moduleConfig,
        type: "item",
        permission: permission
      });
    }
  });

  // Build menu structure with categories
  Object.entries(MENU_CATEGORIES)
    .sort(([,a], [,b]) => a.order - b.order)
    .forEach(([categoryKey, category]) => {
      const categoryItems = categorizedItems[categoryKey];
      if (categoryItems && categoryItems.length > 0) {
        // Add category heading
        menuItems.push({
          id: `${categoryKey}-heading`,
          name: category.name,
          type: "heading"
        });
        
        // Add category items
        menuItems.push(...categoryItems);
      }
    });

  // Add demo items for development (remove in production)
  if (process.env.NODE_ENV === 'development') {
    menuItems.push(...DEMO_ITEMS);
  }

  return menuItems;
};

// 🔑 Legacy function for backward compatibility (roleId-based)
export const getMenuConfigByRole = (roleId) => {
  // This is a fallback for the old system
  // In the new system, use getMenuConfig with actual permissions
  if (roleId === 1) {
    // Super admin gets all modules
    const allPermissions = Object.keys(MODULE_MENU_MAPPING).map(resource => ({
      resource,
      actions: ['read', 'create', 'update', 'delete', 'manage']
    }));
    return getMenuConfig(allPermissions);
  }
  
  // Default minimal permissions for other roles
  const basicPermissions = [
    { resource: 'dashboard', actions: ['read'] },
    { resource: 'profile', actions: ['read', 'update'] }
  ];
  return getMenuConfig(basicPermissions);
};

// Export module mapping for use in other components
export { MODULE_MENU_MAPPING, MENU_CATEGORIES };