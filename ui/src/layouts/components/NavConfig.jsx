
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
  Users,
  Shield,
  Phone,
  PhoneCall
} from "lucide-react";

const allMenuItems = [
  // Masters Section
  { 
    id: "masters", 
    name: "Masters", 
    type: "heading", 
    requiredPermissions: [
      { module: "credit-cards", action: "read" },
      { module: "insurance", action: "read" },
      { module: "loans", action: "read" },
      { module: "users", action: "read" },
      { module: "roles", action: "read" }
    ]
  },
  { 
    id: "credit-cards", 
    name: "Credit Cards", 
    icon: <CreditCard size={18} />, 
    type: "item", 
    module: "credit-cards",
    action: "read"
  },
  { 
    id: "insurance", 
    name: "Insurance", 
    icon: <ShieldUser size={18} />, 
    type: "item", 
    module: "insurance",
    action: "read"
  },
  { 
    id: "loans", 
    name: "Loans", 
    icon: <HandCoins size={18} />, 
    type: "item", 
    path: "/dashboard/loans", 
    module: "loans",
    action: "read"
  },
  { 
    id: "applications", 
    name: "Applications", 
    icon: <ReceiptIndianRupee size={18} />, 
    type: "item", 
    path: "/dashboard/applications", 
    module: "loans",
    action: "read"
  },
  { 
    id: "users", 
    name: "Users", 
    icon: <Users size={18} />, 
    type: "item", 
    path: "/dashboard/users", 
    module: "users",
    action: "read"
  },
  { 
    id: "roles", 
    name: "Roles", 
    icon: <Shield size={18} />, 
    type: "item", 
    path: "/dashboard/roles", 
    module: "roles",
    action: "read"
  },

  // Calling Section
  { 
    id: "calling", 
    name: "Calling", 
    type: "heading", 
    requiredPermissions: [
      { module: "calling_admin", action: "read" },
      { module: "calling_employee", action: "read" }
    ]
  },
  { 
    id: "calling-management", 
    name: "Lead Management", 
    icon: <Phone size={18} />, 
    type: "item", 
    path: "/dashboard/calling-management", 
    module: "calling_admin",
    action: "read"
  },
  { 
    id: "my-calls", 
    name: "My Calling Queue", 
    icon: <PhoneCall size={18} />, 
    type: "item", 
    path: "/dashboard/my-calls", 
    module: "calling_employee",
    action: "read"
  },

  //Attendance Pages
  { 
    id: "attendance", 
    name: "Attendance", 
    type: "heading", 
    requiredPermissions: [
      { module: "attendance", action: "read" }
    ]
  },
  { 
    id: "attendance", 
    name: "Monthly Attendance", 
    icon: <CalendarDays size={18} />, 
    type: "item", 
    path: "/dashboard/attendance", 
    module: "attendance",
    action: "read"
  },
];

// 🔑 Function to filter menus by permissions
export const getNavConfig = (hasPermission) => {
  if (!hasPermission) {
    // If no permission checker provided, return empty array
    return [];
  }

  const result = [];
  let currentSection = [];
  let currentHeading = null;

  for (const item of allMenuItems) {
    if (item.type === "heading") {
      // If we have a previous section with items, add the heading and items
      if (currentHeading && currentSection.length > 0) {
        result.push(currentHeading);
        result.push(...currentSection);
      }
      
      // Start new section
      currentHeading = item;
      currentSection = [];
    } else if (item.type === "item") {
      // Check if user has permission for this item
      if (item.module && item.action) {
        if (hasPermission(item.module, item.action)) {
          currentSection.push(item);
        }
      } else {
        // No specific permission required, include item
        currentSection.push(item);
      }
    }
  }

  // Don't forget the last section
  if (currentHeading && currentSection.length > 0) {
    result.push(currentHeading);
    result.push(...currentSection);
  }

  return result;
};

