const mongoose = require('mongoose');
const config = require('../config');
const Role = require('../models/Role');

// Connect to MongoDB
mongoose.connect(config.DB_URI);

const addAdminCallingPermissions = async () => {
  try {
    console.log('🔧 Adding calling permissions to admin roles...\n');

    // Find admin roles
    const adminRoles = await Role.find({
      name: { $regex: 'admin', $options: 'i' },
      isActive: true
    });

    if (adminRoles.length === 0) {
      console.log('❌ No admin roles found');
      return;
    }

    console.log(`📋 Found ${adminRoles.length} admin role(s):`);
    adminRoles.forEach(role => {
      console.log(`   - ${role.name}`);
    });

    // Update each admin role to include calling_admin permissions
    for (const role of adminRoles) {
      // Check if calling_admin permission already exists
      const existingCallingAdminPerm = role.permissions.find(p => p.resource === 'calling_admin');
      
      if (existingCallingAdminPerm) {
        console.log(`✅ Role "${role.name}" already has calling_admin permissions`);
        continue;
      }

      // Add calling_admin permissions
      role.permissions.push({
        resource: 'calling_admin',
        actions: ['read', 'create', 'update', 'delete', 'bulk_import', 'assign_leads', 'manage_staff', 'view_reports', 'manage_queue']
      });

      await role.save();
      console.log(`✅ Added calling_admin permissions to role "${role.name}"`);
    }

    console.log('\n🎉 Admin calling permissions update completed!');
    console.log('\n📝 Note: Admin users now have implicit access to all permissions,');
    console.log('   but explicit calling_admin permissions have been added for clarity.');

  } catch (error) {
    console.error('❌ Error adding admin calling permissions:', error);
  } finally {
    mongoose.connection.close();
  }
};

addAdminCallingPermissions();