import { useLocation, useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, CreditCard, ArrowRight, Home } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CibilScore() {
  const location = useLocation();
  const navigate = useNavigate();
  const applicationData = location.state;
  const [showCards, setShowCards] = useState(false);

  useEffect(() => {
    // Redirect to home if no application data
    if (!applicationData) {
      navigate('/');
      return;
    }

    // Show cards after a delay for better UX
    const timer = setTimeout(() => {
      setShowCards(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [applicationData, navigate]);

  if (!applicationData) {
    return null;
  }

  const { score, fullName, serviceType } = applicationData;

  // Determine score category and color
  const getScoreCategory = (score) => {
    if (score >= 750) return { category: 'Excellent', color: 'green', bgColor: 'bg-green-500' };
    if (score >= 700) return { category: 'Good', color: 'blue', bgColor: 'bg-blue-500' };
    if (score >= 650) return { category: 'Fair', color: 'yellow', bgColor: 'bg-yellow-500' };
    return { category: 'Poor', color: 'red', bgColor: 'bg-red-500' };
  };

  const scoreInfo = getScoreCategory(score);

  // Mock credit card recommendations based on score
  const getRecommendedCards = (score) => {
    if (score >= 750) {
      return [
        {
          name: 'Premium Rewards Card',
          type: 'premium-card',
          features: ['5% cashback on all purchases', 'Airport lounge access', 'No annual fee first year'],
          limit: '₹5,00,000 - ₹10,00,000',
          approval: 'High'
        },
        {
          name: 'Travel Elite Card',
          type: 'travel-card',
          features: ['10X reward points on travel', 'Complimentary hotel stays', 'Travel insurance'],
          limit: '₹3,00,000 - ₹8,00,000',
          approval: 'High'
        }
      ];
    } else if (score >= 700) {
      return [
        {
          name: 'Cashback Plus Card',
          type: 'cashback-card',
          features: ['3% cashback on dining', '2% on groceries', 'Fuel surcharge waiver'],
          limit: '₹2,00,000 - ₹5,00,000',
          approval: 'Good'
        },
        {
          name: 'Business Pro Card',
          type: 'business-card',
          features: ['Business expense tracking', '2X points on business spends', 'GST invoice management'],
          limit: '₹1,50,000 - ₹4,00,000',
          approval: 'Good'
        }
      ];
    } else if (score >= 650) {
      return [
        {
          name: 'Starter Rewards Card',
          type: 'cashback-card',
          features: ['1% cashback on all purchases', 'No joining fee', 'EMI conversion facility'],
          limit: '₹50,000 - ₹2,00,000',
          approval: 'Moderate'
        }
      ];
    } else {
      return [
        {
          name: 'Secured Credit Card',
          type: 'premium-card',
          features: ['Build credit history', 'Fixed deposit backed', 'Gradual limit increase'],
          limit: '₹10,000 - ₹50,000',
          approval: 'Secured'
        }
      ];
    }
  };

  const recommendedCards = getRecommendedCards(score);

  const handleApplyCard = (cardType) => {
    navigate(`/apply-credit-card/${cardType}`, {
      state: {
        ...applicationData,
        preApproved: score >= 700,
        creditScore: score
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>


      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Your CIBIL Score Report
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Hello {fullName}, here's your credit score and personalized card recommendations
          </p>
        </div>

        {/* CIBIL Score Display */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/20 mb-8">
          <div className="text-center mb-8">
            <div className="relative w-48 h-48 mx-auto mb-6">
              {/* Circular Progress */}
              <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-slate-200"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${(score / 900) * 251.2} 251.2`}
                  className={`text-${scoreInfo.color}-500 transition-all duration-2000 ease-out`}
                  strokeLinecap="round"
                />
              </svg>
              
              {/* Score Display */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-slate-800 mb-1">{score}</div>
                  <div className="text-sm text-slate-600">out of 900</div>
                </div>
              </div>
            </div>

            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${scoreInfo.bgColor} text-white font-semibold mb-4`}>
              {score >= 650 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
              {scoreInfo.category} Credit Score
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <div className="text-2xl font-bold text-slate-800">300-549</div>
                <div className="text-sm text-slate-600">Poor</div>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <div className="text-2xl font-bold text-slate-800">550-649</div>
                <div className="text-sm text-slate-600">Fair</div>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <div className="text-2xl font-bold text-slate-800">650-749</div>
                <div className="text-sm text-slate-600">Good</div>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <div className="text-2xl font-bold text-slate-800">750-900</div>
                <div className="text-sm text-slate-600">Excellent</div>
              </div>
            </div>
          </div>
        </div>

        {/* Credit Card Recommendations */}
        {showCards && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">
                Recommended Credit Cards
              </h2>
              <p className="text-lg text-slate-600">
                Based on your credit score, here are the cards you're likely to get approved for
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {recommendedCards.map((card, index) => (
                <div
                  key={index}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#1e7a8c] to-[#0f4c59] rounded-xl flex items-center justify-center">
                      <CreditCard size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{card.name}</h3>
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        card.approval === 'High' ? 'bg-green-100 text-green-700' :
                        card.approval === 'Good' ? 'bg-blue-100 text-blue-700' :
                        card.approval === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {card.approval === 'High' && <CheckCircle size={12} />}
                        {card.approval === 'Good' && <CheckCircle size={12} />}
                        {card.approval === 'Moderate' && <AlertCircle size={12} />}
                        {card.approval === 'Secured' && <AlertCircle size={12} />}
                        {card.approval} Approval Chance
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-1">Credit Limit</p>
                      <p className="text-slate-600">{card.limit}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700 mb-2">Key Features</p>
                      <ul className="space-y-1">
                        {card.features.map((feature, idx) => (
                          <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                            <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <button
                    onClick={() => handleApplyCard(card.type)}
                    className="w-full bg-gradient-to-r from-[#1e7a8c] to-[#0f4c59] text-white font-semibold py-3 px-4 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    Apply Now
                    <ArrowRight size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Score Improvement Tips */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/20 mb-8">
          <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">
            Tips to Improve Your Credit Score
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle size={20} className="text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-800">Pay Bills on Time</h4>
                  <p className="text-slate-600 text-sm">Always pay your credit card bills and EMIs before the due date</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle size={20} className="text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-800">Keep Credit Utilization Low</h4>
                  <p className="text-slate-600 text-sm">Use less than 30% of your available credit limit</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle size={20} className="text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-800">Maintain Credit Mix</h4>
                  <p className="text-slate-600 text-sm">Have a healthy mix of secured and unsecured loans</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle size={20} className="text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-slate-800">Check Credit Report Regularly</h4>
                  <p className="text-slate-600 text-sm">Monitor your credit report for errors and dispute them</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-[#1e7a8c] to-[#0f4c59] text-white font-semibold py-3 px-8 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Home size={20} />
            Back to Home
          </button>
          <button
            onClick={() => navigate('/services')}
            className="bg-white text-[#1e7a8c] border-2 border-[#1e7a8c] font-semibold py-3 px-8 rounded-xl hover:bg-[#1e7a8c] hover:text-white transition-all"
          >
            Explore All Services
          </button>
        </div>
      </div>
    </div>
  );
}