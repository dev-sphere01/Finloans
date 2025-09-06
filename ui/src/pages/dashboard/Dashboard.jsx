import React from 'react';
import { useNavigate } from 'react-router-dom';
import Home from '@/pages/EmployeePages/Home/Home';

const Dashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = React.useState({
    totalEmployees: 247,
    activeEmployees: 231,
    newHires: 12,
    departments: 8,
  });

  const [chartData] = React.useState([
    { month: "Jan", employees: 220 },
    { month: "Feb", employees: 225 },
    { month: "Mar", employees: 235 },
    { month: "Apr", employees: 240 },
    { month: "May", employees: 245 },
    { month: "Jun", employees: 247 },
  ]);

  const [departmentData] = React.useState([
    { name: "Engineering", count: 85, color: "bg-blue-500" },
    { name: "Sales", count: 42, color: "bg-green-500" },
    { name: "Marketing", count: 28, color: "bg-purple-500" },
    { name: "HR", count: 15, color: "bg-orange-500" },
    { name: "Finance", count: 22, color: "bg-red-500" },
    { name: "Operations", count: 35, color: "bg-yellow-500" },
    { name: "Support", count: 20, color: "bg-pink-500" },
  ]);

  const quickLinks = [
    {
      title: "Add Employee",
      icon: "UserPlus",
      href: "/dashboard/add-employee",
      color: "bg-gray-600 hover:bg-blue-700",
    },
    {
      title: "All Employees",
      icon: "Users",
      href: "/dashboard/all-employees",
      color: "bg-gray-600 hover:bg-green-700",
    },
    {
      title: "Departments",
      icon: "Building2",
      href: "/dashboard/departments",
      color: "bg-gray-600 hover:bg-purple-700",
    },
    {
      title: "Reports",
      icon: "BarChart3",
      href: "/dashboard/reports",
      color: "bg-gray-600 hover:bg-orange-700",
    },
    {
      title: "Payroll",
      icon: "DollarSign",
      href: "/dashboard/process-payroll", // Match your route
      color: "bg-gray-600 hover:bg-red-700",
    },
    {
      title: "Settings",
      icon: "Settings",
      href: "/dashboard/settings",
      color: "bg-gray-600 hover:bg-gray-700",
    },
  ];


  const maxEmployees = Math.max(...chartData.map((d) => d.employees));

  // Lucide React Icons
  const Users = ({ className, size = 20 }) => (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );

  const UserCheck = ({ className, size = 20 }) => (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <polyline points="16,11 18,13 22,9" />
    </svg>
  );

  const UserPlus = ({ className, size = 20 }) => (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  );

  const Building2 = ({ className, size = 20 }) => (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v8h20v-8a2 2 0 0 0-2-2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  );

  const BarChart3 = ({ className, size = 20 }) => (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  );

  const DollarSign = ({ className, size = 20 }) => (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );

  const Settings = ({ className, size = 20 }) => (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  const renderIcon = (iconName, className = "", size = 20) => {
    const iconProps = { className, size };
    switch (iconName) {
      case "Users":
        return <Users {...iconProps} />;
      case "UserCheck":
        return <UserCheck {...iconProps} />;
      case "UserPlus":
        return <UserPlus {...iconProps} />;
      case "Building2":
        return <Building2 {...iconProps} />;
      case "BarChart3":
        return <BarChart3 {...iconProps} />;
      case "DollarSign":
        return <DollarSign {...iconProps} />;
      case "Settings":
        return <Settings {...iconProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 rounded-3xl">
      <Home />
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 mt-4 p-3">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                  <Users className="text-blue-600" size={20} />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Total Employees
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalEmployees}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                  <UserCheck className="text-green-600" size={20} />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Active Employees
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.activeEmployees}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                  <UserPlus className="text-purple-600" size={20} />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  New Hires (This Month)
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.newHires}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-md flex items-center justify-center">
                  <Building2 className="text-orange-600" size={20} />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Departments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.departments}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickLinks.map((link, index) => (
              <button
                key={index}
                className={`${link.color} text-white rounded-lg p-4 text-center transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md`}
                onClick={() => navigate(link.href)}
              >
                <div className="flex justify-center mb-2">
                  {renderIcon(link.icon, "text-white", 24)}
                </div>
                <div className="text-sm font-medium">{link.title}</div>
              </button>

            ))}
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Employee Growth Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Employee Growth
            </h3>
            <div className="space-y-4">
              {chartData.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-12 text-sm text-gray-600">{item.month}</div>
                  <div className="flex-1 mx-4">
                    <div className="bg-gray-200 rounded-full h-4 relative overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${(item.employees / maxEmployees) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-12 text-sm text-gray-900 font-medium text-right">
                    {item.employees}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Department Distribution */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Department Distribution
            </h3>
            <div className="space-y-3">
              {departmentData.map((dept, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full ${dept.color} mr-3`}
                    ></div>
                    <span className="text-sm text-gray-700">{dept.name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 mr-2">
                      {dept.count}
                    </span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${dept.color} transition-all duration-1000 ease-out`}
                        style={{
                          width: `${(dept.count / Math.max(...departmentData.map((d) => d.count))) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Activity
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    John Smith joined the Engineering department
                  </span>
                  <span className="text-xs text-gray-400">2 hours ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    Sarah Johnson updated her profile information
                  </span>
                  <span className="text-xs text-gray-400">4 hours ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    Monthly payroll processed for 247 employees
                  </span>
                  <span className="text-xs text-gray-400">1 day ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    New department "Product" created
                  </span>
                  <span className="text-xs text-gray-400">2 days ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
