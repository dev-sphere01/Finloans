import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle, XCircle, TrendingUp, Phone, Mail } from 'lucide-react';

export default function CibilScorePage() {
  const [scoreData, setScoreData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    if (location.state) {
      setScoreData(location.state);
    }
    setIsLoading(false);
  }, [location]);

  const getScoreColor = (score) => {
    if (score >= 750) return 'text-green-600';
    if (score >= 650) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score) => {
    if (score >= 750) return 'from-green-500 to-green-600';
    if (score >= 650) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  const getScoreStatus = (score) => {
    if (score >= 750) return 'Excellent';
    if (score >= 650) return 'Good';
    return 'Fair';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={32} className="text-green-600" />;
      case 'review':
        return <AlertCircle size={32} className="text-yellow-600" />;
      case 'rejected':
        return <XCircle size={32} className="text-red-600" />;
      default:
        return <TrendingUp size={32} className="text-[#1e7a8c]" />;
    }
  };

  const getStatusMessage = (status, score) => {
    switch (status) {
      case 'approved':
        return {
          title: 'Congratulations! You\'re Pre-Approved',
          message: 'Based on your excellent credit score, you qualify for our best rates and terms.',
          color: 'text-green-800',
          bgColor: 'bg-green-50 border-green-200'
        };
      case 'review':
        return {
          title: 'Application Under Review',
          message: 'Your application is being reviewed. We may need additional documents for approval.',
          color: 'text-yellow-800',
          bgColor: 'bg-yellow-50 border-yellow-200'
        };
      case 'rejected':
        return {
          title: 'Application Needs Improvement',
          message: 'Your current credit score needs improvement. Our team can help you build better credit.',
          color: 'text-red-800',
          bgColor: 'bg-red-50 border-red-200'
        };
      default:
        return {
          title: 'Score Retrieved Successfully',
          message: 'Your CIBIL score has been successfully retrieved and evaluated.',
          color: 'text-blue-800',
          bgColor: 'bg-blue-50 border-blue-200'
        };
    }
  };

  const loanTypeNames = {
    'home-loan': 'Home Loan',
    'personal-loan': 'Personal Loan',
    'car-loan': 'Car Loan',
    'business-loan': 'Business Loan'
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e7a8c] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your CIBIL score...</p>
        </div>
      </div>
    );
  }

  if (!scoreData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No score data available</p>
          <a href="/" className="text-[#1e7a8c] hover:underline">Return to Home</a>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusMessage(scoreData.status, scoreData.score);

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
            <span className="text-gray-500">Step 1: PAN Verification</span>
            <span className="text-[#1e7a8c] font-medium">Step 2: CIBIL Score Check</span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div className="bg-[#1e7a8c] h-2 rounded-full w-full"></div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-4">
            Your CIBIL Score Report
          </h1>
          <p className="text-lg text-gray-600">
            Application for {loanTypeNames[scoreData.loanType] || 'Loan'} • PAN: {scoreData.panNumber}
          </p>
        </div>

        {/* Score Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Score Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="text-center">
              <div className={`w-32 h-32 bg-gradient-to-r ${getScoreBackground(scoreData.score)} rounded-full flex items-center justify-center mx-auto mb-6`}>
                <div className="text-white">
                  <div className="text-3xl font-bold">{scoreData.score}</div>
                  <div className="text-sm opacity-90">/ 900</div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-black mb-2">
                CIBIL Score: {getScoreStatus(scoreData.score)}
              </h3>
              <p className="text-gray-600">
                Your credit score indicates {getScoreStatus(scoreData.score).toLowerCase()} creditworthiness
              </p>
            </div>
          </div>

          {/* Status Card */}
          <div className={`border rounded-2xl p-8 ${statusInfo.bgColor}`}>
            <div className="text-center">
              <div className="mb-6">
                {getStatusIcon(scoreData.status)}
              </div>
              <h3 className={`text-2xl font-bold mb-4 ${statusInfo.color}`}>
                {statusInfo.title}
              </h3>
              <p className={`${statusInfo.color} text-lg`}>
                {statusInfo.message}
              </p>
            </div>
          </div>
        </div>

        {/* Score Range Guide */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mb-8">
          <h3 className="text-xl font-bold text-black mb-6">CIBIL Score Range Guide</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800">300 - 649: Fair</span>
                  <span className="text-sm text-gray-600">Needs Improvement</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800">650 - 749: Good</span>
                  <span className="text-sm text-gray-600">Eligible for Most Loans</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800">750 - 900: Excellent</span>
                  <span className="text-sm text-gray-600">Best Rates & Terms</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mb-8">
          <h3 className="text-xl font-bold text-black mb-6">Next Steps</h3>
          
          {scoreData.status === 'approved' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#1e7a8c] text-white rounded-full flex items-center justify-center text-sm font-bold mt-1">1</div>
                <div>
                  <h4 className="font-semibold text-gray-800">Complete Your Application</h4>
                  <p className="text-gray-600">Provide additional documents and personal details</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#1e7a8c] text-white rounded-full flex items-center justify-center text-sm font-bold mt-1">2</div>
                <div>
                  <h4 className="font-semibold text-gray-800">Document Verification</h4>
                  <p className="text-gray-600">Our team will verify your documents within 24 hours</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#1e7a8c] text-white rounded-full flex items-center justify-center text-sm font-bold mt-1">3</div>
                <div>
                  <h4 className="font-semibold text-gray-800">Loan Approval & Disbursal</h4>
                  <p className="text-gray-600">Get your loan approved and funds disbursed quickly</p>
                </div>
              </div>
            </div>
          )}

          {scoreData.status === 'review' && (
            <div className="space-y-4">
              <p className="text-gray-700">Our loan specialists will contact you within 24 hours to discuss your application and any additional requirements.</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  <strong>Tip:</strong> Having a co-applicant or providing additional income documents may improve your chances of approval.
                </p>
              </div>
            </div>
          )}

          {scoreData.status === 'rejected' && (
            <div className="space-y-4">
              <p className="text-gray-700">Don't worry! There are steps you can take to improve your credit score:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Pay all bills and EMIs on time</li>
                <li>Keep credit utilization below 30%</li>
                <li>Don't apply for multiple loans at once</li>
                <li>Check and correct any errors in your credit report</li>
              </ul>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  <strong>Good News:</strong> You can reapply after 3-6 months of improving your credit score.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {scoreData.status === 'approved' && (
            <button className="bg-[#1e7a8c] text-white font-semibold py-4 px-8 rounded-lg hover:bg-[#0f4c59] transition-colors text-lg">
              Continue Application
            </button>
          )}
          
          <button className="border border-[#1e7a8c] text-[#1e7a8c] font-semibold py-4 px-8 rounded-lg hover:bg-[#1e7a8c] hover:text-white transition-colors text-lg">
            Download Report
          </button>
        </div>

        {/* Contact Information */}
        <div className="mt-12 bg-gray-100 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-black mb-6 text-center">Need Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <Phone size={24} className="text-[#1e7a8c]" />
              <div>
                <p className="font-semibold text-gray-800">Call Us</p>
                <p className="text-gray-600">1800-123-4567 (Toll Free)</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={24} className="text-[#1e7a8c]" />
              <div>
                <p className="font-semibold text-gray-800">Email Us</p>
                <p className="text-gray-600">support@FinLoans.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


