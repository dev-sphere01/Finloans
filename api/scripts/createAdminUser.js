const mongoose = require('mongoose');
const config = require('../config');
const User = require('../models/User');
const Role = require('../models/Role');

// Connect to MongoDB
mongoose.connect(config.DB_URI);

const createAdminUser = async () => {
  try {
    console.log('🔧 Creating admin user and role...');

    // Create admin role first
    let adminRole = await Role.findOne({ name: 'admin' });
    if (!adminRole) {
      adminRole = new Role({
        name: 'admin',
        description: 'Administrator with full access',
        permissions: [
          { resource: 'users', actions: ['create', 'read', 'update', 'delete', 'manage'] },
          { resource: 'roles', actions: ['create', 'read', 'update', 'delete', 'manage'] },
          { resource: 'calling_admin', actions: ['read', 'create', 'update', 'delete', 'bulk_import', 'assign_leads', 'manage_staff', 'view_reports', 'manage_queue'] },
          { resource: 'loans', actions: ['create', 'read', 'update', 'delete', 'manage'] },
          { resource: 'insurance', actions: ['create', 'read', 'update', 'delete', 'manage'] },
          { resource: 'credit-cards', actions: ['create', 'read', 'update', 'delete', 'manage'] },
          { resource: 'applications', actions: ['create', 'read', 'update', 'delete', 'manage'] }
        ],
        isActive: true
      });
      await adminRole.save();
      console.log('✅ Admin role created');
    } else {
      console.log('✅ Admin role already exists');
    }

    // Create admin user
    let adminUser = await User.findOne({ username: 'admin' });
    if (!adminUser) {
      adminUser = new User({
        username: 'admin',
        email: 'admin@finloans.com',
        password: 'admin123', // This will be hashed automatically
        firstName: 'Admin',
        lastName: 'User',
        roleId: adminRole._id,
        isActive: true,
        isAutoGenPass: false
      });
      await adminUser.save();
      console.log('✅ Admin user created');
      console.log('📧 Email: admin@finloans.com');
      console.log('🔑 Password: admin123');
    } else {
      console.log('✅ Admin user already exists');
    }

    // Create staff role
    let staffRole = await Role.findOne({ name: 'staff' });
    if (!staffRole) {
      staffRole = new Role({
        name: 'staff',
        description: 'Staff member with calling permissions',
        permissions: [
          { resource: 'calling_employee', actions: ['read', 'start_call', 'end_call', 'update_status', 'add_notes', 'view_history'] }
        ],
        isActive: true
      });
      await staffRole.save();
      console.log('✅ Staff role created');
    } else {
      console.log('✅ Staff role already exists');
    }

    // Create some staff users
    const staffUsers = [
      { username: 'staff1', firstName: 'John', lastName: 'Doe', email: 'john@finloans.com' },
      { username: 'staff2', firstName: 'Jane', lastName: 'Smith', email: 'jane@finloans.com' },
      { username: 'staff3', firstName: 'Mike', lastName: 'Johnson', email: 'mike@finloans.com' }
    ];

    for (const staffData of staffUsers) {
      let staffUser = await User.findOne({ username: staffData.username });
      if (!staffUser) {
        staffUser = new User({
          ...staffData,
          password: 'staff123',
          roleId: staffRole._id,
          isActive: true,
          isAutoGenPass: false,
          createdBy: adminUser._id
        });
        await staffUser.save();
        console.log(`✅ Staff user created: ${staffData.username}`);
      }
    }

    console.log('\n🎉 Setup completed successfully!');
    console.log('\n👤 Login credentials:');
    console.log('Admin - Email: admin@finloans.com, Password: admin123');
    console.log('Staff - Email: john@finloans.com, Password: staff123');
    console.log('Staff - Email: jane@finloans.com, Password: staff123');
    console.log('Staff - Email: mike@finloans.com, Password: staff123');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    mongoose.connection.close();
  }
};

createAdminUser();