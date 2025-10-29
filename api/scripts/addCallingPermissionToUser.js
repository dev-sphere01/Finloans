const mongoose = require('mongoose');
const config = require('../config');
const User = require('../models/User');
const Role = require('../models/Role');

// Connect to MongoDB
mongoose.connect(config.DB_URI);

const addCallingPermissionToUser = async () => {
  try {
    console.log('🔧 Adding calling permissions to users...\n');

    // Find the employee user (you can modify this to target specific users)
    const employeeUsers = await User.find({ 
      $or: [
        { username: { $regex: 'employee', $options: 'i' } },
        { firstName: { $regex: 'employee', $options: 'i' } },
        { email: { $regex: 'employee', $options: 'i' } }
      ],
      isActive: true 
    }).populate('roleId');

    if (employeeUsers.length === 0) {
      console.log('❌ No employee users found');
      return;
    }

    console.log(`📋 Found ${employeeUsers.length} employee user(s):`);
    employeeUsers.forEach(user => {
      console.log(`   - ${user.firstName} ${user.lastName} (@${user.username}) - Role: ${user.roleId?.name || 'No Role'}`);
    });

    // Update each employee user's role to include calling_employee permissions
    for (const user of employeeUsers) {
      if (!user.roleId) {
        console.log(`⚠️  User ${user.username} has no role assigned, skipping...`);
        continue;
      }

      const role = user.roleId;
      
      // Check if calling_employee permission already exists
      const existingCallingPerm = role.permissions.find(p => p.resource === 'calling_employee');
      
      if (existingCallingPerm) {
        console.log(`✅ User ${user.username} already has calling_employee permissions`);
        continue;
      }

      // Add calling_employee permissions
      role.permissions.push({
        resource: 'calling_employee',
        actions: ['read', 'start_call', 'end_call', 'update_status', 'add_notes', 'view_history']
      });

      await role.save();
      console.log(`✅ Added calling_employee permissions to ${user.username}'s role (${role.name})`);
    }

    console.log('\n🎉 Calling permissions update completed!');

  } catch (error) {
    console.error('❌ Error adding calling permissions:', error);
  } finally {
    mongoose.connection.close();
  }
};

addCallingPermissionToUser();