const mongoose = require('mongoose');
const config = require('../config');
const User = require('../models/User');
const Role = require('../models/Role');

// Connect to MongoDB
mongoose.connect(config.DB_URI);

const checkUserPermissions = async () => {
    try {
        console.log('🔍 Checking user permissions...\n');

        // Get all roles and their permissions
        const roles = await Role.find({ isActive: true });

        console.log('📋 Available Roles:');
        roles.forEach(role => {
            console.log(`\n🏷️  Role: ${role.name}`);
            console.log(`   Description: ${role.description}`);
            console.log('   Permissions:');
            role.permissions.forEach(perm => {
                console.log(`     - ${perm.resource}: [${perm.actions.join(', ')}]`);
            });
        });

        // Get all users and their roles
        const users = await User.find({ isActive: true })
            .populate('roleId', 'name permissions')
            .select('username firstName lastName email roleId');

        console.log('\n\n👥 Users and their permissions:');
        users.forEach(user => {
            console.log(`\n👤 User: ${user.firstName} ${user.lastName} (@${user.username})`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Role: ${user.roleId?.name || 'No Role'}`);

            if (user.roleId?.permissions) {
                console.log('   Permissions:');
                user.roleId.permissions.forEach(perm => {
                    console.log(`     - ${perm.resource}: [${perm.actions.join(', ')}]`);
                });

                // Check specifically for calling permissions
                const callingAdminPerm = user.roleId.permissions.find(p => p.resource === 'calling_admin');
                const callingEmployeePerm = user.roleId.permissions.find(p => p.resource === 'calling_employee');

                if (callingAdminPerm) {
                    console.log(`   ✅ Has calling_admin permissions: [${callingAdminPerm.actions.join(', ')}]`);
                }
                if (callingEmployeePerm) {
                    console.log(`   ✅ Has calling_employee permissions: [${callingEmployeePerm.actions.join(', ')}]`);
                }
                if (!callingAdminPerm && !callingEmployeePerm) {
                    console.log('   ❌ No calling permissions found');
                }
            }
        });

        console.log('\n🎯 Summary:');
        const usersWithCallingAdmin = users.filter(u =>
            u.roleId?.permissions?.some(p => p.resource === 'calling_admin')
        );
        const usersWithCallingEmployee = users.filter(u =>
            u.roleId?.permissions?.some(p => p.resource === 'calling_employee')
        );

        console.log(`   Users with calling_admin permissions: ${usersWithCallingAdmin.length}`);
        console.log(`   Users with calling_employee permissions: ${usersWithCallingEmployee.length}`);

    } catch (error) {
        console.error('❌ Error checking permissions:', error);
    } finally {
        mongoose.connection.close();
    }
};

checkUserPermissions();