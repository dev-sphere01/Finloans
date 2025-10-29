const mongoose = require('mongoose');
const config = require('../config');
const Role = require('../models/Role');

// Connect to MongoDB
mongoose.connect(config.DB_URI);

const updateCallingRoles = async () => {
  try {
    console.log('🔧 Updating calling roles...');

    // Update admin role to include new calling permissions
    const adminRole = await Role.findOne({ name: 'admin' });
    if (adminRole) {
      // Remove old calling permission
      adminRole.permissions = adminRole.permissions.filter(p => p.resource !== 'calling');
      
      // Add new calling admin permissions
      adminRole.permissions.push({
        resource: 'calling_admin',
        actions: ['read', 'create', 'update', 'delete', 'bulk_import', 'assign_leads', 'manage_staff', 'view_reports', 'manage_queue']
      });

      await adminRole.save();
      console.log('✅ Admin role updated with calling_admin permissions');
    }

    // Update staff role to use calling_employee permissions
    const staffRole = await Role.findOne({ name: 'staff' });
    if (staffRole) {
      // Remove old calling permission
      staffRole.permissions = staffRole.permissions.filter(p => p.resource !== 'calling');
      
      // Add new calling employee permissions
      staffRole.permissions.push({
        resource: 'calling_employee',
        actions: ['read', 'start_call', 'end_call', 'update_status', 'add_notes', 'view_history']
      });

      await staffRole.save();
      console.log('✅ Staff role updated with calling_employee permissions');
    }

    // Create Employee role if it doesn't exist
    let employeeRole = await Role.findOne({ name: 'Employee' });
    if (!employeeRole) {
      employeeRole = new Role({
        name: 'Employee',
        description: 'Employee with calling queue access',
        permissions: [
          {
            resource: 'calling_employee',
            actions: ['read', 'start_call', 'end_call', 'update_status', 'add_notes', 'view_history']
          }
        ],
        isActive: true
      });
      await employeeRole.save();
      console.log('✅ Employee role created with calling_employee permissions');
    } else {
      // Update existing Employee role
      employeeRole.permissions = employeeRole.permissions.filter(p => p.resource !== 'calling');
      employeeRole.permissions.push({
        resource: 'calling_employee',
        actions: ['read', 'start_call', 'end_call', 'update_status', 'add_notes', 'view_history']
      });
      await employeeRole.save();
      console.log('✅ Employee role updated with calling_employee permissions');
    }

    console.log('\n🎉 Calling roles updated successfully!');
    console.log('\n📋 Role Summary:');
    console.log('• Admin role: Has calling_admin permissions (full calling management)');
    console.log('• Staff role: Has calling_employee permissions (queue access)');
    console.log('• Employee role: Has calling_employee permissions (queue access)');

  } catch (error) {
    console.error('❌ Error updating calling roles:', error);
  } finally {
    mongoose.connection.close();
  }
};

updateCallingRoles();