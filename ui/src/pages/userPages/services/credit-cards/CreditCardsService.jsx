import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Gift, Zap, Shield, CreditCard } from 'lucide-react';
import ServiceCard from '../components/ServiceCard';
import creditCardService from '@/services/creditCardService';
import notification from '@/services/NotificationService';

const CreditCardsService = ({ onApply }) => {
  const [creditCardProducts, setCreditCardProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const notify = notification();

  // Default icon mapping for different card types
  const getCardIcon = (cardName) => {
    const name = cardName.toLowerCase();
    if (name.includes('premium') || name.includes('platinum')) return Star;
    if (name.includes('cashback') || name.includes('rewards')) return Gift;
    if (name.includes('travel') || name.includes('miles')) return Zap;
    if (name.includes('business') || name.includes('corporate')) return Shield;
    return CreditCard; // Default icon
  };

  // Default color mapping for different card types
  const getCardColor = (cardName) => {
    const name = cardName.toLowerCase();
    if (name.includes('premium') || name.includes('platinum')) return 'from-yellow-500 to-orange-500';
    if (name.includes('cashback') || name.includes('rewards')) return 'from-green-500 to-emerald-500';
    if (name.includes('travel') || name.includes('miles')) return 'from-blue-500 to-cyan-500';
    if (name.includes('business') || name.includes('corporate')) return 'from-purple-500 to-indigo-500';
    return 'from-slate-500 to-slate-600'; // Default color
  };

  // Fetch credit cards from backend
  useEffect(() => {
    const fetchCreditCards = async () => {
      try {
        setLoading(true);
        const response = await creditCardService.getCreditCards();
        
        // Transform backend data to frontend format
        const transformedCards = response.cards?.map(card => ({
          id: card._id,
          title: card.creditCardName,
          description: `CIBIL Range: ${card.cibilRange}`,
          image: card.creditCardPic,
          link: card.link,
          icon: getCardIcon(card.creditCardName),
          annualFee: 'Varies',
          creditLimit: 'Based on CIBIL Score',
          features: [
            'Instant approval',
            'Reward points',
            'Secure transactions',
            'Easy EMI options'
          ],
          color: getCardColor(card.creditCardName),
          bgColor: 'bg-blue-50'
        })) || [];

        setCreditCardProducts(transformedCards);
      } catch (error) {
        console.error('Error fetching credit cards:', error);
        notify.error('Failed to load credit cards');
        // Fallback to default data if API fails
        setCreditCardProducts([
          {
            id: 'default-card',
            title: 'Credit Cards Available',
            description: 'Contact us for available credit card options',
            icon: CreditCard,
            annualFee: 'Varies',
            creditLimit: 'Based on eligibility',
            features: ['Multiple options available', 'Competitive rates', 'Easy application', 'Quick approval'],
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'bg-blue-50'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCreditCards();
  }, []);

  const benefits = [
    {
      icon: Gift,
      title: 'Reward Points',
      description: 'Earn reward points on every purchase and redeem for exciting rewards'
    },
    {
      icon: Shield,
      title: 'Secure Transactions',
      description: 'Advanced security features and fraud protection for safe transactions'
    },
    {
      icon: Zap,
      title: 'Instant Approval',
      description: 'Get instant approval and start using your credit card immediately'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/90 rounded-2xl p-6 animate-pulse">
              <div className="h-32 bg-slate-200 rounded-lg mb-4"></div>
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
      {/* Credit Card Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {creditCardProducts.map((card, index) => (
          <ServiceCard
            key={card.id}
            product={card}
            onApply={onApply}
            index={index}
            serviceType="credit-cards"
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
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Why Choose Our Credit Cards?</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">Experience premium banking with industry-leading benefits</p>
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

export default CreditCardsService;