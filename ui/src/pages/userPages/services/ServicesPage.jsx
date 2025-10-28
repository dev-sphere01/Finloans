import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Phone, Mail, CreditCard, PiggyBank, Briefcase } from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';

// Import service components
import LoansService from './loans/LoansService';
import InsuranceService from './insurance/InsuranceService';
import CreditCardsService from './credit-cards/CreditCardsService';
import WorkWithUsService from './work-with-us/WorkWithUsService';

// Service configuration
const serviceConfig = {
  loans: {
    title: 'Loans',
    description: 'Choose from our comprehensive range of loan products designed to meet your financial goals',
    component: LoansService,
    icon: PiggyBank
  },
  insurance: {
    title: 'Insurance',
    description: 'Comprehensive insurance solutions to protect what matters most to you',
    component: InsuranceService,
    icon: Shield
  },
  'credit-cards': {
    title: 'Credit Cards',
    description: 'Discover credit cards tailored to your lifestyle with exclusive rewards and benefits',
    component: CreditCardsService,
    icon: CreditCard
  },
  'work-with-us': {
    title: 'Work With Us',
    description: 'Join our team and partner with us to bring financial growth opportunities and career advancements',
    component: WorkWithUsService,
    icon: Briefcase
  }
};

// Hero carousel highlights
const heroHighlights = [
  { icon: Shield, text: "Trusted by 200,000+ customers" },
  { icon: Phone, text: "Quick & Secure Services" },
  { icon: Mail, text: "24/7 Support" },
];

export default function ServicesPage() {
  const { serviceType } = useParams();
  const navigate = useNavigate();
  const service = serviceConfig[serviceType];

  const handleApplyNow = (applyFor, productData = null) => {
    // Create a mapping for service types to route parameters
    const serviceTypeMapping = {
      // Loan mappings
      'home-loan': 'home',
      'personal-loan': 'personal',
      'car-loan': 'vehicle',
      'business-loan': 'business',
      // Insurance mappings
      'life-insurance': 'life',
      'health-insurance': 'health',
      'vehicle-insurance': 'vehicle',
      'property-insurance': 'property',
      // Credit card mappings
      'premium-card': 'premium',
      'cashback-card': 'cashback',
      'travel-card': 'travel',
      'business-card': 'business'
    };

    // Determine the correct route based on service type using unified routing
    if (serviceType === 'credit-cards') {
      // For credit cards, go to CIBIL check first
      navigate('/cibil-check');
    } else if (serviceType === 'loans') {
      // For loans, use unified loan application
      const loanType = serviceTypeMapping[applyFor] || applyFor.replace('-loan', '');
      navigate(`/apply/loan/${loanType}`, {
        state: {
          serviceType: 'loan',
          subType: loanType,
          serviceName: `${loanType.charAt(0).toUpperCase() + loanType.slice(1)} Loan`
        }
      });
    } else if (serviceType === 'insurance') {
      // For insurance, handle the case where applyFor might be an ObjectId
      let insuranceType, insuranceSubType, serviceName;
      
      if (productData && productData.title && productData.subTypes) {
        // If we have product data, use the insurance type and default to first subtype
        insuranceType = productData.title.toLowerCase().replace(' insurance', '');
        insuranceSubType = productData.subTypes.length > 0 ? productData.subTypes[0].name : 'term';
        serviceName = productData.title;
      } else if (applyFor && applyFor.match(/^[0-9a-fA-F]{24}$/)) {
        // If applyFor is an ObjectId, default to life insurance with term subtype
        insuranceType = 'life';
        insuranceSubType = 'term';
        serviceName = 'Life Insurance';
      } else {
        // Use the mapping or extract from the applyFor parameter
        insuranceType = serviceTypeMapping[applyFor] || applyFor.replace('-insurance', '');
        insuranceSubType = insuranceType === 'life' ? 'term' : 
                          insuranceType === 'health' ? 'individual' :
                          insuranceType === 'vehicle' ? 'car' :
                          insuranceType === 'property' ? 'home' :
                          insuranceType === 'travel' ? 'domestic' : 'term';
        serviceName = `${insuranceType.charAt(0).toUpperCase() + insuranceType.slice(1)} Insurance`;
      }
      
      navigate(`/apply/insurance/${insuranceType}`, {
        state: {
          serviceType: 'insurance',
          subType: insuranceSubType,
          insuranceType: productData ? productData.title : serviceName,
          serviceName: serviceName
        }
      });
    } else {
      // Fallback to unified route
      navigate(`/apply/${serviceType}/${applyFor}`, {
        state: {
          serviceType: serviceType,
          subType: applyFor
        }
      });
    }
  };

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield size={48} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-4">Service Not Found</h1>
          <p className="text-slate-600 mb-6">The service you are looking for does not exist.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            <ArrowLeft size={20} />
            Back to Home
          </Link>
        </motion.div>
      </div>
    );
  }

  // Get the service component
  const ServiceComponent = service.component;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
      {/* Background floating shapes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>

      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: 'Services', href: '/services' },
          { label: service.title, icon: service.icon }
        ]} 
      />

      {/* Compact Hero Header with highlights */}
      <div className="relative z-10 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white relative rounded-b-3xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 text-center space-y-6">
            {/* Animated highlights carousel */}
            <motion.div
              className="inline-flex items-center gap-4 justify-center flex-wrap text-xs md:text-sm"
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              {heroHighlights.map((highlight, index) => {
                const Icon = highlight.icon;
                return (
                  <div key={index} className="inline-flex items-center gap-1 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                    <Icon className="w-3 h-3 text-green-400" />
                    <span>{highlight.text}</span>
                  </div>
                );
              })}
            </motion.div>

            {/* Service title */}
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
              {service.title}
            </h1>

            {/* Service description */}
            <p className="text-sm md:text-base text-slate-200 max-w-2xl mx-auto leading-relaxed">
              {service.description}
            </p>
          </div>
        </div>
      </div>

      {/* Service Component */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <ServiceComponent onApply={handleApplyNow} />
      </div>

      {/* Call-to-Action Section */}
      <div className="relative z-10 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
            <div className="relative z-10 text-center space-y-6">
              <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
              <p className="text-slate-200 mb-8 text-lg max-w-2xl mx-auto">
                Join thousands of satisfied customers who trust us with their financial needs.
                Get personalized solutions tailored just for you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-slate-800 px-8 py-4 rounded-xl font-semibold hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                >
                  <Phone className="w-5 h-5" />
                  Call Now
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Mail className="w-5 h-5" />
                  Get in Touch
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
