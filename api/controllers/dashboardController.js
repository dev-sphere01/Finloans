const User = require('../models/User');
const Application = require('../models/Application');
const Lead = require('../models/Lead');
const Role = require('../models/Role');
const AuditLog = require('../models/AuditLog');

const dashboardController = {
  // Get dashboard data based on user role and permissions
  getDashboardData: async (req, res) => {
    try {
      const userId = req.user._id;
      const userRole = req.user.roleId;
      
      // Get user with populated role and permissions
      const user = await User.findById(userId).populate({
        path: 'roleId',
        populate: {
          path: 'permissions'
        }
      });

      if (!user || !user.roleId) {
        return res.status(403).json({
          success: false,
          message: 'User role not found'
        });
      }

      const permissions = user.roleId.permissions || [];
      const dashboardData = {
        userInfo: {
          name: `${user.firstName} ${user.lastName}`,
          role: user.roleId.name,
          permissions: permissions
        },
        stats: {},
        allowedSections: []
      };

      // Check permissions and gather data accordingly
      const hasUserPermission = permissions.some(p => 
        p.resource === 'users' && (p.actions.includes('read') || p.actions.includes('manage'))
      );
      
      const hasApplicationPermission = permissions.some(p => 
        p.resource === 'applications' || p.resource === 'dashboard'
      );
      
      const hasLeadsPermission = permissions.some(p => 
        p.resource === 'leads' || p.resource === 'calling'
      );

      const hasReportsPermission = permissions.some(p => 
        p.resource === 'reports' && (p.actions.includes('read') || p.actions.includes('manage'))
      );

      // Fetch user statistics (Admin/Manager only)
      if (hasUserPermission) {
        const userStats = await User.aggregate([
          {
            $group: {
              _id: null,
              totalUsers: { $sum: 1 },
              activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
              lockedUsers: { $sum: { $cond: ['$isLocked', 1, 0] } }
            }
          }
        ]);

        const recentUsers = await User.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .select('firstName lastName email createdAt isActive')
          .populate('roleId', 'name');

        dashboardData.stats.users = {
          total: userStats[0]?.totalUsers || 0,
          active: userStats[0]?.activeUsers || 0,
          locked: userStats[0]?.lockedUsers || 0,
          recent: recentUsers
        };
        dashboardData.allowedSections.push('users');
      }

      // Fetch application statistics
      if (hasApplicationPermission) {
        const applicationStats = await Application.aggregate([
          {
            $group: {
              _id: {
                serviceType: '$serviceType',
                status: '$status'
              },
              count: { $sum: 1 }
            }
          },
          {
            $group: {
              _id: '$_id.serviceType',
              statuses: {
                $push: {
                  status: '$_id.status',
                  count: '$count'
                }
              },
              total: { $sum: '$count' }
            }
          }
        ]);

        // Get status totals across all service types
        const statusTotals = await Application.aggregate([
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]);

        const recentApplications = await Application.find()
          .sort({ submittedAt: -1 })
          .limit(10)
          .select('applicationId serviceType subType status submittedAt fullName');

        // Format the data
        const formattedStats = {
          byServiceType: {},
          byStatus: {},
          total: 0,
          recent: recentApplications
        };

        applicationStats.forEach(service => {
          formattedStats.byServiceType[service._id] = {
            total: service.total,
            statuses: {}
          };
          service.statuses.forEach(status => {
            formattedStats.byServiceType[service._id].statuses[status.status] = status.count;
          });
          formattedStats.total += service.total;
        });

        statusTotals.forEach(status => {
          formattedStats.byStatus[status._id] = status.count;
        });

        dashboardData.stats.applications = formattedStats;
        dashboardData.allowedSections.push('applications');
      }

      // Fetch leads statistics (if Lead model exists)
      if (hasLeadsPermission) {
        try {
          // Basic lead stats by status
          const leadStats = await Lead.aggregate([
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 }
              }
            }
          ]);

          // Lead stats by service type
          const leadsByService = await Lead.aggregate([
            {
              $group: {
                _id: '$selectedService',
                count: { $sum: 1 }
              }
            }
          ]);

          // Lead stats by priority
          const leadsByPriority = await Lead.aggregate([
            {
              $group: {
                _id: '$priority',
                count: { $sum: 1 }
              }
            }
          ]);

          // Call statistics
          const callStats = await Lead.aggregate([
            {
              $match: {
                'callHistory': { $exists: true, $ne: [] }
              }
            },
            {
              $project: {
                totalCalls: { $size: '$callHistory' },
                pickedCalls: {
                  $size: {
                    $filter: {
                      input: '$callHistory',
                      cond: { $eq: ['$$this.picked', true] }
                    }
                  }
                },
                notPickedCalls: {
                  $size: {
                    $filter: {
                      input: '$callHistory',
                      cond: { $eq: ['$$this.picked', false] }
                    }
                  }
                },
                totalDuration: {
                  $sum: '$callHistory.duration'
                },
                hasCallHistory: 1
              }
            },
            {
              $group: {
                _id: null,
                totalLeadsWithCalls: { $sum: 1 },
                totalCalls: { $sum: '$totalCalls' },
                totalPickedCalls: { $sum: '$pickedCalls' },
                totalNotPickedCalls: { $sum: '$notPickedCalls' },
                totalCallDuration: { $sum: '$totalDuration' },
                avgCallsPerLead: { $avg: '$totalCalls' }
              }
            }
          ]);

          // Today's call activity
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);

          const todayCallStats = await Lead.aggregate([
            {
              $match: {
                'callHistory.callTime': {
                  $gte: today,
                  $lt: tomorrow
                }
              }
            },
            {
              $project: {
                todayCalls: {
                  $filter: {
                    input: '$callHistory',
                    cond: {
                      $and: [
                        { $gte: ['$$this.callTime', today] },
                        { $lt: ['$$this.callTime', tomorrow] }
                      ]
                    }
                  }
                }
              }
            },
            {
              $project: {
                callCount: { $size: '$todayCalls' },
                pickedCount: {
                  $size: {
                    $filter: {
                      input: '$todayCalls',
                      cond: { $eq: ['$$this.picked', true] }
                    }
                  }
                }
              }
            },
            {
              $group: {
                _id: null,
                totalTodayCalls: { $sum: '$callCount' },
                totalTodayPicked: { $sum: '$pickedCount' }
              }
            }
          ]);

          // Recent leads with call activity
          const recentLeads = await Lead.find()
            .sort({ updatedAt: -1 })
            .limit(10)
            .select('name contactNo email selectedService status priority createdAt updatedAt callHistory')
            .populate('assignedTo', 'firstName lastName');

          // Top performing agents (by call success rate)
          const agentPerformance = await Lead.aggregate([
            {
              $match: {
                assignedTo: { $exists: true },
                'callHistory': { $exists: true, $ne: [] }
              }
            },
            {
              $project: {
                assignedTo: 1,
                totalCalls: { $size: '$callHistory' },
                successfulCalls: {
                  $size: {
                    $filter: {
                      input: '$callHistory',
                      cond: { $eq: ['$$this.picked', true] }
                    }
                  }
                }
              }
            },
            {
              $group: {
                _id: '$assignedTo',
                totalCalls: { $sum: '$totalCalls' },
                successfulCalls: { $sum: '$successfulCalls' },
                leadsHandled: { $sum: 1 }
              }
            },
            {
              $match: {
                totalCalls: { $gte: 5 } // Only agents with at least 5 calls
              }
            },
            {
              $project: {
                totalCalls: 1,
                successfulCalls: 1,
                leadsHandled: 1,
                successRate: {
                  $multiply: [
                    { $divide: ['$successfulCalls', '$totalCalls'] },
                    100
                  ]
                }
              }
            },
            {
              $sort: { successRate: -1 }
            },
            {
              $limit: 5
            }
          ]);

          // Populate agent names
          const populatedAgentPerformance = await Lead.populate(agentPerformance, {
            path: '_id',
            select: 'firstName lastName'
          });

          const formattedLeadStats = {
            byStatus: {},
            byService: {},
            byPriority: {},
            total: 0,
            recent: recentLeads,
            callStats: callStats[0] || {
              totalLeadsWithCalls: 0,
              totalCalls: 0,
              totalPickedCalls: 0,
              totalNotPickedCalls: 0,
              totalCallDuration: 0,
              avgCallsPerLead: 0
            },
            todayStats: todayCallStats[0] || {
              totalTodayCalls: 0,
              totalTodayPicked: 0
            },
            agentPerformance: populatedAgentPerformance
          };

          // Format status stats
          leadStats.forEach(status => {
            formattedLeadStats.byStatus[status._id] = status.count;
            formattedLeadStats.total += status.count;
          });

          // Format service stats
          leadsByService.forEach(service => {
            formattedLeadStats.byService[service._id] = service.count;
          });

          // Format priority stats
          leadsByPriority.forEach(priority => {
            formattedLeadStats.byPriority[priority._id] = priority.count;
          });

          // Calculate success rate
          if (formattedLeadStats.callStats.totalCalls > 0) {
            formattedLeadStats.callStats.successRate = (
              (formattedLeadStats.callStats.totalPickedCalls / formattedLeadStats.callStats.totalCalls) * 100
            ).toFixed(1);
          } else {
            formattedLeadStats.callStats.successRate = 0;
          }

          // Calculate today's success rate
          if (formattedLeadStats.todayStats.totalTodayCalls > 0) {
            formattedLeadStats.todayStats.successRate = (
              (formattedLeadStats.todayStats.totalTodayPicked / formattedLeadStats.todayStats.totalTodayCalls) * 100
            ).toFixed(1);
          } else {
            formattedLeadStats.todayStats.successRate = 0;
          }

          dashboardData.stats.leads = formattedLeadStats;
          dashboardData.allowedSections.push('leads');
        } catch (error) {
          console.log('Lead model not available or error fetching leads:', error.message);
        }
      }

      // Fetch audit logs (Admin only)
      if (hasReportsPermission) {
        try {
          const auditStats = await AuditLog.aggregate([
            {
              $match: {
                timestamp: {
                  $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                }
              }
            },
            {
              $group: {
                _id: '$action',
                count: { $sum: 1 }
              }
            }
          ]);

          const recentAudits = await AuditLog.find()
            .sort({ timestamp: -1 })
            .limit(10)
            .populate('userId', 'firstName lastName');

          dashboardData.stats.audit = {
            last24Hours: auditStats,
            recent: recentAudits
          };
          dashboardData.allowedSections.push('audit');
        } catch (error) {
          console.log('Audit model not available or error fetching audits:', error.message);
        }
      }

      // Role-specific customizations
      if (user.roleId.name.toLowerCase().includes('employee')) {
        // Employee view - show only their assigned data
        if (hasApplicationPermission) {
          const myApplications = await Application.find({ assignedTo: userId })
            .sort({ submittedAt: -1 })
            .limit(10);
          dashboardData.stats.myApplications = myApplications;
        }
      }

      res.json({
        success: true,
        data: dashboardData
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching dashboard data'
      });
    }
  },

  // Get quick stats for header/summary
  getQuickStats: async (req, res) => {
    try {
      const userId = req.user._id;
      const user = await User.findById(userId).populate('roleId');
      
      if (!user || !user.roleId) {
        return res.status(403).json({
          success: false,
          message: 'User role not found'
        });
      }

      const permissions = user.roleId.permissions || [];
      const quickStats = {};

      // Applications count
      const hasApplicationPermission = permissions.some(p => 
        p.resource === 'applications' || p.resource === 'dashboard'
      );
      
      if (hasApplicationPermission) {
        const appCount = await Application.countDocuments();
        const pendingCount = await Application.countDocuments({ status: 'pending' });
        quickStats.applications = { total: appCount, pending: pendingCount };
      }

      // Users count (Admin/Manager only)
      const hasUserPermission = permissions.some(p => 
        p.resource === 'users' && (p.actions.includes('read') || p.actions.includes('manage'))
      );
      
      if (hasUserPermission) {
        const userCount = await User.countDocuments({ isActive: true });
        quickStats.users = { active: userCount };
      }

      res.json({
        success: true,
        data: quickStats
      });

    } catch (error) {
      console.error('Error fetching quick stats:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching quick stats'
      });
    }
  }
};

module.exports = dashboardController;