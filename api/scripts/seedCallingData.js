const mongoose = require('mongoose');
const config = require('../config');
const Lead = require('../models/Lead');
const Service = require('../models/Service');
const ServiceProvider = require('../models/ServiceProvider');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(config.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const seedCallingData = async () => {
    try {
        console.log('🌱 Starting to seed calling module data...');

        // Get admin user for createdBy field
        const adminUser = await User.findOne({ username: 'admin' });
        if (!adminUser) {
            console.error('❌ Admin user not found. Please create an admin user first.');
            process.exit(1);
        }

        // Get staff users for assignment
        const staffUsers = await User.find({
            username: { $ne: 'admin' },
            isActive: true
        }).limit(3);

        console.log(`📋 Found ${staffUsers.length} staff users for assignment`);

        // 1. Create Services
        console.log('📝 Creating services...');

        const servicesData = [
            {
                name: 'Personal Loan',
                description: 'Personal loans for various needs',
                category: 'loan',
                subcategories: [
                    { name: 'Home Renovation', description: 'Loans for home improvement' },
                    { name: 'Medical Emergency', description: 'Loans for medical expenses' },
                    { name: 'Education', description: 'Loans for educational purposes' },
                    { name: 'Wedding', description: 'Loans for wedding expenses' },
                    { name: 'Travel', description: 'Loans for travel and vacation' }
                ],
                createdBy: adminUser._id,
                sortOrder: 1
            },
            {
                name: 'Home Loan',
                description: 'Home loans and mortgages',
                category: 'loan',
                subcategories: [
                    { name: 'Purchase', description: 'Loans for home purchase' },
                    { name: 'Construction', description: 'Loans for home construction' },
                    { name: 'Refinance', description: 'Home loan refinancing' },
                    { name: 'Top-up', description: 'Additional loan on existing home loan' }
                ],
                createdBy: adminUser._id,
                sortOrder: 2
            },
            {
                name: 'Business Loan',
                description: 'Loans for business purposes',
                category: 'loan',
                subcategories: [
                    { name: 'Working Capital', description: 'Loans for working capital needs' },
                    { name: 'Equipment Finance', description: 'Loans for equipment purchase' },
                    { name: 'Startup Funding', description: 'Loans for new business ventures' },
                    { name: 'Expansion', description: 'Loans for business expansion' }
                ],
                createdBy: adminUser._id,
                sortOrder: 3
            },
            {
                name: 'Credit Card',
                description: 'Credit card applications',
                category: 'credit_card',
                subcategories: [
                    { name: 'Rewards Card', description: 'Credit cards with reward points' },
                    { name: 'Cashback Card', description: 'Credit cards with cashback offers' },
                    { name: 'Travel Card', description: 'Credit cards for travel benefits' },
                    { name: 'Business Card', description: 'Credit cards for business use' }
                ],
                createdBy: adminUser._id,
                sortOrder: 4
            },
            {
                name: 'Health Insurance',
                description: 'Health and medical insurance',
                category: 'insurance',
                subcategories: [
                    { name: 'Individual', description: 'Individual health insurance' },
                    { name: 'Family Floater', description: 'Family health insurance plans' },
                    { name: 'Senior Citizen', description: 'Health insurance for senior citizens' },
                    { name: 'Critical Illness', description: 'Critical illness insurance' }
                ],
                createdBy: adminUser._id,
                sortOrder: 5
            },
            {
                name: 'Life Insurance',
                description: 'Life insurance policies',
                category: 'insurance',
                subcategories: [
                    { name: 'Term Life', description: 'Term life insurance' },
                    { name: 'Whole Life', description: 'Whole life insurance' },
                    { name: 'ULIP', description: 'Unit Linked Insurance Plans' },
                    { name: 'Endowment', description: 'Endowment insurance plans' }
                ],
                createdBy: adminUser._id,
                sortOrder: 6
            }
        ];

        // Clear existing services
        await Service.deleteMany({});

        const services = await Service.insertMany(servicesData);
        console.log(`✅ Created ${services.length} services`);

        // 2. Create Service Providers
        console.log('🏢 Creating service providers...');

        const serviceProvidersData = [
            {
                name: 'HDFC Bank',
                description: 'Leading private sector bank in India',
                website: 'https://www.hdfcbank.com',
                contactEmail: 'support@hdfcbank.com',
                contactPhone: '1800-266-4332',
                services: [services[0]._id, services[1]._id, services[3]._id], // Personal Loan, Home Loan, Credit Card
                rating: 4.5,
                isVerified: true,
                createdBy: adminUser._id,
                sortOrder: 1
            },
            {
                name: 'ICICI Bank',
                description: 'Private sector bank with comprehensive financial services',
                website: 'https://www.icicibank.com',
                contactEmail: 'customercare@icicibank.com',
                contactPhone: '1860-120-7777',
                services: [services[0]._id, services[1]._id, services[2]._id, services[3]._id],
                rating: 4.3,
                isVerified: true,
                createdBy: adminUser._id,
                sortOrder: 2
            },
            {
                name: 'SBI',
                description: 'State Bank of India - Largest public sector bank',
                website: 'https://www.onlinesbi.com',
                contactEmail: 'support@sbi.co.in',
                contactPhone: '1800-11-2211',
                services: [services[0]._id, services[1]._id, services[2]._id],
                rating: 4.1,
                isVerified: true,
                createdBy: adminUser._id,
                sortOrder: 3
            },
            {
                name: 'Bajaj Finserv',
                description: 'Leading NBFC providing various financial services',
                website: 'https://www.bajajfinserv.in',
                contactEmail: 'care@bajajfinserv.in',
                contactPhone: '020-3957-5152',
                services: [services[0]._id, services[2]._id],
                rating: 4.2,
                isVerified: true,
                createdBy: adminUser._id,
                sortOrder: 4
            },
            {
                name: 'Star Health Insurance',
                description: 'Specialized health insurance company',
                website: 'https://www.starhealth.in',
                contactEmail: 'info@starhealth.in',
                contactPhone: '044-28288800',
                services: [services[4]._id], // Health Insurance
                rating: 4.0,
                isVerified: true,
                createdBy: adminUser._id,
                sortOrder: 5
            },
            {
                name: 'LIC of India',
                description: 'Life Insurance Corporation of India',
                website: 'https://www.licindia.in',
                contactEmail: 'customercare@licindia.com',
                contactPhone: '022-6827-6827',
                services: [services[5]._id], // Life Insurance
                rating: 4.4,
                isVerified: true,
                createdBy: adminUser._id,
                sortOrder: 6
            }
        ];

        // Clear existing service providers
        await ServiceProvider.deleteMany({});

        const serviceProviders = await ServiceProvider.insertMany(serviceProvidersData);
        console.log(`✅ Created ${serviceProviders.length} service providers`);

        // 3. Create Sample Leads
        console.log('👥 Creating sample leads...');

        const leadNames = [
            'Rajesh Kumar', 'Priya Sharma', 'Amit Singh', 'Sneha Patel', 'Vikram Gupta',
            'Anita Reddy', 'Suresh Nair', 'Kavya Iyer', 'Rohit Jain', 'Meera Agarwal',
            'Arjun Mehta', 'Pooja Verma', 'Kiran Rao', 'Deepak Pandey', 'Sita Devi',
            'Manoj Tiwari', 'Ritu Saxena', 'Ashok Yadav', 'Sunita Mishra', 'Ravi Chandra',
            'Geeta Kumari', 'Sanjay Dubey', 'Nisha Joshi', 'Prakash Sinha', 'Rekha Bhatt',
            'Ajay Thakur', 'Shweta Malhotra', 'Dinesh Choudhary', 'Preeti Agrawal', 'Naveen Kumar',
            'Madhuri Dixit', 'Sachin Tendulkar', 'Lata Mangeshkar', 'Amitabh Bachchan', 'Deepika Padukone',
            'Shah Rukh Khan', 'Priyanka Chopra', 'Aamir Khan', 'Kareena Kapoor', 'Hrithik Roshan',
            'Aishwarya Rai', 'Salman Khan', 'Katrina Kaif', 'Akshay Kumar', 'Vidya Balan',
            'Ranveer Singh', 'Alia Bhatt', 'Ranbir Kapoor', 'Sonam Kapoor', 'Varun Dhawan'
        ];

        const phoneNumbers = [
            '9876543210', '9876543211', '9876543212', '9876543213', '9876543214',
            '9876543215', '9876543216', '9876543217', '9876543218', '9876543219',
            '9876543220', '9876543221', '9876543222', '9876543223', '9876543224',
            '9876543225', '9876543226', '9876543227', '9876543228', '9876543229',
            '9876543230', '9876543231', '9876543232', '9876543233', '9876543234',
            '9876543235', '9876543236', '9876543237', '9876543238', '9876543239',
            '9876543240', '9876543241', '9876543242', '9876543243', '9876543244',
            '9876543245', '9876543246', '9876543247', '9876543248', '9876543249',
            '9876543250', '9876543251', '9876543252', '9876543253', '9876543254',
            '9876543255', '9876543256', '9876543257', '9876543258', '9876543259'
        ];

        const statuses = ['unassigned', 'assigned', 'pending', 'completed', 'failed'];
        const priorities = ['low', 'medium', 'high', 'urgent'];
        const serviceNames = services.map(s => s.name);

        const leadsData = [];

        for (let i = 0; i < 50; i++) {
            const name = leadNames[i];
            const contactNo = phoneNumbers[i];
            const email = `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`;
            const selectedService = serviceNames[Math.floor(Math.random() * serviceNames.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const priority = priorities[Math.floor(Math.random() * priorities.length)];

            // Assign some leads to staff
            let assignedTo = null;
            let assignedAt = null;
            let assignedBy = null;

            if (status !== 'unassigned' && staffUsers.length > 0) {
                assignedTo = staffUsers[Math.floor(Math.random() * staffUsers.length)]._id;
                assignedAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Random date within last 30 days
                assignedBy = adminUser._id;
            }

            // Add some call attempts for assigned leads
            let callAttempts = 0;
            let lastCallAt = null;
            let callPicked = null;

            if (assignedTo) {
                callAttempts = Math.floor(Math.random() * 5);
                if (callAttempts > 0) {
                    lastCallAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Random date within last 7 days
                    callPicked = Math.random() > 0.3; // 70% chance call was picked
                }
            }

            const leadData = {
                name,
                contactNo,
                email,
                selectedService,
                status,
                priority,
                assignedTo,
                assignedAt,
                assignedBy,
                callAttempts,
                lastCallAt,
                callPicked,
                notes: `Sample lead for ${selectedService}. Generated for testing purposes.`,
                remarks: status === 'completed' ? 'Successfully processed and closed.' :
                    status === 'failed' ? 'Customer not interested or unreachable.' :
                        status === 'pending' ? 'Follow-up required.' : '',
                source: Math.random() > 0.7 ? 'bulk_import' : 'manual',
                createdBy: adminUser._id,
                createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000) // Random date within last 60 days
            };

            leadsData.push(leadData);
        }

        // Clear existing leads
        await Lead.deleteMany({});

        const leads = await Lead.insertMany(leadsData);
        console.log(`✅ Created ${leads.length} sample leads`);

        // Print summary
        console.log('\n📊 Data Summary:');
        console.log(`Services: ${services.length}`);
        console.log(`Service Providers: ${serviceProviders.length}`);
        console.log(`Leads: ${leads.length}`);

        const statusCounts = await Lead.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        console.log('\n📈 Lead Status Distribution:');
        statusCounts.forEach(item => {
            console.log(`${item._id}: ${item.count}`);
        });

        const assignedCount = await Lead.countDocuments({ assignedTo: { $exists: true } });
        console.log(`\n👥 Assigned Leads: ${assignedCount}`);

        console.log('\n🎉 Calling module data seeded successfully!');
        console.log('\n🚀 You can now:');
        console.log('1. View leads in the admin calling management dashboard');
        console.log('2. Assign leads to staff members');
        console.log('3. Staff can view their assigned leads');
        console.log('4. Start calling sessions and update lead status');
        console.log('5. Import more leads via Excel/CSV');

    } catch (error) {
        console.error('❌ Error seeding calling data:', error);
    } finally {
        mongoose.connection.close();
    }
};

// Run the seeder
seedCallingData();