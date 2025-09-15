import React from "react";
// menu item icons imports
import {
  Users,FileSpreadsheet
} from "lucide-react";

const allMenuItems = [
  // Dashboard
  // { id: "home", name: "Home", icon: <LayoutDashboard size={18} />, type: "item", path: "/dashboard", roleId: [1,2] },//not used 
  
  // Example of heading
  // { id: "employee-management", name: "Employee Management", type: "heading", roleId: [1] },
  // { id: "all-employees", name: "All Employees", icon: <Users size={18} />, type: "item", roleId: [1] },


  // Masters Section
  { id: "masters", name: "Masters", type: "heading", roleId: [1] },


  // Demo Pages
  { id: "demo", name: "Demo Pages (Dev)", type: "heading", roleId: [1] },
  { id: "excel-upload", name: "Excel Import Demo", icon: <FileSpreadsheet size={18} />, type: "item", roleId: [1] },
  { id: "emp-data-map", name: "Employee Data Mapping", icon: <Users size={18} />, type: "item", roleId: [1] },

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

