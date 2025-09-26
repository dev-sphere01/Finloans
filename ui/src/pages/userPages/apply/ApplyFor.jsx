import { useState } from 'react';
import { ArrowLeft, CreditCard, Shield, AlertCircle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

function calculateSimulatedScore(panNumber) {
  // Simulate score calculation based on PAN number patterns
  // This is for demo purposes only - real implementation would use actual CIBIL API
  
  const firstLetter = panNumber.charAt(0);
  const lastDigit = parseInt(panNumber.charAt(9));
  const fourthChar = panNumber.charAt(3);
  
  let baseScore = 650; // Start with a base score
  
  // Adjust score based on first letter (simulated pattern)
  if (['A', 'B', 'C'].includes(firstLetter)) {
    baseScore += 100; // Higher score for certain letters
  } else if (['D', 'E', 'F'].includes(firstLetter)) {
    baseScore += 50;
  } else if (['G', 'H', 'I'].includes(firstLetter)) {
    baseScore += 25;
  }
  
  // Adjust based on last digit
  if (lastDigit % 2 === 0) {
    baseScore += 25; // Even digits get bonus
  }
  
  // Adjust based on fourth character
  if (['P', 'L', 'F', 'G'].includes(fourthChar)) {
    baseScore += 50; // Common business/personal identifiers
  }
  
  // Add some randomness but keep it consistent for same PAN
  const panSum = panNumber.split('').reduce((sum, char) => {
    return sum + (isNaN(char) ? char.charCodeAt(0) : parseInt(char));
  }, 0);
  
  const randomAdjustment = (panSum % 100) - 50; // -50 to +49
  baseScore += randomAdjustment;
  
  // Ensure score is within valid range
  baseScore = Math.max(300, Math.min(900, baseScore));
  
  return Math.round(baseScore);
}

function determineApplicationStatus(score, loanType) {
  // Different loan types have different score requirements
  const requirements = {
    'home-loan': { excellent: 750, good: 700 },
    'personal-loan': { excellent: 750, good: 650 },
    'car-loan': { excellent: 720, good: 650 },
    'business-loan': { excellent: 780, good: 720 }
  };
  
  const requirement = requirements[loanType] || requirements['personal-loan'];
  
  if (score >= requirement.excellent) {
    return 'approved';
  } else if (score >= requirement.good) {
    return 'review';
  } else {
    return 'rejected';
  }
}

export default function ApplyLoanPage() {
    const { loanType } = useParams();
    const navigate = useNavigate();
  const [panNumber, setPanNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loanTypeNames = {
    'home-loan': 'Home Loan',
    'personal-loan': 'Personal Loan',
    'car-loan': 'Car Loan',
    'business-loan': 'Business Loan'
  };

  const validatePAN = (pan) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  };

  const handlePanChange = (e) => {
    const value = e.target.value.toUpperCase();
    setPanNumber(value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePAN(panNumber)) {
      setError('Please enter a valid PAN number (e.g., ABCDE1234F)');
      return;
    }

    setIsLoading(true);
    setError('');

    // Simulate API call with a 2-second delay
    setTimeout(() => {
      try {
        const score = calculateSimulatedScore(panNumber);
        const status = determineApplicationStatus(score, loanType);

        console.log(`CIBIL check for PAN: ${panNumber}, Loan: ${loanType}, Score: ${score}, Status: ${status}`);

        // Redirect to CIBIL score page with the results
        navigate('/cibil-score', { state: { panNumber, loanType, score, status } });
        
      } catch (error) {
        console.error('Error checking CIBIL score:', error);
        setError('Unable to process your request. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }, 2000);
  };

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
          </div>
        </div>
      </nav>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#1e7a8c] font-medium">Step 1: PAN Verification</span>
            <span className="text-gray-500">Step 2: CIBIL Score Check</span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div className="bg-[#1e7a8c] h-2 rounded-full w-1/2"></div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-[#1e7a8c] to-[#0f4c59] rounded-full flex items-center justify-center mx-auto mb-6">
            <CreditCard size={40} className="text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-4">
            Apply for {loanTypeNames[loanType] || 'Loan'}
          </h1>
          <p className="text-lg text-gray-600">
            Let's start by verifying your PAN number to check your credit score
          </p>
        </div>

        {/* Application Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="pan" className="block text-sm font-medium text-gray-700 mb-2">
                PAN Number *
              </label>
              <input
                type="text"
                id="pan"
                value={panNumber}
                onChange={handlePanChange}
                placeholder="Enter your PAN number (e.g., ABCDE1234F)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1e7a8c] focus:border-[#1e7a8c] outline-none transition-colors text-lg"
                maxLength={10}
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                Enter your 10-digit PAN number to proceed with the application
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !panNumber}
              className="w-full bg-[#1e7a8c] text-white font-semibold py-4 px-6 rounded-lg hover:bg-[#0f4c59] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Checking CIBIL Score...
                </div>
              ) : (
                'Check CIBIL Score'
              )}
            </button>
          </form>
        </div>

        {/* Security Notice */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Shield size={24} className="text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Your Information is Secure</h3>
              <p className="text-blue-800 text-sm">
                We use bank-level encryption to protect your personal information. Your PAN number is used only for credit verification and is not stored or shared with third parties.
              </p>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">Need help finding your PAN number?</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-100 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">PAN Card Format</h4>
              <p className="text-gray-600">5 letters + 4 numbers + 1 letter</p>
              <p className="text-gray-600">Example: ABCDE1234F</p>
            </div>
            <div className="bg-gray-100 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Where to Find PAN</h4>
              <p className="text-gray-600">Check your PAN card, IT returns, or Form 16</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
