import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, FileText, Calendar, User, ArrowRight, Home } from 'lucide-react';
import { useEffect } from 'react';

export default function ApplicationSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const applicationData = location.state;

  useEffect(() => {
    // Redirect to home if no application data
    if (!applicationData) {
      navigate('/');
    }
  }, [applicationData, navigate]);

  if (!applicationData) {
    return null;
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mb-6 shadow-lg">
            <CheckCircle size={40} className="text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Application Submitted Successfully!
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {applicationData.message}
          </p>
        </div>

        {/* Application Details Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-white/20">
          <h2 className="text-xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <FileText size={20} />
            Application Details
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-r from-[#1e7a8c] to-[#0f4c59] rounded-lg flex items-center justify-center">
                  <FileText size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Application ID</p>
                  <p className="font-bold text-slate-800">{applicationData.applicationId}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <User size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Applicant Name</p>
                  <p className="font-bold text-slate-800">{applicationData.fullName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <FileText size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Service Type</p>
                  <p className="font-bold text-slate-800">{applicationData.serviceName}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <CheckCircle size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Status</p>
                  <p className="font-bold text-green-600 capitalize">{applicationData.status}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Calendar size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Submitted On</p>
                  <p className="font-bold text-slate-800">
                    {formatDate(applicationData.submittedAt)}
                  </p>
                </div>
              </div>

              {applicationData.subType && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <FileText size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Category</p>
                    <p className="font-bold text-slate-800 capitalize">
                      {applicationData.subType.replace('-', ' ')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">What happens next?</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">1</div>
              <p className="text-blue-700">Our team will review your application within 24-48 hours</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">2</div>
              <p className="text-blue-700">You'll receive a call or email for document verification</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">3</div>
              <p className="text-blue-700">Final approval and processing will be completed</p>
            </div>
          </div>
        </div>

        {/* Important Note */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-amber-800 mb-2">Important Note</h3>
          <p className="text-amber-700">
            Please keep your Application ID <strong>{applicationData.applicationId}</strong> safe for future reference.
            You can use this ID to track your application status or contact our support team.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#1e7a8c] to-[#0f4c59] text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all"
          >
            <Home size={18} />
            Back to Home
          </button>

          <button
            onClick={() => navigate('/services')}
            className="flex items-center justify-center gap-2 bg-white text-[#1e7a8c] border-2 border-[#1e7a8c] font-semibold py-3 px-6 rounded-lg hover:bg-[#1e7a8c] hover:text-white transition-all"
          >
            Explore More Services
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Contact Support */}
        <div className="text-center mt-8 p-4 bg-white/50 rounded-lg">
          <p className="text-slate-600 text-sm">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@finloans.com" className="text-[#1e7a8c] font-semibold hover:underline">
              support@finloans.com
            </a>
            {' '}or call{' '}
            <a href="tel:+911234567890" className="text-[#1e7a8c] font-semibold hover:underline">
              +91 12345 67890
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}