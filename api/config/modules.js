// Define all system modules with their CRUD permissions
const SYSTEM_MODULES = {
  // Core System Modules
  users: {
    name: 'User Management',
    description: 'Manage system users and their accounts',
    category: 'System',
    actions: ['create', 'read', 'update', 'delete', 'manage'],
    icon: 'Users'
  },
  roles: {
    name: 'Role Management',
    description: 'Manage user roles and permissions',
    category: 'System',
    actions: ['create', 'read', 'update', 'delete', 'manage'],
    icon: 'Shield'
  },
  audit: {
    name: 'Audit Logs',
    description: 'View system activity and audit trails',
    category: 'System',
    actions: ['read', 'manage'],
    icon: 'FileText'
  },
  settings: {
    name: 'System Settings',
    description: 'Configure system-wide settings',
    category: 'System',
    actions: ['read', 'update', 'manage'],
    icon: 'Settings'
  },

  // Dashboard & Analytics
  dashboard: {
    name: 'Dashboard',
    description: 'Access to main dashboard and analytics',
    category: 'Analytics',
    actions: ['read'],
    icon: 'BarChart3'
  },
  reports: {
    name: 'Reports',
    description: 'Generate and view system reports',
    category: 'Analytics',
    actions: ['create', 'read', 'update', 'delete', 'manage'],
    icon: 'FileSpreadsheet'
  },
  analytics: {
    name: 'Analytics',
    description: 'Advanced analytics and insights',
    category: 'Analytics',
    actions: ['read', 'manage'],
    icon: 'TrendingUp'
  },

  // Employee Management
  employees: {
    name: 'Employee Management',
    description: 'Manage employee records and information',
    category: 'HR',
    actions: ['create', 'read', 'update', 'delete', 'manage'],
    icon: 'Users'
  },
  departments: {
    name: 'Department Management',
    description: 'Manage organizational departments',
    category: 'HR',
    actions: ['create', 'read', 'update', 'delete', 'manage'],
    icon: 'Building'
  },
  positions: {
    name: 'Position Management',
    description: 'Manage job positions and titles',
    category: 'HR',
    actions: ['create', 'read', 'update', 'delete', 'manage'],
    icon: 'Briefcase'
  },

  // Payroll & Finance
  payroll: {
    name: 'Payroll Management',
    description: 'Process and manage employee payroll',
    category: 'Finance',
    actions: ['create', 'read', 'update', 'delete', 'manage'],
    icon: 'DollarSign'
  },
  salary_structure: {
    name: 'Salary Structure',
    description: 'Define salary components and structures',
    category: 'Finance',
    actions: ['create', 'read', 'update', 'delete', 'manage'],
    icon: 'Calculator'
  },
  payroll_slabs: {
    name: 'Payroll Slabs',
    description: 'Manage tax and deduction slabs',
    category: 'Finance',
    actions: ['create', 'read', 'update', 'delete', 'manage'],
    icon: 'Layers'
  },
  loans_advances: {
    name: 'Loans & Advances',
    description: 'Manage employee loans and advances',
    category: 'Finance',
    actions: ['create', 'read', 'update', 'delete', 'manage'],
    icon: 'CreditCard'
  },

  // Attendance & Leave
  attendance: {
    name: 'Attendance Management',
    description: 'Track and manage employee attendance',
    category: 'Operations',
    actions: ['create', 'read', 'update', 'delete', 'manage'],
    icon: 'Clock'
  },
  leaves: {
    name: 'Leave Management',
    description: 'Manage employee leave requests and policies',
    category: 'Operations',
    actions: ['create', 'read', 'update', 'delete', 'manage'],
    icon: 'Calendar'
  },

  // Banking & Finance
  banking: {
    name: 'Banking Management',
    description: 'Manage bank accounts and transactions',
    category: 'Finance',
    actions: ['create', 'read', 'update', 'delete', 'manage'],
    icon: 'Landmark'
  },

  // Profile & Personal
  profile: {
    name: 'Profile Management',
    description: 'Manage personal profile information',
    category: 'Personal',
    actions: ['read', 'update'],
    icon: 'User'
  },

  // Document Management
  documents: {
    name: 'Document Management',
    description: 'Manage and store documents',
    category: 'Operations',
    actions: ['create', 'read', 'update', 'delete', 'manage'],
    icon: 'FileText'
  },

  // Notifications & Communication
  notifications: {
    name: 'Notifications',
    description: 'Manage system notifications',
    category: 'Communication',
    actions: ['create', 'read', 'update', 'delete', 'manage'],
    icon: 'Bell'
  },
  announcements: {
    name: 'Announcements',
    description: 'Create and manage company announcements',
    category: 'Communication',
    actions: ['create', 'read', 'update', 'delete', 'manage'],
    icon: 'Megaphone'
  }
};

// CRUD Actions with descriptions
const CRUD_ACTIONS = {
  create: {
    name: 'Create',
    description: 'Add new records',
    color: 'green'
  },
  read: {
    name: 'Read',
    description: 'View and access records',
    color: 'blue'
  },
  update: {
    name: 'Update',
    description: 'Modify existing records',
    color: 'yellow'
  },
  delete: {
    name: 'Delete',
    description: 'Remove records',
    color: 'red'
  },
  manage: {
    name: 'Manage',
    description: 'Full control (all actions)',
    color: 'purple'
  }
};

// Module categories
const MODULE_CATEGORIES = {
  System: {
    name: 'System Administration',
    description: 'Core system management modules',
    color: 'red',
    icon: 'Shield'
  },
  Analytics: {
    name: 'Analytics & Reports',
    description: 'Data analysis and reporting modules',
    color: 'blue',
    icon: 'BarChart3'
  },
  HR: {
    name: 'Human Resources',
    description: 'Employee and organizational management',
    color: 'green',
    icon: 'Users'
  },
  Finance: {
    name: 'Finance & Payroll',
    description: 'Financial management and payroll processing',
    color: 'yellow',
    icon: 'DollarSign'
  },
  Operations: {
    name: 'Operations',
    description: 'Day-to-day operational modules',
    color: 'purple',
    icon: 'Briefcase'
  },
  Communication: {
    name: 'Communication',
    description: 'Internal communication and notifications',
    color: 'indigo',
    icon: 'MessageSquare'
  },
  Personal: {
    name: 'Personal',
    description: 'Individual user modules',
    color: 'pink',
    icon: 'User'
  }
};

// Default role templates
const DEFAULT_ROLE_TEMPLATES = {
  'Super Admin': {
    description: 'Full system access with all permissions',
    isSystem: true,
    permissions: Object.keys(SYSTEM_MODULES).map(module => ({
      resource: module,
      actions: ['manage']
    }))
  },
  'Admin': {
    description: 'Administrative access with most permissions',
    isSystem: true,
    permissions: [
      { resource: 'users', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'roles', actions: ['read', 'update'] },
      { resource: 'employees', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'departments', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'positions', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'payroll', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'attendance', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'leaves', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'dashboard', actions: ['read'] },
      { resource: 'reports', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'audit', actions: ['read'] },
      { resource: 'settings', actions: ['read', 'update'] }
    ]
  },
  'HR Manager': {
    description: 'Human Resources management access',
    permissions: [
      { resource: 'employees', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'departments', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'positions', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'attendance', actions: ['read', 'update'] },
      { resource: 'leaves', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'dashboard', actions: ['read'] },
      { resource: 'reports', actions: ['read', 'create'] },
      { resource: 'profile', actions: ['read', 'update'] }
    ]
  },
  'Finance Manager': {
    description: 'Financial management and payroll access',
    permissions: [
      { resource: 'payroll', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'salary_structure', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'payroll_slabs', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'loans_advances', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'banking', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'employees', actions: ['read'] },
      { resource: 'dashboard', actions: ['read'] },
      { resource: 'reports', actions: ['read', 'create'] },
      { resource: 'profile', actions: ['read', 'update'] }
    ]
  },
  'Manager': {
    description: 'Department management access',
    permissions: [
      { resource: 'employees', actions: ['read', 'update'] },
      { resource: 'attendance', actions: ['read', 'update'] },
      { resource: 'leaves', actions: ['read', 'update'] },
      { resource: 'dashboard', actions: ['read'] },
      { resource: 'reports', actions: ['read', 'create'] },
      { resource: 'profile', actions: ['read', 'update'] }
    ]
  },
  'Employee': {
    description: 'Basic employee access',
    permissions: [
      { resource: 'dashboard', actions: ['read'] },
      { resource: 'profile', actions: ['read', 'update'] },
      { resource: 'attendance', actions: ['read'] },
      { resource: 'leaves', actions: ['create', 'read'] },
      { resource: 'payroll', actions: ['read'] }
    ]
  }
};

module.exports = {
  SYSTEM_MODULES,
  CRUD_ACTIONS,
  MODULE_CATEGORIES,
  DEFAULT_ROLE_TEMPLATES
};