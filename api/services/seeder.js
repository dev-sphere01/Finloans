const mongoose = require('mongoose');
const User = require('../models/User');
const Role = require('../models/Role');
const path = require('path');
const config = require('../config')

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Connect to MongoDB
    await mongoose.connect(config.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await User.deleteMany({});
    // await Role.deleteMany({});
    // console.log('Cleared existing data');

    // Import role templates
    const { DEFAULT_ROLE_TEMPLATES } = require('../config/modules');

    // Create default roles from templates
    const roles = Object.entries(DEFAULT_ROLE_TEMPLATES).map(([name, template]) => ({
      name,
      description: template.description,
      isSystem: template.isSystem || false,
      permissions: template.permissions
    }));

    const createdRoles = [];
    for (const roleData of roles) {
      const existingRole = await Role.findOne({ name: roleData.name });
      if (!existingRole) {
        const role = new Role(roleData);
        await role.save();
        createdRoles.push(role);
        console.log(`Created role: ${role.name}`);
      } else {
        createdRoles.push(existingRole);
        console.log(`Role already exists: ${existingRole.name}`);
      }
    }

    // Create default super admin user
    const superAdminRole = createdRoles.find(role => role.name === 'Super Admin');
    
    const existingSuperAdmin = await User.findOne({ username: 'admin' });
    if (!existingSuperAdmin) {
      const superAdmin = new User({
        username: 'admin',
        email: 'admin@company.com',
        password: 'Admin123!', // This will be hashed automatically
        firstName: 'Super',
        lastName: 'Admin',
        roleId: superAdminRole._id,
        isAutoGenPass: true, // Force password change on first login
        isActive: true
      });

      await superAdmin.save();
      console.log('Created super admin user:');
      console.log('  Username: admin');
      console.log('  Password: Admin123!');
      console.log('  Email: admin@company.com');
      console.log('  Note: Password change required on first login');
    } else {
      console.log('Super admin user already exists');
    }

    // Create sample users for other roles
    const sampleUsers = [
      {
        username: 'manager1',
        email: 'manager1@company.com',
        password: 'Manager123!',
        firstName: 'John',
        lastName: 'Manager',
        roleName: 'Manager'
      },
      {
        username: 'employee1',
        email: 'employee1@company.com',
        password: 'Employee123!',
        firstName: 'Jane',
        lastName: 'Employee',
        roleName: 'Employee'
      }
    ];

    for (const userData of sampleUsers) {
      const existingUser = await User.findOne({ username: userData.username });
      if (!existingUser) {
        const role = createdRoles.find(r => r.name === userData.roleName);
        const user = new User({
          username: userData.username,
          email: userData.email,
          password: userData.password,
          firstName: userData.firstName,
          lastName: userData.lastName,
          roleId: role._id,
          isAutoGenPass: true,
          isActive: true
        });

        await user.save();
        console.log(`Created user: ${user.username} (${userData.roleName})`);
      } else {
        console.log(`User already exists: ${userData.username}`);
      }
    }

    console.log('\n=== Database Seeding Complete ===');
    console.log('\nDefault Login Credentials:');
    console.log('Super Admin:');
    console.log('  Username: admin');
    console.log('  Password: Admin123!');
    console.log('\nManager:');
    console.log('  Username: manager1');
    console.log('  Password: Manager123!');
    console.log('\nEmployee:');
    console.log('  Username: employee1');
    console.log('  Password: Employee123!');
    console.log('\nNote: All users must change their password on first login');

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;