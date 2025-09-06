import React from "react";
// menu item icons imports
import { FaUserCheck, FaHandHoldingUsd } from "react-icons/fa";
import {
  Users,
  UserPlus,
  Upload,
  Building,
  Laptop,
  Calculator,
  BarChart3,
  FileText,
  DollarSign,
  TrendingUp,
  Shield,
  Settings,
  ClipboardList,
  FileSpreadsheet,
  MapPin,
  User,
  History,
  CalendarPlus,
  LayoutDashboard,
  CalendarDays,
  CreditCard,
  FileSearch,
  GraduationCap,
  BriefcaseBusiness,
  ReceiptIndianRupee
} from "lucide-react";

const allMenuItems = [
  // Dashboard
  // { id: "home", name: "Home", icon: <LayoutDashboard size={18} />, type: "item", path: "/dashboard", roleId: [1,2] },//not used 
  
  // Employee Management Section
  { id: "employee-management", name: "Employee Management", type: "heading", roleId: [1] },
  { id: "all-employees", name: "All Employees", icon: <Users size={18} />, type: "item", roleId: [1] },
  { id: "add-employee", name: "Add Employee", icon: <UserPlus size={18} />, type: "item", roleId: [1] },
  { id: "import-employees", name: "Import Employees", icon: <Upload size={18} />, type: "item", roleId: [1] },
  { id: "onboarding", name: "Onboarding", icon: <FaUserCheck />, type: "item", roleId: [1] },

  // Payroll Management Section
  { id: "payroll-management", name: "Payroll Management", type: "heading", roleId: [1] },
  { id: "import-attendance" , name: "Import Attendance", icon: <Upload size={18} />, type: "item", roleId: [1] },

  { id: "process-payroll", name: "Process Payroll", icon: <Calculator size={18} />, type: "item", roleId: [1] },
  // { id: "payslips", name: "Payslips", icon: <FileText size={18} />, type: "item", roleId: [1] },
  { id: "reports", name: "Reports", icon: <TrendingUp size={18} />, type: "item", roleId: [1] },
  { id: "ctc-assignment", name: "CTC Assignment", icon: <FaHandHoldingUsd size={18} />, type: "item", roleId: [1] },

  // Loan Management Section
  { id: "loan-management", name: "Loan Management", type: "heading", roleId: [1, 2] },
  { id: "loans-advances", name: "Create Loan & Advance", icon: <DollarSign size={18} />, type: "item", roleId: [1] },
  // { id: "loans-advances-view", name: "All Loans & Advances", icon: <FaHandHoldingUsd />, type: "item", roleId: [1] },
  { id: "loan-and-advance", name: "Loans & Advances", icon: <DollarSign size={18} />, type: "item", path: "/dashboard/loan-and-advance", roleId: [2] },
  
  // Leave Management
  { id: "leave-management", name: "Leave Management", type: "heading", roleId: [1, 2] },
  { id: "leave-management/apply", name: "Leave Management", icon: <CalendarPlus size={18} />, type: "item", path: "/dashboard/leave-management", roleId: [1, 2] },
  { id: "leave-management/history", name: "Leave History", icon: <History size={18} />, type: "item", path: "/dashboard/leave-history", roleId: [1, 2] },

  // Administration Section
  // { id: "administration", name: "Administration", type: "heading", roleId: [1] },
  // { id: "user-roles", name: "User Roles", icon: <Shield size={18} />, type: "item", roleId: [1] },
  // { id: "settings", name: "System Settings", icon: <Settings size={18} />, type: "item", roleId: [1] },
  // { id: "audit-logs", name: "Audit Logs", icon: <ClipboardList size={18} />, type: "item", roleId: [1] },

  // Masters Section
  { id: "masters", name: "Masters", type: "heading", roleId: [1] },
  { id: "departments", name: "Departments", icon: <Building size={18} />, type: "item", roleId: [1] },
  { id: "positions", name: "Positions", icon: <MapPin size={18} />, type: "item", roleId: [1] },
  { id: "salary-structures", name: "Salary Structures", icon: <BarChart3 size={18} />, type: "item", roleId: [1] },
  { id: "payroll-slabs", name: "Payroll Slabs", icon: <ReceiptIndianRupee size={18} />, type: "item", roleId: [1] },
  { id: "assets", name: "Assets", icon: <Laptop size={18} />, type: "item", roleId: [1] },

  // Demo Pages
  // { id: "demo", name: "Demo Pages (Dev)", type: "heading", roleId: [1] },
  // { id: "excel-upload", name: "Excel Import Demo", icon: <FileSpreadsheet size={18} />, type: "item", roleId: [1] },
  // { id: "emp-data-map", name: "Employee Data Mapping", icon: <User size={18} />, type: "item", roleId: [1] },


  //Attendance Pages
  { id: "attendance", name: "Attendance", type: "heading", roleId: [1,2] },
  { id: "attendance", name: "Monthly Attendance", icon: <CalendarDays size={18} />, type: "item", path: "/dashboard/attendance", roleId: [1,2] },
  // { id: "upload-attendance", name: "Upload Attendance", icon: <Upload size={18} />, type: "item", path: "/dashboard/upload-attendance", roleId: [1] },


  //Salary Pages
  { id: "salary", name: "Salary & Payslips", type: "heading", roleId: [1,2] },
  { id: "salary-and-payslips", name: "Download Payslips", icon: <FileText size={18} />, type: "item", path: "/dashboard/salary-and-payslips", roleId: [1,2] },


  //Bank Pages
  { id: "bank-details", name: "Bank Details", type: "heading", roleId: [1,2] },
  { id: "bank-details", name: "View / Update Bank Info", icon: <CreditCard size={18} />, type: "item", path: "/dashboard/bank-details", roleId: [1,2] },

  //Document Pages
  { id: "documents", name: "Documents", type: "heading", roleId: [1,2] },
  { id: "documents", name: "My Documents", icon: <FileSearch size={18} />, type: "item", path: "/dashboard/documents", roleId: [1,2] },

  //Education Pages
  { id: "acad-and-prof", name: "Academic and Professional", type: "heading", roleId: [1,2] },
  { id: "academic", name: "Academic", icon: <GraduationCap size={18} />, type: "item", path: "/dashboard/academic", roleId: [1,2] },
  { id: "professional", name: "Professional", icon: <BriefcaseBusiness size={18} />, type: "item", path: "/dashboard/professional", roleId: [1,2] },
];

// 🔑 Function to filter menus by roleId with Admin override
export const getMenuConfig = (roleId) => {
  if (roleId === 1) {
    // Admin sees everything (all menu items)
    return allMenuItems;
  }

  // Employees (or other roles) only see items where their roleId is included
  return allMenuItems.filter((item) => item.roleId.includes(roleId));
};

