import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Shield, Car, Home, Briefcase, Umbrella } from 'lucide-react';
import ServiceCard from '../components/ServiceCard';
import insuranceService from '@/services/insuranceService';
import notification from '@/services/NotificationService';

const InsuranceService = ({ onApply }) => {
  const [insuranceProducts, setInsuranceProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const notify = notification();

  // Default icon mapping for different insurance types
  const getInsuranceIcon = (insuranceType) => {
    const type = insuranceType.toLowerCase();
    if (type.includes('life')) return Heart;
    if (type.includes('health') || type.includes('medical')) return Shield;
    if (type.includes('vehicle') || type.includes('car') || type.includes('auto')) return Car;
    if (type.includes('home') || type.includes('property') || type.includes('house')) return Home;
    if (type.includes('business') || type.includes('commercial')) return Briefcase;
    return Umbrella; // Default icon
  };

  // Default color mapping for different insurance types
  const getInsuranceColor = (insuranceType) => {
    const type = insuranceType.toLowerCase();
    if (type.includes('life')) return 'from-red-500 to-pink-500';
    if (type.includes('health') || type.includes('medical')) return 'from-green-500 to-emerald-500';
    if (type.includes('vehicle') || type.includes('car') || type.includes('auto')) return 'from-blue-500 to-cyan-500';
    if (type.includes('home') || type.includes('property') || type.includes('house')) return 'from-purple-500 to-indigo-500';
    if (type.includes('business') || type.includes('commercial')) return 'from-orange-500 to-red-500';
    return 'from-slate-500 to-slate-600'; // Default color
  };

  // Fetch insurance from backend
  useEffect(() => {
    const fetchInsurance = async () => {
      try {
        setLoading(true);
        const response = await insuranceService.getInsurances();
        
        // Transform backend data to frontend format
        const transformedInsurance = response.items?.map(insurance => ({
          id: insurance._id,
          title: insurance.insuranceType,
          description: insurance.description || `Comprehensive ${insurance.insuranceType.toLowerCase()} coverage with reliable protection`,
          links: insurance.links,
          icon: getInsuranceIcon(insurance.insuranceType),
          premium: 'Affordable premiums',
          coverage: 'Comprehensive coverage',
          features: [
            'Comprehensive coverage',
            'Quick claims process',
            '24/7 customer support',
            'Affordable premiums'
          ],
          color: insurance.color || getInsuranceColor(insurance.insuranceType),
          bgColor: 'bg-purple-50',
          subTypes: insurance.subTypes || []
        })) || [];

        setInsuranceProducts(transformedInsurance);
      } catch (error) {
        console.error('Error fetching insurance:', error);
        notify.error('Failed to load insurance products');
        // Fallback to default data if API fails
        setInsuranceProducts([
          {
            id: 'default-insurance',
            title: 'Insurance Products Available',
            description: 'Contact us for available insurance options',
            icon: Umbrella,
            premium: 'Affordable premiums',
            coverage: 'Comprehensive coverage',
            features: ['Multiple options available', 'Competitive premiums', 'Easy application', 'Quick processing'],
            color: 'from-purple-500 to-indigo-500',
            bgColor: 'bg-purple-50'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchInsurance();
  }, []);

  const benefits = [
    {
      icon: Shield,
      title: 'Comprehensive Coverage',
      description: 'Wide range of coverage options to protect against various risks and uncertainties'
    },
    {
      icon: Briefcase,
      title: 'Quick Claims Process',
      description: 'Hassle-free claims processing with dedicated support for faster settlements'
    },
    {
      icon: Heart,
      title: '24/7 Customer Support',
      description: 'Round-the-clock customer support to assist you whenever you need help'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white/90 rounded-2xl p-6 animate-pulse">
              <div className="h-4 bg-slate-200 rounded mb-2"></div>
              <div className="h-3 bg-slate-200 rounded mb-4"></div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="h-16 bg-slate-200 rounded"></div>
                <div className="h-16 bg-slate-200 rounded"></div>
              </div>
              <div className="h-10 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {/* Insurance Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {insuranceProducts.map((insurance, index) => (
          <ServiceCard
            key={insurance.id}
            product={insurance}
            onApply={onApply}
            index={index}
            serviceType="insurance"
            buttonText="Get Quote"
          />
        ))}
      </div>

      {/* Benefits Section */}
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 md:p-12">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Why Choose Our Insurance?</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">Trusted protection with comprehensive coverage and reliable service</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    whileHover={{ y: -8 }}
                    className="text-center"
                  >
                      <motion.div 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-16 h-16 bg-gradient-to-r from-[#1e7a8c] to-[#0f4c59] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                      >
                          <Icon size={32} className="text-white" />
                      </motion.div>
                      <h3 className="text-xl font-semibold text-slate-800 mb-3">{benefit.title}</h3>
                      <p className="text-slate-600 leading-relaxed">{benefit.description}</p>
                  </motion.div>
              )
          })}
        </div>
      </div>
    </div>
  );
};

export default InsuranceService;