import { TrendingUp, TrendingDown, CheckCircle, CreditCard, Shield, Award, Target, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import creditCardService from '../../../services/creditCardService';

export default function CibilScore() {
  const navigate = useNavigate();
  const [showCards, setShowCards] = useState(false);
  const [animateScore, setAnimateScore] = useState(0);
  const [creditCards, setCreditCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const applicationData = {
    score: 780,
    fullName: 'John Doe',
    serviceType: 'Credit Card'
  };

  const { score, fullName } = applicationData;



  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = score / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setAnimateScore(score);
        clearInterval(timer);
      } else {
        setAnimateScore(Math.floor(current));
      }
    }, duration / steps);

    const cardsTimer = setTimeout(() => setShowCards(true), 1500);

    // Fetch credit cards from API
    const fetchCreditCards = async () => {
      try {
        setLoading(true);
        const response = await creditCardService.getCreditCards({
          limit: 10,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        });

        // Handle the API response structure: {cards: [...], pagination: {...}}
        const responseData = response.data || response;
        const cardsArray = responseData.cards || responseData;
        setCreditCards(Array.isArray(cardsArray) ? cardsArray : []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch credit cards:', err);
        setError('Failed to load credit cards from server');
        setCreditCards([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCreditCards();

    return () => {
      clearInterval(timer);
      clearTimeout(cardsTimer);
    };
  }, [score]);

  const getScoreCategory = (score) => {
    if (score >= 750) return { category: 'Excellent', color: 'emerald', gradient: 'from-emerald-500 to-green-600' };
    if (score >= 700) return { category: 'Good', color: 'blue', gradient: 'from-blue-500 to-cyan-600' };
    if (score >= 650) return { category: 'Fair', color: 'yellow', gradient: 'from-yellow-500 to-orange-500' };
    return { category: 'Poor', color: 'red', gradient: 'from-red-500 to-rose-600' };
  };

  const scoreInfo = getScoreCategory(score);



  // Filter and format credit cards based on CIBIL score
  const getRecommendedCards = () => {
    if (loading) return [];

    // Ensure creditCards is an array before filtering
    if (!Array.isArray(creditCards) || creditCards.length === 0) {
      return [];
    }

    // Filter cards based on CIBIL score requirements
    const filteredCards = creditCards.filter(card => {
      // Parse CIBIL range (e.g., "750-800") to get minimum score
      const cibilRange = card.cibilRange || '';
      const minScore = cibilRange.split('-')[0] ? parseInt(cibilRange.split('-')[0]) : 0;
      return score >= minScore;
    }).map(card => ({
      id: card._id || card.id,
      name: card.creditCardName || card.name,
      bank: card.bank || 'Bank',
      features: card.features || card.benefits || ['Credit card benefits', 'Reward points', 'Easy EMI options'],
      limit: card.creditLimit || '₹1-5L',
      approval: getApprovalChance(score, card.cibilRange),
      annualFee: card.annualFee || 'Contact Bank',
      joiningFee: card.joiningFee || 'Contact Bank',
      icon: getCardIcon(card.category || 'general'),
      cibilRange: card.cibilRange || '0-900',
      category: card.category || 'general',
      image: card.creditCardPic,
      link: card.link
    }));

    // Sort by relevance (higher min CIBIL score first for better cards)
    return filteredCards.sort((a, b) => {
      const aMin = parseInt(a.cibilRange.split('-')[0]) || 0;
      const bMin = parseInt(b.cibilRange.split('-')[0]) || 0;
      return bMin - aMin;
    }).slice(0, 6);
  };

  const getApprovalChance = (userScore, cibilRange) => {
    if (!cibilRange) return 'Good';

    // Parse range like "750-800"
    const rangeParts = cibilRange.split('-');
    const minScore = parseInt(rangeParts[0]) || 0;
    const maxScore = parseInt(rangeParts[1]) || 900;

    if (userScore >= minScore && userScore <= maxScore) return 'High';
    if (userScore >= minScore - 50) return 'Good';
    if (userScore >= minScore - 100) return 'Moderate';
    return 'Low';
  };

  const getCardIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'premium':
      case 'luxury':
        return Award;
      case 'travel':
        return Target;
      case 'cashback':
      case 'rewards':
        return CreditCard;
      case 'secured':
      case 'student':
        return Shield;
      default:
        return CreditCard;
    }
  };

  const recommendedCards = getRecommendedCards();

  const scoreRanges = [
    { range: '300-549', label: 'Poor', color: 'red' },
    { range: '550-649', label: 'Fair', color: 'yellow' },
    { range: '650-749', label: 'Good', color: 'blue' },
    { range: '750-900', label: 'Excellent', color: 'emerald' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Compact Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full mb-2 border border-slate-200">
            <Shield size={14} className="text-[#2D9DB2]" />
            <span className="text-xs font-semibold text-slate-700">CIBIL Score</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Credit Score Analysis</h1>
          <p className="text-sm text-slate-600">Hello <span className="font-semibold text-[#2D9DB2]">{fullName}</span></p>
        </div>

        {/* Compact Score Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-xl shadow-xl p-4 mb-4">
          <div className="grid md:grid-cols-2 gap-4 items-center">
            {/* Smaller Score Circle */}
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 mb-2">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-200" />
                  <circle cx="50" cy="50" r="42" stroke="url(#scoreGradient)" strokeWidth="6" fill="transparent" strokeDasharray={`${(animateScore / 900) * 264} 264`} className="transition-all duration-300 ease-out" strokeLinecap="round" />
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" className="text-[#2D9DB2]" stopColor="currentColor" />
                      <stop offset="100%" className="text-[#1e7a8c]" stopColor="currentColor" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-[#2D9DB2] to-[#1e7a8c] bg-clip-text text-transparent">{animateScore}</div>
                  <div className="text-xs text-slate-500">/ 900</div>
                </div>
              </div>
              <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r ${scoreInfo.gradient} text-white text-sm font-semibold`}>
                {score >= 650 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {scoreInfo.category}
              </div>
            </div>

            {/* Compact Ranges */}
            <div className="space-y-2">
              {scoreRanges.map((range, idx) => (
                <div key={idx} className={`flex items-center justify-between p-2 rounded-lg text-sm transition-all ${score >= parseInt(range.range.split('-')[0]) && score <= parseInt(range.range.split('-')[1]) ? 'bg-[#2D9DB2]/10 border border-[#2D9DB2]' : 'bg-slate-50'}`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full bg-${range.color}-500`}></div>
                    <span className="font-medium text-slate-700 text-xs">{range.range}</span>
                  </div>
                  <span className="text-xs text-slate-600">{range.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Compact Cards */}
        {showCards && (
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-800 mb-3 text-center">
              Recommended Cards
              {!loading && Array.isArray(creditCards) && creditCards.length > 0 && (
                <span className="text-sm font-normal text-slate-600 ml-2">
                  (Based on your CIBIL score)
                </span>
              )}
            </h2>

            {loading && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D9DB2]"></div>
                <span className="ml-2 text-slate-600">Loading credit cards...</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800 text-sm">
                  {error}. Please try again later or contact support.
                </p>
              </div>
            )}

            {!loading && recommendedCards.length === 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center">
                <p className="text-slate-600">No credit cards found matching your CIBIL score.</p>
                <p className="text-sm text-slate-500 mt-1">Please check back later or contact our support team.</p>
              </div>
            )}

            {!loading && recommendedCards.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendedCards.map((card, index) => {
                  const CardIcon = card.icon;
                  return (
                    <div key={index} className="bg-white/90 rounded-lg shadow-md p-4 border border-white/50 hover:shadow-lg transition-all">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#2D9DB2] to-[#1e7a8c] rounded-lg flex items-center justify-center overflow-hidden">
                          {card.image ? (
                            <img src={card.image} alt={card.name} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <CardIcon size={18} className="text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-800 text-sm truncate">{card.name}</h3>
                          <p className="text-xs text-slate-500">{card.bank}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${card.approval === 'High' ? 'bg-emerald-100 text-emerald-700' :
                          card.approval === 'Good' ? 'bg-blue-100 text-blue-700' :
                            card.approval === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-orange-100 text-orange-700'
                          }`}>
                          {card.approval}
                        </span>
                      </div>

                      <div className="bg-slate-50 rounded-lg p-3 mb-3 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-600">Credit Limit:</span>
                          <span className="font-bold text-slate-800">{card.limit}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-600">Annual Fee:</span>
                          <span className="font-bold text-slate-800">{card.annualFee}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-600">Joining Fee:</span>
                          <span className="font-bold text-slate-800">{card.joiningFee}</span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <h4 className="text-xs font-semibold text-slate-700 mb-2">Key Features:</h4>
                        <ul className="space-y-1">
                          {card.features.slice(0, 3).map((feature, idx) => (
                            <li key={idx} className="text-xs text-slate-600 flex items-start gap-1">
                              <CheckCircle size={10} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                          {card.features.length > 3 && (
                            <li className="text-xs text-slate-500 italic">+{card.features.length - 3} more benefits</li>
                          )}
                        </ul>
                      </div>

                      <button
                        onClick={() => {
                          console.log('Card clicked:', card);
                          const subType = card.id || card.name?.toLowerCase().replace(/\s+/g, '-') || 'credit-card';
                          console.log('SubType:', subType);
                          console.log('Navigating to:', `/apply/credit-card/${subType}`);

                          // Clean the card data to remove non-serializable properties (like React components)
                          const cleanCard = {
                            id: card.id,
                            name: card.name,
                            bank: card.bank,
                            features: card.features,
                            limit: card.limit,
                            approval: card.approval,
                            annualFee: card.annualFee,
                            joiningFee: card.joiningFee,
                            cibilRange: card.cibilRange,
                            category: card.category,
                            image: card.image,
                            link: card.link
                          };

                          navigate(`/apply/credit-card/${subType}`, {
                            state: {
                              ...applicationData,
                              preApproved: score >= 700,
                              creditScore: score,
                              selectedCard: cleanCard
                            }
                          });
                        }}
                        className="w-full cursor-pointer bg-gradient-to-r from-[#2D9DB2] to-[#1e7a8c] text-white font-semibold py-2 px-4 rounded-lg hover:shadow-md transition-all flex items-center justify-center gap-2 text-sm"
                      >
                        Apply Now <ArrowRight size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Compact Action Buttons */}
        <div className="flex gap-2 justify-center">
          <button className="bg-gradient-to-r from-[#2D9DB2] to-[#1e7a8c] text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all text-sm">Back to Home</button>
          <button className="bg-white text-[#2D9DB2] border-2 border-[#2D9DB2] font-semibold py-2 px-4 rounded-lg hover:bg-[#2D9DB2] hover:text-white transition-all text-sm">Explore Services</button>
        </div>
      </div>
    </div>
  );
}