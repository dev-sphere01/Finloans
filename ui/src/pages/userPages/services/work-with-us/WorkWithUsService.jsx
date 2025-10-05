import { motion } from 'framer-motion';
import { User, Briefcase, Gift, Shield, Star } from 'lucide-react';
import ServiceCard from '../components/ServiceCard';

const WorkWithUsService = ({ onApply }) => {
  const workOpportunities = [
    {
      id: 'become-agent',
      title: 'Become an Agent',
      description: 'Join our network of financial advisors and earn attractive commissions',
      icon: User,
      earning: '₹50,000/month onwards',
      support: 'Full Training & Support',
      features: ['Flexible working hours', 'Attractive commissions', 'Training provided', 'Marketing support'],
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'partner-with-us',
      title: 'Business Partnership',
      description: 'Partner with us to expand your business offerings',
      icon: Briefcase,
      earning: 'Revenue sharing',
      support: 'Marketing Support',
      features: ['Co-branded solutions', 'Marketing support', 'Technical integration', 'Dedicated account manager'],
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50'
    },
    {
      id: 'referral-program',
      title: 'Referral Program',
      description: 'Earn rewards by referring customers to our services',
      icon: Gift,
      earning: 'Up to ₹10,000 per referral',
      support: 'Instant Payouts',
      features: ['Easy referral process', 'Instant payouts', 'No limits on earnings', 'Track your referrals'],
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'corporate-tie-up',
      title: 'Corporate Tie-up',
      description: 'Exclusive financial solutions for your employees',
      icon: Shield,
      earning: 'Customized packages',
      support: 'Dedicated Relationship Manager',
      features: ['Employee benefits', 'Bulk discounts', 'Dedicated support', 'Custom solutions'],
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50'
    }
  ];

  const benefits = [
    {
      icon: Star,
      title: 'Trusted Brand',
      description: 'Work with a reputable financial services company trusted by thousands of customers'
    },
    {
      icon: Briefcase,
      title: 'Growth Opportunities',
      description: 'Excellent career growth opportunities with comprehensive training and support'
    },
    {
      icon: Gift,
      title: 'Attractive Rewards',
      description: 'Competitive compensation packages with performance-based incentives'
    }
  ];

  return (
    <div className="space-y-16">
      {/* Work Opportunities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workOpportunities.map((opportunity, index) => (
          <ServiceCard
            key={opportunity.id}
            product={opportunity}
            onApply={onApply}
            index={index}
            serviceType="work-with-us"
            buttonText="Join Now"
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
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Why Work With Us?</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">Join a trusted financial services company with excellent growth opportunities</p>
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

export default WorkWithUsService;