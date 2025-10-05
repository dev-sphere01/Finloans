import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  CreditCard, 
  Star, 
  ArrowRight,
  RefreshCw,
  Shield,
  Award
} from 'lucide-react';
import creditCardService from '@/services/creditCardService';
import notification from '@/services/NotificationService';

const CibilScorePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const notify = notification();
  
  const [eligibleCards, setEligibleCards] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Get data from navigation state
  const userData = location.state;
  
  // If no data, redirect back
  useEffect(() => {
    if (!userData || !userData.isCreditCard) {
      navigate('/');
      return;
    }
    
    fetchEligibleCards();
  }, [userData, navigate]);

  const fetchEligibleCards = async () => {
    try {
      setLoading(true);
      const response = await creditCardService.getCreditCards();
      
      // Filter cards based on CIBIL score range
      const userScore = userData.score;
      const eligible = response.cards?.filter(card => {
        const [minScore, maxScore] = card.cibilRange.split('-').map(s => parseInt(s.trim()));
        return userScore >= minScore && userScore <= maxScore;
      }) || [];
      
      setEligibleCards(eligible);
    } catch (error) {
      console.error('Error fetching credit cards:', error);
      notify.error('Failed to load eligible credit cards');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 750) return 'text-green-600';
    if (score >= 650) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreGradient = (score) => {
    if (score >= 750) return 'from-green-500 to-emerald-500';
    if (score >= 650) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const getScoreStatus = (score) => {
    if (score >= 750) return { status: 'Excellent', message: 'You have an excellent credit score!' };
    if (score >= 650) return { status: 'Good', message: 'You have a good credit score.' };
    return { status: 'Fair', message: 'Your credit score needs improvement.' };
  };

  const handleApplyCard = (cardId) => {
    navigate(`/apply/${cardId}`, {
      state: {
        ...userData,
        preApproved: true
      }
    });
  };

  if (!userData) {
    return null;
  }

  const scoreInfo = getScoreStatus(userData.score);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>

    

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* CIBIL Score Display */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/20 mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className={`w-32 h-32 rounded-full bg-gradient-to-r ${getScoreGradient(userData.score)} flex items-center justify-center shadow-lg`}>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{userData.score}</div>
                  <div className="text-sm text-white/90">CIBIL Score</div>
                </div>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Hello, {userData.fullName}!
            </h1>
            <p className={`text-xl font-semibold mb-2 ${getScoreColor(userData.score)}`}>
              {scoreInfo.status} Credit Score
            </p>
            <p className="text-slate-600 mb-6">{scoreInfo.message}</p>
            
            {/* Score Range Indicator */}
            <div className="max-w-md mx-auto">
              <div className="flex justify-between text-xs text-slate-500 mb-2">
                <span>300</span>
                <span>500</span>
                <span>650</span>
                <span>750</span>
                <span>900</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 relative">
                <div className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-3 rounded-full"></div>
                <div 
                  className="absolute top-0 w-4 h-4 bg-white border-2 border-slate-400 rounded-full transform -translate-y-0.5"
                  style={{ left: `${((userData.score - 300) / 600) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Eligible Credit Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              Credit Cards You're Eligible For
            </h2>
            <p className="text-lg text-slate-600">
              Based on your CIBIL score of {userData.score}, here are the credit cards available for you
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/90 rounded-3xl p-6 animate-pulse">
                  <div className="h-40 bg-slate-200 rounded-2xl mb-4"></div>
                  <div className="h-4 bg-slate-200 rounded mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded mb-4"></div>
                  <div className="h-10 bg-slate-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : eligibleCards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eligibleCards.map((card, index) => (
                <motion.div
                  key={card._id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-white/20 group hover:shadow-2xl transition-all duration-300"
                >
                  {/* Card Image */}
                  {card.creditCardPic && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={card.creditCardPic}
                        alt={card.creditCardName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      <div className="absolute top-4 right-4">
                        <div className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle size={12} />
                          Eligible
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                      {card.creditCardName}
                    </h3>
                    <p className="text-slate-600 text-sm mb-4">
                      CIBIL Range: {card.cibilRange}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1 text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={16} fill="currentColor" />
                        ))}
                      </div>
                      <span className="text-sm text-slate-500">Recommended</span>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleApplyCard(card._id)}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-3 px-4 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      Apply Now
                      <ArrowRight size={16} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={48} className="text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                No Eligible Credit Cards Found
              </h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Based on your current CIBIL score of {userData.score}, there are no credit cards available at this time. 
                Consider improving your credit score and try again later.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/')}
                  className="bg-slate-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-700 transition-all"
                >
                  Back to Home
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={fetchEligibleCards}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <RefreshCw size={16} />
                  Refresh
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Credit Score Tips */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16"
        >
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-white/30">
            <h3 className="text-2xl font-bold text-slate-800 mb-6 text-center">
              Tips to Improve Your Credit Score
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard size={32} className="text-white" />
                </div>
                <h4 className="font-semibold text-slate-800 mb-2">Pay Bills On Time</h4>
                <p className="text-slate-600 text-sm">Always pay your credit card bills and EMIs on time to maintain a good payment history.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp size={32} className="text-white" />
                </div>
                <h4 className="font-semibold text-slate-800 mb-2">Keep Credit Utilization Low</h4>
                <p className="text-slate-600 text-sm">Use less than 30% of your available credit limit to show responsible credit usage.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award size={32} className="text-white" />
                </div>
                <h4 className="font-semibold text-slate-800 mb-2">Maintain Credit History</h4>
                <p className="text-slate-600 text-sm">Keep old credit accounts open to maintain a longer credit history.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CibilScorePage;