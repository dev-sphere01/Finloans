const mongoose = require('mongoose');
const Lead = require('../models/Lead');
const Service = require('../models/Service');
const ServiceProvider = require('../models/ServiceProvider');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const queryService = require('../services/queryService');
const XLSX = require('xlsx');

// Get all leads with filtering and pagination
exports.getLeads = async (req, res) => {
  try {
    console.log('getLeads called with query:', req.query);
    const options = {
      searchableFields: ['name', 'contactNo', 'email', 'selectedService'],
      populate: [
        { path: 'assignedTo', select: 'firstName lastName email' },
        { path: 'serviceProvider', select: 'name website' },
        { path: 'createdBy', select: 'firstName lastName' },
        { path: 'updatedBy', select: 'firstName lastName' }
      ],
      customFilters: async (filters, baseFilter) => {
        console.log('Processing filters:', filters);

        // Handle assignedToMe filter for employee view
        if (filters.assignedToMe === 'true') {
          baseFilter.assignedTo = req.userId;
          delete filters.assignedToMe;
        }

        // Handle status filter
        if (filters.status && filters.status !== 'all') {
          baseFilter.status = filters.status;
          delete filters.status;
        }

        // Handle assignedTo filter
        if (filters.assignedTo) {
          baseFilter.assignedTo = filters.assignedTo;
          delete filters.assignedTo;
        }

        // Handle service filter (both 'service' and 'selectedService')
        if (filters.service) {
          baseFilter.selectedService = { $regex: filters.service, $options: 'i' };
          delete filters.service;
        }
        if (filters.selectedService) {
          baseFilter.selectedService = { $regex: filters.selectedService, $options: 'i' };
          delete filters.selectedService;
        }

        // Handle name filter - CASE INSENSITIVE
        if (filters.name) {
          baseFilter.name = { $regex: filters.name, $options: 'i' };
          delete filters.name;
        }

        // Handle contactNo filter
        if (filters.contactNo) {
          baseFilter.contactNo = { $regex: filters.contactNo, $options: 'i' };
          delete filters.contactNo;
        }

        // Handle email filter
        if (filters.email) {
          baseFilter.email = { $regex: filters.email, $options: 'i' };
          delete filters.email;
        }

        // Handle assignedToName filter - need to join with User collection
        if (filters.assignedToName) {
          // Get user IDs that match the name filter
          const matchingUsers = await User.find({
            $or: [
              { firstName: { $regex: filters.assignedToName, $options: 'i' } },
              { lastName: { $regex: filters.assignedToName, $options: 'i' } },
              {
                $expr: {
                  $regexMatch: {
                    input: { $concat: ['$firstName', ' ', '$lastName'] },
                    regex: filters.assignedToName,
                    options: 'i'
                  }
                }
              }
            ]
          }).select('_id');

          if (matchingUsers.length > 0) {
            baseFilter.assignedTo = { $in: matchingUsers.map(u => u._id) };
          } else {
            // No matching users found, return no results
            baseFilter.assignedTo = null;
          }
          delete filters.assignedToName;
        }

        // Handle createdAt filter
        if (filters.createdAt) {
          // Assume it's a date string, convert to date range
          const date = new Date(filters.createdAt);
          const nextDay = new Date(date);
          nextDay.setDate(date.getDate() + 1);
          baseFilter.createdAt = { $gte: date, $lt: nextDay };
          delete filters.createdAt;
        }

        // Handle date range filter
        if (filters.dateRange) {
          const now = new Date();
          let startDate;

          switch (filters.dateRange) {
            case 'today':
              startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
              break;
            case 'yesterday':
              startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
              baseFilter.createdAt = {
                $gte: startDate,
                $lt: new Date(startDate.getTime() + 24 * 60 * 60 * 1000)
              };
              break;
            case 'this_week':
              const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
              baseFilter.createdAt = { $gte: weekStart };
              break;
            case 'last_week':
              const lastWeekStart = new Date(now.setDate(now.getDate() - now.getDay() - 7));
              const lastWeekEnd = new Date(now.setDate(now.getDate() - now.getDay()));
              baseFilter.createdAt = { $gte: lastWeekStart, $lt: lastWeekEnd };
              break;
            case 'this_month':
              startDate = new Date(now.getFullYear(), now.getMonth(), 1);
              baseFilter.createdAt = { $gte: startDate };
              break;
            case 'last_month':
              const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
              const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
              baseFilter.createdAt = { $gte: lastMonthStart, $lt: lastMonthEnd };
              break;
          }

          if (filters.dateRange === 'today') {
            baseFilter.createdAt = { $gte: startDate };
          }
          delete filters.dateRange;
        }

        console.log('Final baseFilter:', baseFilter);
        return baseFilter;
      }
    };

    const { data, pagination } = await queryService.query(Lead, req.query, options);

    // Add assignedToName virtual field
    const leadsWithNames = data.map(lead => {
      const leadObj = lead.toJSON(); // Use toJSON instead of toObject to preserve transforms
      if (leadObj.assignedTo) {
        leadObj.assignedToName = `${leadObj.assignedTo.firstName} ${leadObj.assignedTo.lastName}`;
      }
      return leadObj;
    });

    console.log('Returning leads:', leadsWithNames.length, 'Total:', pagination.total);
    res.json({
      leads: leadsWithNames,
      pagination
    });

  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
};

// Get lead by ID
exports.getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('serviceProvider', 'name website contactEmail contactPhone')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json(lead);

  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({ error: 'Failed to fetch lead' });
  }
};

// Create new lead
exports.createLead = async (req, res) => {
  try {
    const leadData = {
      ...req.body,
      createdBy: req.userId
    };

    // Check for duplicate contact number
    const existingLead = await Lead.findOne({
      contactNo: leadData.contactNo,
      isActive: true
    });

    if (existingLead) {
      return res.status(400).json({
        error: 'A lead with this contact number already exists'
      });
    }

    const lead = new Lead(leadData);
    await lead.save();

    await lead.populate('createdBy', 'firstName lastName');

    // Log lead creation
    await AuditLog.logAction({
      userId: req.userId,
      action: 'LEAD_CREATE',
      resource: 'leads',
      resourceId: lead._id,
      details: {
        leadName: lead.name,
        contactNo: lead.contactNo,
        service: lead.selectedService
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });

    res.status(201).json({
      message: 'Lead created successfully',
      lead
    });

  } catch (error) {
    console.error('Create lead error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Lead with this contact number already exists'
      });
    }

    res.status(500).json({ error: 'Failed to create lead' });
  }
};

// Update lead
exports.updateLead = async (req, res) => {
  try {
    const leadId = req.params.id;
    const updates = req.body;

    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // Store old data for audit log
    const oldData = lead.toObject();

    // Update lead
    Object.assign(lead, updates);
    lead.updatedBy = req.userId;
    await lead.save();

    await lead.populate([
      { path: 'assignedTo', select: 'firstName lastName email' },
      { path: 'serviceProvider', select: 'name website' }
    ]);

    // Log lead update
    await AuditLog.logAction({
      userId: req.userId,
      action: 'LEAD_UPDATE',
      resource: 'leads',
      resourceId: lead._id,
      details: {
        leadName: lead.name,
        updatedFields: Object.keys(updates),
        oldStatus: oldData.status,
        newStatus: lead.status
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });

    res.json({
      message: 'Lead updated successfully',
      lead
    });

  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({ error: 'Failed to update lead' });
  }
};

// Delete lead (soft delete)
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    lead.isActive = false;
    lead.updatedBy = req.userId;
    await lead.save();

    // Log lead deletion
    await AuditLog.logAction({
      userId: req.userId,
      action: 'LEAD_DELETE',
      resource: 'leads',
      resourceId: lead._id,
      details: {
        leadName: lead.name,
        contactNo: lead.contactNo
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });

    res.json({ message: 'Lead deleted successfully' });

  } catch (error) {
    console.error('Delete lead error:', error);
    res.status(500).json({ error: 'Failed to delete lead' });
  }
};

// Bulk import leads from Excel/CSV
exports.bulkImportLeads = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return res.status(400).json({ error: 'No data found in file' });
    }

    const results = {
      total: data.length,
      success: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < data.length; i++) {
      try {
        const row = data[i];

        // Map Excel columns to lead fields
        const leadData = {
          name: row.Name || row.name,
          contactNo: String(row['Contact Number'] || row.contactNo || row.phone).replace(/\D/g, ''),
          email: row.Email || row.email,
          selectedService: row.Service || row.selectedService,
          notes: row.Notes || row.notes,
          source: 'bulk_import',
          createdBy: req.userId
        };

        // Validate required fields
        if (!leadData.name || !leadData.contactNo || !leadData.selectedService) {
          results.failed++;
          results.errors.push({
            row: i + 1,
            error: 'Missing required fields (Name, Contact Number, Service)'
          });
          continue;
        }

        // Check for duplicate
        const existingLead = await Lead.findOne({
          contactNo: leadData.contactNo,
          isActive: true
        });

        if (existingLead) {
          results.failed++;
          results.errors.push({
            row: i + 1,
            error: `Lead with contact number ${leadData.contactNo} already exists`
          });
          continue;
        }

        const lead = new Lead(leadData);
        await lead.save();
        results.success++;

      } catch (error) {
        results.failed++;
        results.errors.push({
          row: i + 1,
          error: error.message
        });
      }
    }

    // Log bulk import
    await AuditLog.logAction({
      userId: req.userId,
      action: 'LEADS_BULK_IMPORT',
      resource: 'leads',
      details: {
        fileName: req.file.originalname,
        totalRows: results.total,
        successCount: results.success,
        failedCount: results.failed
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });

    res.json({
      message: 'Bulk import completed',
      results
    });

  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({ error: 'Failed to import leads' });
  }
};

// Assign leads to staff
exports.assignLeads = async (req, res) => {
  try {
    const { leadIds, staffId } = req.body;

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({ error: 'Lead IDs are required' });
    }

    if (!staffId) {
      return res.status(400).json({ error: 'Staff ID is required' });
    }

    // Verify staff member exists and is active
    const staff = await User.findById(staffId);
    if (!staff || !staff.isActive) {
      return res.status(400).json({ error: 'Invalid or inactive staff member' });
    }

    // Check which leads are already assigned
    const existingLeads = await Lead.find({
      _id: { $in: leadIds },
      isActive: true
    }).select('_id name assignedTo status');

    const alreadyAssignedLeads = existingLeads.filter(lead => 
      lead.assignedTo && lead.status !== 'unassigned'
    );

    const unassignedLeadIds = existingLeads
      .filter(lead => !lead.assignedTo || lead.status === 'unassigned')
      .map(lead => lead._id);

    if (unassignedLeadIds.length === 0) {
      return res.status(400).json({ 
        error: 'All selected leads are already assigned to staff members',
        alreadyAssignedCount: alreadyAssignedLeads.length,
        assignedLeads: alreadyAssignedLeads.map(lead => ({
          id: lead._id,
          name: lead.name,
          status: lead.status
        }))
      });
    }

    // Update only unassigned leads
    const result = await Lead.updateMany(
      { 
        _id: { $in: unassignedLeadIds },
        isActive: true 
      },
      {
        $set: {
          assignedTo: staffId,
          assignedBy: req.userId,
          assignedAt: new Date(),
          status: 'assigned',
          updatedBy: req.userId
        }
      }
    );

    // Log assignment
    await AuditLog.logAction({
      userId: req.userId,
      action: 'LEADS_ASSIGN',
      resource: 'leads',
      details: {
        requestedLeadIds: leadIds,
        assignedLeadIds: unassignedLeadIds,
        assignedTo: `${staff.firstName} ${staff.lastName}`,
        assignedCount: result.modifiedCount,
        skippedCount: alreadyAssignedLeads.length
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });

    const response = {
      message: `${result.modifiedCount} leads assigned successfully`,
      assignedCount: result.modifiedCount
    };

    if (alreadyAssignedLeads.length > 0) {
      response.warning = `${alreadyAssignedLeads.length} leads were already assigned and were skipped`;
      response.skippedCount = alreadyAssignedLeads.length;
      response.skippedLeads = alreadyAssignedLeads.map(lead => ({
        id: lead._id,
        name: lead.name,
        status: lead.status
      }));
    }

    res.json(response);

  } catch (error) {
    console.error('Assign leads error:', error);
    res.status(500).json({ error: 'Failed to assign leads' });
  }
};

// Start call session
exports.startCall = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    await lead.startCall(req.userId);

    // Log call start
    await AuditLog.logAction({
      userId: req.userId,
      action: 'CALL_START',
      resource: 'leads',
      resourceId: lead._id,
      details: {
        leadName: lead.name,
        contactNo: lead.contactNo,
        callAttempt: lead.callAttempts
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });

    res.json({
      message: 'Call session started',
      lead
    });

  } catch (error) {
    console.error('Start call error:', error);
    res.status(500).json({ error: 'Failed to start call' });
  }
};

// End call session
exports.endCall = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const callData = req.body;
    await lead.endCall(callData, req.userId);

    // Log call end
    await AuditLog.logAction({
      userId: req.userId,
      action: 'CALL_END',
      resource: 'leads',
      resourceId: lead._id,
      details: {
        leadName: lead.name,
        contactNo: lead.contactNo,
        callPicked: callData.callPicked,
        finalStatus: lead.status,
        duration: callData.duration
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });

    res.json({
      message: 'Call session ended',
      lead
    });

  } catch (error) {
    console.error('End call error:', error);
    res.status(500).json({ error: 'Failed to end call' });
  }
};

// Get services
exports.getServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .select('name description category subcategories');

    res.json(services);

  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
};

// Get service subcategories
exports.getServiceSubcategories = async (req, res) => {
  try {
    const service = await Service.findById(req.params.serviceId);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const activeSubcategories = service.subcategories.filter(sub => sub.isActive);
    res.json(activeSubcategories);

  } catch (error) {
    console.error('Get subcategories error:', error);
    res.status(500).json({ error: 'Failed to fetch subcategories' });
  }
};

// Get service providers
exports.getServiceProviders = async (req, res) => {
  try {
    const { serviceId } = req.query;

    let query = { isActive: true };
    if (serviceId) {
      query.services = serviceId;
    }

    const providers = await ServiceProvider.find(query)
      .populate('services', 'name')
      .sort({ rating: -1, name: 1 })
      .select('name description website contactEmail contactPhone rating isVerified');

    res.json(providers);

  } catch (error) {
    console.error('Get service providers error:', error);
    res.status(500).json({ error: 'Failed to fetch service providers' });
  }
};

// Get staff members for assignment
exports.getStaff = async (req, res) => {
  try {
    // Get users with calling permissions (role-based)
    const staff = await User.find({
      isActive: true,
      // Add role-based filtering here based on your role system
    })
      .populate('roleId', 'name')
      .select('firstName lastName email roleId')
      .sort({ firstName: 1, lastName: 1 });

    // Add current leads count for each staff member
    const staffWithCounts = await Promise.all(
      staff.map(async (member) => {
        const currentLeads = await Lead.countDocuments({
          assignedTo: member._id,
          status: { $in: ['assigned', 'pending'] },
          isActive: true
        });

        return {
          id: member._id,
          name: `${member.firstName} ${member.lastName}`,
          email: member.email,
          role: member.roleId?.name,
          currentLeads
        };
      })
    );

    res.json(staffWithCounts);

  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
};

// Get current user's calling stats
exports.getMyStats = async (req, res) => {
  try {
    const userId = req.userId;

    // Get stats for leads assigned to current user
    const stats = await Lead.aggregate([
      {
        $match: {
          assignedTo: new mongoose.Types.ObjectId(userId),
          isActive: true
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get total count
    const totalCount = await Lead.countDocuments({
      assignedTo: new mongoose.Types.ObjectId(userId),
      isActive: true
    });

    // Format stats
    const formattedStats = {
      total: totalCount,
      assigned: 0,
      pending: 0,
      completed: 0,
      failed: 0
    };

    stats.forEach(stat => {
      if (formattedStats.hasOwnProperty(stat._id)) {
        formattedStats[stat._id] = stat.count;
      }
    });

    res.json(formattedStats);

  } catch (error) {
    console.error('Get my stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

// Get calling reports and analytics
exports.getCallReports = async (req, res) => {
  try {
    const { startDate, endDate, staffId } = req.query;

    let matchFilter = { isActive: true };

    if (startDate || endDate) {
      matchFilter.createdAt = {};
      if (startDate) matchFilter.createdAt.$gte = new Date(startDate);
      if (endDate) matchFilter.createdAt.$lte = new Date(endDate);
    }

    if (staffId) {
      matchFilter.assignedTo = mongoose.Types.ObjectId(staffId);
    }

    const reports = await Lead.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalCallAttempts: { $sum: '$callAttempts' },
          avgCallAttempts: { $avg: '$callAttempts' }
        }
      }
    ]);

    const staffPerformance = await Lead.aggregate([
      { $match: { ...matchFilter, assignedTo: { $exists: true } } },
      {
        $group: {
          _id: '$assignedTo',
          totalLeads: { $sum: 1 },
          completedLeads: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          failedLeads: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          },
          totalCallAttempts: { $sum: '$callAttempts' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'staff'
        }
      },
      {
        $project: {
          staffName: { $concat: [{ $arrayElemAt: ['$staff.firstName', 0] }, ' ', { $arrayElemAt: ['$staff.lastName', 0] }] },
          totalLeads: 1,
          completedLeads: 1,
          failedLeads: 1,
          totalCallAttempts: 1,
          successRate: {
            $multiply: [
              { $divide: ['$completedLeads', '$totalLeads'] },
              100
            ]
          }
        }
      }
    ]);

    res.json({
      statusReports: reports,
      staffPerformance
    });

  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};

module.exports = exports;