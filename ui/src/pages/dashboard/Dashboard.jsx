import { useState, useEffect } from "react";
import {
  Phone,
  Clock,
  CreditCard,
  Building,
  Shield,
  AlertTriangle,
  TrendingUp,
  Users,
  Activity,
  Target,
  DollarSign,
  CheckCircle,
} from "lucide-react";

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    offlineEnquiry: 0,
    callingResponse: 0,
    pendingEnquiry: 0,
    creditProvided: 0,
    loanProvided: 0,
    insuranceProvided: 0,
    complaints: 0,
    onlineEnquiry: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setDashboardData({
        onlineEnquiry: 1263,
        offlineEnquiry: 45,
        callingResponse: 23,
        pendingEnquiry: 12,
        creditProvided: 156,
        loanProvided: 89,
        insuranceProvided: 67,
        complaints: 8,
      });
      setLoading(false);
    }, 800);
  }, []);

  // Totals
  const totalEnquiries =
    dashboardData.offlineEnquiry +
    dashboardData.callingResponse +
    dashboardData.pendingEnquiry;
  const totalServices =
    dashboardData.creditProvided +
    dashboardData.loanProvided +
    dashboardData.insuranceProvided;
  const totalRevenue = totalServices * 1500;
  const conversionRate = (totalServices / totalEnquiries) * 100;

  const mainGroups = [
    {
      id: "enquiries",
      title: "Customer Enquiries",
      subtitle: "Breakdown by channel",
      icon: Phone,
      gradient: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      details: [
        {
          title: "Online Enquiry",
          value: dashboardData.onlineEnquiry,
          icon: Phone,
          color: "text-green-600",
          bg: "bg-green-100",
          description: "Online customers",
          percentage: Math.round(
            (dashboardData.onlineEnquiry /
              (totalEnquiries + dashboardData.onlineEnquiry)) *
              100
          ),
        },
        {
          title: "Offline Enquiry",
          value: dashboardData.offlineEnquiry,
          icon: Phone,
          color: "text-blue-600",
          bg: "bg-blue-100",
          description: "Walk-in customers",
          percentage: Math.round(
            (dashboardData.offlineEnquiry / totalEnquiries) * 100
          ),
        },
        {
          title: "Calling Response",
          value: dashboardData.callingResponse,
          icon: Phone,
          color: "text-cyan-600",
          bg: "bg-cyan-100",
          description: "Phone enquiries",
          percentage: Math.round(
            (dashboardData.callingResponse / totalEnquiries) * 100
          ),
        },
        {
          title: "Pending Enquiry",
          value: dashboardData.pendingEnquiry,
          icon: Clock,
          color: "text-orange-600",
          bg: "bg-orange-100",
          description: "Awaiting follow-up",
          percentage: Math.round(
            (dashboardData.pendingEnquiry / totalEnquiries) * 100
          ),
        },
      ],
    },
    {
      id: "services",
      title: "Financial Services",
      subtitle: "Products delivered",
      icon: Building,
      gradient: "from-emerald-500 to-green-500",
      bgColor: "bg-emerald-50",
      details: [
        {
          title: "Credit Provided",
          value: dashboardData.creditProvided,
          icon: CreditCard,
          color: "text-purple-600",
          bg: "bg-purple-100",
          description: "Credit facilities",
          percentage: Math.round(
            (dashboardData.creditProvided / totalServices) * 100
          ),
        },
        {
          title: "Loan Provided",
          value: dashboardData.loanProvided,
          icon: Building,
          color: "text-indigo-600",
          bg: "bg-indigo-100",
          description: "Loan applications",
          percentage: Math.round(
            (dashboardData.loanProvided / totalServices) * 100
          ),
        },
        {
          title: "Insurance Provided",
          value: dashboardData.insuranceProvided,
          icon: Shield,
          color: "text-teal-600",
          bg: "bg-teal-100",
          description: "Insurance policies",
          percentage: Math.round(
            (dashboardData.insuranceProvided / totalServices) * 100
          ),
        },
      ],
    },
    {
      id: "issues",
      title: "Issues & Alerts",
      subtitle: "Requires attention",
      icon: AlertTriangle,
      gradient: "from-red-500 to-rose-500",
      bgColor: "bg-red-50",
      details: [
        {
          title: "Active Complaints",
          value: dashboardData.complaints,
          icon: AlertTriangle,
          color: "text-red-600",
          bg: "bg-red-100",
          description: "Unresolved issues",
          percentage: 100,
        },
      ],
    },
  ];


const formatNumber = (num) => {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  } else if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  } else {
    return num.toString().padStart(3, "0");
  }
};


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-3 border-blue-200"></div>
            <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-blue-500 absolute top-0"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-6 lg:px-6 lg:py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
                  Business Dashboard
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Real-time business metrics
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-green-600">
              <Activity className="h-4 w-4" />
              <span className="text-sm font-medium">Live</span>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  Monthly Revenue
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  ${(totalRevenue / 1000).toFixed(0)}K
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  Conversion Rate
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {conversionRate.toFixed(1)}%
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  Resolution Rate
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {Math.round(
                    ((totalEnquiries - dashboardData.complaints) /
                      totalEnquiries) *
                      100
                  )}
                  %
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  Active Customers
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {totalEnquiries + totalServices}
                </p>
              </div>
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Groups */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {mainGroups.map((group) => {
            const IconComponent = group.icon;

            return (
              <div
                key={group.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300"
              >
                {/* Header */}
                <div className="p-4 sm:p-6">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-r ${group.gradient} flex items-center justify-center shadow-sm`}
                    >
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {group.title}
                      </h3>
                      <p className="text-sm text-gray-500">{group.subtitle}</p>
                    </div>

                    <div
                      className={`px-2 mx-2 h-10 rounded-xl text-white text-2xl font-bold bg-gradient-to-r ${group.gradient} flex items-center justify-center shadow-sm`}
                    >
                      {formatNumber(
                        group.details.reduce(
                          (sum, detail) => sum + (detail.value || 0),
                          0
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Details (always visible) */}
                <div className="border-t border-gray-100 p-4 sm:p-6 pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {group.details.map((detail, i) => {
                      const DetailIcon = detail.icon;
                      return (
                        <div
                          key={i}
                          className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center"
                        >
                          {/* Icon + number same line */}
                          <div className="flex items-center justify-center space-x-2 mb-2">
                            <div
                              className={`w-8 h-8 ${detail.bg} rounded-lg flex items-center justify-center`}
                            >
                              <DetailIcon
                                className={`h-4 w-4 ${detail.color}`}
                              />
                            </div>
                            <div className="text-xl font-bold text-gray-900">
                              {detail.value}
                            </div>
                          </div>
                          {/* Title & description */}
                          <h4 className="font-medium text-gray-900 text-sm">
                            {detail.title}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {detail.description}
                          </p>
                          {/* Percentage */}
                          <div className="text-xs text-blue-600 font-medium mt-2">
                            {detail.percentage}% of total
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
