
// menu item icons imports

import {
  Building,
  Laptop,
  BarChart3,
  MapPin,
  CalendarDays,
  ReceiptIndianRupee,
  CreditCard ,
  HandCoins ,
  ShieldUser, 
  Users
} from "lucide-react";

const allMenuItems = [
  // Dashboard
  // { id: "home", name: "Home", icon: <LayoutDashboard size={18} />, type: "item", path: "/dashboard", roleId: [1,2] },//not used 
  
  
  // Administration Section
  // { id: "administration", name: "Administration", type: "heading", roleId: [1] },
  // { id: "user-roles", name: "User Roles", icon: <Shield size={18} />, type: "item", roleId: [1] },
  // { id: "settings", name: "System Settings", icon: <Settings size={18} />, type: "item", roleId: [1] },
  // { id: "audit-logs", name: "Audit Logs", icon: <ClipboardList size={18} />, type: "item", roleId: [1] },

  // Masters Section
  { id: "masters", name: "Masters", type: "heading", roleId: [1] },
  { id: "credit-cards", name: "Credit Cards", icon: <CreditCard  size={18} />, type: "item", roleId: [1] },
  { id: "insurance", name: "Insurance", icon: <ShieldUser    size={18} />, type: "item", roleId: [1] },
  { id: "loans", name: "Loans", icon: <HandCoins   size={18} />, type: "item", path: "/dashboard/loans", roleId: [1] },
  { id: "users", name: "Users", icon: <Users size={18} />, type: "item", path: "/dashboard/users", roleId: [1] },


  // Demo Pages
  // { id: "demo", name: "Demo Pages (Dev)", type: "heading", roleId: [1] },
  // { id: "excel-upload", name: "Excel Import Demo", icon: <FileSpreadsheet size={18} />, type: "item", roleId: [1] },
  // { id: "emp-data-map", name: "Employee Data Mapping", icon: <User size={18} />, type: "item", roleId: [1] },


  //Attendance Pages
  { id: "attendance", name: "Attendance", type: "heading", roleId: [1,2] },
  { id: "attendance", name: "Monthly Attendance", icon: <CalendarDays size={18} />, type: "item", path: "/dashboard/attendance", roleId: [1,2] },
  // { id: "upload-attendance", name: "Upload Attendance", icon: <Upload size={18} />, type: "item", path: "/dashboard/upload-attendance", roleId: [1] },

];

// 🔑 Function to filter menus by roleId with Admin override
export const getNavConfig = (roleId) => {
  if (roleId === 1) {
    // Admin sees everything (all menu items)
    return allMenuItems;
  }

  // Employees (or other roles) only see items where their roleId is included
  return allMenuItems.filter((item) => item.roleId.includes(roleId));
};

