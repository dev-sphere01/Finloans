import React from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, Home, Car, User, Briefcase, CreditCard, Shield, Heart, Star, Gift, Zap } from 'lucide-react';

const productData = {
  loans: {
    title: 'Loan Products',
    description: 'Choose from our comprehensive range of loan products designed to meet your financial goals',
    items: [
      {
        id: 'home-loan',
        title: 'Home Loan',
        description: 'Get your dream home with attractive interest rates and flexible tenure',
        icon: Home,
        rate: '8.5% onwards',
        amount: 'Up to ₹10 Crores',
        features: ['Tax benefits', 'Quick approval', 'Minimal documentation']
      },
      {
        id: 'personal-loan',
        title: 'Personal Loan',
        description: 'Instant personal loans for all your financial needs',
        icon: User,
        rate: '10.99% onwards',
        amount: 'Up to ₹50 Lakhs',
        features: ['No collateral', 'Quick disbursal', 'Flexible repayment']
      },
      {
        id: 'car-loan',
        title: 'Car Loan',
        description: 'Drive your dream car with affordable EMIs',
        icon: Car,
        rate: '7.5% onwards',
        amount: 'Up to ₹1 Crore',
        features: ['New & used cars', 'Fast approval', 'Easy EMIs']
      },
      {
        id: 'business-loan',
        title: 'Business Loan',
        description: 'Fuel your business growth with our business loans',
        icon: Briefcase,
        rate: '12% onwards',
        amount: 'Up to ₹5 Crores',
        features: ['Working capital', 'Equipment finance', 'Business expansion']
      }
    ],
    benefits: {
        title: 'Why Choose Our Loans?',
        description: 'Experience hassle-free lending with industry-leading benefits',
        items: [
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
                icon: Briefcase,
                title: 'Expert Support',
                description: 'Get guidance from our experienced loan specialists throughout the process'
            }
        ]
    }
  },
  insurance: {
    title: 'Insurance Products',
    description: 'Comprehensive insurance solutions to protect what matters most to you',
    items: [
        {
            id: 'life-insurance',
            title: 'Life Insurance',
            description: 'Secure your family\'s financial future with comprehensive life coverage',
            icon: Heart,
            premium: '₹500/month onwards',
            coverage: 'Up to ₹1 Crore',
            features: ['Tax benefits', 'Maturity benefits', 'Accidental death cover']
          },
          {
            id: 'health-insurance',
            title: 'Health Insurance',
            description: 'Complete healthcare protection for you and your family',
            icon: Shield,
            premium: '₹800/month onwards',
            coverage: 'Up to ₹50 Lakhs',
            features: ['Cashless treatment', 'Pre-post hospitalization', 'Day care procedures']
          },
          {
            id: 'vehicle-insurance',
            title: 'Vehicle Insurance',
            description: 'Comprehensive protection for your car and two-wheeler',
            icon: Car,
            premium: '₹3,000/year onwards',
            coverage: 'Up to Vehicle IDV',
            features: ['Third party liability', 'Own damage cover', 'Roadside assistance']
          },
          {
            id: 'property-insurance',
            title: 'Property Insurance',
            description: 'Protect your home and belongings from unforeseen events',
            icon: Home,
            premium: '₹2,000/year onwards',
            coverage: 'Up to ₹2 Crores',
            features: ['Fire & burglary', 'Natural disasters', 'Personal belongings']
          }
    ],
    benefits: {
        title: 'Why Choose Our Insurance?',
        description: 'Trusted protection with comprehensive coverage and reliable service',
        items: [
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
        ]
    }
  },
  'credit-cards': {
    title: 'Credit Cards',
    description: 'Discover credit cards tailored to your lifestyle with exclusive rewards and benefits',
    items: [
        {
            id: 'premium-card',
            title: 'Premium Credit Card',
            description: 'Exclusive benefits with premium lifestyle rewards',
            icon: Star,
            annualFee: '₹2,999',
            creditLimit: 'Up to ₹25 Lakhs',
            features: ['5X reward points', 'Airport lounge access', 'Concierge service']
          },
          {
            id: 'cashback-card',
            title: 'Cashback Credit Card',
            description: 'Earn cashback on all your purchases',
            icon: Gift,
            annualFee: '₹999',
            creditLimit: 'Up to ₹10 Lakhs',
            features: ['5% cashback', 'No foreign transaction fee', 'Fuel surcharge waiver']
          },
          {
            id: 'travel-card',
            title: 'Travel Credit Card',
            description: 'Perfect for frequent travelers with travel benefits',
            icon: Zap,
            annualFee: '₹1,999',
            creditLimit: 'Up to ₹15 Lakhs',
            features: ['Air miles rewards', 'Travel insurance', 'Hotel discounts']
          },
          {
            id: 'business-card',
            title: 'Business Credit Card',
            description: 'Designed for business expenses and cash flow',
            icon: Shield,
            annualFee: '₹3,999',
            creditLimit: 'Up to ₹50 Lakhs',
            features: ['Business rewards', 'Expense tracking', 'Corporate benefits']
          }
    ],
    benefits: {
        title: 'Why Choose Our Credit Cards?',
        description: 'Experience premium banking with industry-leading benefits',
        items: [
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
        ]
    }
  }
};

export default function ProductsPage() {
  const { productType } = useParams();
  const product = productData[productType];

  const handleApplyNow = (applyFor) => {
    window.location.href = `/apply/${applyFor}`;
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800">Product not found</h1>
          <p className="text-gray-600 mt-2">The product you are looking for does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => window.history.back()}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-[#1e7a8c] to-[#0f4c59] rounded-lg flex items-center justify-center">
                  <div className="w-5 h-5 bg-white rounded-sm"></div>
                </div>
                <span className="text-xl font-bold text-black">FinLoans</span>
              </div>
            </div>
            
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="/" className="text-gray-600 hover:text-[#1e7a8c] font-medium px-3 py-2 text-sm transition-colors">
                  Home
                </a>
                <a href="/products" className="text-[#1e7a8c] font-medium px-3 py-2 text-sm">
                  Products
                </a>
                <a href="/about" className="text-gray-600 hover:text-[#1e7a8c] font-medium px-3 py-2 text-sm transition-colors">
                  About
                </a>
                <a href="/contact" className="text-gray-600 hover:text-[#1e7a8c] font-medium px-3 py-2 text-sm transition-colors">
                  Contact
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <User size={20} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm">
            <a href="/" className="text-gray-500 hover:text-[#1e7a8c] transition-colors">Home</a>
            <span className="text-gray-400">/</span>
            <a href="/products" className="text-gray-500 hover:text-[#1e7a8c] transition-colors">Products</a>
            <span className="text-gray-400">/</span>
            <span className="text-[#1e7a8c] font-medium">{product.title}</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-[#1e7a8c] to-[#0f4c59] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {product.title}
            </h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              {product.description}
            </p>
          </div>
        </div>
      </div>

      {/* Product Types Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {product.items.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#1e7a8c] to-[#0f4c59] rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Icon size={32} className="text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-black mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {item.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">{productType === 'loans' ? 'Interest Rate' : (productType === 'insurance' ? 'Premium' : 'Annual Fee')}</p>
                        <p className="font-semibold text-[#1e7a8c]">{item.rate || item.premium || item.annualFee}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">{productType === 'loans' ? 'Loan Amount' : (productType === 'insurance' ? 'Coverage' : 'Credit Limit')}</p>
                        <p className="font-semibold text-black">{item.amount || item.coverage || item.creditLimit}</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <p className="text-sm text-gray-500 mb-2">Key Features</p>
                      <div className="flex flex-wrap gap-2">
                        {item.features.map((feature, index) => (
                          <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={() => handleApplyNow(item.id)}
                      className="w-full bg-[#1e7a8c] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#0f4c59] transition-colors"
                    >
                      {productType === 'insurance' ? 'Get Quote' : 'Apply Now'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">{product.benefits.title}</h2>
            <p className="text-lg text-gray-600">{product.benefits.description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {product.benefits.items.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                    <div key={index} className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-[#1e7a8c] to-[#0f4c59] rounded-full flex items-center justify-center mx-auto mb-4">
                            <Icon size={32} className="text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-black mb-2">{benefit.title}</h3>
                        <p className="text-gray-600">{benefit.description}</p>
                    </div>
                )
            })}
          </div>
        </div>
      </div>
    </div>
  );
}


