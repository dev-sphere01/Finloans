const mongoose = require('mongoose');
const Insurance = require('../models/Insurance');
const config = require('../config');

// Connect to MongoDB
mongoose.connect(config.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const insuranceData = [
  {
    insuranceType: 'Life Insurance',
    description: 'Comprehensive life insurance coverage to protect your family\'s financial future',
    subTypes: [
      {
        name: 'term',
        description: 'Pure life insurance coverage for a specific term',
        isActive: true
      },
      {
        name: 'whole',
        description: 'Permanent life insurance with investment component',
        isActive: true
      },
      {
        name: 'endowment',
        description: 'Life insurance with savings and investment benefits',
        isActive: true
      }
    ],
    isActive: true,
    icon: 'heart',
    color: 'from-red-500 to-pink-500',
    displayOrder: 1,
    links: []
  },
  {
    insuranceType: 'Health Insurance',
    description: 'Medical insurance coverage for healthcare expenses and treatments',
    subTypes: [
      {
        name: 'individual',
        description: 'Individual health insurance coverage',
        isActive: true
      },
      {
        name: 'family',
        description: 'Family floater health insurance policy',
        isActive: true
      },
      {
        name: 'senior-citizen',
        description: 'Specialized health insurance for senior citizens',
        isActive: true
      },
      {
        name: 'critical-illness',
        description: 'Coverage for critical illnesses and major surgeries',
        isActive: true
      }
    ],
    isActive: true,
    icon: 'shield',
    color: 'from-green-500 to-emerald-500',
    displayOrder: 2,
    links: []
  },
  {
    insuranceType: 'Vehicle Insurance',
    description: 'Comprehensive vehicle insurance for cars, bikes, and commercial vehicles',
    subTypes: [
      {
        name: 'car',
        description: 'Car insurance with comprehensive coverage',
        isActive: true
      },
      {
        name: 'bike',
        description: 'Two-wheeler insurance coverage',
        isActive: true
      },
      {
        name: 'commercial',
        description: 'Commercial vehicle insurance',
        isActive: true
      }
    ],
    isActive: true,
    icon: 'car',
    color: 'from-blue-500 to-cyan-500',
    displayOrder: 3,
    links: []
  },
  {
    insuranceType: 'Property Insurance',
    description: 'Insurance coverage for residential and commercial properties',
    subTypes: [
      {
        name: 'home',
        description: 'Home insurance for residential properties',
        isActive: true
      },
      {
        name: 'commercial',
        description: 'Commercial property insurance',
        isActive: true
      },
      {
        name: 'fire',
        description: 'Fire insurance coverage',
        isActive: true
      }
    ],
    isActive: true,
    icon: 'home',
    color: 'from-purple-500 to-indigo-500',
    displayOrder: 4,
    links: []
  },
  {
    insuranceType: 'Travel Insurance',
    description: 'Travel insurance for domestic and international trips',
    subTypes: [
      {
        name: 'domestic',
        description: 'Domestic travel insurance coverage',
        isActive: true
      },
      {
        name: 'international',
        description: 'International travel insurance',
        isActive: true
      },
      {
        name: 'business',
        description: 'Business travel insurance',
        isActive: true
      }
    ],
    isActive: true,
    icon: 'plane',
    color: 'from-orange-500 to-red-500',
    displayOrder: 5,
    links: []
  }
];

async function seedInsuranceData() {
  try {
    console.log('Starting insurance data seeding...');

    // Clear existing data
    await Insurance.deleteMany({});
    console.log('Cleared existing insurance data');

    // Insert new data
    const insertedData = await Insurance.insertMany(insuranceData);
    console.log(`Successfully inserted ${insertedData.length} insurance types`);

    // Display inserted data
    insertedData.forEach(insurance => {
      console.log(`- ${insurance.insuranceType} (${insurance.subTypes.length} subtypes)`);
    });

    console.log('Insurance data seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding insurance data:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedInsuranceData();