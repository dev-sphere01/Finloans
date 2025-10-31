import { useState, useEffect } from "react";
import {
  Phone,
  PhoneOff,
  Clock,
  Shield,
  AlertTriangle,
  TrendingUp,
  Users,
  Activity,
  Target,
  CheckCircle,
  FileText,
  UserCheck,
  PhoneCall,
} from "lucide-react";
import { ActionButton } from '@/components/permissions';
import dashboardService from '@/services/dashboardService';
import { useNavigate } from "react-router-dom";


export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [applicationStats, setApplicationStats] = useState(null);
  const [leadStats, setLeadStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch main dashboard data first to get permissions
        const mainResponse = await dashboardService.getDashboardData();
        if (mainResponse.success) {
          setDashboardData(mainResponse.data);

          // Fetch individual sections based on permissions
          const allowedSections = mainResponse.data.allowedSections || [];

          // Fetch user stats if allowed
          if (allowedSections.includes('users')) {
            try {
              const userResponse = await dashboardService.getUserStats();
              if (userResponse.success) {
                setUserStats(userResponse.data);
              }
            } catch (err) {
              console.warn('Failed to fetch user stats:', err);
            }
          }

          // Fetch application stats if allowed
          if (allowedSections.includes('applications')) {
            try {
              const appResponse = await dashboardService.getApplicationStats();
              if (appResponse.success) {
                setApplicationStats(appResponse.data);
              }
            } catch (err) {
              console.warn('Failed to fetch application stats:', err);
            }
          }

          // Always try to fetch lead stats (check permissions on server)
          try {
            const leadResponse = await dashboardService.getLeadStats();
            if (leadResponse.success) {
              setLeadStats(leadResponse.data);
            }
          } catch (err) {
            console.warn('Failed to fetch lead stats:', err);
          }

          // Audit stats are handled by the main dashboard data
        } else {
          setError('Failed to fetch dashboard data');
        }
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError('Error loading dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllDashboardData();
  }, []);

  // Calculate totals from real data
  const getApplicationTotals = () => {
    if (!applicationStats && !dashboardData?.stats?.applications) {
      return { total: 0, pending: 0, approved: 0, rejected: 0 };
    }

    const apps = applicationStats || dashboardData.stats.applications;
    return {
      total: apps.total || 0,
      pending: apps.byStatus?.pending || 0,
      approved: apps.byStatus?.approved || 0,
      rejected: apps.byStatus?.rejected || 0,
      underReview: apps.byStatus['under-review'] || 0
    };
  };

  const getUserTotals = () => {
    if (!userStats && !dashboardData?.stats?.users) {
      return { total: 0, active: 0, inactive: 0 };
    }

    const users = userStats || dashboardData.stats.users;
    const total = users.total || 0;
    const active = users.active || 0;
    const inactive = total - active;

    return {
      total,
      active,
      inactive
    };
  };

  const getLeadTotals = () => {
    if (!leadStats && !dashboardData?.stats?.leads) {
      return {
        total: 0,
        pending: 0,
        assigned: 0,
        called: 0,
        interested: 0,
        completed: 0,
        failed: 0,
        callStats: {},
        todayStats: {},
        agentPerformance: []
      };
    }

    const leads = leadStats || dashboardData.stats.leads;
    return {
      total: leads.total || 0,
      pending: leads.byStatus?.pending || 0,
      assigned: leads.byStatus?.assigned || 0,
      called: leads.byStatus?.called || 0,
      interested: leads.byStatus?.interested || 0,
      completed: leads.byStatus?.completed || 0,
      failed: leads.byStatus?.failed || 0,
      unassigned: leads.byStatus?.unassigned || 0,
      not_picked: leads.byStatus?.not_picked || 0,
      picked: leads.byStatus?.picked || 0,
      in_progress: leads.byStatus?.in_progress || 0,
      applied: leads.byStatus?.applied || 0,
      follow_up: leads.byStatus?.follow_up || 0,
      notCalled: leads.notCalled || 0,
      callStats: leads.callStats || {},
      todayStats: leads.todayStats || {},
      agentPerformance: leads.agentPerformance || []
    };
  };

  const appTotals = getApplicationTotals();
  const userTotals = getUserTotals();
  const leadTotals = getLeadTotals();

  // Build main groups based on user permissions and available data
  const buildMainGroups = () => {
    const groups = [];
    const allowedSections = dashboardData?.allowedSections || [];

    // Applications section
    if (allowedSections.includes('applications') || applicationStats) {

      groups.push({
        id: "applications",
        title: "Applications",
        subtitle: "Service applications",
        icon: FileText,
        gradient: "from-blue-500 to-cyan-500",
        bgColor: "bg-blue-50",
        details: [
          {
            title: "Pending Applications",
            value: appTotals.pending,
            icon: Clock,
            color: "text-orange-600",
            bg: "bg-orange-100",
            description: "Applications waiting for review",
            percentage: appTotals.total ? Math.round((appTotals.pending / appTotals.total) * 100) : 0,
            url: "/dashboard/applications",
            filter: "pending"
          },
          {
            title: "Under Review",
            value: appTotals.underReview,
            icon: Activity,
            color: "text-blue-600",
            bg: "bg-blue-100",
            description: "Applications being processed",
            percentage: appTotals.total ? Math.round((appTotals.underReview / appTotals.total) * 100) : 0,
            url: "/dashboard/applications",
            filter: "under-review"
          },
          {
            title: "Approved Applications",
            value: appTotals.approved,
            icon: CheckCircle,
            color: "text-green-600",
            bg: "bg-green-100",
            description: "Applications successfully approved",
            percentage: appTotals.total ? Math.round((appTotals.approved / appTotals.total) * 100) : 0,
            url: "/dashboard/applications",
            filter: "approved"
          },
          {
            title: "Rejected Applications",
            value: appTotals.rejected,
            icon: AlertTriangle,
            color: "text-red-600",
            bg: "bg-red-100",
            description: "Applications that were declined",
            percentage: appTotals.total ? Math.round((appTotals.rejected / appTotals.total) * 100) : 0,
            url: "/dashboard/applications",
            filter: "rejected"
          },
        ],
      });


    }



    // Leads section - always show if we have lead stats
    if (allowedSections.includes('leads') || leadStats) {
      groups.push({
        id: "leads",
        title: "Lead Management",
        subtitle: "Sales pipeline",
        icon: PhoneCall,
        gradient: "from-cyan-500 to-blue-500",
        bgColor: "bg-cyan-50",
        details: [
          {
            title: "Unassigned Leads",
            value: leadTotals.unassigned,
            icon: Clock,
            color: "text-orange-600",
            bg: "bg-orange-100",
            description: "Leads not assigned to any agent",
            percentage: leadTotals.total ? Math.round((leadTotals.unassigned / leadTotals.total) * 100) : 0,
            url: "/dashboard/calling-management",
            filter: "unassigned"
          },
          {
            title: "Assigned Leads",
            value: leadTotals.assigned,
            icon: UserCheck,
            color: "text-blue-600",
            bg: "bg-blue-100",
            description: "Total leads assigned to agents",
            percentage: leadTotals.total ? Math.round((leadTotals.assigned / leadTotals.total) * 100) : 0,
            url: "/dashboard/calling-management",
            filter: "assigned"
          },
          {
            title: "Called Leads",
            value: leadTotals.callStats.totalLeadsWithCalls || 0,
            icon: PhoneCall,
            color: "text-green-600",
            bg: "bg-green-100",
            description: "Leads that have been contacted",
            percentage: leadTotals.total ? Math.round(((leadTotals.callStats.totalLeadsWithCalls || 0) / leadTotals.total) * 100) : 0,
            url: "/dashboard/calling-management",
            filter: "called"
          },
          {
            title: "Not Called Yet",
            value: Math.max(0, leadTotals.assigned - (leadTotals.callStats.totalLeadsWithCalls || 0)),
            icon: AlertTriangle,
            color: "text-red-600",
            bg: "bg-red-100",
            description: "Assigned leads not yet contacted",
            percentage: leadTotals.total ? Math.round((Math.max(0, leadTotals.assigned - (leadTotals.callStats.totalLeadsWithCalls || 0)) / leadTotals.total) * 100) : 0,
            url: "/dashboard/calling-management",
            filter: "not-called"
          },
        ],
      });

      // Call Statistics section
      if (leadTotals.callStats.totalCalls > 0) {
        groups.push({
          id: "calling",
          title: "Call Statistics",
          subtitle: "Calling performance",
          icon: Phone,
          gradient: "from-green-500 to-emerald-500",
          bgColor: "bg-green-50",
          totalValue: leadTotals.callStats.totalCalls,
          details: [
            {
              title: "Total Calls Made",
              value: leadTotals.callStats.totalCalls,
              icon: Phone,
              color: "text-blue-600",
              bg: "bg-blue-100",
              description: `to ${leadTotals.callStats.totalLeadsWithCalls || 0} leads`,
              percentage: 100
            },
            {
              title: "Calls Answered",
              value: leadTotals.callStats.totalPickedCalls,
              icon: CheckCircle,
              color: "text-green-600",
              bg: "bg-green-100",
              description: `${leadTotals.callStats.successRate}% answer rate`,
              percentage: leadTotals.callStats.totalCalls ? Math.round((leadTotals.callStats.totalPickedCalls / leadTotals.callStats.totalCalls) * 100) : 0
            },
            {
              title: "Calls Not Answered",
              value: leadTotals.callStats.totalNotPickedCalls,
              icon: PhoneOff,
              color: "text-red-600",
              bg: "bg-red-100",
              description: "Unanswered or busy calls",
              percentage: leadTotals.callStats.totalCalls ? Math.round((leadTotals.callStats.totalNotPickedCalls / leadTotals.callStats.totalCalls) * 100) : 0
            },
          ],
        });
      }
    }

    // Users section (Admin/Manager only) - moved to last position
    if (allowedSections.includes('users') || userStats) {
      groups.push({
        id: "users",
        title: "User Management",
        subtitle: "System users",
        icon: Users,
        gradient: "from-purple-500 to-pink-500",
        bgColor: "bg-purple-50",
        details: [
          {
            title: "Active Users",
            value: userTotals.active,
            icon: UserCheck,
            color: "text-green-600",
            bg: "bg-green-100",
            description: "Users with active accounts",
            percentage: userTotals.total ? Math.round((userTotals.active / userTotals.total) * 100) : 0,
            url: "/dashboard/users",
            filter: "active"
          },
          {
            title: "Inactive Users",
            value: userTotals.inactive,
            icon: Users,
            color: "text-gray-600",
            bg: "bg-gray-100",
            description: "Users with inactive accounts",
            percentage: userTotals.total ? Math.round((userTotals.inactive / userTotals.total) * 100) : 0,
            url: "/dashboard/users",
            filter: "inactive"
          },
        ],
      });
    }

    return groups;
  };

  const mainGroups = buildMainGroups();


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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600">No dashboard data available</p>
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
                  Dashboard
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Welcome, {dashboardData.userInfo?.name} ({dashboardData.userInfo?.role})
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-green-600">
                <Activity className="h-4 w-4" />
                <span className="text-sm font-medium">Live</span>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex items-center gap-2">
                <ActionButton
                  module="applications"
                  action="read"
                  label="Applications"
                  size="sm"
                  onClick={() => window.location.href = '/dashboard/applications'}
                />
                <ActionButton
                  module="users"
                  action="read"
                  label="Users"
                  size="sm"
                  onClick={() => window.location.href = '/dashboard/users'}
                />
              </div>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {dashboardData.allowedSections.includes('applications') && (
            <>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 font-medium">
                      Total Applications
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                      {appTotals.total}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 font-medium">
                      Application Approval Rate
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                      {appTotals.total ? ((appTotals.approved / appTotals.total) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </div>
            </>
          )}

          {dashboardData.allowedSections.includes('users') && (
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">
                    Active System Users
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {userTotals.active}
                  </p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </div>
          )}

          {(dashboardData.allowedSections.includes('leads') || leadStats) && (
            <>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 font-medium">
                      Total Leads
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                      {leadTotals.total}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-indigo-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 font-medium">
                      Call Answer Rate
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                      {leadTotals.callStats.successRate || 0}%
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Phone className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 font-medium">
                      Calls Made Today
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                      {leadTotals.todayStats.totalTodayCalls || 0}
                    </p>
                    <p className="text-xs text-gray-500">
                      to {leadTotals.todayStats.totalLeadsContactedToday || 0} leads
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <PhoneCall className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Agent Performance Section - Commented out for now as not needed */}
        {/* 
        {(dashboardData.allowedSections.includes('leads') || leadStats) && leadTotals.agentPerformance.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2 text-blue-600" />
              Top Performing Telecallers (by Call Answer Rate)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {leadTotals.agentPerformance.slice(0, 6).map((agent, index) => (
                <div key={agent._id} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                          index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                        }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {agent._id ? `${agent._id.firstName} ${agent._id.lastName}` : 'Unknown Agent'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">{agent.successRate.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                    <div className="text-center">
                      <p className="font-medium">{agent.totalCalls}</p>
                      <p>Calls</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">{agent.successfulCalls}</p>
                      <p>Success</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">{agent.leadsHandled}</p>
                      <p>Leads</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        */}

        {/* Detailed Groups */}
        {mainGroups.length > 0 ? (
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
                          group.totalValue !== undefined
                            ? group.totalValue
                            : group.details.reduce(
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
                            className={`p-4 bg-gray-50 rounded-lg transition-colors text-center ${detail.url ? 'hover:bg-gray-100 cursor-pointer' : ''}`}
                            onClick={() => {
                              if (detail.url) {
                                navigate(detail.url, { state: detail.filter ? { status: detail.filter } : null });
                              }
                            }}
                            style={{ cursor: detail.url ? 'pointer' : 'default' }}
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
        ) : (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Limited Access</h3>
            <p className="text-gray-600">
              You don't have permissions to view detailed dashboard sections.
              Contact your administrator for access to more features.
            </p>
            <div className="mt-4 text-sm text-gray-500">
              Your role: <span className="font-medium">{dashboardData.userInfo?.role}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
