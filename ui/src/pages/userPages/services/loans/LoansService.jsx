import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, Car, User, Briefcase, CreditCard, Shield, DollarSign } from 'lucide-react';
import ServiceCard from '../components/ServiceCard';
import loanService from '@/services/loanService';
import notification from '@/services/NotificationService';

const LoansService = ({ onApply }) => {
  const [loanProducts, setLoanProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const notify = notification();

  // Default icon mapping for different loan types
  const getLoanIcon = (loanType) => {
    const type = loanType.toLowerCase();
    if (type.includes('home') || type.includes('housing')) return Home;
    if (type.includes('car') || type.includes('auto') || type.includes('vehicle')) return Car;
    if (type.includes('personal')) return User;
    if (type.includes('business') || type.includes('commercial')) return Briefcase;
    return DollarSign; // Default icon
  };

  // Default color mapping for different loan types
  const getLoanColor = (loanType) => {
    const type = loanType.toLowerCase();
    if (type.includes('home') || type.includes('housing')) return 'from-green-500 to-emerald-500';
    if (type.includes('car') || type.includes('auto') || type.includes('vehicle')) return 'from-purple-500 to-pink-500';
    if (type.includes('personal')) return 'from-blue-500 to-cyan-500';
    if (type.includes('business') || type.includes('commercial')) return 'from-orange-500 to-red-500';
    return 'from-slate-500 to-slate-600'; // Default color
  };

  // Fetch loans from backend
  useEffect(() => {
    const fetchLoans = async () => {
      try {
        setLoading(true);
        const response = await loanService.getLoans();
        
        // Transform backend data to frontend format
        const transformedLoans = response.items?.map(loan => ({
          id: loan._id,
          title: loan.loanType,
          description: `${loan.loanType} with competitive interest rates and flexible terms`,
          links: loan.links,
          icon: getLoanIcon(loan.loanType),
          rate: 'Competitive rates',
          amount: 'Based on eligibility',
          features: [
            'Quick approval',
            'Flexible tenure',
            'Minimal documentation',
            'Competitive rates'
          ],
          color: getLoanColor(loan.loanType),
          bgColor: 'bg-green-50'
        })) || [];

        setLoanProducts(transformedLoans);
      } catch (error) {
        console.error('Error fetching loans:', error);
        notify.error('Failed to load loan products');
        // Fallback to default data if API fails
        setLoanProducts([
          {
            id: 'default-loan',
            title: 'Loan Products Available',
            description: 'Contact us for available loan options',
            icon: DollarSign,
            rate: 'Competitive rates',
            amount: 'Based on eligibility',
            features: ['Multiple options available', 'Competitive rates', 'Easy application', 'Quick approval'],
            color: 'from-green-500 to-emerald-500',
            bgColor: 'bg-green-50'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, []);

  const benefits = [
    {
      icon: CreditCard,
      title: 'Quick Approval',
      description: 'Get loan approval in as little as 24 hours with our streamlined process'
    },
    {
      icon: User,
      title: 'Competitive Rates',
      description: 'Enjoy some of the most competitive interest rates in the market'
    },
    {
      icon: Shield,
      title: 'Expert Support',
      description: 'Get guidance from our experienced loan specialists throughout the process'
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
      {/* Loan Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loanProducts.map((loan, index) => (
          <ServiceCard
            key={loan.id}
            product={loan}
            onApply={onApply}
            index={index}
            serviceType="loans"
            buttonText="Apply Now"
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
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Why Choose Our Loans?</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">Experience hassle-free lending with industry-leading benefits</p>
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

export default LoansService;